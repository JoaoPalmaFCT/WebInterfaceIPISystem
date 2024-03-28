import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUser } from './user';
export const store = configureStore({
    reducer: {
        user: userReducer,

    },
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([logger]),
});

export type State = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

//store.dispatch(loadInclinometers())

