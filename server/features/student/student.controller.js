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
        if(savedUser?._id){
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
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await StudentProfile.findById(id).populate("userId", "name email mobile status");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
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
export const updateStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mobile, email, ...profileUpdates } = req.body;

        const studentProfile = await StudentProfile.findById(id);
        if (!studentProfile) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const userId = studentProfile.userId;
        const userUpdates = {};
        if (name) userUpdates.name = name;
        if (mobile) userUpdates.mobile = mobile;
        if (email) userUpdates.email = email;

        // Update User document if there are changes
        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(userId, userUpdates, { new: true, runValidators: true });
        }

        // Update StudentProfile document
        const updatedProfile = await StudentProfile.findByIdAndUpdate(
            id,
            profileUpdates,
            { new: true, runValidators: true }
        ).populate("userId", "name email mobile status");

        res.status(200).json({
            message: "Student updated successfully",
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