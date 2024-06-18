import React, { useState, useEffect } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
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
      <div className='code-editor'>
        <CodeMirror
          value={code}
          options={{
            mode: 'r',
            theme: 'material',
            lineNumbers: true
          }}
          onBeforeChange={(editor, data, value) => {
            handleChange(editor, data, value);
          }}
        />
      </div>
    );
  }
  
  export default Code;