import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types'
export interface State {
    user: User | undefined;
}

const initialState: State = {
    user: undefined,
}

export const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
        }
    }
})

export const { setUser } = slice.actions

export const getUser = (email:string, token: string) => (dispatch: any) => {
    fetch('http://localhost:8080/api/user/'+email, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then( response => response.json())
        .then( user => dispatch(setUser(user)))
};

export default slice.reducer