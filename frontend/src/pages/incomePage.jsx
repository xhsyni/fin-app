import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { IoIosAddCircleOutline } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import SuccessToast from '../components/successToast';
import { resetIncomeState, viewAllIncome } from '../redux/slices/incomeSlice';
import { createLineChart } from '../components/lineChart';
import { createPieChart } from '../components/pieChart';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { BiError } from "react-icons/bi";
import { TbFileExport } from "react-icons/tb";


function IncomePage() {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const chartPieRef = useRef(null);
    const chartPieInstance = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [incomeActive, setIncomeActive] = useState(false);
    const [incomeActive1, setIncomeActive1] = useState(false);
    const [reportActive, setReportActive] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const {
        incomes,
        loadingIncome,
        errorIncome,
        createIncome,
        deleteIncome,
        updateIncome,
    } = useSelector((state) => state.income || {});
    const [year, setYear] = useState(() => {
        const incomeYears = Object.keys(incomes?.totalIncome || {});
        return incomeYears.length > 0
            ? incomeYears[incomeYears.length - 1]
            : new Date().getFullYear().toString();
    });
    const handleAddIncome = () => {
        navigate('add-income');
        setIncomeActive(true);
    }

    useEffect(() => {
        dispatch(viewAllIncome())
    }, [dispatch]);

    const colorTheme = {
        gain: "#1E40AF",
        loss: "#DC2626",
    };

    const backColorTheme = {
        gain: "#93C5FD",
        loss: "#FCA5A5",
    };

    useEffect(() => {
        if (createIncome) {
            setShowToast(true);
            setMessage('Income added successfully!');
        } else if (deleteIncome) {
            setShowToast(true);
            setMessage('Income deleted successfully!');
        } else if (updateIncome) {
            setShowToast(true);
            setMessage('Income updated successfully!');
        }
        if (createIncome || deleteIncome || updateIncome) {
            setTimeout(() => {
                dispatch(resetIncomeState());
            }, 388);
        }
    }, [createIncome, updateIncome, deleteIncome, dispatch]);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (chartPieInstance.current) {
            chartPieInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const ctxPie = chartPieRef.current.getContext('2d');
        chartInstance.current = createLineChart(ctx, incomes, year, 'Monthly Income');
        chartPieInstance.current = createPieChart(ctxPie, incomes, year, 'Income Category');
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            if (chartPieInstance.current) {
                chartPieInstance.current.destroy();
            }
        };
    }, [incomes, year]);

    function showIncome(id) {
        setIncomeActive1(true);
        navigate(`/user/income/modify-income/${id}`);
    }


    return (
        <>
            {showToast && (
                <SuccessToast
                    message={message}
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className={`overlay-content ${incomeActive || incomeActive1 || reportActive ? "active" : ""}`}>
                <Outlet context={{
                    isActive: incomeActive,
                    setActive: setIncomeActive,
                    isEditActive: incomeActive1,
                    setEditActive: setIncomeActive1,
                    isReportActive: reportActive,
                    setReportActive: setReportActive,
                }} />
            </div>
            <div className="content">
                <div className='content-header'>
                    <h2>Income Overview</h2>
                    <div className='control-header'>
                        <select onChange={(e) => setYear(e.target.value)} value={year}>
                            {incomes && Object?.keys(incomes?.totalIncome || {}).length > 0 ?
                                (Object?.keys(incomes?.totalIncome || {}).map((year, index) => (
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
                        <button onClick={handleAddIncome}>
                            <IoIosAddCircleOutline />
                            Add Income
                        </button>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Total Income ({year})</h3>
                        <h2 className="amount">RM {incomes?.totalIncome?.[year] || 0}</h2>
                        <div className="card-footer">
                            <div className="trend-indicator">
                                <span className="trend-icon"
                                    style={{
                                        color: incomes?.totalIncome?.[year] > (incomes?.totalIncome?.[year - 1] || 0)
                                            ? "#16A34A"
                                            : "#DC2626"
                                    }}
                                >
                                    {incomes?.totalIncome?.[year] > (incomes?.totalIncome?.[year - 1] || 0)
                                        ? <FaArrowTrendUp />
                                        : <FaArrowTrendDown />}
                                    <span>
                                        {(() => {
                                            if (!incomes?.totalIncome?.[year] || !incomes?.totalIncome?.[year - 1]) {
                                                return '0%';
                                            }
                                            const difference = incomes.totalIncome[year] - incomes.totalIncome[year - 1];
                                            const percent = (difference / incomes.totalIncome[year - 1] * 100).toFixed(1);
                                            return `${percent}%`;
                                        })()}
                                    </span>
                                </span>
                            </div>
                            <span className="comparison">vs last year ({year - 1})</span>
                        </div>
                    </div>
                    <div className="analytic-card">
                        <h3>Average Monthly Income ({year})</h3>
                        <p>Month With Income</p>
                        <h2 className="amount">RM {incomes?.averageIncome?.[year]?.toFixed(2) || 0}</h2>
                        <p>Month Without Income</p>
                        <h2 className="amount">RM {incomes?.averageIncome1?.[year]?.toFixed(2) || 0}</h2>
                    </div>
                    <div className="analytic-card">
                        <h3>Income Category ({year})</h3>
                        <div style={{ height: '150px', width: '100%' }}>
                            <canvas ref={chartPieRef}></canvas>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Income Distribution ({year})</h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div id='table-card'>
                        <h3>Income History</h3>
                        {incomes && incomes.income?.length > 0 ? (
                            <div className='content-table'>
                                <table className='income-table'>
                                    <thead>
                                        <tr>
                                            {incomes && Object?.keys(incomes?.income?.[0] || {}).filter(key => key !== "file").map((key) => (
                                                <th key={key} className="table-header">
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </th>
                                            ))}
                                            <th className="table-header">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='tbody-style'>
                                        {incomes && incomes.income?.map((income, index) => (
                                            <tr key={index} onClick={() => showIncome(income.id)}>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">#{income.id}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">{income.source}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="table-text">{income.date}</div>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="table-status" style={{ color: "#065F46" }}>
                                                        {income.category.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="table-text">RM {income.amount}</td>
                                                <td className="table-cell">
                                                    <span className="table-status" style={{
                                                        color: colorTheme[income.type.toLowerCase()],
                                                        backgroundColor: backColorTheme[income.type.toLowerCase()]
                                                    }}>
                                                        {income.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="table-text">
                                                        {income.job}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                    <button className="table-button" onClick={() => showIncome(income.id)}>
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
                                    <h4>No income data found.....</h4>
                                    <p>Please add your income</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export default IncomePage