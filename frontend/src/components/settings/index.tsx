import React, {useEffect, useState} from "react";
import {
    Alert,
    AlertTitle,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Slide,
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

    const [alertFailed, setAlertFailed] = useState(false);
    const [alertSuccess, setAlertSuccess] = useState(false);

    const [url, setUrl] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [org, setOrg] = useState<string>('');
    const [bucket, setBucket] = useState<string>('');

    const [api, setApi] = useState(new InfluxDB({
        url: '',
        token: ''
    }).getQueryApi(''));

    /*const api = new InfluxDB({
        //url: 'https://positive-presumably-bluegill.ngrok-free.app/',
        url: '//localhost:8086/',
        token: '5q-pfsRjWH5q-pfsRjWHQvyFZqhBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA=='
    }).getQueryApi('c5936632b4808196');*/

    const handleTestConnection = async () => {
        setLoading(true);
        setConnectionStatus('');
        //let bucketTest = "inputs"

        let testApi = new InfluxDB({
            url: url,
            token: token
        }).getQueryApi(org);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const fluxQuery = `buckets()`;

            //const fluxQuery = `from(bucket:"${bucket}")`;// |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")`;
            const response = await testApi.collectRows(fluxQuery);

            console.log(response)
            setLoading(false);
            setConnectionStatus('success');
        } catch (error) {
            console.error('Error testing connection:', error);
            setLoading(false);
            setConnectionStatus('error');
        }
    };

    const handleUrl = (newUrl: string) => {
        setUrl(newUrl)
    }

    const handleToken = (newToken: string) => {
        setToken(newToken)
    }

    const handleOrg = (newOrg: string) => {
        setOrg(newOrg)
    }

    const handleBucket = (newBucket: string) => {
        setBucket(newBucket)
    }

    const handleSubmit = () => {
        if(url.length === 0 || token.length === 0 || org.length === 0){

            setAlertFailed(true);
            setTimeout(() => {
                setAlertFailed(false);
            }, 5000);
        }else{

            let newApi = new InfluxDB({
                url: url,
                token: token
            }).getQueryApi(org);

            setApi(newApi)

            setAlertSuccess(true);
            setTimeout(() => {
                setAlertSuccess(false);
            }, 5000);
        }
    }

    return (
        <div className="main-wrapper full-screen" style={{paddingTop: '30px'}}>
            {alertSuccess && (
                <Slide
                    direction="left"
                    in={alertSuccess}
                    mountOnEnter
                    unmountOnExit>
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            right: 16,
                            zIndex: 9999
                        }}>
                        <Alert
                            severity="success"
                            sx={{alignItems: 'center'}}>
                            <AlertTitle
                                sx={{textAlign: 'left'}}>Success</AlertTitle>
                            The database connection was
                            successfully
                            added.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertFailed && (
                <Slide
                    direction="left"
                    in={alertFailed}
                    mountOnEnter
                    unmountOnExit>
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            right: 16,
                            zIndex: 9999
                        }}>
                        <Alert
                            severity="error"
                            sx={{alignItems: 'center'}}>
                            <AlertTitle
                                sx={{textAlign: 'left'}}>Error</AlertTitle>
                            Some
                            values
                            may
                            be
                            missing.
                            Please
                            fill
                            all
                            the
                            required
                            fields.
                        </Alert>
                    </Box>
                </Slide>
            )}
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
                            onChange={(e) => handleUrl(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Token"
                            style={{paddingBottom: '15px'}}
                            onChange={(e) => handleToken(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Organization"
                            style={{paddingBottom: '15px'}}
                            onChange={(e) => handleOrg(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Bucket"
                            style={{paddingBottom: '15px'}}
                            onChange={(e) => handleBucket(e.target.value)}
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
                                onClick={handleSubmit}
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