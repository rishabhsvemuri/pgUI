import React, { useEffect, useState, useRef } from 'react';
import '.././assets/style.scss';

function Output() {
  const [pdfPath, setPdfPath] = useState('');

  useEffect(() => {
    const handleRefreshPDF = (event, savePath) => {
      console.log(`Received refresh-pdf event with path: ${savePath}`);
      setPdfPath(savePath)
    };

    if (window.electron && window.electron.onRefreshPDF) {
      window.electron.onRefreshPDF(handleRefreshPDF);
    } else {
      console.error('window.electron.onRefreshPDF is not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('refresh-pdf', handleRefreshPDF);
      }
    };
  }, []);

  return (
    <div className='output-div'>
      {pdfPath ? (
        <embed className='pdf' src={`atom://${pdfPath}`}  id="pdf" width="850px" height="1100px" />
      ) : (
        <p className='pdf'>No PDF Generated</p>
      )}
    </div>
  );
}

export default Output;


