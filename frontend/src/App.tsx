import React, { useEffect }  from 'react';
import logo from './logo.svg';
import './App.css';
import ResultsVisualization, { getData, getDataFromLastYear,  } from './components/resultsVisualization'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux'
import { store } from './store'
import {
    Container,
    Header
} from "./components/layout";
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
          <Header title={""}>
              
          </Header>
          <Container>
              <Routes>
                  <Route path="/visualization" element={<ResultsVisualization/>} />
              </Routes>
          </Container>
        </div>
      </Router>
  );
}


const RdxApp = () =>
    <Provider store={store}>
      <App/>
    </Provider>
export default RdxApp;
