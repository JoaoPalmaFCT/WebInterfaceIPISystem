import React, { useEffect }  from 'react';
import logo from './logo.svg';
import './App.css';
import ResultsVisualization, {   } from './components/resultsVisualization'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux'
import { store } from './store'
import { Container, Footer, Header } from "./components/layout";
import HomeScreen from "./components/home";
import Profile from "./components/profile";
import MonitoringProfiles from "./components/monitoringProfiles";
import SettingsPage from "./components/settings";
import LincsLogo from "./images/logo/Lincs-logo_Page 3_1.png"
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Drawer,
} from "@mui/material";
import {FormatListBulleted,SsidChart, Home, AccountCircle, Logout, Settings} from "@mui/icons-material";
function App() {
  /*useEffect(() => {
    getData()//.catch(error => console.error('Error querying InfluxDB:', error));
  }, []);
  useEffect(() => {
    //getDataFromLastYear()//.catch(error => console.error('Error querying InfluxDB:', error));
        //ResultsVisualization
  }, []);*/

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const DrawerList = () => {
        const navigate = useNavigate();

        return (
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%'  }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {['Home', 'Monitoring Groups', 'Monitoring Profiles', 'Visualization of Results', 'Settings'].map((text, index) => (
                    <ListItem key={text} disablePadding onClick={() => {
                        if (index === 0) navigate('/');
                        if (index === 2) navigate('/monitoringProfiles');
                        if (index === 3) navigate('/visualization');
                        if (index === 4) navigate('/settings');
                    }}>
                        <ListItemButton>
                            <ListItemIcon>
                                {index === 0 && <Home/>}
                                {index === 1 && <FormatListBulleted/>}
                                {index === 2 && <FormatListBulleted/>}
                                {index === 3 && <SsidChart/>}
                                {index === 4 && <Settings/>}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <List>
                {['Profile', 'Logout'].map((text, index) => (
                    <ListItem key={text} disablePadding onClick={() => {
                        if (index === 0) navigate('/profile');
                    }}>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <AccountCircle/> : <Logout/>}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )};

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
                      <div>
                          <Drawer
                              open={open}
                              onClose={toggleDrawer(false)}>
                              <DrawerList />
                          </Drawer>
                      </div>
                      <div>
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                          onClick={toggleDrawer(true)}>
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                      </svg>
                      </div>
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
                          path="/"
                          element={
                              <HomeScreen/>}/>
                      <Route
                          path="/monitoringProfiles"
                          element={
                              <MonitoringProfiles/>}/>
                      <Route
                          path="/visualization"
                          element={
                              <ResultsVisualization/>}/>
                      <Route
                          path="/settings"
                          element={
                              <SettingsPage/>}/>
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
