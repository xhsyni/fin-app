import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import '../../styles/expense.css'
import { useDispatch, useSelector } from 'react-redux';
import { addExpenses, viewAllExpense, extractFile, resetExpenseState } from '../../redux/slices/expenseSlice';
import loadingGIF from "../../assets/loading.gif"

function Expense({ isActive, setActive }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [expenseData, setExpenseData] = useState({
        date: "",
        category: "Self",
        otherCategory: "",
        sub_category: "individual",
        otherSubCategory: "",
        amount: "",
        name: "",
        description: "",
        filename: [],
        isDeductible: true,
    });
    const [errors, setErrors] = useState({});
    const subCategory = {
        "Self": ["individual", "spouse/alimony with no income or joint assessment", "parent medical expenses"],
        "Medical": ["serious disease", "accident", "vacination", "checkup"],
        "Lifestyle": ["learning materials", "electronics", "sport equipment", "internet", "utilities"],
        "Education": ["education fees", "course"],
        "Parenthood": ["breastfeeding", "childcare fees", "SSPN deposit", "child relief", "full-time education", "tertiary education"],
        "Insurance": ["health insurance", "life insurance", "SOSCO", "deferred annuity"],
        "Disability": ["equipment", "individual", "spouse", "child", "additional relief"],
        "Donation": ['donation'],
        "Other": [],
    };
    const { loadingExtract,
        extractedExpense,
        expense,
        loadingExpense,
        errorExpense,
        createExpense,
    } = useSelector((state) => state.expense || {});

    useEffect(() => {
        if (extractedExpense.imageText) {
            setExpenseData(prev => ({
                ...prev,
                name: extractedExpense.imageText.name,
                date: extractedExpense.imageText.date,
                category: extractedExpense.imageText.category,
                sub_category: extractedExpense.imageText.sub_category.toLowerCase(),
                isDeductible: extractedExpense.imageText.isDeductible,
                amount: extractedExpense.imageText.amount,
                description: extractedExpense.imageText.summary,
            }));
        }
    }, [extractedExpense])

    const handleBack = () => {
        if (typeof setActive === 'function') {
            setActive(false);
        }
        navigate('/user/expense');
        dispatch(resetExpenseState());
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
        const validFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return fileValidation.includes(extension);
        });
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

        if (validFiles.length) {
            setExpenseData(prev => ({
                ...prev,
                filename: [...prev.filename, ...validFiles]
            }));
            setErrors(prevErrors => ({
                ...prevErrors,
                filename: undefined
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
            setExpenseData(prev => ({
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
        setExpenseData(prev => ({
            ...prev,
            filename: prev.filename.filter((_, i) =>
                i !== index
            )
        }));
        dispatch(resetExpenseState());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!expenseData.date || expenseData.date.trim() === '') {
            newErrors.date = "Date is required";
        }
        if (!expenseData.name || expenseData.name.trim() === '') {
            newErrors.name = "Name is required";
        }
        if (!expenseData.amount || expenseData.amount.trim() === '') {
            newErrors.amount = "Amount is required";
        }
        if (!expenseData.otherCategory && expenseData.category === 'other') {
            newErrors.category = "Category is required";
        }
        if (!expenseData.otherSubCategory && expenseData.sub_category === '') {
            newErrors.otherSubCategory = "Sub-category is required";
        }
        if (expenseData.filename.length === 0) {
            newErrors.filename = "Please upload at least one file!";
        } else if (expenseData.filename.length > 5) {
            newErrors.filename = "You can only upload up to 5 files";
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            dispatch(addExpenses(expenseData))
                .then(() => {
                    dispatch(viewAllExpense());
                    navigate('/user/expense');
                    if (typeof setActive === 'function') {
                        setActive(false);
                    }
                });
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        if (name === 'category') {
            setExpenseData(prevState => ({
                ...prevState,
                sub_category: subCategory[value][0] || '',
                otherSubCategory: '',
            }));
            if (value !== 'other') {
                setExpenseData(prevState => ({
                    ...prevState,
                    otherCategory: '',
                    otherSubCategory: '',
                }));
            }
        }
        if (value && value.trim() !== '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined
            }));
            if (name === 'sub_category') {
                setErrors(prevState => ({
                    ...prevState,
                    otherSubCategory: undefined,
                }));
            }
        }
    }
    const handleExtractData = () => {
        dispatch(resetExpenseState());
        dispatch(extractFile(expenseData.filename));
    }

    return (
        <>
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
                {expenseData.filename.length > 0 && (
                    <div className="file-list">
                        {expenseData.filename.map((file, index) => (
                            <div key={index} className="file-item">
                                <span>{file.name}</span>
                                <button onClick={() => removeFile(index)}
                                    className="remove-file">
                                    x
                                </button>
                            </div>
                        ))}
                        {extractedExpense?.imageText ? (
                            <div className="form-group">
                                <label>AI Summary:</label>
                                <textarea
                                    value={extractedExpense?.imageText?.summary || ''}
                                    readOnly
                                    rows={4}
                                    cols={50}
                                />
                            </div>
                        ) : loadingExtract ? (
                            <div className="loading-spinner">
                                <img src={loadingGIF} alt="Loading..." width={50} height={50} />
                            </div>
                        ) : (
                            <button className='submitButton' onClick={handleExtractData}>
                                Extract
                            </button>
                        )}
                    </div>
                )}
                <div style={{ borderTop: "solid 1px rgb(0,0,0)" }}>
                    <div className='form-header'>
                        <button className="submitButton" onClick={handleBack}>Back</button>
                        <h2>Add New Expense</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Expense Date</label>
                            <input type="date" name="date" onChange={handleChange} value={expenseData.date} />
                            {errors.date && <span className="error-message">{errors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label>Expense Name</label>
                            <input type="text" name="name" onChange={handleChange} value={expenseData.name} />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Expense Amount</label>
                            <input type="number" name="amount" onChange={handleChange} value={expenseData.amount} />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label>Expense Category</label>
                            <select name="category" onChange={handleChange} value={expenseData.category}>
                                {Object.keys(subCategory).map((cat, index) => (
                                    <option key={index} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {expenseData.category === 'Other' && (
                                <input
                                    type="text"
                                    name="otherCategory"
                                    placeholder="Please specify other category"
                                    value={expenseData.otherCategory}
                                    onChange={handleChange}
                                />
                            )}
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>
                        <div className="form-group">
                            <label>Expense Sub-Category</label>
                            <select name="sub_category" onChange={handleChange} value={expenseData.sub_category}>
                                {expenseData.category && subCategory[expenseData.category] &&
                                    subCategory[expenseData.category].map((subCat, index) => (
                                        <option key={index} value={subCat}>
                                            {subCat}
                                        </option>
                                    ))
                                }
                            </select>
                            {(expenseData.category === 'other' || expenseData.sub_category === '') && (
                                <input
                                    type="text"
                                    name="otherSubCategory"
                                    placeholder="Please specify other sub-category"
                                    value={expenseData.otherSubCategory}
                                    onChange={handleChange}
                                />
                            )}
                            {errors.otherSubCategory && <span className="error-message">{errors.otherSubCategory}</span>}
                        </div>
                        <div className="form-group">
                            <label>Is Deducted?</label>
                            <select name="isDeductible" onChange={handleChange} value={expenseData.isDeductible}>
                                <option value={true}>Yes (Suggested)</option>
                                <option value={false}>No (Not Suggested)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Expense Description (Summary)</label>
                            <textarea name="description"
                                onChange={handleChange}
                                rows={4}
                                cols={50}
                                value={expenseData.description} />
                        </div>
                        <button type="submit" className="submitButton">Submit</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Expense