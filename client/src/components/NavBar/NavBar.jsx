import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSchoolInfo } from '../../context/SchoolContext';
import RoleGate from "../../config/RoleGate";
import './NavBar.scss';

const NavBar = () => {
    const { schoolInfo } = useSchoolInfo();
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="primary-nav">
            <div className="nav-brand">
                <Link to="/">
                    {/* 1. Logo Section */}
                    {schoolInfo?.logo && (
                        <img src={schoolInfo.logo} alt="School Logo" className="nav-logo" />
                    )}

                    {/* 2. Text Section (Name + Motto) */}
                    <div className="brand-info">
                        <span className="nav-school-name">
                            {schoolInfo?.name || "School Portal"}
                        </span>
                        {/* Only render motto if it exists */}
                        {schoolInfo?.motto && (
                            <span className="nav-school-motto">{schoolInfo.motto}</span>
                        )}
                    </div>
                </Link>
            </div>

            <div className="nav-links">
                <Link to="/">Home</Link>
                {!isAuthenticated && <Link to="/admission">Apply Online</Link>}

                <RoleGate allowedRoles={['super', 'admin', 'desk']}>
                    <Link to="/all-students">Students</Link>
                    <Link to="/admission-requests">Requests</Link>
                </RoleGate>

                <RoleGate allowedRoles={['super', 'admin']}>
                    <Link to='/create-student'>Admission</Link>
                    <Link to='/school-settings'>Settings</Link>
                </RoleGate>

                <RoleGate allowedRoles={['super', 'admin', 'desk', 'student', 'teacher']}>
                    <Link to="/dashboard">Dashboard</Link>
                </RoleGate>

                <RoleGate allowedRoles={['student']}>
                    <Link to="/profile">Profile</Link>
                </RoleGate>
            </div>

            <div className="nav-auth">
                {!isAuthenticated ? (
                    <Link to="/login" className="btn-login">Login</Link>
                ) : (
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                )}
            </div>
        </nav>
    );
};

export default NavBar;