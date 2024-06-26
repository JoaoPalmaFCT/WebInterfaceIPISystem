import {
    Measurements
} from "../types";
import {
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";

export interface State {
    measurements: Measurements[] | undefined;
}

const initialState: State = {
    measurements: undefined
}

export const slice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        setMeasurements: (state, action: PayloadAction<Measurements[]>) => {
            state.measurements = action.payload
        }
    }
})

export const { setMeasurements } = slice.actions

export const getMeasurements = (token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/settings/measurement', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( m => dispatch(setMeasurements(m)))
};


export default slice.reducer