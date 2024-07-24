import React, { useEffect, useState } from 'react';
import Loader from 'react-loaders';
import '.././assets/style.scss';
import pgUIStartUp from '.././assets/pgUIOutput.pdf'

function Output() {
  const [pdfPath, setPdfPath] = useState('');
  const [showPdf, setShowPdf] = useState(false); // State to control rendering
  const [message, setMessage] = useState(''); // State to control rendering
  const [activeTab, setActiveTab] = useState('pdf');

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
      if (message.includes('Error')) {
        setActiveTab('err')
      } else {
        setActiveTab('loader');
      }
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

  useEffect(() => {
    if (showPdf) {
      setActiveTab('pdf');
    }
  }, [showPdf]);


  return (
    <div className='output-div'>
      <div className={`pdfOrLoader ${activeTab === 'pdf' ? 'active' : ''}`}>
        {showPdf && pdfPath ? (
          <embed className='pdf' src={pdfPath} type="application/pdf" id="pdf" width="850px" height="750px" />
        ) : (
          <>
            <embed className='pdf' src={pgUIStartUp} type="application/pdf" id="pdf" width="850px" height="750px" />
            {/* <p className='pdf' id='pdf-text'>No PDF Generated</p>
            {message != '' ? <hr id='output-hr'/>: null} */}
          </>
        )}
      </div>
      <div className={`pdfOrLoader ${activeTab === 'err' ? 'active' : ''}`}>
        <p id='pdf-text'>{message}</p>
      </div>
      <div className={`pdfOrLoader ${activeTab === 'loader' ? 'active' : ''}`}>
        <Loader className='loaderIconSpinner' type="square-spin" active style={{transform: 'scale(2.0)'}}/>
      </div>
    </div>
  );
}

export default Output;