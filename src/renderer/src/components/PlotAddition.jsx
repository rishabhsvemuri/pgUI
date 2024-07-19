import React, { useEffect, useState, useCallback } from 'react';
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { FaRegTrashCan } from "react-icons/fa6";
import { BsInfoCircle } from "react-icons/bs";
import { BsQuestionCircle } from "react-icons/bs";
import '../assets/style.scss';
import plotCircle from '../assets/plotIcons/plotCircle.png'
import plotGenes from '../assets/plotIcons/plotGenes.png'
import plotGenomeLabel from '../assets/plotIcons/plotGenomeLabel.png'
import plotHicRectangle from '../assets/plotIcons/plotHicRectangle.png'
import plotHicSquare from '../assets/plotIcons/plotHicSquare.png'
import plotHicTriangle from '../assets/plotIcons/plotHicTriangle.png'
import plotIdeogram from '../assets/plotIcons/plotIdeogram.png'
import plotLegend from '../assets/plotIcons/plotLegend.png'
import plotManhattan from '../assets/plotIcons/plotManhattan.png'
import plotPairs from '../assets/plotIcons/plotPairs.png'
import plotPolygon from '../assets/plotIcons/plotPolygon.png'
import plotRanges from '../assets/plotIcons/plotRanges.png'
import plotRect from '../assets/plotIcons/plotRect.png'
import plotSegments from '../assets/plotIcons/plotSegments.png'
import plotSignal from '../assets/plotIcons/plotSignal.png'
import plotText from '../assets/plotIcons/plotText.png'
import plotTranscripts from '../assets/plotIcons/plotTranscripts.png'

