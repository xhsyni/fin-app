import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { IoIosAddCircleOutline } from 'react-icons/io'
import { addTax, viewAllTax } from '../redux/slices/taxSlice'
import { BiExport, BiError } from "react-icons/bi";
import ChartJS from 'chart.js/auto';


function TaxFiling() {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isActive, setActive] = useState(false);
    const [isActive1, setActive1] = useState(false);
    const { taxs } = useSelector((state) => state.tax)
    const [year, setYear] = useState(() => {
        const taxYears = Object.keys(taxs?.totalTax || {});
        console.log(taxYears)
        return taxYears.length > 0
            ? taxYears[taxYears.length - 1]
            : new Date().getFullYear().toString();
    });

    function handleIncomeReport() {
        setActive(true);
        navigate('/user/tax/report')
    }

    function handleIncomeTax() {
        setActive1(true);
        navigate('/user/tax/manage-tax')
    }

    useEffect(() => {
        dispatch(viewAllTax())
    }, [dispatch])

    useEffect(() => {
        if (taxs && taxs.tax) {
            const sortedData = [...taxs.tax].sort((a, b) => a.year - b.year);

            const data = {
                labels: sortedData.map(item => item.year),
                datasets: [
                    {
                        label: 'Tax Liability',
                        data: sortedData.map(item => item.income_tax),
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    },
                    {
                        label: 'Taxable Income',
                        data: sortedData.map(item => item.taxable_income),
                        backgroundColor: 'rgba(53, 162, 235, 0.7)',
                        borderColor: 'rgb(53, 162, 235)',
                        borderWidth: 1
                    },
                    {
                        label: 'Deductions',
                        data: sortedData.map(item => item.deduction),
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    }
                ]
            };

            const options = {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Tax Liability Analysis'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'RM ' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                barPercentage: 0.8,
                categoryPercentage: 0.9
            };

            const ctx = chartRef.current.getContext('2d');

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new ChartJS(ctx, {
                type: 'bar',
                data: data,
                options: options
            });
        }
    }, [taxs]);

    console.log(year)

    return (
        <>
            <div className={`overlay-content ${isActive || isActive1 ? "active" : ""}`}>
                <Outlet context={{
                    isActive: isActive,
                    setActive: setActive,
                    isActive1: isActive1,
                    setActive1: setActive1
                }}
                />
            </div>
            <div className="content">
                <div className='content-header'>
                    <h2>Tax Overview</h2>
                    <div className='control-header'>
                        <select onChange={(e) => setYear(e.target.value)} value={year}>
                            {taxs && Object.keys(taxs?.totalTax || {}).map((yearOption) =>
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            )}
                        </select>
                        <button onClick={handleIncomeTax}>
                            <IoIosAddCircleOutline />
                            Manage Income Tax
                        </button>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Effective Tax Rate ({taxs?.totalTax?.[year] ? year : "N/A"})</h3>
                        <h2 className="amount">
                            {
                                taxs?.totalTax?.[year]?.taxable_income
                                    ? ((taxs.totalTax[year].income_tax || 0) / taxs.totalTax[year].taxable_income * 100).toFixed(1)
                                    : "0.0"
                            }%
                        </h2>
                        <p>This rate shows the average percentage of income paid in taxes for the year {year}.</p>
                        <p>A lower rate may indicate effective tax planning or available deductions.</p>
                    </div>
                    <div className="analytic-card">
                        <h3>Average Income Tax</h3>
                        <h2 className="amount">
                            RM {taxs?.totalTax && taxs.totalTax[year] ? (() => {
                                const years = Object.keys(taxs.totalTax);
                                const totalTax = years.reduce((sum, yr) => sum + (taxs.totalTax[yr]?.income_tax || 0), 0);
                                return (totalTax / years.length).toFixed(2);
                            })() : "0.00"}
                        </h2>
                        {taxs?.totalTax && Object.keys(taxs.totalTax).length > 1 && taxs.totalTax[year] && (() => {
                            const years = Object.keys(taxs.totalTax);
                            const currentYearTax = taxs.totalTax[year]?.income_tax || 0;
                            const previousYear = years.find(yr => yr !== year);
                            const previousYearTax = taxs.totalTax[previousYear]?.income_tax || 0;
                            const change = previousYearTax ? ((currentYearTax - previousYearTax) / previousYearTax * 100).toFixed(2) : "0.00";
                            return <p>{`Change from previous year: ${change}%`}</p>;
                        })()}

                    </div>
                    <div className="analytic-card">
                        <h3>Deduction to Tax Ratio ({year})</h3>
                        <h2 className="amount">
                            {taxs?.totalTax?.[year]
                                ? ((taxs.totalTax[year].deduction || 0) / (taxs.totalTax[year].income_tax || 1)).toFixed(2)
                                : "0.00"}
                        </h2>

                        <p>A higher ratio would indicate deductions are having a greater impact on reducing taxes relative to your total liability.</p>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <h3>Tax Liability Analysis</h3>
                        <div style={{ height: '450px', width: '100%' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div className="analytic-card">
                        <div className='content-header'>
                            <h3>Tax History</h3>
                        </div>
                        {taxs && taxs.tax?.length > 0 ? (
                            <div className='content-table'>
                                <table className='income-table'>
                                    <thead>
                                        <tr>
                                            {taxs && Object?.keys(taxs?.tax?.[0] || {}).filter(key => key !== "file").map((key) => (
                                                <th key={key} className="table-header">
                                                    {key?.charAt(0).toUpperCase() + key.slice(1)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className='tbody-style'>
                                        {taxs && taxs.tax?.map((tax, index) => (
                                            <tr key={index}>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">#{tax.id}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">{tax.year}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">
                                                            RM {tax?.deduction.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex-container">
                                                        <div className="table-text">
                                                            RM {tax?.taxable_income.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="table-text">
                                                        RM {tax?.income_tax.toFixed(2)}
                                                    </div>
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
            </div>
        </>
    )
}

export default TaxFiling
