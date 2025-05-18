import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { viewAllExpense, resetExpenseState } from '../redux/slices/expenseSlice';
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate, Outlet } from 'react-router-dom';
import '../styles/expense.css'
import SuccessToast from '../components/successToast';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { BiError } from "react-icons/bi";
import { createLineChart } from '../components/lineChart';
import { createPieChart } from '../components/pieChart';
import { TbFileExport } from "react-icons/tb";

function ExpensePage() {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const chartPieRef = useRef(null);
    const chartPieInstance = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { expenses, loadingExpense, errorExpense, createExpense, deleteExpense, updateExpense } = useSelector((state) => state.expense);
    const [expenseActive, setExpenseActive] = useState(false);
    const [expenseActive1, setExpenseActive1] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const [year, setYear] = useState(() => {
        const expenseYears = Object.keys(expenses?.totalExpenses || {});
        return expenseYears.length > 0
            ? expenseYears[expenseYears.length - 1]
            : new Date().getFullYear().toString();
    });

    const colorTheme = {
        gain: "#1E40AF",
        loss: "#DC2626",
    };

    const backColorTheme = {
        gain: "#93C5FD",
        loss: "#FCA5A5",
    };

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (chartPieInstance.current) {
            chartPieInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const ctxPie = chartPieRef.current.getContext('2d');

        if (ctx && ctxPie) {
            chartInstance.current = createLineChart(ctx, expenses, year, 'Monthly Expenses');
            chartPieInstance.current = createPieChart(ctxPie, expenses, year, 'Expense Category');
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            if (chartPieInstance.current) {
                chartPieInstance.current.destroy();
            }
        };
    }, [expenses, year]);

    useEffect(() => {
        dispatch(viewAllExpense());
    }, [dispatch]);

    useEffect(() => {
        if (createExpense) {
            setShowToast(true);
            setMessage('Expense added successfully!');
        } else if (deleteExpense) {
            setShowToast(true);
            setMessage('Expense deleted successfully!');
        } else if (updateExpense) {
            setShowToast(true);
            setMessage('Expense updated successfully!');
        }
        if (createExpense || deleteExpense || updateExpense) {
            setTimeout(() => {
                dispatch(resetExpenseState());
            }, 388);
        }
    }, [createExpense, deleteExpense, updateExpense, dispatch]);

    const handleAddExpense = () => {
        navigate('add-expense');
        setExpenseActive(true);
    }

    function showExpense(id) {
        setExpenseActive1(true);
        navigate(`/user/expense/modify-expense/${id}`);
    }

    return (
        <>
            {showToast && (
                <SuccessToast
                    message={message}
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className={`overlay-content ${expenseActive || expenseActive1 ? "active" : ""}`}>
                <Outlet context={{
                    isActive: expenseActive,
                    setActive: setExpenseActive,
                    isEditActive: expenseActive1,
                    setEditActive: setExpenseActive1,
                }} />
            </div>
            <div className="content">
                <div className='content-header'>
                    <h2>Expense Overview</h2>
                    <div className='control-header'>
                        <select onChange={(e) => setYear(e.target.value)} value={year}>
                            {expenses && Object?.keys(expenses?.totalExpenses || {}).length > 0 ?
                                (Object?.keys(expenses?.totalExpenses || {}).map((year, index) => (
                                    <option key={index} value={year}>
                                        {year}
                                    </option>
                                ))) :
                                (
                                    <option value={new Date().getFullYear().toString()}>
                                        {new Date().getFullYear().toString()}
                                    </option>
                                )
                            }
                        </select>
                        <button onClick={handleAddExpense}>
                            <IoIosAddCircleOutline />
                            Add Expense
                        </button>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Total Expenses ({year})</h3>
                        <h2 className="amount">RM {expenses?.totalExpenses?.[year] || 0}</h2>
                        <div className="card-footer">
                            <div className="trend-indicator">
                                <span className="trend-icon"
                                    style={{
                                        color: expenses?.totalExpenses?.[year] > (expenses?.totalExpenses?.[year - 1] || 0)
                                            ? "#16A34A"
                                            : "#DC2626"
                                    }}
                                >
                                    {expenses?.totalExpenses?.[year] > (expenses?.totalExpenses?.[year - 1] || 0)
                                        ? <FaArrowTrendUp />
                                        : <FaArrowTrendDown />}
                                    <span>
                                        {(() => {
                                            if (!expenses?.totalExpenses?.[year] || !expenses?.totalExpenses?.[year - 1]) {
                                                return '0%';
                                            }
                                            const difference = expenses.totalExpenses[year] - expenses.totalExpenses[year - 1];
                                            const percent = (difference / expenses.totalExpenses[year - 1] * 100).toFixed(1);
                                            return `${percent}%`;
                                        })()}
                                    </span>
                                </span>
                            </div>
                            <span className="comparison">vs last year ({year - 1})</span>
                        </div>
                    </div>
                    <div className="analytic-card">
                        <h3>Average Monthly Expenses ({year})</h3>
                        <p>Month With Expenses</p>
                        <h2 className="amount">RM {expenses?.averageExpenses?.[year]?.toFixed(2) || 0}</h2>
                        <p>Month Without Expenses</p>
                        <h2 className="amount">RM {expenses?.averageExpenses1?.[year]?.toFixed(2) || 0}</h2>
                    </div>
                    <div className="analytic-card">
                        <h3>Expenses Category ({year})</h3>
                        <div style={{ height: '150px', width: '100%' }}>
                            <canvas ref={chartPieRef}></canvas>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Expenses Distribution ({year})</h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div id='table-card'>
                        <h3>Expenses History</h3>
                        {expenses && expenses.expense?.length > 0 ? (
                            <div className='content-table'>
                                <table className='income-table'>
                                    <thead>
                                        <tr>
                                            {expenses && Object?.keys(expenses?.expense?.[0] || {})
                                                .filter(key => key !== "file" && key !== "description").map((key) => (
                                                    <th key={key} className="table-header">
                                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                                    </th>
                                                ))}
                                            <th className="table-header">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='tbody-style'>
                                        {expenses && expenses.expense?.map((expense, index) => (
                                            <tr key={index} onClick={() => showExpense(expense.id)}>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">#{expense.id}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">{expense.date}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="table-text">
                                                        {expense.expense_name}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="table-status" style={{ color: "#065F46" }}>
                                                        {expense.category.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="table-status" style={{
                                                        color: colorTheme[expense.sub_category.toLowerCase()],
                                                        backgroundColor: backColorTheme[expense.sub_category.toLowerCase()]
                                                    }}>
                                                        {expense.sub_category.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="table-text">RM {expense.amount}</td>
                                                <td className="table-cell">
                                                    <span className="table-text">
                                                        {expense.deductible ? "Applicable" : "Not Applicable"}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                    <button className="table-button" onClick={() => showExpense(expense.id)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) :
                            (
                                <div className='no-data'>
                                    <BiError />
                                    <h4>No expense data found.....</h4>
                                    <p>Please add your expenses</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export default ExpensePage