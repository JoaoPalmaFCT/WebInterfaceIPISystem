import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { State, AppDispatch } from '.'
import type { State as UserState } from './user'
import type { State as MonitoringProfileState } from './monitoringProfile'
import type { State as MeasurementsState } from './settings'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<State> = useSelector


export const useUserSelector: TypedUseSelectorHook<UserState> =
    <T>(f:(state:UserState) => T) => useAppSelector((state:State) => f(state.user))

export const useMPSelector: TypedUseSelectorHook<MonitoringProfileState> =
    <T>(f:(state:MonitoringProfileState) => T) => useAppSelector((state:State) => f(state.mp))

export const useMeasurementsSelector: TypedUseSelectorHook<MeasurementsState> =
    <T>(f:(state:MeasurementsState) => T) => useAppSelector((state:State) => f(state.measurements))
