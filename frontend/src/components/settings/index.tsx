import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import {
    CheckCircle,
    Error
} from "@mui/icons-material";
import {
    InfluxDB
} from "@influxdata/influxdb-client";

function Settings() {

    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('');

    const api = new InfluxDB({
        //url: 'https://positive-presumably-bluegill.ngrok-free.app/',
        url: '//localhost:8086/',
        token: '5q-pfsRjWHQvyFZqhQ3Y8BT9CQmUJBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA=='
    }).getQueryApi('c5936632b4808196');

    const handleTestConnection = async () => {
        setLoading(true);
        setConnectionStatus('');
        let bucket = "inputs"

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const fluxQuery = `from(bucket:"${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")`;
            const response = await api.collectRows(fluxQuery);

            setLoading(false);
            setConnectionStatus('success');
        } catch (error) {
            console.error('Error testing connection:', error);
            setLoading(false);
            setConnectionStatus('error');
        }
        /*let isConnectionSuccessful = false;
        try {

            const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")';
            const response = api.collectRows(fluxQuery);

            isConnectionSuccessful = true;

        } catch (error) {
            isConnectionSuccessful = false;
        }

        setTimeout(() =>  {}, 2000);
        setLoading(false);
        setConnectionStatus(isConnectionSuccessful ? 'success' : 'error');*/
    };

    return (
        <div className="main-wrapper full-screen" style={{paddingTop: '30px'}}>
            <Card sx={{ minWidth: 700 }}>
                <CardContent>
                    <Typography variant="h4" textAlign="left" style={{paddingBottom: '10px'}}>
                        Definition of connections
                    </Typography>
                    <Typography variant="h5" textAlign="left">
                        Database - InfluxDB Connection
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="flex-start"
                        mt={2}>
                        <TextField
                            required
                            id="outlined-required"
                            label="Url"
                            style={{paddingBottom: '15px'}}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Token"
                            style={{paddingBottom: '15px'}}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Organization"
                            style={{paddingBottom: '15px'}}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Bucket"
                            style={{paddingBottom: '15px'}}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="body1"
                                color="#065f46"
                                style={{ cursor: 'pointer' }}
                                onClick={handleTestConnection}
                            >
                                Test your connection
                                {loading && <CircularProgress size={18} style={{ marginLeft: '10px' }} />}
                                {connectionStatus === 'success' && <CheckCircle style={{ color: 'green', marginLeft: '10px' }} />}
                                {connectionStatus === 'error' && <Error style={{ color: 'red', marginLeft: '10px' }} />}
                            </Typography>
                            <button
                                type="button"
                                className="py-3 px-10 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                            >
                                Submit
                            </button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;