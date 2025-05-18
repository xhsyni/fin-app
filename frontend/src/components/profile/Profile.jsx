import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/Profile.css'
import { updateUser } from '../../redux/slices/userSlice';

const Profile = () => {
    const dispatch = useDispatch();
    let userInfo = JSON.parse(localStorage.getItem('userInfo')).user;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        job: userInfo?.job || '',
        birth_date: userInfo?.birth_date || '',
        marital_status: userInfo?.marital_status || false,
        ethnicity: userInfo?.ethnicity || '',
        gender: userInfo?.gender || '',
        nationality: userInfo?.nationality || ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(formData));
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <button
                    className={`edit-button ${isEditing ? 'save' : ''}`}
                    onClick={(e) => isEditing ? handleSubmit(e) : setIsEditing(true)}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>
            <div className="profile-content">
                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="profile-fields">
                        <div className="field-group">
                            <label>Name:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.name}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Email:</label>
                            <span>{userInfo?.email}</span>
                        </div>

                        <div className="field-group">
                            <label>Phone:</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.phone || 'Not provided'}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Job:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="job"
                                    value={formData.job}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.job || 'Not provided'}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Birth Date:</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.birth_date || 'Not provided'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Additional Information</h2>
                    <div className="profile-fields">
                        <div className="field-group">
                            <label>Marital Status:</label>
                            {isEditing ? (
                                <input
                                    type="checkbox"
                                    name="marital_status"
                                    checked={formData.marital_status}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.marital_status ? 'Married' : 'Single'}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Ethnicity:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="ethnicity"
                                    value={formData.ethnicity}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.ethnicity || 'Not provided'}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Gender:</label>
                            {isEditing ? (
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <span>{userInfo?.gender || 'Not provided'}</span>
                            )}
                        </div>

                        <div className="field-group">
                            <label>Nationality:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span>{userInfo?.nationality || 'Not provided'}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;