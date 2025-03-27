import Output from "./components/Output"
import PathEntry from "./components/PathEntry"
import PlotAddition from "./components/PlotAddition"
import { Routes, Route} from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Code from "./components/Code";
import Save from "./components/Save";
import Info from "./components/Info";



function App() { 
  return (
    <>
      <Sidebar/>
      <Output/>
    </>
  )
}

export default App

