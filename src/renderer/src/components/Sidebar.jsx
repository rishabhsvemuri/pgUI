import React, { useEffect, useState, useCallback } from 'react';
import { FaFile } from "react-icons/fa";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { LuShovel } from "react-icons/lu";
import { FaCode } from "react-icons/fa";
import { LuNetwork } from "react-icons/lu";
import { IoIosSave } from "react-icons/io";
import { MdIosShare } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import PathEntry from './PathEntry';
import PlotAddition from './PlotAddition';
import Code from './Code';
import Save from './Save';
import Info from './Info';
import Logo from '.././assets/PlotgardenerLogo.png';
import '.././assets/style.scss';
import Header from '.././assets/pg-wordmark.png'

function Sidebar(){
    const [activeTab, setActiveTab] = useState('PathEntry');
    const [numRunScript, setNumRunScript] = useState(0);
    const [plotAdditionKey, setPlotAdditionKey] = useState(0);
    const [pathEntryKey, setPathEntryKey] = useState(0);

    const handleRunScript = () => {
        window.electron.runScript();
        setNumRunScript(numRunScript + 1)
    };

    useEffect(() => {
        // Listener for session switch in Nodes
        const handleSessionSwitch = () => {
            // Update the key to remount PlotAddition
            setPlotAdditionKey(prevKey => prevKey + 1);
            setPathEntryKey(prevKey => prevKey + 1);
        };

        window.electron.onSessionSwitch(handleSessionSwitch);

        // Cleanup listener on unmount
        return () => {
            window.electron.offSessionSwitch(handleSessionSwitch);
        };
    }, []);

    const handleCheckDup = () => {
        let dup = window.electron.getPlotsDuplicate();
        console.log(dup)
        console.log(typeof dup)
    };

    return (
        <>
            <div className='nav-bar'>
                <img className='logo-image' src={Logo} alt="Logo" />
                <nav>
                    <div className="tooltip">
                        <FaFile className='icon-images' onClick={() => setActiveTab('PathEntry')} style={activeTab === 'PathEntry' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Create Page</span>
                    </div>
                    <div className="tooltip">
                        <LuShovel className='icon-images' onClick={() => setActiveTab('PlotAddition')} style={activeTab === 'PlotAddition' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Plot Addition</span>
                    </div>
                    <div className="tooltip">
                        <IoIosSave className='icon-images' onClick={() => setActiveTab('Save')} style={activeTab === 'Save' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Save</span>
                    </div>
                    <div className="tooltip">
                        <FaCode className='icon-images' onClick={() => setActiveTab('Code')} style={activeTab === 'Code' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Code</span>
                    </div>
                    <div className="tooltip">
                        <BsInfoCircle className='icon-images' onClick={() => setActiveTab('Info')} style={activeTab === 'Info' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Info</span>
                    </div>
                </nav>
            </div>
            <div className='page'>
                <div className='container'>
                    <div className="tab-div">
                        <img className = 'header' src = {Header} alt="Header"/>
                        <div className={`tab-content ${activeTab === 'PathEntry' ? 'active' : ''}`}>
                            <PathEntry key={pathEntryKey} />
                        </div>
                        <div className={`tab-content ${activeTab === 'PlotAddition' ? 'active' : ''}`}>
                            <PlotAddition key={plotAdditionKey} />
                        </div>
                        <div className={`tab-content ${activeTab === 'Save' ? 'active' : ''}`}>
                            <Save />
                        </div>
                        <div className={`tab-content ${activeTab === 'Code' ? 'active' : ''}`}>
                            <Code nrs={numRunScript}/>
                        </div>
                        <div className={`tab-content ${activeTab === 'Info' ? 'active' : ''}`}>
                            <Info />
                        </div>
                    </div>
                    <div className="rbtn-div">
                        <button id="rbtn" type="button" onClick={handleRunScript} className='rbtn'>Run Script</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
