import React, { useState, useEffect } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import { BsArrowsAngleExpand } from "react-icons/bs";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/icecoder.css';
import 'codemirror/mode/r/r';

function Code() {
    const [code, setCode] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    
  
    useEffect(() => {
      const fetchData = async () => {
        const initialCode = await window.electron.readWrittenR();
        setCode(initialCode);
      };
  
      fetchData();
    });
  
    const handleChange = (editor, data, value) => {
      setCode(value);
      window.electron.writeWrittenR(value);
    };

    const handleDownload = () => {
      window.electron.downloadCode(code)
    };

    const handleExpand = () => {

    }
  
    return (
      <div className={`plot-div ${isExpanded ? "expanded" : ""}`}>
        <div className='expand-header'>
          <h2 className='gen-r-script'>Generated R Script</h2> 
          <BsArrowsAngleExpand 
            className="expand-code" 
            onClick={() => setIsExpanded(!isExpanded)} 
          />
        </div>
        <div className='code-editor'>
        <CodeMirror
          value={code}
          options={{
            mode: 'r',
            theme: 'icecoder',
            lineNumbers: true
          }}
          onBeforeChange={(editor, data, value) => {
            handleChange(editor, data, value);
          }}
        />
        <button onClick={handleDownload}>Download Code</button>
        </div>
        
      </div>

    );
  }
  
  export default Code;

  