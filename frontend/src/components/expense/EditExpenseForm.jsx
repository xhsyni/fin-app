import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import BASE_URL from '../../utils/baseURL';
import { editExpenses, viewAllExpense, deleteExpenses } from '../../redux/slices/expenseSlice';

function EditExpenseForm({ isActive, setActive, id }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [expenseData, setExpenseData] = useState({
        date: "",
        category: "",
        otherCategory: "",
        sub_category: "",
        otherSubCategory: "",
        amount: "",
        expense_name: "",
        description: "",
        filename: [],
        deductible: true,
    });
    const [errors, setErrors] = useState({});
    const {
        expenses,
        loadingExpense,
        errorExpense,
        createExpense,
        deleteExpense,
        updateExpense,
    } = useSelector((state) => state.expense || {});
    const subCategory = {
        "Self": ["individual", "family", "parent",],
        "Medical": ["serious disease", "accident", "vacination"],
        "Lifestyle": ["learning materials", "electronics", "sport equipment", "internet", "utilities"],
        "Education": ["education fees", "course"],
        "Child Expenses": [],
        "Parenthood": ["breastfeeding", "childcare fees", "SSPN deposit", "child relief", "full-time education", "tertiary education"],
        "Insurance": ["health insurance", "life insurance", "SOSCO", "deferred annuity"],
        "Family": [],
        "Disability": ["equipment", "individual", "spouse", "child", "additional relief"],
        "Donation": [],
        "Other": [],
    };

    const handleBack = () => {
        if (typeof setActive === 'function') {
            setActive(false);
        }
        navigate('/user/expense')
    }
    useEffect(() => {
        if (id && expenses?.expense) {
            const targetExpense = expenses.expense.find((expense) => expense.id === parseInt(id));
            if (targetExpense) {
                setExpenseData(targetExpense);
            }
        }
    }, [id, expenses]);

    useEffect(() => {
        if (createExpense) {
            navigate('/user/expense');
            if (typeof setActive === 'function') {
                setActive(false);
            }
        }
    }, [createExpense, navigate]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!expenseData.date || expenseData.date.trim() === '') {
            newErrors.date = "Date is required";
        }
        if (!expenseData.expense_name || expenseData.expense_name.trim() === '') {
            newErrors.expense_name = "Name is required";
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
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            dispatch(editExpenses(expenseData))
                .then(() => {
                    dispatch(viewAllExpense());
                    navigate('/user/expense');
                    if (typeof setActive === 'function') {
                        setActive(false);
                    }
                });
        }
    }

    function handleDelete() {
        dispatch(deleteExpenses({ expenseid: id }))
            .then(() => {
                dispatch(viewAllExpense());
                navigate('/user/expense');
                if (typeof setActive === 'function') {
                    setActive(false);
                }
            });
    }

    function handleDownload(e) {
        e.preventDefault();
        if (expenseData?.file?.length > 0) {
            expenseData.file.forEach(fileUrl => {
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
        <div className="form-content">
            {expenseData?.file?.length > 0 && (
                <div className="file-list">
                    {expenseData?.file.map((file, index) => (
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
                    <h2>Edit Expense (ID #E{id})</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Expense Date</label>
                        <input type="date" name="date" onChange={handleChange} value={expenseData.date} />
                        {errors.date && <span className="error-message">{errors.date}</span>}
                    </div>
                    <div className="form-group">
                        <label>Expense Name</label>
                        <input type="text" name="expense_name" onChange={handleChange} value={expenseData.expense_name} />
                        {errors.expense_name && <span className="error-message">{errors.expense_name}</span>}
                    </div>
                    <div className="form-group">
                        <label>Expense Amount</label>
                        <input type="number" name="amount" onChange={handleChange} value={expenseData.amount} />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>
                    <div className="form-group">
                        <label>Expense Category</label>
                        <select name="category" onChange={handleChange} value={expenseData.category}>
                            <option value={expenses?.category}>{expenseData?.category?.toUpperCase()}</option>
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
                            <option value={expenses?.sub_category}>{expenseData?.sub_category?.toUpperCase()}</option>
                            {expenseData.category && subCategory[expenseData.category] &&
                                subCategory[expenseData.category].map((subCat, index) => (
                                    <option key={index} value={subCat}>
                                        {subCat}
                                    </option>
                                ))
                            }
                        </select>
                        {expenseData.category === 'other' || expenseData.sub_category === '' && (
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
                        <select name="deductible" onChange={handleChange} value={expenseData.deductible}>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Expense Description (Summary)</label>
                        <textarea
                            value={expenseData.description || ''}
                            name="description" onChange={handleChange}
                            rows={4}
                            cols={50}
                        />
                    </div>
                    <div className='action-buttons'>
                        <button type="submit" className="submitButton" disabled={loadingExpense}>
                            {loadingExpense ? 'Updating...' : 'Update'}
                        </button>
                        <button onClick={handleDelete} id='deleteButton'>
                            {loadingExpense ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    )
}

export default EditExpenseForm