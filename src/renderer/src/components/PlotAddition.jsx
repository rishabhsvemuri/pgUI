import React, { useEffect, useState } from 'react';
import {defaultPlots, updateDefaultPlots} from './Defaults'
import '.././assets/style.scss';
import Header from '.././assets/pg-wordmark.png'

function PlotAddition() {
  const [plots, setPlots] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputFields, setInputFields] = useState({});

  useEffect(() => {
    const handleJSONGen = (event, jsonData, id) => {
      setInputFields(jsonData);
      generateFormInputs(jsonData, id);
    };

    if (window.electron && window.electron.onjsonGen) {
      window.electron.onjsonGen(handleJSONGen);
    } else {
      console.error('jsongen not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('json-gen', handleJSONGen);
      }
    };
  }, []);

  function generateFormInputs (jsonData, id) {
    // Get the container where the inputs will be appended
    const container = document.getElementById('plotList');
    let subcontainer = document.getElementById(`${id}-container`);
    let append = true;
    if (subcontainer == null) {
      subcontainer = document.createElement('div');
      subcontainer.setAttribute('id', `${id}-container`);
    }
    else {
      subcontainer.innerHTML = '';
      append = false;
    }
    // Check if the container exists
    if (!container) {
      console.error('Container element not found in plotaddition');
      return;
    }
    if (jsonData == null) {
      console.log('jsondata not available in plotaddition')
    }
    // existingInputs.forEach(input => input.remove());
    for (const key in jsonData){
      if(jsonData.hasOwnProperty(key)){
        // console.log(`${key}`)
        const variable = `${key}`
        const type = `${jsonData[key].type}`
        // Create a label for the input
        const label = document.createElement('label');
        label.setAttribute('for', variable);
        label.textContent = variable
        // label.style.color = "white"
        // Create the input element
        const input = document.createElement('input');
        input.setAttribute('id', `${id}-${variable}`);
        input.setAttribute('name', variable);
        input.setAttribute('placeholder', type)
        input.setAttribute('data-plot-id', id);
        // input.classList.add('plot-div');
        // Append the label and input to the subcontainer
        subcontainer.appendChild(label);
        subcontainer.appendChild(input);
        subcontainer.classList.add('plot-div');
        // Add a line break for better readability
        subcontainer.appendChild(document.createElement('br'));
      }
      // apend subcountainer to container if has not been appended before
      if (append){
        container.appendChild(subcontainer);
      }
    }
    // Attach a single event listener to the container using event delegation
    container.addEventListener('blur', function(event) {
      if (event.target.tagName.toLowerCase() === 'input') {
        window.electron.updateItemValue(event.target.getAttribute('data-plot-id'), event.target.name, event.target.value)
      }
    }, true);
  }

  const handleAddPlot = () => {
    console.log(plots.length);
    if (plots.length > 0 && plots[plots.length - 1].category === 'Select One') {
      console.log('Please select a category for the last input');
    }
    else {
      const newPlot = {
        id: `item-${Date.now()}`,
        name: inputValue,
        category: 'Select One',
      };

      setPlots([...plots, newPlot]);
      setInputValue('');
      window.electron.addItem(newPlot);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCategoryChange = (id, event) => {
    const updatedPlots = plots.map((plot) => {
      if (plot.id === id) {
        const updatedPlot = { ...plot, category: event.target.value };
        window.electron.updateCategory(updatedPlot.name, updatedPlot.category, updatedPlot.id);
        window.electron.loadJson(updatedPlot.category, plot.id);
        return updatedPlot;
      }
      return plot;
    });
    setPlots(updatedPlots);
  };

  const handleRunScript = () => {
    window.electron.runScript();
  };

  return (
    <div id="container">
      <img className = 'header' src = {Header} ></img>
      <div id="plotListContainer">
        <ul id="plotList">
          {plots.map((plot) => (
            <li key={plot.id}>
              {plot.name}
              <select
                value={plot.category}
                onChange={(event) => handleCategoryChange(plot.id, event)}
              >
                <option value="Select One">Select One</option>
                <option value="plotGenes">plotGenes</option>
                <option value="plotGenomeLabel">plotGenomeLabel</option>
                <option value="plotHicRectangle">plotHicRectangle</option>
                <option value="plotHicSquare">plotHicSquare</option>
                <option value="plotHicTriangle">plotHicTriangle</option>
                <option value="plotHicIdeogram">plotHicIdeogram</option>
                <option value="plotManhattan">plotManhattan</option>
                <option value="plotPairs">plotPairs</option>
                <option value="plotPairsArches">plotPairsArches</option>
                <option value="plotRanges">plotRanges</option>
                <option value="plotSignal">plotSignal</option>
                <option value="plotMultiSignal">plotMultiSignal</option>
                <option value="plotTranscripts">plotTranscripts</option>
                <option value="plotCircle">plotCircle</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
      <div id="addPlotContainer">
        <input
          type="text"
          id="plotInput"
          placeholder="Plot Name"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button id="addPlot" onClick={handleAddPlot}>Add Plot</button>
      </div>
      <hr />
      <div>
        <button id="rbtn" type="button" onClick={handleRunScript} className='rbtn'>Run Script</button>
      </div>
    </div>
  );
}

export default PlotAddition;