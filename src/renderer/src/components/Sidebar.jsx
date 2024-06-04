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

    return (
        <>
            <div className='nav-bar'>
                <img className='logo-image' src={Logo} alt="Logo" />
                <nav>
                    <FaFile className='icon-images' onClick={() => setActiveTab('PathEntry')} />
                    <BsBoundingBoxCircles className='icon-images' onClick={() => setActiveTab('PlotAddition')} />
                    <LuNetwork className='icon-images' onClick={() => setActiveTab('Nodes')} />
                    <FaCode className='icon-images' onClick={() => setActiveTab('Code')} />
                    <MdIosShare className='icon-images' onClick={() => setActiveTab('Share')} />
                </nav>
            </div>
            <div className='page'>
                <div className='container'>
                <img className = 'header' src = {Header} ></img>
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
                        <Code />
                    </div>
                    <div className={`tab-content ${activeTab === 'Share' ? 'active' : ''}`}>
                        <Share />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;