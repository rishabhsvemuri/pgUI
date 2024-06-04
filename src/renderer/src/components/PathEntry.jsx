import React, {useEffect} from 'react';
import '.././assets/style.scss';

function PathEntry() {

  useEffect(() => {
    // Function to run when the component mounts
    const runOnStart = () => {
      const id = 'a-0';
      const category = 'pageCreate'
      window.electron.updateCategory(category, category, id);
      window.electron.loadJson(category, id);
    };
    runOnStart();
  }, []);

  useEffect(() => {
    const handleCreateInputs = (event, jsonData, id) => {
      generatePageCreate(jsonData, id);
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

  function generatePageCreate (jsonData, id) {
    // Get the container where the inputs will be appended
    const container = document.getElementById('pageCreate');
    let subcontainer = document.getElementById('pageCreateFields');
    if (subcontainer != null) {
      return;
    }
    subcontainer = document.createElement('div');
    subcontainer.setAttribute('id', 'pageCreateFields')
    // Check if the container exists
    if (!container) {
      console.error('Container element not found in plotaddition');
      return;
    }
    if (jsonData == null) {
      console.log('jsondata not available in plotaddition')
    }
    for (const key in jsonData){
      if(jsonData.hasOwnProperty(key)){
        const variable = `${key}`
        const things = `${jsonData[key].type}`
        // Create a label for the input
        const label = document.createElement('label');
        label.setAttribute('for', variable);
        label.textContent = variable;
        label.style.color = "white"
        // Create the input element
        const input = document.createElement('input');
        input.setAttribute('id', `${id}-${variable}`);
        input.setAttribute('name', variable);
        input.setAttribute('placeholder', things)
        input.setAttribute('data-plot-id', id);
        // Append the label and input to the subcontainer
        subcontainer.appendChild(label);
        subcontainer.appendChild(input);
        subcontainer.classList.add('plot-div');
        // Add a line break for better readability
        subcontainer.appendChild(document.createElement('br'));
      }
    }
    container.appendChild(subcontainer);
    // Attach a single event listener to the container using event delegation
    container.addEventListener('blur', function(event) {
      if (event.target.tagName.toLowerCase() === 'input') {
        window.electron.updateItemValue(event.target.getAttribute('data-plot-id'), event.target.name, event.target.value);
      }
    }, true);
  };

  return (
    <div id="creator">
      <div id="askPath">
        <h2>Enter path:</h2>
        <input type="text" id="path" onBlur={handlePathBlur} class = "path-input" placeholder = "path/file-name.pdf"/>
      </div>
      <div id = "pageCreate">
        <h2>Create a plotgardener page:</h2>
      </div>
    </div>
  );
}

export default PathEntry;