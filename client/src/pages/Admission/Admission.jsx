import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import StudentForm from '../../components/StudentForm/StudentForm';
import { api } from '../../utils/api';

const Admission = () => {
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleAdmissionSubmit = async (formData) => {
        setStatus({ type: 'info', msg: 'Submitting your application...' });
        
        // Clean data (remove empty email/dates) - same logic as your CreateStudent
        const payload = { ...formData };
        if (!payload.email) delete payload.email;
        if (!payload.dateOfBirth) delete payload.dateOfBirth;

        try {
            const response = await api.post('api/students/admission', payload); // Public Endpoint
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setStatus({ type: 'success', msg: 'Application Submitted! Admin will review it shortly.' });
            
            // Optional: Redirect to a "Success" page or clear form
        } catch (error) {
            setStatus({ type: 'error', msg: error.message });
        }
    };

    if (status.type === 'success') {
        return (
            <div className="admission-success">
                <NavBar />
                <div className="success-card">
                    <h2>✅ Application Received</h2>
                    <p>{status.msg}</p>
                    <p>Your Mobile Number will be your Login ID and Password once approved.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admission-page">
            <NavBar />
            <div className="container">
                <div className="header-section">
                    <h1>Online Admission</h1>
                    <p>Fill out the form below to apply for the upcoming session.</p>
                </div>
                
                {status.msg && <div className={`alert ${status.type}`}>{status.msg}</div>}

                <div className="form-wrapper">
                    <StudentForm 
                        onSubmit={handleAdmissionSubmit} 
                        submitLabel="Submit Application"
                        isPublic={true}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Admission;