import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Expense from '../components/expense/ExpenseForm';
import EditExpenseForm from '../components/expense/EditExpenseForm';

function AddExpensePage() {
    const { isActive, setActive, isEditActive, setEditActive } = useOutletContext() || {};
    const { id } = useParams();

    return (
        <>
            {!id ? (
                <Expense
                    isActive={isActive}
                    setActive={setActive}
                />
            ) : (
                <EditExpenseForm
                    isActive={isEditActive}
                    setActive={setEditActive}
                    id={id}
                />
            )}
        </>
    );
}

export default AddExpensePage;