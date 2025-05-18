import React from 'react'
import { useNavigate } from 'react-router-dom'

function DownloadForm({ isActive, setActive }) {
    const navigate = useNavigate();
    const handleBack = () => {
        if (typeof setActive === 'function') {
            setActive(false);
        }
        navigate(-1);
    }
    return (
        <div className="form-content">
            <div className='form-header'>
                <button className="submitButton" onClick={handleBack}>Back</button>
                <h2>Export Report</h2>
            </div>
            <p>Filter the column to export your report</p>
        </div>
    )
}

export default DownloadForm