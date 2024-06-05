import React, { useEffect, useState } from 'react';
import '.././assets/style.scss';

function Output() {
  const [pdfPath, setPdfPath] = useState('');
  const [showPdf, setShowPdf] = useState(false); // State to control rendering
  const [message, setMessage] = useState(''); // State to control rendering

  useEffect(() => {
    const handleRefreshPDF = (event, savePath) => {
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

  useEffect(() => {
    const handleMessage = (event, message) => {
      setMessage(message);
    };

    if (window.electron && window.electron.onMessage) {
      window.electron.onMessage(handleMessage);
    } else {
      console.error('message not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('message', handleMessage);
      }
    };
  }, []);




  return (
    <div className='output-div'>
      <p>{message}</p>
      {showPdf && pdfPath ? (
        <embed className='pdf' src={pdfPath} type="application/pdf" id="pdf" width="850px" height="1100px" />
      ) : (
        <p className='pdf'>No PDF Generated</p>
      )}
    </div>
  );
}

export default Output;


