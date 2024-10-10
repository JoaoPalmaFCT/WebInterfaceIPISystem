import {
    Connection,
    Measurements,
    MonitoringProfile
} from "../types";
import {
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";


export interface State {
    measurements: Measurements[] | undefined;
    connection: Connection | undefined;
    connections: Connection[] | undefined;
}

const initialState: State = {
    measurements: undefined,
    connection: undefined,
    connections: undefined
}

function createConnection(
    url: string, token: string, org: string, bucket: string
): Connection{
    return {
        url, token, org, bucket
    };
}


export const slice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        setMeasurements: (state, action: PayloadAction<Measurements[]>) => {
            state.measurements = action.payload
        },
        setConnection: (state, action: PayloadAction<Connection>) => {
            state.connection = action.payload
        },
        setConnections: (state, action: PayloadAction<Connection[]>) => {
            state.connections = action.payload
        },
    }
})

export const { setMeasurements, setConnection, setConnections } = slice.actions

export const getMeasurements = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/settings/measurement', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( m => dispatch(setMeasurements(m)))
};

export const addConnection = (url: string, tokenDB: string, org: string, bucket: string ,token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/settings/connection', {
        method: "POST",
        headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
            url:url,
            token:tokenDB,
            org: org,
            bucket: bucket
        })
    })
    //.then( response => response.json())
    //.then( p => dispatch(setPoint(p)))
    dispatch(setConnection(createConnection(url, tokenDB, org, bucket)));
};

export const getAllConnections = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/settings/connection', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( m => dispatch(setConnections(m)))
};

export default slice.reducer