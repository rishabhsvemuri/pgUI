import React, { useEffect, useState } from 'react';
import '.././assets/style.scss';

function Output() {
  const [pdfPath, setPdfPath] = useState('');
  const [showPdf, setShowPdf] = useState(false); // State to control rendering

  useEffect(() => {
    const handleRefreshPDF = (event, savePath) => {
      console.log(`Received refresh-pdf event with path: ${savePath}`);
      setShowPdf(false); // Hide the PDF element temporarily
      setTimeout(() => {
        setPdfPath(`atom://${savePath}`);
        setShowPdf(true); // Show the PDF element again
      }, 0);
    };

    if (window.electron && window.electron.onRefreshPDF) {
      console.log('Setting up onRefreshPDF listener');
      window.electron.onRefreshPDF(handleRefreshPDF);
    } else {
      console.error('window.electron.onRefreshPDF is not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        console.log('Removing onRefreshPDF listener');
        window.electron.removeListener('refresh-pdf', handleRefreshPDF);
      }
    };
  }, []);

  return (
    <div className='output-div'>
      {showPdf && pdfPath ? (
        <embed className='pdf' src={pdfPath} id="pdf" width="850px" height="1100px" />
      ) : (
        <p className='pdf'>No PDF Generated</p>
      )}
    </div>
  );
}

export default Output;


