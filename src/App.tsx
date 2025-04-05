
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Camera from './pages/Camera';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Camera />} />
      </Routes>
    </Router>
  );
};

export default App;
