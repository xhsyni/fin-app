import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/income.css'
import { useDispatch, useSelector } from "react-redux";
import { addIncome, viewAllIncome } from '../../redux/slices/incomeSlice';
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import loadingGIF from "../../assets/loading.gif"

function Income({ isActive, setActive }) {
    const dispatch = useDispatch();
    const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [incomeData, setIncomeData] = useState({
        source: "",
        amount: "",
        date: today,
        category: 'business',
        otherCategory: "",
        job: userInfo?.user?.job || "",
        type: 'gain',
        filename: [],
    });
    const [selectedCategory, setSelectedCategory] = useState('business');
    const [errors, setErrors] = useState({});
    const {
        incomes,
        loadingIncome,
        errorIncome,
        createIncome,
    } = useSelector((state) => state.income || {});

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


    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const fileValidation = ['.png', '.jpg', '.jpeg', '.pdf'];
        const invalidFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return !fileValidation.includes(extension);
        });

        if (invalidFiles.length > 0) {
            setErrors(prevErrors => ({
                ...prevErrors,
                filename: `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only ${fileValidation.join(', ')} files are allowed.`
            }));
            return;
        }

        const validFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return fileValidation.includes(extension);
        });
        if (validFiles.length) {
            setIncomeData(prev => ({
                ...prev,
                filename: [...prev.filename, ...validFiles]
            }));
            setErrors(prevErrors => ({
                ...prevErrors,
                filename: undefined
            }));
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setIncomeData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (value && value.trim() !== '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined
            }));
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const fileValidation = ['.png', '.jpg', '.jpeg', '.pdf'];
        const invalidFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return !fileValidation.includes(extension);
        });
        if (invalidFiles.length > 0) {
            setErrors(prevErrors => ({
                ...prevErrors,
                filename: `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only ${fileValidation.join(', ')} files are allowed.`
            }));
            return;
        }
        const validFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return fileValidation.includes(extension);
        });
        if (validFiles.length) {
            setIncomeData(prev => ({
                ...prev,
                filename: [...prev.filename, ...validFiles]
            }));
        }
        setErrors(prevErrors => ({
            ...prevErrors,
            filename: undefined
        }));
    }

    const removeFile = (index) => {
        setIncomeData(prev => ({
            ...prev,
            filename: prev.filename.filter((_, i) =>
                i !== index
            )
        }));
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
        if (incomeData.filename.length === 0) {
            newErrors.filename = "Please upload at least one file!";
        } else if (incomeData.filename.length > 5) {
            newErrors.filename = "You can only upload up to 5 files";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            dispatch(addIncome(incomeData))
                .then(() => {
                    dispatch(viewAllIncome());
                    navigate('/user/income');
                    if (typeof setActive === 'function') {
                        setActive(false);
                    }
                });
        }
    }

    return (
        <>
            {errorIncome && <span className="error-message">{typeof errorIncome === 'string' ? errorIncome : 'An error occurred'}</span>}
            <div className="form-content">
                <div
                    className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <BsFileEarmarkArrowUp />
                    <p>Drag and drop files here, or click to select</p>
                    <p>The system will fill up the text form automatically for you</p>
                    {errors.filename && <span className="error-message">{errors.filename}</span>}
                </div>
                {incomeData.filename.length > 0 && (
                    <div className="file-list">
                        {incomeData.filename.map((file, index) => (
                            <div key={index} className="file-item">
                                <span>{file.name}</span>
                                <button onClick={() => removeFile(index)}
                                    className="remove-file">
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ borderTop: "solid 1px rgb(0,0,0)" }}>
                    <div className='form-header'>
                        <button className="submitButton" onClick={handleBack}>Back</button>
                        <h2>Add New Income</h2>
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
                                <option value="business">Business Income</option>
                                <option value="rental">Rental Income</option>
                                <option value="dividend">Dividend Income</option>
                                <option value="interest">Interest Income</option>
                                <option value="royalties">Royalties Income</option>
                                <option value="pensions">Pensions Income</option>
                                <option value="other">Other</option>
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
                        <button type="submit" className="submitButton" disabled={loadingIncome}>
                            {loadingIncome ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Income