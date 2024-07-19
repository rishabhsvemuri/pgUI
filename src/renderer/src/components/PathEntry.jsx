import React, { useEffect, useState } from 'react';
import '.././assets/style.scss';
import { BsQuestionCircle } from "react-icons/bs";

function PathEntry() {
  const [pageCreateData, setPageCreateData] = useState({});

  useEffect(() => {
    const runOnStart = () => {
      const id = 'a0';
      const category = 'pageCreate';
      window.electron.runScript();
      window.electron.updateCategory(category, category, id);
      window.electron.loadJson(category, id);
    };
    runOnStart();
  }, []);

  useEffect(() => {
    const handleCreateInputs = (event, jsonData, id) => {
      setPageCreateData({ jsonData, id });
    };

    if (window.electron && window.electron.onCreatePage) {
      window.electron.onCreatePage(handleCreateInputs);
    } else {
      console.error('createPage not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('create-page', handleCreateInputs);
      }
    };
  }, []);

  const handleInputBlur = (event, id) => {
    if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'select') {
      window.electron.updateItemValue(id, event.target.name, event.target.value);
    }
  };

  const generatePageCreate = () => {
    const { jsonData, id } = pageCreateData;
    return (
      <div id="pageCreateFields">
        {jsonData &&
          Object.keys(jsonData).map((key) => {
            const variable = key;
            const type = jsonData[key].type;
            const defaultArg = jsonData[key].default;
            const options = jsonData[key].options;
            const description = jsonData[key].description;
            return (
              <div key={variable} className="input-field">
                <label htmlFor={`${id}-${variable}`} style={{ color: 'white' }}>
                  {variable}
                </label>
                {options ? (
                  <select
                    id={`${id}-${variable}`}
                    name={variable}
                    data-plot-id={id}
                    onBlur={(event) => handleInputBlur(event, id)}
                  >
                    {options.split(',').map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${id}-${variable}`}
                    name={variable}
                    placeholder={defaultArg}
                    data-plot-id={id}
                    onBlur={(event) => handleInputBlur(event, id)}
                  />
                )}
                <div className='tooltip'>
                  <BsQuestionCircle />
                  <span className="tooltipdescription">{description}</span>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div id="creator">
      <div id="pageCreate" className='plot-div'>
        <h2>Create a page:</h2>
        {generatePageCreate()} {/* Call generatePageCreate here */}
      </div>
    </div>
  );
}

export default PathEntry;