import React, { useState, useEffect } from 'react';

function Save() {
  const [sessionName, setSessionName] = useState('');
  const [savedSessions, setSavedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');

  const handleSessionNameChange = (e) => {
    setSessionName(e.target.value);
  };

  const handleCreateNewSession = async () => {
    if (!sessionName) {
      alert('Please enter a session name.');
      return;
    }
  
    const response = await window.electron.createNewSession();
    if (response.success) {
      alert('Session created successfully.');
      setSessionName(''); // Clear input
  
      // Emit the session switch event to clear plots in PlotAddition
      window.electron.emitSessionSwitch();
    } else {
      alert(`Error: ${response.message}`);
    }
  };
  
  const handleSessionSelect = async (e) => {
    console.log("Start of load session");
    const selected = e.target.value;
    console.log("Got selected session");
    setSelectedSession(selected);
    console.log("Set Selected Session");
  
    // Load the selected session data from file
    const sessionData = await window.electron.loadSession(selected);
    console.log("After load session");
  
    if (sessionData) {
      alert("Loaded Session Successfully");
  
      // Update duplicatePlots and annotationsDuplicate with the loaded session data
      window.electron.updatePlotsDuplicate(sessionData.plots || []);
      window.electron.updateAnnotationsDuplicate(sessionData.annotations || []);
  
      // Notify PlotAddition to reload the session data
      window.electron.emitSessionSwitch();
    } else {
      alert('Failed to load session');
    }
  };
  

  const handleSaveSession = async () => {

    // Get the latest data from duplicatePlots and annotationsDuplicate
    const sessionData = {
      plots: window.electron.getPlotsDuplicate(),
      annotations: window.electron.getAnnotationsDuplicate(),
      backEndPlots: window.electron.getPlotsBackEnd(),
    };

    const response = await window.electron.saveSession(sessionData);
    if (response.success) {
      alert('Session saved successfully.');
    } else {
      console.error('Failed to save session:', response.message);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) {
      alert('Please select a session to delete.');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to delete the session "${selectedSession}"?`);
    if (!confirmation) return;

    const response = await window.electron.deleteSession(selectedSession);
    if (response.success) {
      alert('Session deleted successfully.');
      setSelectedSession(''); // Clear the selected session
      // loadSessions(); // Refresh the list of sessions
      window.electron.emitSessionSwitch(); // Notify PlotAddition to reset plots
    } else {
      console.error('Failed to delete session:', response.message);
    }
  };

  const handleSessionUpload = async (file) => {
    const fileText = await file.text();
    // Load the selected session data from file
    const sessionData = await window.electron.loadSession(fileText);
    console.log("After load session");
    if (sessionData) {
      alert("Loaded Session Successfully");
      // Update duplicatePlots and annotationsDuplicate with the loaded session data
      window.electron.updatePlotsDuplicate(sessionData.plots || []);
      window.electron.updateAnnotationsDuplicate(sessionData.annotations || []);
      // Notify PlotAddition to reload the session data
      window.electron.emitSessionSwitch();
    } else {
      alert('Failed to load session');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // first selected file
    if (file) {
      console.log("iGotIt!")
      handleSessionUpload(file)
    }
  };

  return (
    <div>
      <h2>Manage Sessions</h2>
      
      <input
        type="text"
        placeholder="Enter new session name"
        value={sessionName}
        onChange={handleSessionNameChange}
      />
      <button onClick={handleCreateNewSession}>Create Session</button>

      {/* <h3>Saved Sessions</h3> */}
      {/* <select value={selectedSession} onChange={handleSessionSelect}>
        <option value="">Select a session</option>
        {savedSessions.map((session) => (
          <option key={session} value={session}>{session}</option>
        ))}
      </select> */}
      <h3>Upload Session</h3>
      <input type='file' className='file-input' onChange={handleFileUpload}/>

      <h3>Save Session</h3>
      <button onClick={handleSaveSession}>Save</button>
      {/* <button onClick={handleDeleteSession} style={{ marginLeft: '10px', color: 'red' }}>Delete Session</button> */}
    </div>
  );
}

export default Save;
