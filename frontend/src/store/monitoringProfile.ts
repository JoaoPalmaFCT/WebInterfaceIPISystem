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
    points: PointXY[] | undefined;
    point: PointXY | undefined;
    marker: MarkerLatLng[] | undefined;
    lines: LineCrossSection[] | undefined;
    line: LineCrossSection | undefined;
}

const initialState: State = {
    mpGroup: undefined,
    mpGroups: undefined,
    mp: undefined,
    posAdjust: undefined,
    points: undefined,
    point: undefined,
    marker: undefined,
    lines: undefined,
    line: undefined
}

function createPointXY(
    positionX: number,
    positionY: number,
    profilePositionAdjustmentId: number
): PointXY{
    return {
        positionX,
        positionY,
        profilePositionAdjustmentId
    };
}

function createLine(
    topX: number,
    topY: number,
    bottomX: number,
    bottomY: number,
    profilePositionAdjustmentId: number
): LineCrossSection{
    return {
        topX,
        topY,
        bottomX,
        bottomY,
        profilePositionAdjustmentId
    };
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

        setPosAdjust: (state, action: PayloadAction<ProfilePositionAdjustment[]>) => {
            state.posAdjust = action.payload
        },

        setMarkers: (state, action: PayloadAction<MarkerLatLng[]>) => {
            state.marker = action.payload
        },

        setPoint: (state, action: PayloadAction<PointXY>) => {
            state.point = action.payload
        },

        setPoints: (state, action: PayloadAction<PointXY[]>) => {
            state.points = action.payload
        },

        setLines: (state, action: PayloadAction<LineCrossSection[]>) => {
            state.lines = action.payload
        },

        setLine: (state, action: PayloadAction<LineCrossSection>) => {
            state.line = action.payload
        }
    }
})

export const { setMonitoringProfileGroup, setMonitoringProfileGroups,
    setMonitoringProfile, setPosAdjust, setMarkers,
    setPoint, setPoints, setLines, setLine,
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

export const getSpecificProfilePositionAdjustments = (mpId: number ,token: string) => async (dispatch: any):Promise<ProfilePositionAdjustment[]> => {
    const response = await fetch(`http://localhost:8080/api/monitprofiles/posAdjust/${mpId}`, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`},
    })

    const pos: ProfilePositionAdjustment[] = await response.json();
    dispatch(setPosAdjust(pos));
    return pos;
};

//Points

export const addPoint = (positionX: number, positionY: number, monitoringGroupId: number ,token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/point', {
        method: "POST",
        headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
            positionX:positionX,
            positionY:positionY,
            profilePositionAdjustmentId:monitoringGroupId
        })
    })
        //.then( response => response.json())
        //.then( p => dispatch(setPoint(p)))
    dispatch(setPoint(createPointXY(positionX, positionY, monitoringGroupId)));
};

export const getPoints = (mpId: number ,token: string) => async (dispatch: any):Promise<PointXY[]> => {
    const response = await fetch(`http://localhost:8080/api/monitprofiles/point/${mpId}`, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`},
    })

        const points: PointXY[] = await response.json();
    dispatch(setPoints(points));
    return points;
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

//Line Cross Sections

export const addLine = (topX: number, topY: number, bottomX: number, bottomY: number, monitoringGroupId: number ,token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/monitprofiles/line', {
        method: "POST",
        headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
            topX: topX,
            topY: topY,
            bottomX: bottomX,
            bottomY: bottomY,
            profilePositionAdjustmentId:monitoringGroupId
        })
    })
    //.then( response => response.json())
    //.then( p => dispatch(setPoint(p)))
    dispatch(setLine(createLine(topX, topY, bottomX, bottomY, monitoringGroupId)));
};

export const getLinesCrossSection = (mpId: number ,token: string) => async (dispatch: any):Promise<LineCrossSection[]> => {
    const response = await fetch(`http://localhost:8080/api/monitprofiles/line/${mpId}`, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`},
    })

    const lines: LineCrossSection[] = await response.json();
    dispatch(setLines(lines));
    return lines;
};

export default slice.reducer