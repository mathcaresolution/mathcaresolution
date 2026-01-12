import User from "../user/user.model.js";
import StudentProfile from "./student.model.js";
import bcryptjs from "bcryptjs";

const { SALT_ROUNDS } = process.env;

export const createStudent = async (req, res) => {
    let savedUser;
    try {
        const {
            name,
            mobile,
            email,
        } = req.body;

        // 1. Check if user already exists
        const checkQuery = [{ mobile }];
        if (email) checkQuery.push({ email });

        const existingUser = await User.findOne({ $or: checkQuery });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this mobile or email already exists" });
        }

        // 2. Prepare Password (Default to Mobile Number if not provided)
        const plainPassword = mobile; // Setting mobile as default password
        const saltRounds = parseInt(SALT_ROUNDS) || 10;
        const hashedPassword = await bcryptjs.hash(plainPassword, saltRounds);

        // 3. Create the User Document
        const newUser = new User({
            name,
            mobile,
            email: email || undefined, // undefined lets the sparse index ignore it
            password: hashedPassword,
            role: "student",
            status: "active",
        });

        savedUser = await newUser.save();

        // 4. Create the Student Profile Document
        const newProfile = new StudentProfile({
            ...req.body,
            userId: savedUser._id

        });

        await newProfile.save();

        res.status(201).json({
            message: "Student and Profile created successfully",
            user: savedUser,
            profile: newProfile,
        });
    } catch (error) {
        console.error("Error creating student:", error);
        if (savedUser?._id) {
            await User.findByIdAndDelete(savedUser._id);
            console.log("Rolled back user creation due to profile creation failure.");
        }
        res
            .status(500)
            .json({ message: "Error creating student", error: error.message });
    }
};


// Get All Students 
export const getAllStudents = async (req, res) => {
    try {
        const students = await StudentProfile.find().populate("userId", "name email mobile status");
        res.status(200).json({
            message: "Students fetched successfully",
            students,
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

// Get Student by ID
// Get Student by ID (Smart Check)
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Try to find by Profile ID (Standard admin way)
        let student = await StudentProfile.findById(id).populate("userId", "name email mobile status");

        // 2. If not found, try to find by User ID (The fix for "My Profile")
        if (!student) {
            student = await StudentProfile.findOne({ userId: id }).populate("userId", "name email mobile status");
        }

        if (!student) {
            return res.status(404).json({ message: "Student profile not found." });
        }

        res.status(200).json({
            message: "Student fetched successfully",
            student,
        });
    } catch (error) {
        console.error("Error fetching student by ID:", error);
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
};

// Update Student by ID
// Replace this function in server/student/student.controller.js

export const updateStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Separate User fields from Profile fields
        const { name, mobile, email, ...rawProfileUpdates } = req.body;
        
        const requesterRole = req.user.role; 
        const requesterId = req.user.id;

        const studentProfile = await StudentProfile.findById(id);
        if (!studentProfile) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        // --- SECURITY CHECK ---
        if (requesterRole === 'student') {
            // Check ownership
            if (studentProfile.userId.toString() !== requesterId) {
                return res.status(403).json({ message: "You are not authorized to update this profile." });
            }

            // Block sensitive fields
            delete rawProfileUpdates.classGrade;
            delete rawProfileUpdates.group;
            delete rawProfileUpdates.status;
            delete rawProfileUpdates.residentialStatus; 
            
            // Block mobile change
            if (mobile && mobile !== studentProfile.userId.mobile) {
                return res.status(403).json({ message: "Contact Admin to change your Login Mobile Number." });
            }
        }
        // --- END SECURITY CHECK ---

        // --- FIX START: Sanitize Empty Strings & Dates ---
        // Convert "" to undefined so Mongoose ignores them
        const profileUpdates = { ...rawProfileUpdates };
        const fieldsToClean = [
            'religion', 'gender', 'dateOfBirth', 'birthCertificateNo', 
            'fatherNID', 'motherNID', 'version'
        ];
        
        fieldsToClean.forEach((field) => {
            if (profileUpdates[field] === "") {
                profileUpdates[field] = undefined;
            }
        });
        // --- FIX END ---

        const userId = studentProfile.userId;
        const userUpdates = {};
        
        if (name) userUpdates.name = name;
        if (email === "") userUpdates.email = undefined; // specialized check for sparse email
        else if (email) userUpdates.email = email;
        
        // Allow admins to update mobile
        if (mobile && requesterRole !== 'student') userUpdates.mobile = mobile;

        // 2. Update User Model
        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(userId, userUpdates, { new: true, runValidators: true });
        }

        // 3. Update Student Profile
        const updatedProfile = await StudentProfile.findByIdAndUpdate(
            id,
            profileUpdates, // Use the sanitized data
            { new: true, runValidators: true }
        ).populate("userId", "name email mobile status");

        res.status(200).json({
            message: "Profile updated successfully",
            student: updatedProfile,
        });
    } catch (error) {
        console.error("Error updating student by ID:", error);
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
};


// Delete students by ID
export const deleteStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const studentProfile = await StudentProfile.findById(id);
        if (!studentProfile) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const userId = studentProfile.userId;

        // Delete the StudentProfile document
        await StudentProfile.findByIdAndDelete(id);

        // Delete the associated User document
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Student and associated user deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting student by ID:", error);
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
};


export const studentAdmission = async (req, res) => {
    let savedUser;
    try {
        const { name, mobile, email } = req.body;

        // Check duplicate... (keep existing code)
        const checkQuery = [{ mobile }];
        if (email) checkQuery.push({ email });
        const existingUser = await User.findOne({ $or: checkQuery });
        if (existingUser) {
            return res.status(400).json({ message: "Account with this mobile or email already exists." });
        }

        // --- UPDATED FIX: Clean Empty Strings AND DATES ---
        const profileData = { ...req.body };

        // List of fields that crash Mongoose if they are empty strings ""
        const fieldsToClean = [
            'classGrade', 'version', 'group', 'residentialStatus',
            'religion', 'gender', 'dateOfBirth', 'email' // Added dateOfBirth and email
        ];

        fieldsToClean.forEach((field) => {
            if (profileData[field] === "") {
                profileData[field] = undefined;
            }
        });
        // --------------------------------------------------

        // ... Keep the rest of your password/User creation logic ...
        const { SALT_ROUNDS } = process.env;
        const plainPassword = mobile;
        const saltRounds = parseInt(SALT_ROUNDS) || 10;
        const hashedPassword = await bcryptjs.hash(plainPassword, saltRounds);

        const newUser = new User({
            name,
            mobile,
            email: profileData.email, // Use cleaned email
            password: hashedPassword,
            role: "student",
            status: "pending",
        });

        savedUser = await newUser.save();

        const newProfile = new StudentProfile({
            ...profileData, // Use cleaned profileData
            userId: savedUser._id
        });

        await newProfile.save();

        res.status(201).json({
            message: "Admission submitted! Please wait for admin approval.",
        });

    } catch (error) {
        console.error("Admission Error:", error);
        if (savedUser?._id) await User.findByIdAndDelete(savedUser._id);
        res.status(500).json({ message: "Submission failed", error: error.message });
    }
};

// Also add a controller to APPROVE student (change status pending -> active)
export const approveAdmission = async (req, res) => {
    try {
        const { id } = req.params; // StudentProfile ID
        const student = await StudentProfile.findById(id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Update User status
        await User.findByIdAndUpdate(student.userId, { status: 'active' });

        res.status(200).json({ message: "Student approved successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}