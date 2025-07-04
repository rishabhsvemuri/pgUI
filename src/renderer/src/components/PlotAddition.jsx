import React, { useEffect, useState, useCallback } from 'react';
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { FaRegTrashCan } from "react-icons/fa6";
import { BsInfoCircle } from "react-icons/bs";
import { BsQuestionCircle } from "react-icons/bs";
import '../assets/style.scss';
import globals from '../assets/globalTest.json'
import plotCircle from '../assets/plotIcons/plotCircle.png';
import plotGenes from '../assets/plotIcons/plotGenes.png';
import plotGenomeLabel from '../assets/plotIcons/plotGenomeLabel.png';
import plotHicRectangle from '../assets/plotIcons/plotHicRectangle.png';
import plotHicSquare from '../assets/plotIcons/plotHicSquare.png';
import plotHicTriangle from '../assets/plotIcons/plotHicTriangle.png';
import plotIdeogram from '../assets/plotIcons/plotIdeogram.png';
import plotLegend from '../assets/plotIcons/plotLegend.png';
import plotManhattan from '../assets/plotIcons/plotManhattan.png';
import plotPairs from '../assets/plotIcons/plotPairs.png';
import plotPolygon from '../assets/plotIcons/plotPolygon.png';
import plotRanges from '../assets/plotIcons/plotRanges.png';
import plotRect from '../assets/plotIcons/plotRect.png';
import plotSegments from '../assets/plotIcons/plotSegments.png';
import plotSignal from '../assets/plotIcons/plotSignal.png';
import plotText from '../assets/plotIcons/plotText.png';
import plotTranscripts from '../assets/plotIcons/plotTranscripts.png';

