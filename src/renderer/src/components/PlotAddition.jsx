import React, { useEffect, useState, useCallback } from 'react';
import '../assets/style.scss';

function PlotAddition() {
  const [plots, setPlots] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleJSONGen = (event, jsonData, id) => {
      setPlots((prevPlots) =>
        prevPlots.map((plot) =>
          plot.id === id
            ? { ...plot, formData: generateFormInputs(jsonData, id) }
            : plot
        )
      );
    };
    
    if (window.electron && window.electron.onjsonGen) {
      window.electron.onjsonGen(handleJSONGen);
    } else {
      console.error('jsonGen not defined');
    }

    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('json-gen', handleJSONGen);
      }
    };
  }, []);

  const generateFormInputs = (jsonData, id) => {
    if (!jsonData) {
      console.log('jsonData not available in PlotAddition');
      return [];
    }
    return Object.keys(jsonData).map((key) => ({
      variable: key,
      type: jsonData[key].type,
      id: `${id}-${key}`,
    }));
  };

  const handleAddPlot = () => {
    if (plots.length > 0 && plots[plots.length - 1].category === 'Select One') {
      console.log('Please select a category for the last input');
    } else {
      const newPlot = {
        id: `item${Date.now()}`,
        name: inputValue,
        category: 'Select One',
        formData: [],
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

  const handleBlur = useCallback((event) => {
    if (event.target.tagName.toLowerCase() === 'input') {
      const { dataset: { plotId }, name, value } = event.target;
      window.electron.updateItemValue(plotId, name, value);
    }
  }, []);

  return (
    <div id="container">
      <div id="plotListContainer" onBlur={handleBlur}>
        <ul id="plotList">
          {plots.map((plot) => (
            <li key={plot.id}>
              <div className='plot-div'>
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
              {plot.formData && plot.formData.map((input) => (
                <div key={input.id} className="plot-div">
                  <label htmlFor={input.id}>{input.variable}</label>
                  <input
                    id={input.id}
                    name={input.variable}
                    placeholder={input.type}
                    data-plot-id={plot.id}
                  />
                  <br />
                </div>
              ))}
              </div>
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