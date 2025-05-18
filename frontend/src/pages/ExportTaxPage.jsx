import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DownloadForm from '../components/tax/downloadReport';
import ManageTax from '../components/tax/manageTax';

function ExportTaxPage() {
    const { isActive, setActive, isActive1, setActive1 } = useOutletContext() || {};

    return (
        <>
            {isActive && (
                <DownloadForm
                    isActive={isActive}
                    setActive={setActive}
                />
            )}
            {isActive1 && (
                <ManageTax
                    isActive={isActive1}
                    setActive={setActive1}
                />
            )}
        </>
    );
}

export default ExportTaxPage