function PlotAddition() {
  const [plots, setPlots] = useState(window.electron.getPlotsDuplicate());
  const [inputValue, setInputValue] = useState('');
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [newPlotName, setNewPlotName] = useState('');
  const [annotations, setAnnotations] = useState(window.electron.getAnnotationsDuplicate());
  const [valid, setValid] = useState(true);
  const inputSections = ['Data', 'Positional', 'Aesthetic'];
  const [domUpdater, UpdateDom] = useState(0)

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

  //Update PlotsDuplicate to plots whenever plots duplicate is changed
  useEffect(() => {
    window.electron.updatePlotsDuplicate(plots);
    console.log(window.electron.getPlotsDuplicate())
  }, [plots]);

  useEffect(() => {
    window.electron.updateAnnotationsDuplicate(annotations);
    console.log(window.electron.getAnnotationsDuplicate())
  }, [annotations]);


  useEffect(() => {
    const handleJSONGen = (event, jsonData, id) => {
      if (id.includes('annotation')) {
        setAnnotations((prevAnnos) =>
          prevAnnos.map((annotation) =>
            annotation.id === id
              ? { ...annotation, formData: generateFormInputs(jsonData, id) }
              : annotation
          )
        );
      }
      else {
        setPlots((prevPlots) =>
          prevPlots.map((plot) =>
            plot.id === id
              ? { ...plot, formData: generateFormInputs(jsonData, id) }
              : plot
          )
        );
      }
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
  useEffect(() => {
    window.electron.runScript()
    UpdateDom((domUpdater) => domUpdater + 1)
  }, []);

  const generateFormInputs = (jsonData, id) => {
    if (!jsonData) {
      console.log('jsonData not available in PlotAddition');
      return [];
    }

    return Object.keys(jsonData).map((key) => {
      if (key === 'plot' && id.includes('annotation')) {
        const plotid = id.split('annotation')
        window.electron.updateItemValue(id, key, plotid[0]);
        return null; // Skip this key
      }

      if (key === 'params' || key === '...') {
        return null; // skip params and ... params
      }
      
      let options = jsonData[key].options;
      let display
      if (options != null) {
        if (options.includes('c(')) {
          options = options.split(/,(?=(?:[^()"]|\([^()]*\)|"[^"]*")*$)/)
        } else {
          options = options.split(',')
        }
      }
      let fileInput = false
      if (jsonData[key].description.includes('path') || jsonData[key].description.includes('Path')) {
        fileInput = true
      }
      if (globals.hasOwnProperty(key)) {
        options = globals[key].options;
        display = globals[key].display;
      }
      return {
        variable: key,
        type: jsonData[key].type,
        options: options,
        default: jsonData[key].default,
        description: jsonData[key].description,
        section: jsonData[key].class,
        enteredValue: null,
        valid: true,
        fileInput: fileInput,
        display: display,
        id: `${id}-${key}`,
      };
    }).filter(item => item !== null);
  };

  useEffect(() => {
    const handleCheckValid = () => {
      const isValid = checkValidInputs(); // Now it returns a boolean
      setValid(isValid); // Set valid based on the check
      window.electron.sendCheckValidResponse(isValid); // Send the updated value
    }
  
    if (window.electron && window.electron.onCheckValid) {
      window.electron.onCheckValid(handleCheckValid);
    } else {
      console.error('not defined');
    }
  
    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener('check-valid', handleCheckValid);
      }
    };
  }, []);
  
  const checkValidInputs = () => {
    let allValid = true; // Start by assuming all inputs are valid
    setPlots(prevPlots =>
      prevPlots.map(plot => {
        const updatedFormData = plot.formData.map(param => {
          const isValid = param.default || param.enteredValue || param.options; // Check if valid, if field has default or options it's always valid
          if (!isValid) {
            allValid = false; // Mark as invalid if any input fails
            return { ...param, valid: false }; // Return updated param
          }
          return param; // Return unchanged param
        });
        return {
          ...plot,
          formData: updatedFormData,
        };
      })
    );
    setAnnotations(prevAnnos =>
      prevAnnos.map(annotation => {
        const updatedFormData = annotation.formData.map(param => {
          const isValid = param.default || param.enteredValue; // Check if valid
          if (!isValid) {
            allValid = false; // Mark as invalid if any input fails
            return { ...param, valid: false }; // Return updated param
          }
          return param; // Return unchanged param
        });
        return {
          ...annotation,
          formData: updatedFormData,
        };
      })
    );

    return allValid; // Return whether all inputs are valid
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
      // window.electron.addItem(newPlot);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCategoryChange = (id, event) => {
    const updatedPlots = plots.map((plot) => {
      if (plot.id === id) {
        const updatedPlot = { ...plot, category: event.target.value, formData: []};
        window.electron.updateCategory(updatedPlot.name, updatedPlot.category, updatedPlot.id);
        window.electron.updateItemValue(updatedPlot.id, 'name', updatedPlot.name);
        window.electron.loadJson(updatedPlot.category, plot.id);
        return updatedPlot;
      }
      return plot;
    });
    setPlots(updatedPlots);
  };

  const handleBlur = useCallback((event) => {
    const { dataset: { plotId }, name, value } = event.target;
    let formattedValue;
    if (name == 'name') {
      return;
    }
    if (value.includes('fakepath')) {
      formattedValue = `\"${event.target.files[0].path}\"`
      console.log(formattedValue)
    } else {
      formattedValue = value
    }
    if (plotId && name) {
      setPlots(prevPlots =>
        prevPlots.map(plot => {
          if (plot.id === plotId) {
            return {
              ...plot,
              formData: plot.formData.map(param => {
                if (param.variable === name) {
                  window.electron.updateItemValue(plotId, name, formattedValue)
                  return { ...param, enteredValue: formattedValue, valid: true };
                }
                return param;
              }),
            };
          }
          return plot; // Keep other plots unchanged
        })
      );
      setAnnotations(prevAnnos =>
        prevAnnos.map(annotation => {
          if (annotation.id === plotId) {
            return {
              ...annotation,
              formData: annotation.formData.map(param => {
                if (param.variable === name) {
                  window.electron.updateItemValue(plotId, name, formattedValue)
                  return {...param, enteredValue: formattedValue, valid: true}
                }
                return param;
              }),
            };
          }
          return annotation;
        })
      );
    }
  }, []);

  const handleDeletePlot = (id) => {
    setPlots(plots.filter(plot => plot.id !== id));
    const relatedAnnotations = annotations.filter(annotation => annotation.plot === id);
    relatedAnnotations.forEach(annotation => {
      handleDeleteAnno(annotation.id);
    });
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


  const handleAddAnno = (id) => {
      const newAnno = {
        plot: id,
        id: `${id}annotation${Date.now()}`,
        type: 'Select One',
        formData: [],
      };
      setAnnotations([...annotations, newAnno]);
      window.electron.addItem(newAnno);
    }

  const handleAnnotationChange = (plotId, annotationId, event) => {
        const updatedAnnotations = annotations.map((annotation) => {
          if (annotation.id === annotationId) {
            window.electron.updateCategory(null, event.target.value, annotationId);
            window.electron.loadJson(event.target.value, annotationId);
            return { ...annotation, type: event.target.value, formData: []};
          }
          return annotation;
        });
        setAnnotations(updatedAnnotations);
  };

  const handleAnnoBlur = useCallback((event) => {
    const { dataset: { annotationId }, name, value } = event.target;
    if (annotationId && name) {
      window.electron.updateItemValue(annotationId, name, value);
      console.log('reached')
      setAnnotations(prevAnnos =>
        prevAnnos.map(annotation => {
          if (annotation.id === annotationId) {
            return {
              ...annotation,
              formData: annotation.formData.map(param => 
                param.variable === name
                ? {...param, enteredValue: value, valid: true}
                : param,
              ),
            };
          }
          return annotation;
        })
      );
    }
  }, []);

  const handleDeleteAnno = (id) => {
    setAnnotations(prevAnnotations => prevAnnotations.filter(annotation => annotation.id !== id));
    window.electron.updateCategory(null, null, id);
  };  

  return (
    <div id="container">
      <div id="plotListContainer" onBlur={handleBlur} onChange={handleBlur}>

        <ul id="plotList">
          {plots.map((plot) => (
            <li key={plot.id}>
              <div className='plot-div'>
                <div id='plot-header' className='plot-header'>
                <div className='left-items'>
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
                    <p id='plot-name' className='plot-name' onClick={() => handlePlotNameDoubleClick(plot.id, plot.name)}>{plot.name}</p>
                  )}
                </div>
                <div className='right-items'>
                  <FaRegTrashCan onClick={() => handleDeletePlot(plot.id)} className='delete-button' title="Delete Plot">Delete</FaRegTrashCan>
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
                {/* <option value="plotMultiSignal">plotMultiSignal</option> */}
                <option value="plotTranscripts">plotTranscripts</option>
                <option value="plotCircle">plotCircle</option>
                <option value="plotLegend">plotLegend</option>
                {/* <option value="plotPolygon">plotPolygon</option> */}
                <option value="plotRaster">plotRaster</option>
                <option value="plotRect">plotRect</option>
                <option value="plotSegments">plotSegments</option>
                <option value="plotText">plotText</option>
              </select>
              <a href={`https://phanstiellab.github.io/plotgardener/reference/${plot.category}.html`} target='_blank' className='infoButton' title="More info @ Plotgardener site"><BsInfoCircle /></a>
              </div>
              <div className={`field-content ${plot.showFields ? 'active' : ''}`} >
                {inputSections.map(section =>
                  <div>
                  {plot.category != 'Select One' && (plot.formData.filter(formData => formData.section === section).length > 0) ? <><h3>{section}</h3><hr></hr></>:null}
                    <ul>
                    {plot.formData && plot.formData.filter(formData => formData.section === section).map((input) => (
                      <li>
                        <div className={input.valid ? 'input-field' : 'invalid-field'}>
                          <label htmlFor={input.id}>{input.default || input.options ? `${input.variable}` : `${input.variable}*`}</label>
                          {input.options ? (
                            <select id={input.id} name={input.variable} data-plot-id={plot.id} value={input.enteredValue !== null ? input.enteredValue: null} onChange={(e) => handleBlur(e)}>
                              {input.options.map((option, idx) => (
                                <option key={idx} value={option}>{input.variable === 'palette' ? input.display[idx] : option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className='half'
                              id={input.id}
                              name={input.variable}
                              placeholder={input.default}
                              value={input.enteredValue !== null && !input.fileInput ? input.enteredValue : null} // cannot set value for a file input
                              onChange={(e) => handleBlur(e)}
                              data-plot-id={plot.id}
                              type={input.fileInput ? 'file' : null}
                            />
                          )}
                          <div className='tooltip'>
                            <BsQuestionCircle />
                            <span className="tooltipdescription">{input.description}</span>
                          </div>
                        </div>
                      </li>
  
                    ))}
                    </ul>
                  </div>
                )}
                <ul>
                  <div className='anno-div'>
                    {annotations.map((annotation, index) => (
                      (plot.id == annotation.plot ? 
                      <div key={annotation.id} >
                        <div key={index} className='dropdown-container'>
                          <select
                            value={annotation.type}
                            onChange={(event) => handleAnnotationChange(plot.id, annotation.id, event)}
                          >
                            <option value="Select One">Select One</option>
                            <option value="annoDomains">annoDomains</option>
                            <option value="annoGenomeLabel">annoGenomeLabel</option>
                            <option value="annoHeatmapLegend">annoHeatmapLegend</option>
                            <option value="annoHighlight">annoHighlight</option>
                            <option value="annoPixels">annoPixels</option>
                            <option value="annoSegments">annoSegments</option>
                            <option value="annoText">annoText</option>
                            <option value="annoXaxis">annoXaxis</option>
                            <option value="annoYaxis">annoYaxis</option>
                            <option value="annoZoomLines">annoZoomLines</option>
                          </select>
                          <a href={`https://phanstiellab.github.io/plotgardener/reference/${annotation.type}.html`} target='_blank' className='infoButton' title="More info @ Plotgardener site"><BsInfoCircle /></a>
                          <FaRegTrashCan className='delete-button' onClick={() => handleDeleteAnno(annotation.id)} title="Delete Annotation"> </FaRegTrashCan>
                        </div>
                        {annotation.formData && annotation.formData.map((input) => (
                            <li>
                              <div className={input.valid ? 'input-field' : 'invalid-field'}>
                                <label htmlFor={input.id}>{input.default ? `${input.variable}` : `${input.variable}*`}</label>
                                {input.options ? (
                                  <select id={input.id} name={input.variable} data-plot-id={annotation.id}>
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
                                    value={input.enteredValue !== null ? input.enteredValue: null}
                                    data-plot-id={annotation.id}
                                    type={input.fileInput ? 'file' : null}
                                  />
                                )}
                                <div className='tooltip'>
                                  <BsQuestionCircle />
                                  <span className="tooltipdescription">{input.description}</span>
                                </div>
                              </div>
                            </li>
                        ))}
                      </div>: null)
                    ))}
                    {plot.category !== 'Select One' ? (
                      <button onClick={() => handleAddAnno(plot.id)}>Add Annotation +</button>
                    ) : null}
                  </div>
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
