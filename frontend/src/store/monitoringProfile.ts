import {
    LineCrossSection,
    MonitoringProfile,
    MonitoringProfileGroup,
    ProfilePositionAdjustment,
    MarkerLatLng,
    PointXY
} from "../types";
import {
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";

export interface State {
    mpGroup: MonitoringProfileGroup | undefined;
    mpGroups: MonitoringProfileGroup[] | undefined;
    mp: MonitoringProfile[] | undefined;
    posAdjust: ProfilePositionAdjustment[] | undefined;
    point: PointXY[] | undefined;
    marker: MarkerLatLng[] | undefined;
    line: LineCrossSection[] | undefined;
}

const initialState: State = {
    mpGroup: undefined,
    mpGroups: undefined,
    mp: undefined,
    posAdjust: undefined,
    point: undefined,
    marker: undefined,
    line: undefined
}

export const slice = createSlice({
    name: 'mpGroups',
    initialState,
    reducers: {
        setMonitoringProfileGroup: (state, action: PayloadAction<MonitoringProfileGroup>) => {
            state.mpGroup = action.payload
        },

        setMonitoringProfileGroups: (state, action: PayloadAction<MonitoringProfileGroup[]>) => {
            state.mpGroups = action.payload
        },

        setMonitoringProfile: (state, action: PayloadAction<MonitoringProfile[]>) => {
            state.mp = action.payload
        },

        setProfilePositionAdjustments: (state, action: PayloadAction<ProfilePositionAdjustment[]>) => {
            state.posAdjust = action.payload
        },

        setMarkers: (state, action: PayloadAction<MarkerLatLng[]>) => {
            state.marker = action.payload
        }
    }
})

export const { setMonitoringProfileGroup, setMonitoringProfileGroups,
    setMonitoringProfile, setMarkers,
    setProfilePositionAdjustments } = slice.actions

// Monitoring Profile Groups

export const addMonitoringProfileGroup = (group: string, measurements: string, monitoringGroupId: number ,token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/group', {
        method: "POST",
        headers: {'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
            group:group,
            measurements:measurements,
            monitoringGroupId:monitoringGroupId
        })
    })
        .then( response => response.json())
        .then( mpg => dispatch(setMonitoringProfileGroup(mpg)))
};

export const getMonitoringProfileGroups = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/group', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( mpgs => dispatch(setMonitoringProfileGroups(mpgs)))
};

// Monitoring Profiles

export const getMonitoringProfiles = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( mp => dispatch(setMonitoringProfile(mp)))
};

//Profile Position Adjustment

export const getProfilePositionAdjustments = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/posAdjust', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( p => dispatch(setProfilePositionAdjustments(p)))
};

//Markers

export const getMarkers = (mpId: number ,token: string) => async (dispatch: any):Promise<MarkerLatLng[]> => {
    const response = await fetch(`http://localhost:8080/api/monitprofiles/marker/${mpId}`, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`},
    })

    const markers: MarkerLatLng[] = await response.json();
    dispatch(setMarkers(markers));
    return markers;
};



export default slice.reducer