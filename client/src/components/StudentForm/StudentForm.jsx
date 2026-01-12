import React, { useState, useEffect } from "react";
import { InitialStudentForm, ClassLabels, ClassOptions } from '../../utils/studentConstants.js';
import './StudentForm.scss'; 

// Props:
// initialData: Object (for editing)
// onSubmit: Function (handles API call)
// lockedFields: Array of strings (names of inputs to disable)
const StudentForm = ({ initialData = null, onSubmit, submitLabel = "Save", lockedFields = [] }) => {
    const [formData, setFormData] = useState(InitialStudentForm);
    const [batchCategory, setBatchCategory] = useState("");

    useEffect(() => {
        if (initialData) {
            // Flatten the structure if it comes from DB (userId object -> top level fields)
            const mappedData = {
                ...InitialStudentForm, // Defaults
                ...initialData,        // Profile data
                name: initialData.userId?.name || initialData.name || "",
                mobile: initialData.userId?.mobile || initialData.mobile || "",
                email: initialData.userId?.email || initialData.email || "",
            };
            setFormData(mappedData);

            // Auto-select batch logic
            if(initialData.classGrade) {
                const foundBatch = Object.keys(ClassOptions).find(key => 
                    ClassOptions[key].includes(initialData.classGrade)
                );
                if (foundBatch) setBatchCategory(foundBatch.charAt(0).toUpperCase() + foundBatch.slice(1));
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Prevent changes to locked fields
        if (lockedFields.includes(name)) return;

        const inputValue = type === "checkbox" ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: inputValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Helper to check if a field is locked
    const isLocked = (fieldName) => lockedFields.includes(fieldName);

    return (
        <form onSubmit={handleSubmit} className="student-form-grid">
            {/* LEFT COLUMN */}
            <div className="column">
                <h3>Basic Information</h3>
                <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                        type="text" name="name" 
                        value={formData.name} onChange={handleChange} 
                        required disabled={isLocked('name')} 
                    />
                </div>
                <div className="form-group">
                    <label>Mobile (Login ID) *</label>
                    <input 
                        type="text" name="mobile" 
                        value={formData.mobile} onChange={handleChange} 
                        required disabled={isLocked('mobile')} 
                        title={isLocked('mobile') ? "Contact Admin to change" : ""}
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLocked('email')}/>
                </div>
                
                <h4>Personal Details</h4>
                <div className="form-group">
                    <label>Father's Name</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} disabled={isLocked('fatherName')}/>
                </div>
                <div className="form-group">
                    <label>Mother's Name</label>
                    <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} disabled={isLocked('motherName')}/>
                </div>
                <div className="form-group">
                    <label>Religion</label>
                    <select name="religion" value={formData.religion} onChange={handleChange} disabled={isLocked('religion')}>
                        <option value="">Select Religion</option>
                        <option value="Islam">Islam</option>
                        <option value="Hinduism">Hinduism</option>
                        {/* Add other options... */}
                    </select>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="column">
                <h3>Academic Info</h3>
                {/* Note: In Student Mode, we usually LOCK these */}
                
                <div className="form-group">
                    <label>Class/Grade</label>
                    <input 
                        type="text" 
                        value={ClassLabels[formData.classGrade] || formData.classGrade || ""} 
                        disabled 
                        style={{background: '#e9ecef', cursor: 'not-allowed'}}
                    />
                    {/* Only show the Select dropdown if NOT locked */}
                    {!isLocked('classGrade') && (
                       <p className="hint-text">To change class, use the admin panel.</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                        type="date" name="dateOfBirth" 
                        value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} 
                        onChange={handleChange} 
                        disabled={isLocked('dateOfBirth')}
                    />
                </div>
                
                <div className="form-group">
                    <label>Birth Certificate No</label>
                    <input type="text" name="birthCertificateNo" value={formData.birthCertificateNo} onChange={handleChange} disabled={isLocked('birthCertificateNo')}/>
                </div>

                {/* Additional fields like NID, Address can go here */}
            </div>

            <button type="submit" className="save-btn">{submitLabel}</button>
        </form>
    );
};

export default StudentForm;