function PlotAddition() {
  const [plots, setPlots] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [newPlotName, setNewPlotName] = useState('');

  const plotImages = new Map([
    ["plotCircle", plotCircle],
    ["plotGenes", plotGenes],
    ["plotGenomeLabel", plotGenomeLabel],
    ["plotHicRectangle", plotHicRectangle],
    ["plotHicSquare", plotHicSquare],
    ["plotHicTriangle", plotHicTriangle],
    ["plotIdeogram", plotIdeogram],
    ["plotLegend", plotLegend],
    ["plotManhattan", plotManhattan],
    ["plotPairs", plotPairs],
    ["plotPolygon", plotPolygon],
    ["plotRanges", plotRanges],
    ["plotRect",plotRect],
    ["plotSegments", plotSegments],
    ["plotSignal", plotSignal],
    ["plotText", plotText],
    ["plotTranscripts", plotTranscripts],
  ]);

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
    return Object.keys(jsonData).map((key) => {
      let options = jsonData[key].options;
      if (options != null) {
        if (options.includes('c(')) {
          options = options.split(/,(?=(?:[^()"]|\([^()]*\)|"[^"]*")*$)/)
        } else {
          options = options.split(',')
        }
      }
      return {
        variable: key,
        type: jsonData[key].type,
        options: options,
        default: jsonData[key].default,
        description: jsonData[key].description,
        section: jsonData[key].class,
        id: `${id}-${key}`,
      };
    });
  };

  const handleAddPlot = () => {
    if (plots.length > 0 && plots[plots.length - 1].category === 'Select One') {
      console.log('Please select a category for the last input');
    } else {
      const newPlot = {
        id: `item${Date.now()}`,
        name: inputValue === '' ? 'Untitled Plot': inputValue,
        category: 'Select One',
        showFields: true,
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

  const handleBlur = useCallback((event) => {
    const { dataset: { plotId }, name, value } = event.target;
    if (plotId && name) {
      window.electron.updateItemValue(plotId, name, value);
    }
  }, []);

  const handleDeletePlot = (id) => {
    setPlots(plots.filter(plot => plot.id !== id));
    window.electron.updateCategory(null, null, id);
  };

  const handleFieldCollapse = (id) => {
    const updatedPlots = plots.map((plot) => {
      if(plot.id === id){
        const updatedPlot = { ...plot, showFields: !plot.showFields};
        return updatedPlot;
      }
      return plot;
    });
    setPlots(updatedPlots);
  };

  const handlePlotNameDoubleClick = (id, name) => {
    setEditingPlotId(id);
    setNewPlotName(name);
  };

  const handlePlotNameChange = (e) => {
    setNewPlotName(e.target.value);
  };

  const handlePlotNameBlur = (id) => {
    setPlots((prevPlots) =>
      prevPlots.map((plot) =>
        plot.id === id ? { ...plot, name: newPlotName } : plot
      )
    );
    window.electron.updateItemValue(id, 'name', newPlotName);
    setEditingPlotId(null);
  };

  return (
    <div id="container">
      <div id="plotListContainer" onBlur={handleBlur} onChange={handleBlur}>
        <ul id="plotList">
          {plots.map((plot) => (
            <li key={plot.id}>
              <div className='plot-div'>
                <div id='plot-header' className='plot-header'>
                <img className='plot-icon-image' src={plotImages.get(plot.category)}/>
                  {editingPlotId === plot.id ? (
                    <input
                      type="text"
                      value={newPlotName}
                      onChange={handlePlotNameChange}
                      onBlur={() => handlePlotNameBlur(plot.id)}
                      autoFocus
                    />
                  ) : (
                    <p id='plot-name' className='edit-name' onClick={() => handlePlotNameDoubleClick(plot.id, plot.name)}>{plot.name}</p>
                  )}
                <div>
                  <FaRegTrashCan onClick={() => handleDeletePlot(plot.id)} className='delete-button' >Delete</FaRegTrashCan>
                  {plot.showFields ? <TiArrowSortedUp className='collapseButton' onClick={() => handleFieldCollapse(plot.id)}/>: <TiArrowSortedDown className='collapseButton' onClick={() => handleFieldCollapse(plot.id)}/>}
                </div>
              </div>
              <div className='dropdown-container'>
              <select
                className='full'
                value={plot.category}
                onChange={(event) => handleCategoryChange(plot.id, event)}
              >
                <option value="Select One">Select One</option>
                <option value="plotGenes">plotGenes</option>
                <option value="plotGenomeLabel">plotGenomeLabel</option>
                <option value="plotHicRectangle">plotHicRectangle</option>
                <option value="plotHicSquare">plotHicSquare</option>
                <option value="plotHicTriangle">plotHicTriangle</option>
                <option value="plotIdeogram">plotIdeogram</option>
                <option value="plotManhattan">plotManhattan</option>
                <option value="plotPairs">plotPairs</option>
                <option value="plotPairsArches">plotPairsArches</option>
                <option value="plotRanges">plotRanges</option>
                <option value="plotSignal">plotSignal</option>
                <option value="plotMultiSignal">plotMultiSignal</option>
                <option value="plotTranscripts">plotTranscripts</option>
                <option value="plotCircle">plotCircle</option>
                <option value="plotLegend">plotLegend</option>
                <option value="plotPolygon">plotPolygon</option>
                <option value="plotRaster">plotRaster</option>
                <option value="plotRect">plotRect</option>
                <option value="plotSegments">plotSegments</option>
                <option value="plotText">plotText</option>
              </select>
              <a href={`https://phanstiellab.github.io/plotgardener/reference/${plot.category}.html`} target='_blank' className='infoButton'><BsInfoCircle /></a>
              </div>
              <div className={`field-content ${plot.showFields ? 'active' : ''}`} >
                <ul>
                  {plot.formData && plot.formData.map((input, idx, arr) => (
                    <React.Fragment key={input.id}>
                      {(idx === 0 || input.section !== arr[idx - 1].section) && (
                        <>
                          {idx !== 0 && <hr />}
                          <h3>{input.section}</h3>
                        </>
                      )}
                      <li>
                        <div className='input-field'>
                          <label htmlFor={input.id}>{input.variable}</label>
                          {input.options ? (
                            <select id={input.id} name={input.variable} data-plot-id={plot.id}>
                              {input.options.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className='half'                     
                              id={input.id}
                              name={input.variable}
                              placeholder={input.default}
                              data-plot-id={plot.id}
                            />
                          )}
                          <div className='tooltip'>
                            <BsQuestionCircle />
                            <span className="tooltipdescription">{input.description}</span>
                          </div>
                        </div>
                      </li>
                    </React.Fragment>
                  ))}
                </ul>
              </div>
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
        <button id="addPlotButton" onClick={handleAddPlot}>
          Add Plot
        </button>
      </div>
    </div>
  );
}

export default PlotAddition;
