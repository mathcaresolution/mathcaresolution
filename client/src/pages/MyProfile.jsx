import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import NavBar from '../components/NavBar/NavBar';
import StudentForm from '../components/StudentForm/StudentForm';
import './MyProfile.scss'; 

const MyProfile = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                // Fetch using the specific ID endpoint
                const response = await api.get(`api/students/${user._id}`);
                const data = await response.json();
                
                // --- FIX: Logic updated for Single Student Response ---
                if (response.ok && data.student) {
                    setStudentData(data.student);
                } else {
                    console.error("Profile check failed:", data);
                }
                // -----------------------------------------------------

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if(user) fetchMyProfile();
    }, [user._id]);

    const handleUpdate = async (updatedData) => {
        setMessage({ text: 'Updating...', type: 'info' });
        try {
            const payload = { ...updatedData };
            // Security: Remove locked fields
            delete payload.classGrade; 
            delete payload.mobile;
            delete payload.group;
            delete payload.batchCategory;
            delete payload.status;

            const response = await api.put(`api/students/${studentData._id}`, payload);
            const data = await response.json();

            if(!response.ok) throw new Error(data.message);

            setMessage({ text: 'Profile Updated Successfully!', type: 'success' });
            setStudentData(data.student); 
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    if (loading) return <div style={{padding:"20px"}}>Loading Profile...</div>;
    
    if (!studentData) return (
        <div style={{padding:"20px"}}>
            <NavBar />
            <h3>Profile not found.</h3>
            <p>If you just registered, your admission might still be <strong>Pending Approval</strong>.</p>
        </div>
    );

    return (
        <div className="my-profile-page">
            <NavBar />
            <div className="profile-container">
                <div className="profile-header">
                    <h2>My Profile</h2>
                    <p>Keep your personal information up to date.</p>
                </div>

                {message.text && <div className={`msg ${message.type}`} style={{padding:"10px", margin:"10px 0", background: message.type === 'error' ? '#fdd':'#ddf'}}>{message.text}</div>}

                <div className="form-card">
                    <StudentForm 
                        initialData={studentData}
                        onSubmit={handleUpdate}
                        submitLabel="Update My Info"
                        lockedFields={['classGrade', 'mobile', 'group', 'batchCategory', 'status', 'residentialStatus', 'version']}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyProfile;