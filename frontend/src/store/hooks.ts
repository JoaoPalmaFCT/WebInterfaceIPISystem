import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { State, AppDispatch } from '.'
import type { State as UserState } from './user'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<State> = useSelector


export const useUserSelector: TypedUseSelectorHook<UserState> =
    <T>(f:(state:UserState) => T) => useAppSelector((state:State) => f(state.user))

