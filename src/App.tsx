
import './App.css';
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Countdown from './pages/countDown';
import Camera from './pages/Camera';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Countdown />} />
        <Route path="/camera" element={<Camera />} />
      </Routes>
    </Router>
  );
};

export default App;
