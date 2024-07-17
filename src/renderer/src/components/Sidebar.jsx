import { FaFile } from "react-icons/fa";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FaCode } from "react-icons/fa";
import { LuNetwork } from "react-icons/lu";
import { MdIosShare } from "react-icons/md";
import { useState } from 'react';
import PathEntry from './PathEntry';
import PlotAddition from './PlotAddition';
import Code from './Code';
import Nodes from './Nodes';
import Share from './Share';
import Logo from '.././assets/PlotgardenerLogo.png';
import '.././assets/style.scss';
import Header from '.././assets/pg-wordmark.png'

function Sidebar(){
    const [activeTab, setActiveTab] = useState('PathEntry');
    const [numRunScript, setNumRunScript] = useState(0);

    const handleRunScript = () => {
        window.electron.runScript();
        setNumRunScript(numRunScript + 1)
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
                        <BsBoundingBoxCircles className='icon-images' onClick={() => setActiveTab('PlotAddition')} style={activeTab === 'PlotAddition' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Plot Addition</span>
                    </div>
                    <div className="tooltip">
                        <LuNetwork className='icon-images' onClick={() => setActiveTab('Nodes')} style={activeTab === 'Nodes' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Nodes</span>
                    </div>
                    <div className="tooltip">
                        <FaCode className='icon-images' onClick={() => setActiveTab('Code')} style={activeTab === 'Code' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Code</span>
                    </div>
                    <div className="tooltip">
                        <MdIosShare className='icon-images' onClick={() => setActiveTab('Share')} style={activeTab === 'Share' ? { backgroundColor: '#232323' } : {}}/>
                        <span className="tooltiptext">Share</span>
                    </div>
                </nav>
            </div>
            <div className='page'>
                <div className='container'>
                    <div className="tab-div">
                        <img className = 'header' src = {Header} alt="Header"/>
                        <div className={`tab-content ${activeTab === 'PathEntry' ? 'active' : ''}`}>
                            <PathEntry />
                        </div>
                        <div className={`tab-content ${activeTab === 'PlotAddition' ? 'active' : ''}`}>
                            <PlotAddition />
                        </div>
                        <div className={`tab-content ${activeTab === 'Nodes' ? 'active' : ''}`}>
                            <Nodes />
                        </div>
                        <div className={`tab-content ${activeTab === 'Code' ? 'active' : ''}`}>
                            <Code nrs={numRunScript}/>
                        </div>
                        <div className={`tab-content ${activeTab === 'Share' ? 'active' : ''}`}>
                            <Share />
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
