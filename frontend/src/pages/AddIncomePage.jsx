import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Income from '../components/income/IncomeForm';
import EditIncomeForm from '../components/income/EditIncomeForm';

function AddIncomePage() {
    const { isActive, setActive, isEditActive, setEditActive } = useOutletContext() || {};
    const { id } = useParams();

    return (
        <>
            {!id ? (
                <Income
                    isActive={isActive}
                    setActive={setActive}
                />
            ) : (
                <EditIncomeForm
                    isActive={isEditActive}
                    setActive={setEditActive}
                    id={id}
                />
            )}
        </>
    );
}

export default AddIncomePage;