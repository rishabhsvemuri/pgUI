import React, { useEffect, useState } from 'react';
import '.././assets/style.scss';
import { BsQuestionCircle } from "react-icons/bs";
import { BsInfoCircle } from "react-icons/bs";

function PathEntry() {
  const [pageCreateData, setPageCreateData] = useState({});
  const [a0, setA0] = useState(() => {
    const plots = window.electron.getPlotsBackEnd();
    return plots.has('a0') ? Object.fromEntries(plots.get('a0')) : {};
  });

  const printHashMap = () => {
    console.log("Plots Hashmap:", window.electron.getPlotsBackEnd());
  };

  useEffect(() => {
    const runOnStart = () => {
      const plots = window.electron.getPlotsBackEnd();
      const id = 'a0';
      const category = 'pageCreate';
      if (plots.size === 0) {
        window.electron.updateCategory(category, category, id);
      }
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
      setA0(prev => ({ ...prev, [event.target.name]: event.target.value }));
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
                    onChange={(event) => handleInputBlur(event, id)}
                    value={a0 && a0.hasOwnProperty(key) ? a0[key] : null}
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
                    onChange={(event) => handleInputBlur(event, id)}
                    value={a0 && a0.hasOwnProperty(key) ? a0[key] : null}
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
        <div className='page-create'>
          <h2>Create a page:</h2>
          <a href={`https://phanstiellab.github.io/plotgardener/reference/pageCreate.html`} target='_blank' className='infoButton'><BsInfoCircle /></a>
        </div>
        {generatePageCreate()}
        <button onClick={printHashMap}>Click</button>
      </div>
    </div>
  );
}

export default PathEntry;
