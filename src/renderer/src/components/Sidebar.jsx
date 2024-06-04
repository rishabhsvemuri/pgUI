import { Link, NavLink } from 'react-router-dom'
import Logo from '.././assets/PlotgardenerLogo.png'
import '.././assets/style.scss';
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

function Sidebar(){
    const [secondBar,setSecondBar] = useState('PathEntry')
    function handleSecondBarChange(nextBar){
        setSecondBar(nextBar);
    }

    return(
        <>
            <div className='nav-bar'>
                
                <img className='logo-image' src={Logo} ></img>
                
                

                <nav>
                    <FaFile className='icon-images' onClick={() => handleSecondBarChange('PathEntry')}/>
                    <BsBoundingBoxCircles className='icon-images'onClick={() => handleSecondBarChange('PlotAddition')}/>
                    <LuNetwork className='icon-images' onClick={() => handleSecondBarChange('Nodes')}/>
                    <FaCode className='icon-images'onClick={() => handleSecondBarChange('Code')} />
                    <MdIosShare className='icon-images' onClick={() => handleSecondBarChange('Share')}/>
                </nav>
            </div>
            <div className='page'>
                <div className='container'>
                    {(secondBar==='PathEntry') && (<PathEntry/>)}
                    {(secondBar==='PlotAddition') && (<PlotAddition/>)}
                    {(secondBar==='Nodes') && (<Nodes/>)}
                    {(secondBar==='Code') && (<Code/>)}
                    {(secondBar==='Share') && (<Share/>)}
                </div>
        
            </div>
            

        </>

    )
    
}
export default Sidebar