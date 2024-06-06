import React, { useEffect, useState } from 'react';
import '.././assets/style.scss';

function PathEntry() {
  const [pageCreateData, setPageCreateData] = useState({});

  useEffect(() => {
    const runOnStart = () => {
      const id = 'a0';
      const category = 'pageCreate';
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

  const handlePathBlur = (event) => {
    const pathText = event.target.value;
    window.electron.savePath(pathText);
  };

  const generatePageCreate = () => {
    const { jsonData, id } = pageCreateData;
    return (
      <div id="pageCreateFields">
        {jsonData &&
          Object.keys(jsonData).map((key) => {
            const variable = key;
            const type = jsonData[key].type;
            return (
              <div key={variable} className="plot-div">
                <label htmlFor={`${id}-${variable}`} style={{ color: 'white' }}>
                  {variable}
                </label>
                <input
                  id={`${id}-${variable}`}
                  name={variable}
                  placeholder={type}
                  data-plot-id={id}
                  onBlur={(event) => handleInputBlur(event, id)}
                />
              </div>
            );
          })}
      </div>
    );
  };

  const handleInputBlur = (event, id) => {
    if (event.target.tagName.toLowerCase() === 'input') {
      window.electron.updateItemValue(id, event.target.name, event.target.value);
    }
  };

  return (
    <div id="creator">
      <div id="pageCreate">
        <h2>Create a plotgardener page:</h2>
        {generatePageCreate()} {/* Call generatePageCreate here */}
      </div>
    </div>
  );
}

export default PathEntry;