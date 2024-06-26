import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUser } from './user';
import monitoringProfileReducer from './monitoringProfile';
import measurementsReducer from './settings';

export const store = configureStore({
    reducer: {
        user: userReducer,
        mp: monitoringProfileReducer,
        measurements: measurementsReducer
    },
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([logger]),
});

export type State = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

//store.dispatch(loadInclinometers())

