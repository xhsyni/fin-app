import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/income.css'
import { useDispatch, useSelector } from "react-redux";
import { deleteIncome, editIncome, viewAllIncome } from '../../redux/slices/incomeSlice';
import BASE_URL from '../../utils/baseURL';

function EditIncomeForm({ isActive, setActive, id }) {
    const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [incomeData, setIncomeData] = useState({
        otherCategory: "",
    });
    const [selectedCategory, setSelectedCategory] = useState('business');
    const [errors, setErrors] = useState({});
    const {
        incomes,
        loadingIncome,
        errorIncome,
        createIncome,
    } = useSelector((state) => state.income || {});
    const incomeCategory =
        [
            { value: 'business', label: 'Business Income' },
            { value: 'rental', label: 'Rental Income' },
            { value: 'dividend', label: 'Dividend Income' },
            { value: 'interest', label: 'Interest Income' },
            { value: 'royalties', label: 'Royalties Income' },
            { value: 'pension', label: 'Pensions Income' },
            { value: 'other', label: 'Other' }
        ]

    useEffect(() => {
        if (id && incomes?.income) {
            const targetIncome = incomes.income.find((income) => income.id === parseInt(id));
            if (targetIncome) {
                setIncomeData(targetIncome);
                setSelectedCategory(targetIncome.category);
            }
        }
    }, [id, incomes]);

    useEffect(() => {
        if (createIncome) {
            navigate('/user/income');
            if (typeof setActive === 'function') {
                setActive(false);
            }
        }
    }, [createIncome, navigate]);

    const handleBack = () => {
        if (typeof setActive === 'function') {
            setActive(false);
        }
        navigate('/user/income')
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setIncomeData(prevState => ({
            ...prevState,
            [name]: value,
        }));

        if (name === 'category') {
            setSelectedCategory(value);
        }

        if (value && value.trim() !== '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined
            }));
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!incomeData.source || incomeData.source.trim() === '') {
            newErrors.source = 'Please enter an income source';
        }
        if (!incomeData.amount || incomeData.amount == null || Number(incomeData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }
        if (!incomeData.date || incomeData.date.trim() === '') {
            newErrors.date = 'Please select a date';
        }
        if (!incomeData.job || incomeData.job.trim() === '') {
            newErrors.job = 'Please enter your job title';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const updatedIncomeData = {
                ...incomeData,
                otherCategory: incomeData.otherCategory || ''
            };
            dispatch(editIncome(updatedIncomeData))
                .then(() => {
                    dispatch(viewAllIncome());
                    navigate('/user/income');
                    if (typeof setActive === 'function') {
                        setActive(false);
                    }
                });
        }
    }
    function handleDelete() {
        dispatch(deleteIncome({ incomeid: id }))
            .then(() => {
                dispatch(viewAllIncome());
                navigate('/user/income');
                if (typeof setActive === 'function') {
                    setActive(false);
                }
            });
    }

    function handleDownload(e) {
        e.preventDefault();
        if (incomeData?.file?.length > 0) {
            incomeData.file.forEach(fileUrl => {
                const transformedFileUrl = fileUrl
                    .replace(/ /g, '_')
                    .replace(/\(|\)/g, '');
                fetch(`${BASE_URL.serverURL.replace('/api', '')}/media/files/${transformedFileUrl}`)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = transformedFileUrl;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => window.URL.revokeObjectURL(url), 100);
                    })
                    .catch(error => console.error("Error downloading file:", error));
            });
        } else {
            console.error("No files available for download.");
        }
    }

    return (
        <>
            {errorIncome && <span className="error-message">{typeof errorIncome === 'string' ? errorIncome : 'An error occurred'}</span>}
            <div className="form-content">
                {incomeData?.file?.length > 0 && (
                    <div className="file-list">
                        {incomeData?.file.map((file, index) => (
                            <div key={index} className="file-item">
                                <span>{file}</span>
                            </div>
                        ))}
                        <button className='submitButton' onClick={(e) => handleDownload(e)}>Download</button>
                    </div>
                )}
                <div style={{ borderTop: "solid 1px rgb(0,0,0)" }}>
                    <div className='form-header'>
                        <button className="submitButton" onClick={handleBack}>Back</button>
                        <h2>Edit Income (ID #{id})</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Income Type</label>
                            <select
                                name="type"
                                value={incomeData.type}
                                onChange={handleChange}
                            >
                                <option value="gain">Gain (+)</option>
                                <option value="loss">Loss (-)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={incomeData.category}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSelectedCategory(e.target.value);
                                }}
                            >
                                <option value={incomes?.category}>{incomeData?.category?.toUpperCase()}</option>
                                {incomeCategory.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            {selectedCategory === 'other' && (
                                <input
                                    type="text"
                                    name="otherCategory"
                                    placeholder="Please specify other category"
                                    value={incomeData.otherCategory}
                                    onChange={handleChange}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Income Source</label>
                            <input
                                type="text"
                                name="source"
                                value={incomeData.source}
                                onChange={handleChange}
                                placeholder="Enter income source"
                            />
                            {errors.source && <span className="error-message">{errors.source}</span>}
                        </div>
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                name="job"
                                value={incomeData.job || ""}
                                onChange={handleChange}
                                placeholder="Enter job title"
                            />
                            {errors.source && <span className="error-message">{errors.source}</span>}
                        </div>
                        <div className="form-group">
                            <label>Income Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={incomeData.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                            />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label>Income Date</label>
                            <input
                                type="date"
                                name="date"
                                value={incomeData.date}
                                onChange={handleChange}
                            />
                            {errors.date && <span className="error-message">{errors.date}</span>}
                        </div>
                        <div className='action-buttons'>
                            <button type="submit" className="submitButton" disabled={loadingIncome}>
                                {loadingIncome ? 'Updating...' : 'Update'}
                            </button>
                            <button onClick={handleDelete} id='deleteButton'>
                                {loadingIncome ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditIncomeForm