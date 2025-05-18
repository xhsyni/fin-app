import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/taxcontainer.css'
import { useSelector, useDispatch } from 'react-redux';
import { addTax, updateTax, viewAllTax, exportReport } from '../../redux/slices/taxSlice';

function ManageTax({ isActive, setActive }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [years, setYears] = useState([]);
    const [inputYear, setInputYear] = useState(new Date().getFullYear());
    const { taxs, loadingTax, exportReportPath } = useSelector((state) => state.tax);

    useEffect(() => {
        if (taxs?.tax.length > 0) {
            setYears(taxs?.tax.map((tax) => tax.year));
        } else {
            setYears([]);
        }
    }, [taxs]);

    const handleBack = () => {
        if (typeof setActive === 'function') {
            setActive(false);
        }
        navigate(-1)
            .then(dispatch(viewAllTax));
    }

    const handleAddYear = () => {
        if (!years.includes(inputYear)) {
            setYears([inputYear, ...years]);
            setInputYear(new Date().getFullYear());
        }
    }
    const exportButton = (year) => {
        dispatch(exportReport({ create: { year } }));
    }

    return (
        <div className="form-content">
            <div className='form-header'>
                <button className="submitButton" onClick={handleBack}>Back</button>
                <h2>Manage Tax</h2>
            </div>
            <div className="form-container">
                <div className='tax-list'>
                    {years.sort((a, b) => b - a).map((year) => (
                        <div key={year} className='tax-container'>
                            <h3>Year {year}</h3>
                            {taxs?.tax.find(tax => tax.year === year) ? (
                                <>
                                    <div className='tax-info'>
                                        <p>Total Taxable Income: RM {taxs.tax.find(tax => tax.year === year).taxable_income}</p>
                                        <p>Total Deduction: RM {taxs.tax.find(tax => tax.year === year).deduction}</p>
                                        <p>Total Income Tax: RM {taxs.tax.find(tax => tax.year === year).income_tax}</p>
                                    </div>
                                    <div className='control-buttons'>
                                        <button className="update-button" onClick={() => dispatch(updateTax({ create: { year } }))}>
                                            {loadingTax ? "Loading..." : "Update Income Tax"}
                                        </button>
                                        <button className="add-button" onClick={e => exportButton(year)}>
                                            Export Report
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button className="add-button" onClick={() =>
                                    dispatch(addTax({ create: { year } }))
                                        .then(dispatch(viewAllTax()),
                                            navigate(-1),
                                            setActive(false)
                                        )}>
                                    Add Income Tax
                                </button>
                            )}
                        </div>
                    ))}
                    <div className='form-group1'>
                        <div className='form-group'>
                            <label>Year:</label>
                            <input
                                type="number"
                                name='year'
                                value={inputYear}
                                onChange={(e) => setInputYear(parseInt(e.target.value))}
                                min="2000"
                                max="2100"
                            />
                        </div>
                        <button className="add-year-button" onClick={handleAddYear}>
                            + Add a New Year
                        </button>
                    </div>
                    <p>The Income Tax will be calculated based on the income and expense.</p>
                </div>
            </div>
        </div >
    )
}

export default ManageTax