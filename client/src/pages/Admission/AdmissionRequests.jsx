import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import NavBar from '../../components/NavBar/NavBar';
const AdmissionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            // We need to filter for 'pending' users. 
            // Ideally, modify getAllStudents API to accept query param ?status=pending
            // For now, let's assume we fetch all and filter client-side or creating a specific API is better.
            const response = await api.get('api/students/all'); 
            const data = await response.json();
            
            // Filter only pending students
            const pending = data.students.filter(s => s.userId?.status === 'pending');
            setRequests(pending);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (studentId) => {
        if(!window.confirm("Approve this student? They will be able to login.")) return;
        try {
            await api.put(`api/students/approve/${studentId}`, {});
            fetchRequests(); // Refresh list
        } catch (error) {
            alert("Failed to approve");
        }
    };

    const handleReject = async (studentId) => {
        if(!window.confirm("Reject and delete this application?")) return;
        try {
            await api.delete(`api/students/${studentId}`); // Reuse existing delete
            fetchRequests();
        } catch (error) {
            alert("Failed to reject");
        }
    };

    return (
        <div className="admission-dashboard">
            <NavBar />
            <div className="container">
                <h2>Pending Admission Requests</h2>
                {loading ? <p>Loading...</p> : (
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Mobile</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(student => (
                                <tr key={student._id}>
                                    <td>{student.userId?.name}</td>
                                    <td>{student.classGrade}</td>
                                    <td>{student.userId?.mobile}</td>
                                    <td>
                                        <button className="btn-approve" onClick={() => handleApprove(student._id)}>Accept</button>
                                        <button className="btn-reject" onClick={() => handleReject(student._id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && <tr><td colSpan="4">No pending requests.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdmissionRequests;