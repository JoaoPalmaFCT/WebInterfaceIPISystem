import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import {
  getData,
  getDataFromLastYear
} from './components/Inclinometer/inclinometer.js'
function App() {
  useEffect(() => {
    getData()//.catch(error => console.error('Error querying InfluxDB:', error));
  }, []);
  useEffect(() => {
    getDataFromLastYear()//.catch(error => console.error('Error querying InfluxDB:', error));
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
        </header>

      </div>
    </Router>
  );
}

export default App;
