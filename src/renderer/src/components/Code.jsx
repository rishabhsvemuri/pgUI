import React, { useState, useEffect } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/icecoder.css';
import 'codemirror/mode/r/r';

function Code() {
    const [code, setCode] = useState('');
  
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
  
    return (
      <div className='plot-div'>
        <h2>Generated R Script</h2>
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
        </div>
      </div>

    );
  }
  
  export default Code;

  