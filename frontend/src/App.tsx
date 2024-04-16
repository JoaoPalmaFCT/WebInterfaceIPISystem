import React, { useEffect }  from 'react';
import logo from './logo.svg';
import './App.css';
import ResultsVisualization, {   } from './components/resultsVisualization'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux'
import { store } from './store'
import { Container, Footer, Header } from "./components/layout";
import Profile from "./components/profile";
import LincsLogo from "./images/logo/Lincs-logo_Page 3_1.png"
function App() {
  /*useEffect(() => {
    getData()//.catch(error => console.error('Error querying InfluxDB:', error));
  }, []);
  useEffect(() => {
    //getDataFromLastYear()//.catch(error => console.error('Error querying InfluxDB:', error));
        //ResultsVisualization
  }, []);*/

  return (
      <Router>
          <div className="App">
              <Header
                  title={""}>
                  <div
                      style={{
                          display: 'flex',
                          alignItems: 'center'
                      }}>
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6">
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                      </svg>

                      <img
                          src={LincsLogo}
                          alt="Lincs"
                          width="100px"
                          style={{
                              display: 'block',
                              margin: '0 auto'
                          }}
                      />
                  </div>
              </Header>
              <Container>
                  <Routes>
                  <Route
                          path="/visualization"
                          element={
                              <ResultsVisualization/>}/>
                      <Route
                          path="/profile"
                          element={
                              <Profile/>}/>
                  </Routes>
              </Container>
              <Footer/>
          </div>
      </Router>
  );
}


const RdxApp = () =>
    <Provider store={store}>
      <App/>
    </Provider>
export default RdxApp;
