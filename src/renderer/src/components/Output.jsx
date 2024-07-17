import React, { useEffect, useState } from 'react';
import Loader from 'react-loaders';
import '.././assets/style.scss';

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
      setActiveTab('loader')
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
          <embed className='pdf' src={pdfPath} type="application/pdf" id="pdf" width="850px" height="1100px" />
        ) : (
          <>
            <p className='pdf' id='pdf-text'>No PDF Generated</p>
            {message != '' ? <hr id='output-hr'/>: null}
          </>
        )}
        <p id='output-text'>{message}</p>
      </div>

      <div className={`pdfOrLoader ${activeTab === 'loader' ? 'active' : ''}`}>
        <Loader className='loaderIconSpinner' type="ball-clip-rotate-multiple" active />
      </div>
    </div>
  );
}

export default Output;


// import React, { useEffect, useState } from 'react';
// import '.././assets/style.scss';
// import Loader from 'react-loaders';

// function Output() {
//   const [pdfPath, setPdfPath] = useState('');
//   const [showPdf, setShowPdf] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const handleRefreshPDF = (event, savePath) => {
//       setShowPdf(false);
//       setLoading(true); // Show the loader
//       setTimeout(() => {
//         setPdfPath(`atom://${savePath}`);
//         setLoading(false); // Hide the loader
//         setShowPdf(true);
//       }, 0);
//     };

//     const handleMessage = (event, msg) => {
//       setMessage(msg);
//       if (msg === '') {
//         setLoading(false); // Hide the loader if there's no message
//       }
//     };

//     if (window.electron && window.electron.onRefreshPDF) {
//       window.electron.onRefreshPDF(handleRefreshPDF);
//       window.electron.onMessage(handleMessage);
//     } else {
//       console.error('window.electron.onRefreshPDF is not defined');
//     }
//     if (window.electron && window.electron.onMessage) {
//       window.electron.onMessage(handleMessage);
//     } else {
//       console.error('window.electron.onMessage is not defined');
//     }

//     return () => {
//       if (window.electron && window.electron.removeListener) {
//         console.log('Removing onRefreshPDF listener');
//         window.electron.removeListener('refresh-pdf', handleRefreshPDF);
//       }
//       if (window.electron && window.electron.removeListener) {
//         console.log('Removing onRefreshPDF listener');
//         window.electron.removeListener('message', handleMessage);
//       }
//     };
//   }, []);

//   return (
//     <div className='output-div'>
//       {loading && (
//         <div className="loader-container">
//           <Loader type="ball-clip-rotate-multiple" active />
//         </div>
//       )}
//       {showPdf && (
//         <>
//         <embed className='pdf' src={pdfPath} type="application/pdf" id="pdf" width="850px" height="1100px" />
//         <div className="loader-container">
//           <Loader type="ball-clip-rotate-multiple" active />
//         </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Output;
