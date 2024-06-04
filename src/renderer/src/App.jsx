import Output from "./components/Output"
import PathEntry from "./components/PathEntry"
import PlotAddition from "./components/PlotAddition"
import { Routes, Route} from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Code from "./components/Code";
import Nodes from "./components/Nodes";
import Share from "./components/Share";



function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')  
  
  

  return (
    <>
      <Sidebar/>
      <Output/>
    </>
  )
}

export default App

