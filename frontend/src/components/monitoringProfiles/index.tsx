import {
    alpha,
    Box,
    Checkbox,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Tooltip,
    Modal,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Theme,
    useTheme,
    Chip,
    OutlinedInput,
    Alert,
    AlertTitle,
    Slide,
    Button,
    FormControlLabel,
    CardContent,
    Card,
    CardHeader
} from "@mui/material";
import React, {
    Fragment,
    useEffect,
    useRef,
    useState
} from "react";
import {visuallyHidden} from "@mui/utils";
import {
    Clear,
    Delete,
    FilterList,
    CheckBoxOutlineBlankRounded,
    CheckBoxRounded,
    CloudUpload,
    ArrowBack,
    NavigateBefore,
    NavigateNext,
    Place,
    InsertDriveFile
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import {
    Listbox,
    Transition
} from "@headlessui/react";
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/react/20/solid";
import Konva
    from "konva";
import * as firebase from 'firebase/app';
import {getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from '../../firebaseConfig';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
    Polyline
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import L, {
    Icon,
    LatLng
} from 'leaflet'
import {
    useAppDispatch,
    useMeasurementsSelector,
    useMPSelector
} from "../../store/hooks";
import {
    getMarkers,
    getMonitoringProfileGroups,
    getMonitoringProfiles,
    getProfilePositionAdjustments,
    getSpecificProfilePositionAdjustments,
    addPoint,
    getPoints,
    setPoints,
    getLinesCrossSection,
    addLine
} from "../../store/monitoringProfile";
import {
    getMeasurements
} from "../../store/settings";

const testData = [createData(1, 'Barragem do Azibo', 2, 40),
    createData(2, 'Lab Test', 1, 30)];

const testIncValues = ['Barragem do Azibo', 10, "Lab Test", 30];

const createCustomIcon = (markerId: number) => {
    return L.divIcon({
        html: `<div class="custom-marker">
                   <img src="/marker-icon-green.png" alt="Marker Icon" />
                   <div class="marker-id">I${markerId}</div>
               </div>`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: ''
    });
};


interface Measurement {
    id: number;
    measurement: string;
    host: string;
    inclinometers: string
}

function createMeasurement(
    id: number,
    measurement: string,
    host: string,
    inclinometers: string
): Measurement {
    return {
        id,
        measurement,
        host,
        inclinometers
    };
}


const testMeasurements = ['Barragem do Azibo', "Lab Test"];

const typeOfProfile = [
    {
        id: 1,
        name: 'PLAN',
    },
    {
        id: 2,
        name: 'CROSSSECTION',
    }
]

interface PlanCheckbox {
    id: number;
    check: boolean;
}

function createPlanCheckbox(
    id: number,
    check: boolean
): PlanCheckbox {
    return {
        id,
        check
    };
}

interface CrossSectionCheckbox {
    id: number;
    check: boolean;
}

function createCrossSectionCheckbox(
    id: number,
    check: boolean
): CrossSectionCheckbox {
    return {
        id,
        check
    };
}

interface Point {
    id: number;
    posX: number;
    posY: number;
}

function createPoint(
    id: number,
    posX: number,
    posY: number
): Point {
    return {
        id,
        posX,
        posY
    };
}

interface PointsPerProfile {
    id: number;
    points: Point[];
}

function createPointPerProfile(
    id: number,
    points: Point[]
): PointsPerProfile {
    return {
        id,
        points
    };
}

interface CheckCorrectedValues {
    id: number;
    check: boolean;
}

function createCheckCorrectedValues(
    id: number,
    check: boolean
): CheckCorrectedValues {
    return {
        id,
        check
    };
}

interface CorrectedValuesPerProfile {
    id: number;
    lc: L.LatLng[];
}

function createCorrectedValuesPerProfile(
    id: number,
    lc: L.LatLng[]
): CorrectedValuesPerProfile {
    return {
        id,
        lc
    };
}

interface LineCoordinatesPerProfile {
    id: number;
    lc: L.LatLng[];
}

function createLineCoordinatesPerProfile(
    id: number,
    lc: L.LatLng[]
): LineCoordinatesPerProfile {
    return {
        id,
        lc
    };
}

interface PointMarkerPerProfile {
    id: number;
    pm: PointMarker[];
}

function createPointMarkerPerProfile(
    id: number,
    pm: PointMarker[]
): PointMarkerPerProfile {
    return {
        id,
        pm
    };
}

interface PointMarker {
    id: number;
    latLng: L.LatLng;
}

function createPointMarker(
    id: number,
    latLng: L.LatLng
): PointMarker {
    return {
        id,
        latLng
    };
}

interface LinePoint {
    id: number;
    topX: number;
    topY: number;
    bottomX: number;
    bottomY: number;
}


function createLinePoint(
    id: number,
    topX: number,
    topY: number,
    bottomX: number,
    bottomY: number
): LinePoint {
    return {
        id,
        topX,
        topY,
        bottomX,
        bottomY
    };
}

interface LinePointPerProfile {
    id: number;
    lp: LinePoint[];
}

function createLinePointPerProfile(
    id: number,
    lp: LinePoint[]
): LinePointPerProfile {
    return {
        id,
        lp
    };
}

interface AuxCrossSectionLinesPerProfile {
    id: number;
    array: number[];
}

function createAuxCrossSectionLinesPerProfile(
    id: number,
    array: number[]
): AuxCrossSectionLinesPerProfile {
    return {
        id,
        array
    };
}

interface MonitoringProfile {
    id: number;
    group: string;
    name: string;
    description: string;
    typeOfProfile: string;
    hasImage: boolean;
    imagedAttached: string;
}

function createDataMP(
    id: number,
    group: string,
    name: string,
    description: string,
    typeOfProfile: string,
    hasImage: boolean,
    imagedAttached: string
): MonitoringProfile {
    return {
        id,
        group,
        name,
        description,
        typeOfProfile,
        hasImage,
        imagedAttached
    };
}


interface MonitoringProfileGroup {
    id: number;
    group: string;
    measurements: number;
    measurementsList: string[];
    inclinometers: number;
}

function createDataMPG(
    id: number,
    group: string,
    measurements: number,
    measurementsList: string[],
    inclinometers: number,
): MonitoringProfileGroup {
    return {
        id,
        group,
        measurements,
        measurementsList,
        inclinometers
    };
}


interface ExistingMonitoringProfiles {
    id: number;
    group: string;
    measurements: number;
    inclinometers: number;
}

function createData(
    id: number,
    group: string,
    measurements: number,
    inclinometers: number,
): ExistingMonitoringProfiles {
    return {
        id,
        group,
        measurements,
        inclinometers
    };
}

interface MPPC {
    id: number;
    groupMP: string;
    inc: number;
    hasPoint: boolean;
    pickPoint: number[];
}

function createDataMPPC(
    id: number,
    groupMP: string,
    inc: number,
    hasPoint: boolean,
    pickPoint: number[]
): MPPC {
    return {
        id,
        groupMP,
        inc,
        hasPoint,
        pickPoint
    };
}

interface MPPCUniqueIds {
    id: number;
    inc: number;
}

function createDataMPPCUniqueIds(
    id: number,
    inc: number
): MPPCUniqueIds {
    return {
        id,
        inc
    };
}

interface MPPCCodeWithUniqueId {
    code: number;
    id: number;
}

function createDataMPPCCodeWithUniqueId(
    code: number,
    id: number
): MPPCCodeWithUniqueId {
    return {
        code,
        id
    };
}


interface IncPerProfile {
    id: number;
    profileCode: number;
    profileGroup: string;
    measurement: string;
    inc: number;
}

function createIncPerProfile(
    id: number,
    profileCode: number,
    profileGroup: string,
    measurement: string,
    inc: number
): IncPerProfile {
    return {
        id,
        profileCode,
        profileGroup,
        measurement,
        inc
    };
}


function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string | boolean | number[]},
    b: { [key in Key]: number | string | boolean | number[]},
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof ExistingMonitoringProfiles;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'group',
        numeric: false,
        disablePadding: true,
        label: 'Group',
    },
    {
        id: 'measurements',
        numeric: true,
        disablePadding: false,
        label: 'Structures',
    },
    {
        id: 'inclinometers',
        numeric: true,
        disablePadding: false,
        label: 'Inclinometers',
    }
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ExistingMonitoringProfiles) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof ExistingMonitoringProfiles) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox" sx={{ backgroundColor: '#10b981' }}>
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all groups',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'center' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ backgroundColor: '#10b981' }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {
    numSelected: number;
    onDelete: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected, onDelete } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),backgroundColor: '#047857'
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="white"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                    color="white"
                >
                    Select groups from existing monitoring profiles
                </Typography>
            )}
            {numSelected > 0 && (
                <Tooltip title="Delete selected groups">
                    <IconButton onClick={onDelete}>
                        <Delete/>
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

// Selected Groups

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface HeadCellMP {
    disablePadding: boolean;
    id: keyof MonitoringProfile;
    label: string;
    numeric: boolean;
}

const headCellsMP: readonly HeadCellMP[] = [
    {
        id: 'id',
        numeric: true,
        disablePadding: true,
        label: 'Code',
    },
    {
        id: 'group',
        numeric: false,
        disablePadding: false,
        label: 'Group',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
    },
    {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'Description',
    },
    {
        id: 'typeOfProfile',
        numeric: false,
        disablePadding: false,
        label: 'Type Of Profile',
    },
    {
        id: 'hasImage',
        numeric: false,
        disablePadding: false,
        label: 'No Image',
    },
    {
        id: 'imagedAttached',
        numeric: false,
        disablePadding: false,
        label: 'Attach image',
    },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface EnhancedTablePropsMP {
    //numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof MonitoringProfile) => void;
    //onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHeadMP(props: EnhancedTablePropsMP) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandlerMP =
        (property: keyof MonitoringProfile) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsMP.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='left'//{headCell.numeric ? 'center' : 'left'}
                        padding='normal'//{headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ backgroundColor: '#10b981' }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandlerMP(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarPropsMP {
    numSelected: number;
}

function EnhancedTableToolbarMP(props: EnhancedTableToolbarPropsMP) {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),backgroundColor: '#047857'
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="white"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle2"
                    component="div"
                    color="white"
                >
                    Set monitoring profiles
                </Typography>
            )}
            {numSelected > 0 && (
                <Tooltip title="Delete selected monitoring profiles">
                    <IconButton>
                        <Delete/>
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

// MP Position correction


interface HeadCellMPPC {
    disablePadding: boolean;
    id: keyof MPPC;
    label: string;
    numeric: boolean;
}

const headCellsMPPC: readonly HeadCellMPPC[] = [
    {
        id: 'id',
        numeric: true,
        disablePadding: true,
        label: 'Code',
    },
    {
        id: 'groupMP',
        numeric: false,
        disablePadding: false,
        label: 'Measurement',
    },
    {
        id: 'inc',
        numeric: true,
        disablePadding: false,
        label: 'Inclinometer',
    },
    {
        id: 'hasPoint',
        numeric: false,
        disablePadding: false,
        label: 'Position Adjusted',
    },
    {
        id: 'pickPoint',
        numeric: false,
        disablePadding: false,
        label: 'Position Correction',
    }
];

interface EnhancedTablePropsMPPC {
    //numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof MPPC) => void;
    //onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHeadMPPC(props: EnhancedTablePropsMPPC) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandlerMPPC =
        (property: keyof MPPC) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsMPPC.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='left'//{headCell.numeric ? 'center' : 'left'}
                        padding='normal'//{headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ backgroundColor: '#10b981' }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandlerMPPC(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarPropsMPPC {
    numSelected: number;
}

function EnhancedTableToolbarMPPC(props: EnhancedTableToolbarPropsMPPC) {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),backgroundColor: '#047857'
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="white"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle2"
                    component="div"
                    color="white"
                >
                    Inclinometers belonging to profile and position adjustment
                </Typography>
            )}
        </Toolbar>
    );
}



const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(measurement: string, selectedMeasurements: readonly string[], theme: Theme) {
    return {
        fontWeight:
            selectedMeasurements.indexOf(measurement) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

function MonitoringProfiles() {

    const sessionToken: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImlhdCI6MTcxOTM1NDM3MSwiZXhwIjoxNzIxOTgyNDY3fQ.ABHn1JqMi-TI0tns0G09aC80gm5NfbH6Zb3zlW7EqkiFx7fyPhojx6DdxPQx1JgJK2iCwppVU3m1WVaqCNXvtA";
    const dispatch = useAppDispatch()
    const dbMeasurementsList = useMeasurementsSelector(state => state.measurements)
    const dbMPGroups = useMPSelector(state => state.mpGroups)
    const dbMPs = useMPSelector(state => state.mp)
    const dbPosAdjust = useMPSelector(state => state.posAdjust)
    const dbMarkers = useMPSelector(state => state.marker)
    const dbPoints = useMPSelector(state => state.point)
    useEffect(() => {
        dispatch(getMeasurements(sessionToken))
        dispatch(getMonitoringProfileGroups(sessionToken))
        dispatch(getMonitoringProfiles(sessionToken))
        //dispatch(getProfilePositionAdjustments(sessionToken))
        /*if(selectedDetailedProfileID === 0){
            dispatch(getMarkers(1,sessionToken))
        }*/
    }, [dispatch]);

    const [measurements, setMeasurements] = React.useState<Measurement[]>([]);

    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof ExistingMonitoringProfiles>('group');
    const [selected, setSelected] = React.useState<readonly number[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<ExistingMonitoringProfiles[]>([]);
    const [monitoringProfiles, setMonitoringProfiles] = React.useState<MonitoringProfileGroup[]>([]);
    const [orderMP, setOrderMP] = React.useState<Order>('asc');
    const [orderByMP, setOrderByMP] = React.useState<keyof MonitoringProfile>('id');
    const [selectedMP, setSelectedMP] = React.useState<readonly number[]>([]);
    const [pageMP, setPageMP] = React.useState(0);
    const [denseMP, setDenseMP] = React.useState(false);
    const [rowsPerPageMP, setRowsPerPageMP] = React.useState(5);
    const [rowsMP, setRowsMP] = React.useState<MonitoringProfile[]>([]);
    const [monitoringProfilesTableData, setMonitoringProfilesTableData] = React.useState<MonitoringProfile[]>([]);
    const [profilesCodeList, setProfilesCodeList] = React.useState<string[]>([]);
    const [selectFromCodeList, setSelectFromCodeList] = React.useState<string>('1');
    const [firebaseInitialized, setFirebaseInitialized] = React.useState(false);

    firebase.initializeApp(firebaseConfig);
    /*useEffect(() => {
        if(!firebaseInitialized){
            firebase.initializeApp(firebaseConfig);
            setFirebaseInitialized(true);
        }
    }, [firebaseInitialized]);*/


    useEffect(() => {
        if(dbMeasurementsList != undefined){
            let m = [];
            let counterArray = 0;
            for(let i = 0; i<(dbMeasurementsList ?? []).length; i++) {
                let mIncString = dbMeasurementsList[i].inclinometers;
                let incs:string[] = [];
                if (mIncString !== undefined) {
                    incs = mIncString.split("?");
                } else {
                    incs = [];
                }

                let measurementName = dbMeasurementsList[i].measurement;
                let hostName = dbMeasurementsList[i].host;
                if(measurementName !== undefined && hostName !== undefined){
                    for (let j = 0; j < incs.length; j++) {
                        m.push(createMeasurement(counterArray, measurementName,hostName,incs[j]))
                        counterArray++;
                    }
                }
            }
            setMeasurements(m)

            if(dbMPGroups !== undefined){
                let groups = [];
                let groups2 = [];
                for(let i = 0; i<(dbMPGroups ?? []).length; i++){
                    let measurementsCounter = 0;
                    let groupMeasurements:string[] = [];
                    let groupMeasurementsString = dbMPGroups[i].measurements;

                    if(groupMeasurementsString !== undefined){
                        groupMeasurements = groupMeasurementsString.split("?");
                    }else{
                        groupMeasurements = [];
                    }

                    let incsPerMeasurements = 0;

                    for(let j = 0; j<groupMeasurements.length; j++){
                        let tempIncs = m.filter(mFilter => mFilter.measurement === groupMeasurements[j])
                        incsPerMeasurements+=tempIncs.length;
                        measurementsCounter++;
                    }

                    let mgId = dbMPGroups[i].monitoringGroupId;
                    let mgGroup = dbMPGroups[i].group;
                    if(mgId !== undefined && mgGroup !== undefined){
                        groups.push(createData(mgId, mgGroup, measurementsCounter, incsPerMeasurements))
                        groups2.push(createDataMPG(mgId, mgGroup, measurementsCounter, groupMeasurements, incsPerMeasurements))
                    }
                }
                setRows(groups)
                setMonitoringProfiles(groups2)

                if(dbMPs !== undefined){
                    let monitProfiles = [];
                    for(let i = 0; i<(dbMPs ?? []).length; i++){
                        let mIncString = dbMPs[i].inclinometers;
                        let incs:string[] = [];
                        if (mIncString !== undefined) {
                            incs = mIncString.split("?");
                        } else {
                            incs = [];
                        }

                        let mpId = dbMPs[i].code;
                        let mpGroup = dbMPs[i].group;
                        let mpName = dbMPs[i].name;
                        let mpDescription = dbMPs[i].description;
                        let mpType = dbMPs[i].type;
                        let mpImage = dbMPs[i].attachedImage;
                        let mpHasImage = (mpImage !== '')
                        if(mpId !== undefined && mpGroup !== undefined && mpName !== undefined && mpDescription !== undefined &&
                        mpType !== undefined && mpImage !== undefined){
                            monitProfiles.push(createDataMP(Number(mpId), mpGroup, mpName, mpDescription, mpType, mpHasImage, mpImage))
                        }
                    }
                    setMonitoringProfilesTableData(monitProfiles)
                    setRowsMP(monitProfiles)

                    let tempPoints = [];
                    let tempCoord = [];
                    let tempCorrected = [];
                    let tempManualCheck = [];
                    let tempPlanCheckboxs = [];
                    let tempCrossSectionCheckboxs = [];
                    for(let i = 0; i < monitProfiles.length; i++){
                        //tempMarks.push(createPointMarkerPerProfile(i+1, []))
                        //tempPoints.push(createPointPerProfile(i+1, []))
                        tempCoord.push(createLineCoordinatesPerProfile(i+1, []))
                        tempCorrected.push(createCorrectedValuesPerProfile(i+1, []))
                        tempManualCheck.push(createCheckCorrectedValues(i+1, false))
                        tempPlanCheckboxs.push(createPlanCheckbox(i+1, false))
                        tempCrossSectionCheckboxs.push(createCrossSectionCheckbox(i+1, false))
                    }
                    //selectedDetailedProfileID+1(tempMarks);
                    //setPointsPerProfile(tempPoints);
                    setLineCoordinatesPerProfile(tempCoord);
                    setCorrectedValuesPerProfile(tempCorrected);
                    setManuallyCorrectedLines(tempManualCheck)
                    setPlanCheckboxs(tempPlanCheckboxs)
                    setCrossSectionCheckboxs(tempCrossSectionCheckboxs)
                }
                /*setMonitoringProfiles([createDataMPG(1, 'Barragem do Azibo', 2, ['Barragem do Azibo', 'Lab Test'], 10),
                    createDataMPG(2, 'Lab Test', 1, ['Lab Test'], 30)]);*/
                /*setMonitoringProfilesTableData([createDataMP(1, 'Barragem do Azibo', 'All','All inclinometers in the dam (Plan)', typeOfProfile[0].name, true, 'https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FimagePlan3.png?alt=media&token=06e79ca3-a159-47b7-9522-66de489f4c3f'),//'/profiles/imagePlan3.png'),
                    createDataMP(2, 'Barragem do Azibo', 'Crest', 'Profile along the crest in the downstream site', typeOfProfile[1].name, false, '/profiles/NoImageFound.png'),
                    createDataMP(3, 'Barragem do Azibo', 'P5', 'Profile P5', typeOfProfile[1].name, true, 'https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil5_v3.svg?alt=media&token=940d3b7e-e8bf-4458-a2bc-05f6cc4a4bd3'),
                    createDataMP(4, 'Lab Test', 'P7', 'Profile P6', typeOfProfile[1].name, false, '/profiles/NoImageFound.png')
                ]);*/

                //let tempMarks = [];

            }
        }
    },[dbMPGroups]);

    const [markersInitialized, setMarkersInitialized] = React.useState(false);

    useEffect(() => {
        if(!markersInitialized){
            let tempMarks = [];
            let tempLines = [];
            let tempAuxLines = [];
            let tempPoints = [];
            for(let i = 0; i < 6; i++){
                tempMarks.push(createPointMarkerPerProfile(i+1, []))
                tempLines.push(createLinePointPerProfile(i+1, []))
                tempAuxLines.push(createAuxCrossSectionLinesPerProfile(i+1, []))
                tempPoints.push(createPointPerProfile(i+1, []))
            }
            setMarkersPerProfile(tempMarks);
            setLinesPerProfile(tempLines)
            setAuxCrossSectionLinesPerProfile(tempAuxLines)
            setPointsPerProfile(tempPoints)
            setMarkersInitialized(true)
        }
    }, [markersInitialized]);

    //Test Data
    /*useEffect(() => {
        setRows([createData(1, 'Profiles1', 2, 10),
            createData(2, 'Profiles2', 1, 30)]);
        setMonitoringProfiles([createDataMPG(1, 'Profiles1', 2, ['PK150_200', 'PK250_300'], 10),
            createDataMPG(2, 'Profiles2', 1, ['PK250_300'], 30)]);
        setMonitoringProfilesTableData([createDataMP(1, 'Profiles1', 'All','All inclinometers in the dam (Plan)', typeOfProfile[0].name, true, 'https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FimagePlan3.png?alt=media&token=06e79ca3-a159-47b7-9522-66de489f4c3f'),//'/profiles/imagePlan3.png'),
            createDataMP(2, 'Profiles1', 'Crest', 'Profile along the crest in the downstream site', typeOfProfile[1].name, false, '/profiles/NoImageFound.png'),
            createDataMP(3, 'Profiles1', 'P5', 'Profile P5', typeOfProfile[1].name, true, 'https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil5_v2.svg?alt=media&token=53a9f417-d178-426d-b26f-8ca05bd481ad'),
            createDataMP(4, 'Profiles2', 'P7', 'Profile P6', typeOfProfile[1].name, false, '/profiles/NoImageFound.png')
        ]);

        let tempMarks = [];
        let tempPoints = [];
        let tempCoord = [];
        let tempCorrected = [];
        let tempManualCheck = [];
        let tempPlanCheckboxs = [];
        let tempCrossSectionCheckboxs = [];
        for(let i = 0; i < 4; i++){
            tempMarks.push(createPointMarkerPerProfile(i+1, []))
            tempPoints.push(createPointPerProfile(i+1, []))
            tempCoord.push(createLineCoordinatesPerProfile(i+1, []))
            tempCorrected.push(createCorrectedValuesPerProfile(i+1, []))
            tempManualCheck.push(createCheckCorrectedValues(i+1, false))
            tempPlanCheckboxs.push(createPlanCheckbox(i+1, false))
            tempCrossSectionCheckboxs.push(createCrossSectionCheckbox(i+1, false))
        }
        setMarkersPerProfile(tempMarks);
        setPointsPerProfile(tempPoints);
        setLineCoordinatesPerProfile(tempCoord);
        setCorrectedValuesPerProfile(tempCorrected);
        setManuallyCorrectedLines(tempManualCheck)
        setPlanCheckboxs(tempPlanCheckboxs)
        setCrossSectionCheckboxs(tempCrossSectionCheckboxs)
    }, [page]);*/

    // Monitoring profile groups

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof ExistingMonitoringProfiles,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDense(event.target.checked);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = React.useMemo(
        () => rows.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [monitoringProfiles, rows, order, orderBy, page, rowsPerPage],
    );

    const handleDelete = () => {
        const newRows = rows.filter((row) => !selected.includes(row.id));
        setRows(newRows);
        setSelected([]);
        setCheckedGroups([]);
    };

    // Selected Monitoring profile groups

    const handleRequestSortMP = (
        event: React.MouseEvent<unknown>,
        property: keyof MonitoringProfile,
    ) => {
        const isAsc = orderByMP === property && orderMP === 'asc';
        setOrderMP(isAsc ? 'desc' : 'asc');
        setOrderByMP(property);
    };

    const handleSelectAllClickMP = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rowsMP.map((n) => n.id);
            setSelectedMP(newSelected);
            return;
        }
        setSelectedMP([]);
    };

    const handleClickMP = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelectedMP(newSelected);
    };

    const handleChangePageMP = (event: unknown, newPage: number) => {
        setPageMP(newPage);
    };

    const handleChangeRowsPerPageMP = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageMP(parseInt(event.target.value, 10));
        setPageMP(0);
    };

    const handleChangeDenseMP = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDenseMP(event.target.checked);
    };

    const isSelectedMP = (id: number) => selectedMP.indexOf(id) !== -1;

    const emptyRowsMP =
        pageMP > 0 ? Math.max(0, (1 + pageMP) * rowsPerPageMP - rowsMP.length) : 0;

    const visibleRowsMP = React.useMemo(
        () => rowsMP.slice().sort(getComparator(orderMP, orderByMP)).slice(
            pageMP * rowsPerPageMP,
            pageMP * rowsPerPageMP + rowsPerPageMP),
        [monitoringProfilesTableData, rowsMP, orderMP, orderByMP, pageMP, rowsPerPageMP],
    );

    const [openNew, setOpenNew] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);


    const handleOpenNew = () => setOpenNew(true);

    const handleCloseNew = () => {
        setMissingFieldGroupName(false)
        setMissingFieldMeasurements(false)
        setErrorMessage('')
        setSelectedInclinometers(0)
        setSelectedMeasurements([])
        setGroupName('')

        setOpenNew(false)
    };


    const handleOpenEdit = () => setOpenEdit(true);

    const handleCloseEdit = () => {
        setMissingFieldGroupName(false)
        setMissingFieldMeasurements(false)
        setErrorMessage('')
        setSelectedInclinometersEdit(0)
        setSelectedMeasurementsEdit([])
        setSelectedGroupEdit('')
        setSelectedMPEdit(createDataMPG(0, '', 0, [], 0))

        setOpenEdit(false)
    };

    const handleGetAllMPCodes = () =>{
        if(monitoringProfilesTableData.length > 0){
            let codeList: string[] = []
            for(let i = 0; i < monitoringProfilesTableData.length; i++){
                if(monitoringProfilesTableData[i].hasImage && monitoringProfilesTableData[i].typeOfProfile === typeOfProfile[0].name)
                    codeList.push(monitoringProfilesTableData[i].id.toString())
            }

            setProfilesCodeList(codeList);
        }
    }

    const handleSelectFromCodeList = (e: string) =>{
        setSelectFromCodeList(e)
    }

    // ADD AND EDIT POP UPS SECTION

    const theme = useTheme();
    const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([]);
    const [selectedInclinometers, setSelectedInclinometers] = useState<number>(0);
    const [groupName, setGroupName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [missingFieldGroupName, setMissingFieldGroupName] = useState(false);
    const [missingFieldMeasurements, setMissingFieldMeasurements] = useState(false);
    const [alertSuccessVisible, setAlertSuccessVisible] = useState(false);
    const [alertSuccessEditVisible, setAlertSuccessEditVisible] = useState(false);
    const [alertFailedVisible, setAlertFailedVisible] = useState(false);
    const [alertFailedSelectVisible, setAlertFailedSelectVisible] = useState(false);
    const [alertWrongFileType, setAlertWrongFileType] = useState(false);
    const [alertNothingSelected, setAlertNothingSelected] = useState(false);
    const [warningNoMoreProfiles, setWarningNoMoreProfiles] = useState(false);

    const [selectedMPEdit, setSelectedMPEdit] = useState<MonitoringProfileGroup>(createDataMPG(0, '', 0, [], 0));
    const [selectedGroupEdit, setSelectedGroupEdit] = useState<string>('');
    const [selectedMeasurementsEdit, setSelectedMeasurementsEdit] = useState<string[]>([]);
    const [selectedInclinometersEdit, setSelectedInclinometersEdit] = useState<number>(0);
    const [selectedMPEditOld, setSelectedMPEditOld] = useState<MonitoringProfileGroup>(createDataMPG(0, '', 0, [], 0));
    const [selectedGroupEditOld, setSelectedGroupEditOld] = useState<string>('');
    const [selectedMeasurementsEditOld, setSelectedMeasurementsEditOld] = useState<string[]>([]);
    const [selectedInclinometersEditOld, setSelectedInclinometersEditOld] = useState<number>(0);

    const [checkedGroups, setCheckedGroups] = useState<number[]>([])
    const [groupSelected, setGroupSelected] = useState<boolean>(false);

    useEffect(() => {
        if(selectedMeasurements.length !== 0){
            let incNumber = 0;
            for(let i = 0; i < selectedMeasurements.length; i++){
                for(let j = 0; j < testIncValues.length; j++){
                    if(testIncValues[j] === selectedMeasurements[i]){
                        incNumber += Number(testIncValues[j+1])
                    }
                }
            }
            setSelectedInclinometers(incNumber)
        }
    }, [selectedMeasurements]);

    useEffect(() => {
        if(selectedMeasurementsEdit.length !== 0){
            let incNumber = 0;
            for(let i = 0; i < selectedMeasurementsEdit.length; i++){
                for(let j = 0; j < testIncValues.length; j++){
                    if(testIncValues[j] === selectedMeasurementsEdit[i]){
                        incNumber += Number(testIncValues[j+1])
                    }
                }
            }
            setSelectedInclinometersEdit(incNumber)
        }
    }, [selectedMeasurementsEdit]);

    const handleChange = (event: SelectChangeEvent<typeof selectedMeasurements>) => {
        const {
            target: { value },
        } = event;
        setSelectedMeasurements(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeEdit = (event: SelectChangeEvent<typeof selectedMeasurementsEdit>) => {
        const {
            target: { value },
        } = event;
        setSelectedMeasurementsEdit(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleGroupName = (newGroupName: string) => {
        setGroupName(newGroupName)
    }

    const handleGroupNameEdit = (newGroupName: string) => {
        setSelectedGroupEdit(newGroupName)
    }

    const handleSubmit = () => {
        if(selectedMeasurements.length === 0 || groupName.length === 0){
            setErrorMessage('Please fill in all required fields.');
            if(groupName.length === 0){
                setMissingFieldGroupName(true)
            }
            if(selectedMeasurements.length === 0){
                setMissingFieldMeasurements(true)
            }
            setAlertFailedVisible(true);
            setTimeout(() => {
                setAlertFailedVisible(false);
            }, 5000);
        }else{
            let tempRows = rows;
            let tempMP = monitoringProfiles;
            tempRows.push(createData(rows.length + 1, groupName, selectedMeasurements.length, selectedInclinometers));
            tempMP.push(createDataMPG(monitoringProfiles.length + 1, groupName, selectedMeasurements.length, selectedMeasurements, selectedInclinometers));
            setRows(tempRows);
            setMonitoringProfiles(tempMP)
            handleCloseNew()
            setAlertSuccessVisible(true);
            setTimeout(() => {
                setAlertSuccessVisible(false);
            }, 5000);
        }
    };

    const handleSelectedMPEdit = (mp: string) => {
        monitoringProfiles.map(m => {
            if(m.group === mp){
                setSelectedMPEdit(m)
                setSelectedGroupEdit(m.group)
                setSelectedMeasurementsEdit(m.measurementsList)
                setSelectedInclinometersEdit(m.inclinometers)
                setSelectedMPEditOld(m)
                setSelectedGroupEditOld(m.group)
                setSelectedMeasurementsEditOld(m.measurementsList)
                setSelectedInclinometersEditOld(m.inclinometers)
            }
        })
    }

    const handleSubmitEdit = () => {
        console.log(selectedMPEdit)
        let tempRows = rows;
        let tempMP = monitoringProfiles;

        if (selectedMPEdit.group === '') {
            setErrorMessage('Please select a monitoring profile to edit.');
            setAlertFailedSelectVisible(true);
            setTimeout(() => {
                setAlertFailedSelectVisible(false);
            }, 5000);
        }else if(selectedMeasurementsEdit.length === 0 || selectedGroupEdit.length === 0) {
            setErrorMessage('Please fill in all required fields.');
            if(selectedGroupEdit.length === 0){
                setMissingFieldGroupName(true)
            }
            if(selectedMeasurementsEdit.length === 0){
                setMissingFieldMeasurements(true)
            }
            setAlertFailedVisible(true);
            setTimeout(() => {
                setAlertFailedVisible(false);
            }, 5000);
        }else{
            let tempCreateData = createData(rows.length + 1, selectedGroupEdit, selectedMeasurementsEdit.length, selectedInclinometersEdit);
            let tempCreateDataMP = createDataMPG(monitoringProfiles.length + 1, selectedGroupEdit, selectedMeasurementsEdit.length, selectedMeasurementsEdit, selectedInclinometersEdit);
            console.log(tempCreateData)
            for(let i = 0; i < tempRows.length; i++){
                if(tempRows[i].group === selectedMPEdit.group){
                    tempRows[i] = tempCreateData;
                    tempMP[i] = tempCreateDataMP;
                }
            }

            setRows(tempRows);
            setMonitoringProfiles(tempMP)
            handleCloseEdit()
            setAlertSuccessEditVisible(true);
            setTimeout(() => {
                setAlertSuccessEditVisible(false);
            }, 5000);
        }
    };

    useEffect(() => {
        if(checkedGroups.length === 0){
            setGroupSelected(false);
        }
    }, [checkedGroups]);

    const handleSubmitGroups = () => {
        if(checkedGroups.length === 0){
            setGroupSelected(false);
            setAlertNothingSelected(true);
            setTimeout(() => {
                setAlertNothingSelected(false);
            }, 5000);
        }else{
            setGroupSelected(true);
            let tempRows = []
            let checkedGroupsSet = new Set(checkedGroups);

            for (let i = 0; i < rows.length; i++) {
                if (checkedGroupsSet.has(rows[i].id)) {
                    for(let j = 0; j < monitoringProfilesTableData.length; j++) {
                        if(monitoringProfilesTableData[j].group === rows[i].group){
                            tempRows.push(monitoringProfilesTableData[j]);
                        }
                    }
                }
            }

            setRowsMP(tempRows);
        }
    }


    // New and edit profiles pop up

    const [openNewProfile, setOpenNewProfile] = useState(false);
    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [profileGroups, setProfileGroups] = useState<string[]>([]);
    const [missingFieldCorrespondingGroupNew, setMissingFieldCorrespondingGroupNew] = useState(false);
    const [missingFieldProfileNameNew, setMissingFieldProfileNameNew] = useState(false);
    const [missingFieldProfileDescriptionNew, setMissingFieldProfileDescriptionNew] = useState(false);
    const [missingFieldTypeOfProfileNew, setMissingFieldTypeOfProfileNew] = useState(false);
    const [missingSelectedInclinometers, setMissingSelectedInclinometers] = useState(false);
    const [selectedProfileNew, setSelectedProfileNew] = useState<MonitoringProfile>(createDataMP(0, '', '', '', '', false, ''));
    const [selectedGroupProfileNew, setSelectedGroupProfileNew] = useState<string>('');
    const [selectedNameProfileNew, setSelectedNameProfileNew] = useState<string>('');
    const [selectedDescriptionProfileNew, setSelectedDescriptionProfileNew] = useState<string>('');
    const [selectedTypeOfProfileNew, setSelectedTypeOfProfileNew] = useState<string>('');
    const [selectedHasImageProfileNew, setSelectedHasImageProfileNew] = useState<boolean>(false);
    const [selectedAttachedImageNew, setSelectedAttachedImageNew] = useState<string>('');
    const [availableInclinometersNew, setAvailableInclinometersNew] = useState<string[]>([]);
    const [selectedInclinometersNew, setSelectedInclinometersNew] = useState<string[]>([]);


    const [incPerProfiles, setIncPerProfiles] = React.useState<IncPerProfile[]>([]);
    const [pointsPerProfile, setPointsPerProfile] = useState<PointsPerProfile[]>([]);

    useEffect(() => {
        let tempMPTD = monitoringProfiles;
        let differentMP: string[] = []
        let differentMPMeasurement: string[][] = []
        let newMPFound = false;

        tempMPTD.map((mp, index) =>{
            if(selectedGroupProfileNew === mp.group){
                if(differentMP.length !== 0){
                    differentMP.map(dmp =>{
                        if(mp.group !== dmp){
                            newMPFound = true;
                        }
                    })
                    if(newMPFound){
                        differentMP.push(mp.group)
                        differentMPMeasurement.push(mp.measurementsList)
                        newMPFound = false;
                    }
                }else{
                    differentMP.push(mp.group)
                    differentMPMeasurement.push(mp.measurementsList)
                }
            }
        })

        //let tempIncPerProfiles: IncPerProfile[] = []
        let tempAvailInc: string[] = [];
        let counter = 0;
        let counterInc = 1;
        for(let i = 0; i < differentMP.length; i++){
            for(let j = 0; j < differentMPMeasurement[i].length; j++){
                for(let k = 0; k < 9; k++){
                    tempAvailInc.push("I" + counterInc + " (" + differentMPMeasurement[i][j] + ")");
                    counter++;
                    if(counterInc === 6){
                        counterInc=7
                    }
                    counterInc++
                }
                counterInc = 1;
            }
        }

        setAvailableInclinometersNew(tempAvailInc);

    }, [selectedGroupProfileNew]);

    const handleOpenNewProfile = () => setOpenNewProfile(true);

    const handleCloseNewProfile = () => {
        /*setMissingFieldGroupName(false)
        setMissingFieldMeasurements(false)
        setErrorMessage('')
        setSelectedInclinometers(0)
        setSelectedMeasurements([])
        setGroupName('')
*/
        setOpenNewProfile(false)
    };

    const handleSelectedGroupProfileNew= (p: string) => {
        monitoringProfiles.map(m => {
            if(m.group === p){
                setSelectedGroupProfileNew(p)
                /*setSelectedMPEdit(m)
                setSelectedGroupEdit(m.group)
                setSelectedMeasurementsEdit(m.measurementsList)
                setSelectedInclinometersEdit(m.inclinometers)
                setSelectedMPEditOld(m)
                setSelectedGroupEditOld(m.group)
                setSelectedMeasurementsEditOld(m.measurementsList)
                setSelectedInclinometersEditOld(m.inclinometers)*/
            }
        })
    }

    const handleNameProfileNew = (newName: string) => {
        setSelectedNameProfileNew(newName)
    }

    const handleDescriptionProfileNew = (newName: string) => {
        setSelectedDescriptionProfileNew(newName)
    }

    const handleSelectedTypeOfProfileNew= (p: string) => {
        typeOfProfile.map(m => {
            if(m.name === p){
                setSelectedTypeOfProfileNew(p)
                /*setSelectedMPEdit(m)
                setSelectedGroupEdit(m.group)
                setSelectedMeasurementsEdit(m.measurementsList)
                setSelectedInclinometersEdit(m.inclinometers)
                setSelectedMPEditOld(m)
                setSelectedGroupEditOld(m.group)
                setSelectedMeasurementsEditOld(m.measurementsList)
                setSelectedInclinometersEditOld(m.inclinometers)*/
            }
        })
    }

    const handleChangeSelectedIncNew = (event: SelectChangeEvent<typeof selectedInclinometersNew>) => {
        const {
            target: { value },
        } = event;
        setSelectedInclinometersNew(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleSubmitProfile = () => {
        if(selectedGroupProfileNew.length === 0 || selectedNameProfileNew.length === 0 || selectedDescriptionProfileNew.length === 0 || selectedTypeOfProfileNew.length === 0 || selectedInclinometersNew.length === 0){
            setErrorMessage('Please fill in all required fields.');
            if(selectedGroupProfileNew.length === 0){
                setMissingFieldCorrespondingGroupNew(true)
            }
            if(selectedNameProfileNew.length === 0){
                setMissingFieldProfileNameNew(true)
            }
            if(selectedDescriptionProfileNew.length === 0){
                setMissingFieldProfileDescriptionNew(true)
            }
            if(selectedTypeOfProfileNew.length === 0){
                setMissingFieldTypeOfProfileNew(true)
            }
            if(selectedInclinometersNew.length === 0){
                setMissingSelectedInclinometers(true)
            }

            setAlertFailedVisible(true);
            setTimeout(() => {
                setAlertFailedVisible(false);
            }, 5000);
        }else{
            let tempRows = rowsMP;
            let tempMP = monitoringProfilesTableData;
            let tempIncPerProfiles = incPerProfiles;
            let nextId = rowsMP.length + 1;

            tempRows.push(createDataMP(rowsMP.length + 1, selectedGroupProfileNew, selectedNameProfileNew, selectedDescriptionProfileNew, selectedTypeOfProfileNew, (selectedAttachedImageNew !== ''), selectedAttachedImageNew))
            tempMP.push(createDataMP(monitoringProfilesTableData.length + 1, selectedGroupProfileNew, selectedNameProfileNew, selectedDescriptionProfileNew, selectedTypeOfProfileNew, (selectedAttachedImageNew !== ''), selectedAttachedImageNew === '' ? '' : selectedAttachedImageNew))

            for(let i = 0; i < selectedInclinometersNew.length; i++){
                tempIncPerProfiles.push(createIncPerProfile(tempIncPerProfiles.length + 1, rowsMP.length + 1, selectedGroupProfileNew, selectedInclinometersNew[i].split("(")[1].split(")")[0], Number(selectedInclinometersNew[i].split(" ")[0].split("I")[1])));
            }

            setRowsMP(tempRows);
            setMonitoringProfilesTableData(tempMP)
            setIncPerProfiles(tempIncPerProfiles);

            let tempMarks = markersPerProfile;
            let tempPoints = pointsPerProfile;
            let tempLines = linesPerProfile;
            let tempCoords = lineCoordinatesPerProfile;
            let tempCorrected = correctedValuesPerProfile;
            let tempManualCheck = manuallyCorrectedLines;
            let tempCrossSectionCheckbox = crossSectionCheckboxs;
            let tempPlanCheckbox = planCheckboxs;
            tempMarks.push(createPointMarkerPerProfile(nextId, []));
            tempPoints.push(createPointPerProfile(nextId, []));
            tempLines.push(createLinePointPerProfile(nextId, []))
            tempCoords.push(createLineCoordinatesPerProfile(nextId, []))
            tempCorrected.push(createCorrectedValuesPerProfile(nextId, []))
            tempManualCheck.push(createCheckCorrectedValues(nextId, false))
            tempCrossSectionCheckbox.push(createCrossSectionCheckbox(nextId, false))
            tempPlanCheckbox.push(createPlanCheckbox(nextId, false))
            setMarkersPerProfile(tempMarks);
            setPointsPerProfile(tempPoints);
            setLinesPerProfile(tempLines);
            setLineCoordinatesPerProfile(tempCoords);
            setCorrectedValuesPerProfile(tempCorrected);
            setManuallyCorrectedLines(tempManualCheck)
            setCrossSectionCheckboxs(tempCrossSectionCheckbox)
            setPlanCheckboxs(tempPlanCheckbox)

            handleCloseNew()
            setAlertSuccessVisible(true);
            setTimeout(() => {
                setAlertSuccessVisible(false);
            }, 5000);
        }
    };

    const handleEditProfilePopUp = () => {

    }

    // Image upload
    const [fileInputRefs, setFileInputRefs] = useState<HTMLInputElement[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, rowId :number) => {
        if (event.target.files && event.target.files[0]) {
            //setSelectedFile(event.target.files[0]);
            let fileType = event.target.files[0].type
            if(fileType === "image/svg+xml" || fileType === "image/png" || fileType === "image/jpg" || fileType === "image/jpeg")
                handleUpload(event.target.files[0], rowId)
            else{
                setAlertWrongFileType(true);
                setTimeout(() => {
                    setAlertWrongFileType(false);
                }, 5000);
            }
        }
    };

    const handleUpload = (file: File, rowId: number) =>{
        const imageFile: File = file
        const storage = getStorage(firebase.getApp());

        const storageRef = ref(storage, `profiles/${imageFile.name}`);

        uploadBytes(storageRef, imageFile)
            .then((snapshot) => {
                console.log('Image uploaded successfully!');
                return getDownloadURL(snapshot.ref);
            })
            .then((downloadURL) => {
                console.log('Download URL:', downloadURL);
                let tempData = monitoringProfilesTableData;
                tempData[rowId].imagedAttached = downloadURL;
                tempData[rowId].hasImage = true;
                setMonitoringProfilesTableData(tempData);
                setRowsMP(tempData);
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
            });

    }


    // Detailed view

    const [detailedView, setDetailedView] = React.useState(false);
    const [selectedDetailedProfile, setSelectedDetailedProfile] = React.useState<string>('Profile1: All');
    const [selectedDetailedProfileAttachedImageName, setSelectedDetailedProfileAttachedImageName] = React.useState<string>('');
    const [selectedDetailedProfileID, setSelectedDetailedProfileID] = React.useState<number>(0);
    const [selectedTypeOfProfile, setSelectedTypeOfProfile] = React.useState<string>(typeOfProfile[0].name);

    const [orderMPPC, setOrderMPPC] = React.useState<Order>('asc');
    const [orderByMPPC, setOrderByMPPC] = React.useState<keyof MPPC>('id');
    const [selectedMPPC, setSelectedMPPC] = React.useState<readonly number[]>([]);
    const [pageMPPC, setPageMPPC] = React.useState(0);
    const [denseMPPC, setDenseMPPC] = React.useState(false);
    const [rowsPerPageMPPC, setRowsPerPageMPPC] = React.useState(5);
    const [rowsMPPC, setRowsMPPC] = React.useState<MPPC[]>([]);
    const [MPPCTableData, setMPPCTableData] = React.useState<MPPC[]>([]);
    const [MPPCTableDataUniqueIds, setMPPCTableDataUniqueIds] = React.useState<MPPCUniqueIds[]>([]);
    const [MPPCTableDataCodeWithUniqueId, setMPPCTableDataCodeWithUniqueId] = React.useState<MPPCCodeWithUniqueId[]>([]);

    const stageRef = useRef<Konva.Stage | null>(null);
    const pointsLayerRef = useRef<Konva.Layer | null>(null);
    const [positionsArray, setPositionsArray] = React.useState<number[]>([]);
    const [replaceValues, setReplaceValues] = React.useState(false);

    const [emptyPhoto, setEmptyPhoto] = React.useState(true);

    const [planCheckActiveImgSrc, setPlanCheckActiveImgSrc] = useState<string>('');
    const [planCheckActiveOwn, setPlanCheckActiveOwn] = useState(false);
    const [planCheckActive, setPlanCheckActive] = useState(false);
    const [crossSectionCheckActive, setCrossSectionCheckActive] = useState(false);
    const [replaceCrossCheckValue, setReplaceCrossCheckValue] = useState(false);
    const [replacePlanCheckValue, setReplacePlanCheckValue] = useState(false);
    const [planCheckboxs, setPlanCheckboxs] = useState<PlanCheckbox[]>([]);
    const [crossSectionCheckboxs, setCrossSectionCheckboxs] = useState<CrossSectionCheckbox[]>([]);

    const [activePickPointRow, setActivePickPointRow] = useState(false);
    const [activePickPointRowId, setActivePickPointRowId] = useState<number>(-1);

    const stageRefCrossSection = useRef<Konva.Stage | null>(null);
    const pointsLayerRefCrossSection = useRef<Konva.Layer | null>(null);
    const [positionsArrayCrossSection, setPositionsArrayCrossSection] = React.useState<number[]>([]);
    const [auxCrossSectionLinesPerProfile, setAuxCrossSectionLinesPerProfile] = React.useState<AuxCrossSectionLinesPerProfile[]>([]);
    const [replaceValuesCrossSection, setReplaceValuesCrossSection] = React.useState(false);

    const [clickTop, setClickTop] = useState(false);
    const [clickBottom, setClickBottom] = useState(false);
    const [selectedIncTopBottom, setSelectedIncTopBottom] = useState<number>(0);
    const [coordIncs, setCoordIncs] = useState<number[]>([]);


    useEffect(() => {
        console.log(selectedDetailedProfile)
        dispatch(getSpecificProfilePositionAdjustments(selectedDetailedProfileID+1,sessionToken)).then(pos => {
            if(pos !== undefined){
                if(selectedDetailedProfile === "Barragem do Azibo: All" && selectedDetailedProfileID === 0 || selectedDetailedProfile === "Barragem do Azibo: P5" && selectedDetailedProfileID === 1
                    || selectedDetailedProfile === "Barragem do Azibo: P7" && selectedDetailedProfileID === 2 || selectedDetailedProfile === "Barragem do Azibo: P9" && selectedDetailedProfileID === 3
                    || selectedDetailedProfile === "Barragem do Azibo: P13" && selectedDetailedProfileID === 4 || selectedDetailedProfile === "Lab Test: P1" && selectedDetailedProfileID === 5){

                    let tempPos = [];
                    let tempIncs = [];
                    let tempUniqueIds = [];
                    let tempCodeWithUniqueId = [];
                    for(let i = 0; i < pos.length; i++){
                        let newUniqueId = pos[i].uniqueId;
                        let newCode = pos[i].code;
                        let newMeasurement = pos[i].measurement;
                        let newInc = pos[i].inc;
                        let newType = pos[i].type;
                        let newPosAdjust = pos[i].positionAdjusted;
                        let newMonitProfId
                        if(newUniqueId !== undefined && newCode !== undefined && newMeasurement !== undefined && newInc !== undefined && newPosAdjust !== undefined){
                            tempCodeWithUniqueId.push(createDataMPPCCodeWithUniqueId(Number(newCode), newUniqueId))
                            tempPos.push(createDataMPPC(Number(newCode), newMeasurement, Number(newInc.split("I")[1]), newPosAdjust, []))
                            tempIncs.push(Number(newInc.split("I")[1]))
                            tempUniqueIds.push(createDataMPPCUniqueIds(newUniqueId, Number(newInc.split("I")[1])))
                        }
                    }
                    setMPPCTableDataCodeWithUniqueId(tempCodeWithUniqueId)
                    setMPPCTableData(tempPos)
                    setRowsMPPC(tempPos)
                    setCoordIncs(tempIncs.sort((a, b) => a - b))

                    let incsForProfile = tempIncs.sort((a, b) => a - b)
                    let tempAux = auxCrossSectionLinesPerProfile
                    let newAuxArrayNumbers = [];
                    for(let i = 0; i < incsForProfile.length*4;i++){
                        newAuxArrayNumbers.push(0)
                    }

                    tempAux[selectedDetailedProfileID] = createAuxCrossSectionLinesPerProfile(selectedDetailedProfileID, newAuxArrayNumbers);
                    setAuxCrossSectionLinesPerProfile(tempAux)

                    setSelectedIncTopBottom(tempIncs[0])
                    setMPPCTableDataUniqueIds(tempUniqueIds)
                }
            }
        })


            /*for(let i = 0; i<(dbPosAdjust ?? []).length; i++) {


                let mIncString = dbPosAdjust[i].inclinometers;
                let incs:string[] = [];
                if (mIncString !== undefined) {
                    incs = mIncString.split("?");
                } else {
                    incs = [];
                }

                let measurementName = dbMeasurementsList[i].measurement;
                let hostName = dbMeasurementsList[i].host;
                if(measurementName !== undefined && hostName !== undefined){
                    for (let j = 0; j < incs.length; j++) {
                        m.push(createMeasurement(counterArray, measurementName,hostName,incs[j]))
                        counterArray++;
                    }
                }
            }
            setMeasurements(m)*/


        /*if(selectedDetailedProfile === 'Barragem do Azibo: All'){
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, true, [296.2878194833505, 137.46244130721217]),
                createDataMPPC(1, 'Barragem do Azibo', 2, false, []),
                createDataMPPC(2, 'Barragem do Azibo', 3, false, []),
                createDataMPPC(3, 'Barragem do Azibo', 4, false, []),
                createDataMPPC(4, 'Barragem do Azibo', 5, false, []),
                createDataMPPC(5, 'Barragem do Azibo', 6, false, []),
                createDataMPPC(6, 'Barragem do Azibo', 8, false, []),
                createDataMPPC(7, 'Barragem do Azibo', 9, false, []),
                createDataMPPC(8, 'Barragem do Azibo', 10, false, [])])
            setRowsMPPC(MPPCTableData)
        }else if(selectedDetailedProfile === 'Barragem do Azibo: Crest'){
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, false, []),
                createDataMPPC(1, 'Barragem do Azibo', 3, false, []),
                createDataMPPC(2, 'Barragem do Azibo', 6, false, []),
                createDataMPPC(3, 'Barragem do Azibo', 9, false, [])])
            setRowsMPPC(MPPCTableData)
        }else{
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, false, []),
                createDataMPPC(1, 'Barragem do Azibo', 2, false, [])])
            setRowsMPPC(MPPCTableData)
        }*/
    }, [detailedView, selectedDetailedProfile, selectedDetailedProfileID]);

    /*useEffect(() => {
        if(selectedDetailedProfile !== 'Barragem do Azibo: All' && selectedDetailedProfile !== 'Barragem do Azibo: Crest' && selectedDetailedProfile !== 'Barragem do Azibo: P5') {

            let tempIncValues = incPerProfiles;
            let tempIncValuesFinal: IncPerProfile[] = [];
            let selectedCode = 0;

            rowsMP.map((i, index) => {
                if (i.group === selectedDetailedProfile.split(": ")[0] && i.name === selectedDetailedProfile.split(": ")[1]) {
                    selectedCode = i.id;
                }
            })

            tempIncValues.map((v, index) => {
                if (v.profileCode - 1 === selectedCode) {
                    tempIncValuesFinal.push(v);
                }
            })

            let tempRows = [];
            let tempMPPCTableData = [];
            let tempInc = [];
            let counter = 0;
            for (let i = 0; i < tempIncValuesFinal.length; i++) {
                tempRows.push(createDataMPPC(counter, tempIncValuesFinal[i].profileGroup, tempIncValuesFinal[i].inc, false, []))
                tempMPPCTableData.push(createDataMPPC(counter, tempIncValuesFinal[i].profileGroup, tempIncValuesFinal[i].inc, false, []))
                tempInc.push(tempIncValuesFinal[i].inc)
                counter++;
            }
            if(tempIncValuesFinal.length > 0){
                setSelectedIncTopBottom(tempIncValuesFinal[0].inc)
            }
            setCoordIncs(tempInc)
            setRowsMPPC(tempRows)
            setMPPCTableData(tempMPPCTableData)

        }else if(selectedDetailedProfile === 'Barragem do Azibo: All'){
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, true, [296.2878194833505, 137.46244130721217]),
                createDataMPPC(1, 'Barragem do Azibo', 2, false, []),
                createDataMPPC(2, 'Barragem do Azibo', 3, false, []),
                createDataMPPC(3, 'Barragem do Azibo', 4, false, []),
                createDataMPPC(4, 'Barragem do Azibo', 5, false, []),
                createDataMPPC(5, 'Barragem do Azibo', 6, false, []),
                createDataMPPC(6, 'Barragem do Azibo', 8, false, []),
                createDataMPPC(7, 'Barragem do Azibo', 9, false, []),
                createDataMPPC(8, 'Barragem do Azibo', 10, false, [])])
            setRowsMPPC(MPPCTableData)
        }else if(selectedDetailedProfile === 'Barragem do Azibo: Crest'){
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, false, []),
                createDataMPPC(1, 'Barragem do Azibo', 3, false, []),
                createDataMPPC(2, 'Barragem do Azibo', 6, false, []),
                createDataMPPC(3, 'Barragem do Azibo', 9, false, [])])
            setRowsMPPC(MPPCTableData)
            setCoordIncs([1,3,6,9])
            setSelectedIncTopBottom(1)
        }else{
            setMPPCTableData([createDataMPPC(0, 'Barragem do Azibo', 1, false, []),
                createDataMPPC(1, 'Barragem do Azibo', 2, false, [])])
            setRowsMPPC(MPPCTableData)
            setCoordIncs([1,2])
            setSelectedIncTopBottom(1)
        }
    }, [selectedDetailedProfile, selectedDetailedProfileID]);*/

    useEffect(() => {
        setRowsMPPC(MPPCTableData)
    }, [MPPCTableData]);


    useEffect(() => {
        dispatch(getPoints(selectedDetailedProfileID+1,sessionToken)).then(pos => {
            if(pos !== undefined){
                if(selectedDetailedProfile === "Barragem do Azibo: All" && selectedDetailedProfileID === 0 || selectedDetailedProfile === "Barragem do Azibo: P5" && selectedDetailedProfileID === 1
                    || selectedDetailedProfile === "Barragem do Azibo: P7" && selectedDetailedProfileID === 2 || selectedDetailedProfile === "Barragem do Azibo: P9" && selectedDetailedProfileID === 3
                    || selectedDetailedProfile === "Barragem do Azibo: P13" && selectedDetailedProfileID === 4 || selectedDetailedProfile === "Lab Test: P1" && selectedDetailedProfileID === 5){

                    let tempPos = [];

                    for(let i = 0; i < pos.length; i++){
                        let newPosX = pos[i].positionX;
                        let newPosY = pos[i].positionY;
                        let newPosAdjustId = pos[i].profilePositionAdjustmentId;

                        if(newPosX !== undefined && newPosY !== undefined && newPosAdjustId !== undefined){
                            tempPos.push(createPoint(newPosAdjustId, newPosX, newPosY));
                        }
                    }

                    let tempPoints = pointsPerProfile;
                    tempPoints[selectedDetailedProfileID] = createPointPerProfile(selectedDetailedProfileID+1, tempPos);
                    setPointsPerProfile(tempPoints);
                }
            }
        })
    }, [dispatch, selectedDetailedProfile, selectedDetailedProfileID]);

    useEffect(() => {
        let tempTableData = MPPCTableData;
        let tempPoints = pointsPerProfile;
        let tempTDCUID = MPPCTableDataCodeWithUniqueId;
        if(tempPoints.length > 0 && tempTableData.length > 0){
            if(tempPoints[selectedDetailedProfileID].points.length > 0) {

                for (let i = 0; i < tempTableData.length; i++) {
                    if (tempTableData[i].id === tempTDCUID[i].code) {
                        let profilePoints = tempPoints[selectedDetailedProfileID].points
                        let id = tempTDCUID[i].id;
                        let code = tempTDCUID[i].code;
                        for (let j = 0; j < profilePoints.length; j++) {
                            if (profilePoints[j].id === id) {
                                let oldData = tempTableData[code - 1];
                                tempTableData[code - 1] = createDataMPPC(oldData.id, oldData.groupMP, oldData.inc, true, [profilePoints[j].posX, profilePoints[j].posY]);
                            }
                        }
                    }
                }

                setMPPCTableData(tempTableData);
                setRowsMPPC(tempTableData);
            }
        }
    }, [selectedDetailedProfile, pointsPerProfile, MPPCTableData, rowsMPPC]);

    useEffect(() => {
        /*if(positionsArray.length === 0){
            setPositionsArray([296.2878194833505, 137.46244130721217, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0])
        }*/

        if(stageRef.current && pointsLayerRef.current && replaceValues && !emptyPhoto){
            let stage = stageRef.current;

            if (pointsLayerRef.current) {
                pointsLayerRef.current.destroy();
            }

            let layer = new Konva.Layer({
                scaleX: 1,
                scaleY: 1,
                rotation: 5,
            });

            stage.add(layer);

            pointsLayerRef.current = layer;

            //let layer = pointsLayerRef.current;

            let group = new Konva.Group({
                x: 30,
                rotation: 10,
                scaleX: 1,
            });
            layer.add(group);

            let pointsArray = pointsPerProfile[selectedDetailedProfileID].points;

            console.log(pointsArray)

            for(let i = 0; i < pointsArray.length; i++){
                let point = pointsArray[i];
                if(point){
                if(pointsArray[i].posX !== 0 || pointsArray[i].posY !== 0){
                    let shape = new Konva.Circle({
                        x: pointsArray[i].posX,
                        y: pointsArray[i].posY,
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                }}
            }
            /*for(let i = 0; i < 9; i++){
                if(positionsArray[posCounter] !== 0 || positionsArray[posCounter+1] !== 0){
                    let shape = new Konva.Circle({
                        x: positionsArray[posCounter],
                        y: positionsArray[posCounter+1],
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                }
                posCounter += 2;
            }*/
            setReplaceValues(false);
        }else if(replaceValues && emptyPhoto){
            setMarkers(markersPerProfile[selectedDetailedProfileID].pm)

            setReplaceValues(false);
        }
    }, [MPPCTableData, positionsArray, replaceValues, pointsPerProfile]);

    useEffect(() => {
        /*if(positionsArrayCrossSection.length === 0){
            setPositionsArrayCrossSection([0, 0, 0, 0, 0, 0, 0, 0])
        }*/

        if(stageRefCrossSection.current && pointsLayerRefCrossSection.current && crossSectionCheckboxs[selectedDetailedProfileID].check && replaceValuesCrossSection && emptyPhoto && crossSectionCheckActive) {
            let stage = stageRefCrossSection.current;

            if (pointsLayerRefCrossSection.current) {
                pointsLayerRefCrossSection.current.destroy();
            }

            let layer = new Konva.Layer({
                scaleX: 1,
                scaleY: 1,
                rotation: 5,
            });

            stage.add(layer);

            pointsLayerRefCrossSection.current = layer;

            //let layer = pointsLayerRef.current;

            let group = new Konva.Group({
                x: 30,
                rotation: 10,
                scaleX: 1,
            });
            layer.add(group);

            let tempPosArray = auxCrossSectionLinesPerProfile[selectedDetailedProfileID].array//positionsArrayCrossSection;
            console.log(tempPosArray)

            for(let i = 0; i < coordIncs.length; i++) {
                if (tempPosArray[i * 4] !== 0 && tempPosArray[i * 4 + 2] !== 0) {
                    //linha
                    let shape = new Konva.Line({
                        points: [tempPosArray[i * 4], tempPosArray[i * 4 + 1], tempPosArray[i * 4 + 2], tempPosArray[i * 4 + 3]],
                        stroke: 'red',
                        strokeWidth: 5
                    });
                    group.add(shape);
                } else if (tempPosArray[i * 4] !== 0) {
                    //ponto
                    let shape = new Konva.Circle({
                        x: tempPosArray[i * 4],
                        y: tempPosArray[i * 4 + 1],
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                } else if (tempPosArray[i * 4 + 2] !== 0) {
                    //ponto
                    let shape = new Konva.Circle({
                        x: tempPosArray[i * 4 + 2],
                        y: tempPosArray[i * 4 + 3],
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                }
            }
            /*let posCounter = 0;
            for (let i = 0; i < 9; i++) {
                if (positionsArrayCrossSection[posCounter] !== 0 || positionsArrayCrossSection[posCounter + 1] !== 0) {
                    let shape = new Konva.Circle({
                        x: positionsArrayCrossSection[posCounter],
                        y: positionsArrayCrossSection[posCounter + 1],
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                }
                posCounter += 2;
            }*/
            setReplaceValuesCrossSection(false);
        }

    }, [auxCrossSectionLinesPerProfile, replaceValuesCrossSection]);


    //const [crossSectionImgLarge, setCrossSectionImgLarge] = useState<boolean>(false);

    /*useEffect(() => {
        if(detailedView && selectedTypeOfProfile == typeOfProfile[1].name){
            let tempData = monitoringProfilesTableData;
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID + 1)
            if (selectedData.length > 0) {
                let image = new Image();
                image.src = selectedData[0].imagedAttached;

                image.onload = () => {
                    console.log(image.width)
                    console.log(image)

                    setCrossSectionImgWidth(image.width)
                    setCrossSectionImgHeight(image.height)

                    console.log(selectedData)
                    console.log(image.height + " | " + image.width)

                    if ((image.height / image.width) > 0.63) {
                        setCrossSectionImgLarge(false);
                    } else {
                        setCrossSectionImgLarge(true);
                    }
                }
            }
        }
    }, [selectedDetailedProfile, selectedDetailedProfileID]);*/

    useEffect(() => {
        if(detailedView) {
            let tempData = monitoringProfilesTableData;
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID + 1)

            if (selectedTypeOfProfile === typeOfProfile[0].name && planCheckboxs[selectedDetailedProfileID].check) {

                setTimeout(function () {
                    if (stageRef.current) {
                        const stage = stageRef.current;
                        stage.destroy();
                    }

                    const stage = new Konva.Stage({
                        container: 'konvaContainer',
                        width: 600,
                        height: 400
                    });
                    stageRef.current = stage;

                    let backgroundLayer = new Konva.Layer();
                    stage.add(backgroundLayer);

                    let backgroundImage = new Image();
                    backgroundImage.onload = function () {
                        let background = new Konva.Image({
                            image: backgroundImage,
                            width: stage.width(),
                            height: stage.height(),
                        });
                        backgroundLayer.add(background);

                        let border = new Konva.Rect({
                            x: 0,
                            y: 0,
                            width: stage.width(),
                            height: stage.height(),
                            stroke: 'black',
                            strokeWidth: 2,
                        });
                        backgroundLayer.add(border);
                        backgroundLayer.draw();
                    };
                    backgroundImage.src = selectedData[0].imagedAttached;//'/profiles/imagePlan3.png';

                    let layer = new Konva.Layer({
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 5,
                    });
                    stage.add(layer);

                    let group = new Konva.Group({
                        x: 30,
                        rotation: 10,
                        scaleX: 1,
                    });
                    layer.add(group);

                    if (selectedData[0].imagedAttached !== '/profiles/NoImageFound.png' && selectedDetailedProfileID === 0) {

                        /*if (pointsLayerRef.current) {
                            pointsLayerRef.current.destroy();
                        }*/

                        let pointsArray = pointsPerProfile[selectedDetailedProfileID].points;

                        for(let i = 0; i < pointsArray.length; i++){
                            if(pointsArray[i].posX !== 0 || pointsArray[i].posY !== 0){
                                let shape = new Konva.Circle({
                                    x: pointsArray[i].posX,
                                    y: pointsArray[i].posY,
                                    fill: 'red',
                                    radius: 5,
                                });
                                group.add(shape);
                            }
                        }

                        /*let posCounter = 0;
                        for (let i = 0; i < 9; i++) {
                            if (positionsArray[posCounter] !== 0 || positionsArray[posCounter + 1] !== 0) {
                                let shape = new Konva.Circle({
                                    x: positionsArray[posCounter],
                                    y: positionsArray[posCounter + 1],
                                    fill: 'red',
                                    radius: 5,
                                });
                                group.add(shape);
                            }
                            posCounter += 2;
                        }*/
                    }
                    pointsLayerRef.current = layer;

                    if (selectedData[0].imagedAttached === '') {
                        if (stageRef.current) {
                            const stage = stageRef.current;
                            stage.destroy();
                        }
                    }
                }, 1);
            }else{
                if (stageRef.current) {
                    let stage = stageRef.current;
                    stage.destroy();
                }
            }
        }else {
            if (stageRef.current) {
                let stage = stageRef.current;
                stage.destroy();
            }
        }
    }, [selectedDetailedProfile, detailedView, monitoringProfilesTableData, replacePlanCheckValue, planCheckboxs]);

    useEffect(() => {
        if(detailedView) {
            let tempData = monitoringProfilesTableData;
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID + 1)

            if(selectedTypeOfProfile === typeOfProfile[1].name && crossSectionCheckboxs[selectedDetailedProfileID].check && crossSectionCheckActive){
                setTimeout(function () {
                    if (stageRefCrossSection.current) {
                        let stage2 = stageRefCrossSection.current;
                        stage2.destroy();
                    }

                    let imgWidth: number = 600;
                    let imgHeight: number = 400;

                    setEmptyPhoto(true)

                    let measureImage = new Image();
                    measureImage.src = selectedData[0].imagedAttached;

                    measureImage.onload = () => {
                        if(measureImage.width < 600){
                            let aspectRatio = measureImage.width/measureImage.height;
                            imgWidth = 600;
                            imgHeight = 600 / aspectRatio;
                            //setImgCrossSectionWidth(600)
                            //setImgCrossSectionHeight(newHeight)
                        }else{
                            imgWidth = measureImage.width;
                            imgHeight = measureImage.height;
                            //setImgCrossSectionWidth(image.width)
                            //setImgCrossSectionHeight(image.height)
                        }
                        //setImgCrossSectionSrc(image.src)
                    }

                    let stage2 = new Konva.Stage({
                        container: 'konvaContainerCrossSection',
                        width: imgWidth,
                        height: imgHeight
                    });
                    stageRefCrossSection.current = stage2;

                    let backgroundLayer2 = new Konva.Layer();
                    stage2.add(backgroundLayer2);

                    let image = new Image();

                    image.onload = function () {
                        let background2 = new Konva.Image({
                            image: image,
                            width: imgWidth,
                            height: imgHeight,
                        });

                        backgroundLayer2.add(background2);
                        let border2 = new Konva.Rect({
                            x: 0,
                            y: 0,
                            width: imgWidth,
                            height: imgHeight,
                            stroke: 'black',
                            strokeWidth: 2,
                        });
                        backgroundLayer2.add(border2);
                        backgroundLayer2.draw();
                    }

                    image.src = measureImage.src;
                    //backgroundImage.src = selectedData[0].imagedAttached;//'/profiles/imagePlan3.png';

                    let layer2 = new Konva.Layer({
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 5,
                    });
                    stage2.add(layer2);

                    let group2 = new Konva.Group({
                        x: 30,
                        rotation: 10,
                        scaleX: 1,
                    });
                    layer2.add(group2);


                    if (selectedData[0].imagedAttached !== '/profiles/NoImageFound.png' && selectedData[0].imagedAttached !== '') {
                        let tempPosArray = auxCrossSectionLinesPerProfile[selectedDetailedProfileID].array//positionsArrayCrossSection;

                        for(let i = 0; i < coordIncs.length; i++){
                            if(tempPosArray[i*4] !== 0 && tempPosArray[i*4+2] !== 0){
                                //linha
                                let shape = new Konva.Line({
                                    points: [tempPosArray[i*4], tempPosArray[i*4+1], tempPosArray[i*4+2], tempPosArray[i*4+3]],
                                    stroke: 'red',
                                    strokeWidth: 5
                                });
                                group2.add(shape);
                            }else if(tempPosArray[i*4] !== 0){
                                //ponto
                                let shape = new Konva.Circle({
                                    x: tempPosArray[i*4],
                                    y: tempPosArray[i*4+1],
                                    fill: 'red',
                                    radius: 5,
                                });
                                group2.add(shape);
                            }else if(tempPosArray[i*4+1] !== 0){
                                //ponto
                                let shape = new Konva.Circle({
                                    x: tempPosArray[i*4+2],
                                    y: tempPosArray[i*4+3],
                                    fill: 'red',
                                    radius: 5,
                                });
                                group2.add(shape);
                            }
                        }
                        /*let posCounter = 0;
                        for (let i = 0; i < 9; i++) {
                            if (positionsArrayCrossSection[posCounter] !== 0 || positionsArrayCrossSection[posCounter + 1] !== 0) {
                                let shape = new Konva.Circle({
                                    x: positionsArrayCrossSection[posCounter],
                                    y: positionsArrayCrossSection[posCounter + 1],
                                    fill: 'red',
                                    radius: 5,
                                });
                                group2.add(shape);
                            }
                            posCounter += 2;
                        }*/
                    }
                    pointsLayerRefCrossSection.current = layer2;

                }, 1);
            }else{
                if (stageRefCrossSection.current) {
                    let stage2 = stageRefCrossSection.current;
                    stage2.destroy();
                }
            }
        }else {
            if (stageRefCrossSection.current) {
                let stage2 = stageRefCrossSection.current;
                stage2.destroy();
            }
        }
    }, [selectedDetailedProfile, detailedView, replaceCrossCheckValue, crossSectionCheckboxs]);



    const [imgCrossSectionSrc, setImgCrossSectionSrc] = useState<string>('');
    const [imgCrossSectionWidth, setImgCrossSectionWidth] = useState<number>(0);
    const [imgCrossSectionHeight, setImgCrossSectionHeight] = useState<number>(0);

    useEffect(() => {
        let tempData = monitoringProfilesTableData;
        if(tempData.length !== 0) {
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID + 1)

            if (selectedData[0].imagedAttached === '/profiles/NoImageFound.png' || selectedData[0].imagedAttached === '') {
                setEmptyPhoto(true)
            }else if(selectedData[0].typeOfProfile === typeOfProfile[1].name){
                setEmptyPhoto(true)

                let image = new Image();
                image.src = selectedData[0].imagedAttached;

                image.onload = () => {

                    if(image.width < 600){
                        let aspectRatio = image.width/image.height;
                        let newHeight = 600 / aspectRatio;
                        setImgCrossSectionWidth(600)
                        setImgCrossSectionHeight(newHeight)
                    }else{
                        setImgCrossSectionWidth(image.width)
                        setImgCrossSectionHeight(image.height)
                    }

                    setImgCrossSectionSrc(image.src)
                }

            }else{
                setEmptyPhoto(true)//setEmptyPhoto(false)
            }
        }
    }, [selectedDetailedProfileID]);

    const handlePickPoint = (rowId: number, rowInc: number) => {
        setActivePickPointRowId(rowId);
        console.log(rowId)
        console.log(MPPCTableData)

        if (stageRef.current && pointsLayerRef.current && !emptyPhoto) {
            let stage = stageRef.current;
            /*let layer = new Konva.Layer({
                scaleX: 1,
                scaleY: 1,
                rotation: 5,
            });
            stage.add(layer);*/
            let layer = pointsLayerRef.current;

            let group = new Konva.Group({
                x: 30,
                rotation: 10,
                scaleX: 1,
            });
            layer.add(group);

            let clicked = false;

            stage.on('click', function () {
                if (!clicked) {
                    let pos = group.getRelativePointerPosition();
                    if (pos !== null) {
                        let shape = new Konva.Circle({
                            x: pos.x,
                            y: pos.y,
                            fill: 'red',
                            radius: 5,
                        });
                        console.log(pos.x + " | " + pos.y)
                        group.add(shape);

                        let tempPosArray = positionsArray;
                        let tempTableData = MPPCTableData;
                        let rowData = MPPCTableData[rowId-1]

                        tempPosArray[rowId*2] = pos.x
                        tempPosArray[rowId*2+1] = pos.y

                        tempTableData[rowId-1] = createDataMPPC(rowId, rowData.groupMP, rowData.inc, true, [pos.x,pos.y]);

                        let foundUniqueId: number = 0;
                        for(let i = 0; i < MPPCTableDataUniqueIds.length; i++){
                            if(MPPCTableDataUniqueIds[i].inc === rowId){
                                foundUniqueId = MPPCTableDataUniqueIds[i].id;
                                console.log(foundUniqueId)
                            }
                        }


                        let tempPPP = pointsPerProfile;
                        let tempPointsPerProfile = tempPPP[selectedDetailedProfileID].points;

                        let exists = false;

                        for(let i = 0; i < tempPointsPerProfile.length; i++){
                            if(tempPointsPerProfile[i].id === foundUniqueId){
                                tempPointsPerProfile[i] = createPoint(foundUniqueId, pos.x, pos.y);
                                exists = true;
                            }
                        }

                        if(!exists){
                            tempPointsPerProfile.push(createPoint(foundUniqueId, pos.x, pos.y))
                        }

                        setPointsPerProfile(tempPPP)

                        dispatch(addPoint(pos.x, pos.y, foundUniqueId, sessionToken))

                        setMPPCTableData(tempTableData);
                        setRowsMPPC(tempTableData)
                        setPositionsArray(tempPosArray);
                        clicked = true;
                        setReplaceValues(true)
                        setActivePickPointRowId(-1)
                    }
                }
            })
        }else if(emptyPhoto){
            setCurrentRowId(rowId)
            setCurrentPoint(rowInc)
            setClickPoint(true);
        }
    }

    const handlePickPointCrossSection = (placedAt: string) => {

        if (stageRefCrossSection.current && pointsLayerRefCrossSection.current && emptyPhoto && crossSectionCheckActive) {
            let stage = stageRefCrossSection.current;

            let layer = pointsLayerRefCrossSection.current;

            let group = new Konva.Group({
                x: 30,
                rotation: 10,
                scaleX: 1,
            });
            layer.add(group);

            /*let shape = new Konva.Line({
                points: [192.1246379510998, 76.9538253966865,231.27566411570146, 226.93114751659465],
                stroke: 'red',
                strokeWidth: 5
            });
            group.add(shape);

            console.log(shape)
            console.log(layer)*/

            let clicked = false;
            stage.on('click', function () {
                if (!clicked) {
                    let pos = group.getRelativePointerPosition();
                    if (pos !== null) {
                        let tempLines = linesPerProfile[selectedDetailedProfileID]
                        //let tempLinesArray = tempLines.lp;

                        let tempPosArray = auxCrossSectionLinesPerProfile[selectedDetailedProfileID].array;//positionsArrayCrossSection;
                        console.log("------------")
                        console.log(tempPosArray)
                        console.log("------------")

                        for(let i = 0; i < coordIncs.length; i++){
                            if(selectedIncTopBottom === coordIncs[i]){
                                if(placedAt === "top"){
                                    if(tempPosArray[i*4+2] !== 0 || tempPosArray[i*4+3] !== 0){
                                        //criar linha
                                        let shape = new Konva.Line({
                                            points: [pos.x, pos.y, tempPosArray[i*4+2], tempPosArray[i*4+3]],
                                            stroke: 'red',
                                            strokeWidth: 5
                                        });
                                        group.add(shape);
                                        setClickTop(false)

                                        let foundUniqueId: number = 0;
                                        for(let i = 0; i < MPPCTableDataUniqueIds.length; i++){
                                            if(MPPCTableDataUniqueIds[i].inc === selectedIncTopBottom){
                                                foundUniqueId = MPPCTableDataUniqueIds[i].id;
                                            }
                                        }

                                        dispatch(addLine(pos.x, pos.y, tempPosArray[i*4+2], tempPosArray[i*4+3], foundUniqueId, sessionToken))
                                    }else{
                                        //criar ponto
                                        let shape = new Konva.Circle({
                                            x: pos.x,
                                            y: pos.y,
                                            fill: 'red',
                                            radius: 5,
                                        });
                                        group.add(shape);

                                        setClickTop(false)
                                    }
                                    tempPosArray[i*4] = pos.x;
                                    tempPosArray[i*4+1] = pos.y;
                                }else{
                                    if(tempPosArray[i*4] !== 0 || tempPosArray[i*4+1] !== 0){
                                        //criar linha
                                        let shape = new Konva.Line({
                                            points: [tempPosArray[i*4], tempPosArray[i*4+1], pos.x, pos.y],
                                            stroke: 'red',
                                            strokeWidth: 5
                                        });
                                        group.add(shape);
                                        setClickBottom(false)
                                        let foundUniqueId: number = 0;
                                        for(let i = 0; i < MPPCTableDataUniqueIds.length; i++){
                                            if(MPPCTableDataUniqueIds[i].inc === selectedIncTopBottom){
                                                foundUniqueId = MPPCTableDataUniqueIds[i].id;
                                            }
                                        }

                                        dispatch(addLine(tempPosArray[i*4], tempPosArray[i*4+1], pos.x, pos.y, foundUniqueId, sessionToken))

                                    }else{
                                        //criar ponto
                                        let shape = new Konva.Circle({
                                            x: pos.x,
                                            y: pos.y,
                                            fill: 'red',
                                            radius: 5,
                                        });
                                        group.add(shape);

                                        setClickBottom(false)
                                    }
                                    tempPosArray[i*4+2] = pos.x;
                                    tempPosArray[i*4+3] = pos.y;
                                }
                            }
                        }
                        /*let tempPosArray = positionsArrayCrossSection;

                        for(let i = 0; i < coordIncs.length; i++){
                            if(selectedIncTopBottom === coordIncs[i]){
                                if(placedAt === "top"){
                                    if(tempPosArray[i*4+2] !== 0 || tempPosArray[i*4+3] !== 0){
                                        //criar linha
                                        let shape = new Konva.Line({
                                            points: [pos.x, pos.y, tempPosArray[i*4+2], tempPosArray[i*4+3]],
                                            stroke: 'red',
                                            strokeWidth: 5
                                        });
                                        group.add(shape);
                                        setClickTop(false)
                                    }else{
                                        //criar ponto
                                        let shape = new Konva.Circle({
                                            x: pos.x,
                                            y: pos.y,
                                            fill: 'red',
                                            radius: 5,
                                        });
                                        group.add(shape);

                                        setClickTop(false)
                                    }
                                    tempPosArray[i*4] = pos.x;
                                    tempPosArray[i*4+1] = pos.y;
                                }else{
                                    if(tempPosArray[i*4] !== 0 || tempPosArray[i*4+1] !== 0){
                                        //criar linha
                                        let shape = new Konva.Line({
                                            points: [tempPosArray[i*4], tempPosArray[i*4+1], pos.x, pos.y],
                                            stroke: 'red',
                                            strokeWidth: 5
                                        });
                                        group.add(shape);

                                        setClickBottom(false)
                                    }else{
                                        //criar ponto
                                        let shape = new Konva.Circle({
                                            x: pos.x,
                                            y: pos.y,
                                            fill: 'red',
                                            radius: 5,
                                        });
                                        group.add(shape);

                                        setClickBottom(false)
                                    }
                                    tempPosArray[i*4+2] = pos.x;
                                    tempPosArray[i*4+3] = pos.y;
                                }
                            }
                        }*/

                        //let tempPointPerProfile = pointsPerProfile;

                        //pointsPerProfile[selectedDetailedProfileID] = createPointPerProfile()
                        //dispatch(addPoint(pos.x, pos.y, foundUniqueId, sessionToken))
                        let tempPosCS = auxCrossSectionLinesPerProfile
                        tempPosCS[selectedDetailedProfileID] = createAuxCrossSectionLinesPerProfile(selectedDetailedProfileID, tempPosArray)
                        //setPositionsArrayCrossSection(tempPosArray);
                        setAuxCrossSectionLinesPerProfile(tempPosCS)
                        console.log("******")
                        console.log(tempPosCS)
                        clicked = true;
                        setReplaceValuesCrossSection(true)
                    }
                }
            })
        }
/*
        if (stageRef.current && pointsLayerRef.current && !emptyPhoto) {
            let stage = stageRef.current;

            let layer = pointsLayerRef.current;

            let group = new Konva.Group({
                x: 30,
                rotation: 10,
                scaleX: 1,
            });
            layer.add(group);

            let clicked = false;

            stage.on('click', function () {
                if (!clicked) {
                    let pos = group.getRelativePointerPosition();
                    if (pos !== null) {
                        let shape = new Konva.Circle({
                            x: pos.x,
                            y: pos.y,
                            fill: 'red',
                            radius: 5,
                        });
                        console.log(pos.x + " | " + pos.y)
                        group.add(shape);

                        let tempPosArray = positionsArray;
                        let tempTableData = MPPCTableData;
                        let rowData = MPPCTableData[rowId]

                        tempPosArray[rowId*2] = pos.x
                        tempPosArray[rowId*2+1] = pos.y

                        tempTableData[rowId] = createDataMPPC(rowId, rowData.groupMP, rowData.inc, true, [pos.x,pos.y]);

                        let tempPointPerProfile = pointsPerProfile;

                        //pointsPerProfile[selectedDetailedProfileID] = createPointPerProfile()

                        setMPPCTableData(tempTableData);
                        setRowsMPPC(tempTableData)
                        setPositionsArray(tempPosArray);
                        clicked = true;
                        setReplaceValues(true)
                        setActivePickPointRowId(-1)
                    }
                }
            })
        }else if(emptyPhoto){
            setCurrentRowId(rowId)
            setCurrentPoint(rowInc)
            setClickPoint(true);
        }*/
    }

    const handleCrossSectionCheckbox = (event: React.ChangeEvent<HTMLInputElement>) =>{
        if(event.target.checked){
            let temp = crossSectionCheckboxs;
            temp[selectedDetailedProfileID].check = false;
            setReplaceCrossCheckValue(true);
            setCrossSectionCheckboxs(temp);

            setCrossSectionCheckActive(true)
        }else{
            let temp = crossSectionCheckboxs;
            temp[selectedDetailedProfileID].check = true;
            setReplaceCrossCheckValue(true);
            setCrossSectionCheckboxs(temp);

            setCrossSectionCheckActive(false)
        }
    }

    const handlePlanCheckbox = (event: React.ChangeEvent<HTMLInputElement>, from: string) =>{
        if(event.target.checked){
            let temp = planCheckboxs;
            temp[selectedDetailedProfileID].check = false;
            setReplacePlanCheckValue(true);
            setPlanCheckboxs(temp)
            setEmptyPhoto(false)

            if(from !== "own"){

            setPlanCheckActive(true)
            setPlanCheckActiveOwn(false)

            for(let i = 0; i < monitoringProfilesTableData.length; i++){
                if(Number(selectFromCodeList) === monitoringProfilesTableData[i].id && from === "other"){
                    setPlanCheckActiveImgSrc(monitoringProfilesTableData[i].imagedAttached)
                }else if(selectedDetailedProfileID === monitoringProfilesTableData[i].id && from === "own"){
                    //setPlanCheckActiveImgSrc(monitoringProfilesTableData[i].imagedAttached)
                    setPlanCheckActiveOwn(true)
                }
            }
            }
        }else{
            let temp = planCheckboxs;
            temp[selectedDetailedProfileID].check = true;
            setReplacePlanCheckValue(true);
            setPlanCheckboxs(temp)
            setEmptyPhoto(true)
            setPlanCheckActive(false)
            setPlanCheckActiveOwn(false)

            if(from === "own"){
                if (stageRef.current) {
                    const stage = stageRef.current;
                    stage.destroy();
                }
            }
        }
    }

    //const [markers, setMarkers] = useState<L.LatLng[]>([]);
    const [markersPerProfile, setMarkersPerProfile] = useState<PointMarkerPerProfile[]>([]);
    const [linesPerProfile, setLinesPerProfile] = useState<LinePointPerProfile[]>([]);
    const [markers, setMarkers] = useState<PointMarker[]>([]);
    const [currentRowId, setCurrentRowId] = useState(0);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [clickPoint, setClickPoint] = useState(false);
    const [lineCoordinatesPerProfile, setLineCoordinatesPerProfile] = useState<LineCoordinatesPerProfile[]>([]);
    const [lineCoordinates, setLineCoordinates] = useState<L.LatLng[]>([]);
    const [manuallyCorrectedLine, setManuallyCorrectedLine] = useState(false);
    //const [selectedBottomLimit, setSelectedBottomLimit] = useState<number>(0);
    const [lineManualCoordinates, setLineManualCoordinates] = useState<L.LatLng[]>([]);
    const [manuallyCorrectedLines, setManuallyCorrectedLines] = useState<CheckCorrectedValues[]>([]);
    const [correctedValuesPerProfile, setCorrectedValuesPerProfile] = useState<CorrectedValuesPerProfile[]>([]);
    const [replaceLinesValues, setReplaceLinesValues] = useState(false);

    /*useEffect(() => {
        console.log(markersPerProfile[selectedDetailedProfileID]);
    }, [selectedDetailedProfileID]);*/

    useEffect(() => {
        for(let i = 0; i < MPPCTableData.length; i++){
            if(!MPPCTableData[i].hasPoint && MPPCTableData[i].pickPoint.length !== 0){
                MPPCTableData[i].hasPoint = true;
                setActivePickPointRowId(-1)
                setRowsMPPC(MPPCTableData)
            }
        }
    }, [rowsMPPC, MPPCTableData, pointsPerProfile, replaceValues, activePickPointRowId]);


    useEffect(() => {
        //if(selectedDetailedProfileID === 0 || selectedDetailedProfileID === 2){
        dispatch(getMarkers(selectedDetailedProfileID+1,sessionToken)).then(markers => {

        if(markers !== undefined){
            if(selectedDetailedProfile === "Barragem do Azibo: All" && selectedDetailedProfileID === 0 || selectedDetailedProfile === "Barragem do Azibo: P5" && selectedDetailedProfileID === 1
            || selectedDetailedProfile === "Barragem do Azibo: P7" && selectedDetailedProfileID === 2 || selectedDetailedProfile === "Barragem do Azibo: P9" && selectedDetailedProfileID === 3
            || selectedDetailedProfile === "Barragem do Azibo: P13" && selectedDetailedProfileID === 4 || selectedDetailedProfile === "Barragem do Azibo: P1" && selectedDetailedProfileID === 5){
                console.log(selectedDetailedProfile + " | " + selectedDetailedProfileID)
                console.log(markers)
                let tempMarkers = [];
                for(let i = 0; i < markers.length; i++){
                    let newLat = markers[i].lat;
                    let newLng = markers[i].lng;
                    if(newLat !== undefined && newLng !== undefined){
                        let point = new L.LatLng(newLat, newLng)
                        tempMarkers.push(createPointMarker(i+1, point))
                    }
                }

                let tempMarkersPerProfile = markersPerProfile;
                tempMarkersPerProfile[selectedDetailedProfileID] = createPointMarkerPerProfile(selectedDetailedProfileID+1, tempMarkers) ;

                setMarkersPerProfile(tempMarkersPerProfile);
                setMarkers(tempMarkers);

            }
        }
        });

        dispatch(getLinesCrossSection(selectedDetailedProfileID+1,sessionToken)).then(lines => {

            if(lines !== undefined){
                if(selectedDetailedProfile === "Barragem do Azibo: All" && selectedDetailedProfileID === 0 || selectedDetailedProfile === "Barragem do Azibo: P5" && selectedDetailedProfileID === 1
                    || selectedDetailedProfile === "Barragem do Azibo: P7" && selectedDetailedProfileID === 2 || selectedDetailedProfile === "Barragem do Azibo: P9" && selectedDetailedProfileID === 3
                    || selectedDetailedProfile === "Barragem do Azibo: P13" && selectedDetailedProfileID === 4 || selectedDetailedProfile === "Barragem do Azibo: P1" && selectedDetailedProfileID === 5){

                    let tempLines = [];

                    for(let i = 0; i < lines.length; i++){
                        let newTopX = lines[i].topX;
                        let newTopY = lines[i].topY;
                        let newBottomX = lines[i].bottomX;
                        let newBottomY = lines[i].bottomY;
                        let newAdjustId = lines[i].profilePositionAdjustmentId;
                        if(newTopX !== undefined && newTopY !== undefined && newBottomX !== undefined && newBottomY !== undefined
                            && newAdjustId !== undefined){
                            tempLines.push(createLinePoint(newAdjustId, newTopX, newTopY, newBottomX, newBottomY))
                        }
                    }

                    let tempLinesPerProfile = linesPerProfile;
                    tempLinesPerProfile[selectedDetailedProfileID] = createLinePointPerProfile(selectedDetailedProfileID+1, tempLines) ;

                    setLinesPerProfile(tempLinesPerProfile);
                }
            }
        });

    }, [dispatch, selectedDetailedProfile]);


    useEffect(() => {
        let temp = crossSectionCheckboxs;
        if(crossSectionCheckboxs.length > 0 && replaceCrossCheckValue){
            if(crossSectionCheckboxs[selectedDetailedProfileID].check){
                temp[selectedDetailedProfileID].check = false;
                setCrossSectionCheckboxs(temp)
            }else{
                temp[selectedDetailedProfileID].check = true;
                setCrossSectionCheckboxs(temp)
            }
            setReplaceCrossCheckValue(false);
        }

    }, [replaceCrossCheckValue, crossSectionCheckboxs, selectedDetailedProfileID]);

    useEffect(() => {
        let temp = planCheckboxs;
        if(planCheckboxs.length > 0  && replacePlanCheckValue){
            if(planCheckboxs[selectedDetailedProfileID].check){
                temp[selectedDetailedProfileID].check = false;
                setPlanCheckboxs(temp)
            }else{
                temp[selectedDetailedProfileID].check = true;
                setPlanCheckboxs(temp)
            }
            setReplacePlanCheckValue(false);
        }

    }, [replacePlanCheckValue, planCheckboxs, selectedDetailedProfileID]);

    useEffect(() => {
        if(manuallyCorrectedLines.length > 0){
            if(manuallyCorrectedLines[selectedDetailedProfileID].check){
                setLineManualCoordinates(correctedValuesPerProfile[selectedDetailedProfileID].lc)
                setReplaceLinesValues(false)
            }
        }
    }, [replaceLinesValues, correctedValuesPerProfile, clickTop, clickBottom, lineManualCoordinates, manuallyCorrectedLines]);

    /*const MapClickTopBottomHandler = () => {
        useMapEvents({
            click: (event) => {
                if(!manuallyCorrectedLine){
                    setManuallyCorrectedLine(true);
                }
                if(!manuallyCorrectedLines[selectedDetailedProfileID].check){
                    let tempManual = manuallyCorrectedLines
                    tempManual[selectedDetailedProfileID].check = true;
                    setManuallyCorrectedLines(tempManual);
                }

                let newPointPos = event.latlng
                let tempLineCoord = lineManualCoordinates;

                if(lineManualCoordinates.length === 0) {
                    let initialTop: LatLng = new LatLng(0, 0);
                    let initialBottom: LatLng = new LatLng(0, 0);
                    let markersPP = markersPerProfile[selectedDetailedProfileID].pm;

                    for(let i = 0; i < markersPP.length; i++){
                        if(selectedTopLimit === markersPP[i].id){
                            initialTop = markersPP[i].latLng;
                        }
                        if(selectedBottomLimit === markersPP[i].id){
                            initialBottom = markersPP[i].latLng;
                        }
                    }

                    tempLineCoord.push(initialTop);
                    tempLineCoord.push(initialBottom);
                }

                if(clickTop){
                    tempLineCoord[0] = newPointPos;
                }else{
                    tempLineCoord[1] = newPointPos;
                }
                console.log(newPointPos)
                console.log(tempLineCoord)

                setLineManualCoordinates(tempLineCoord);
                let tempCorrected = correctedValuesPerProfile;
                tempCorrected[selectedDetailedProfileID].lc = tempLineCoord;
                setCorrectedValuesPerProfile(tempCorrected);
                //setManuallyCorrectedValues(true);
                if(clickTop)
                    setClickTop(false);
                if(clickBottom)
                    setClickBottom(false);

                setReplaceLinesValues(true);
            }
        });

        return null;
    };*/



    useEffect(() => {
        let coordinates = markers.map(marker => marker.latLng);
        setLineCoordinates(coordinates);
        let tempCoord = lineCoordinatesPerProfile;
        if(lineCoordinatesPerProfile.length > 0){
            tempCoord[selectedDetailedProfileID].lc = coordinates;
            setLineCoordinatesPerProfile(tempCoord)
        }
    }, [markers]);

    const MapClickHandler = () => {
        useMapEvents({
            click: (event) => {
                let newPointMarker = createPointMarker(currentPoint, event.latlng)

                let alreadyExists = false;
                let tempMarkers = markers
                if(tempMarkers.length !== 0){
                    tempMarkers.map((m, index) =>{
                        if(m.id === currentPoint){
                            tempMarkers[index] = newPointMarker;
                            alreadyExists = true;
                        }
                    })
                }

                if(alreadyExists){
                    setMarkers(tempMarkers)
                }else{
                    tempMarkers.push(newPointMarker);
                    tempMarkers.sort((a, b) => a.id - b.id);
                    setMarkers(tempMarkers);
                }

                let coordinates = tempMarkers.map(marker => marker.latLng);
                setLineCoordinates(coordinates);

                let tempMPPC = MPPCTableData;
                let oldMPPC = tempMPPC[currentRowId];

                tempMPPC[currentRowId] = createDataMPPC(currentRowId, oldMPPC.groupMP, oldMPPC.inc, true, [event.latlng.lat, event.latlng.lng]);
                setMPPCTableData(tempMPPC);
                setRowsMPPC(tempMPPC);

                let tempMarks = markersPerProfile;
                let tempMarkersArray = markersPerProfile[selectedDetailedProfileID].pm;
                tempMarkersArray.push(newPointMarker);
                tempMarkersArray.sort((a, b) => a.id - b.id);

                markersPerProfile[selectedDetailedProfileID] = createPointMarkerPerProfile(currentRowId, tempMarkersArray)
                lineCoordinatesPerProfile[selectedDetailedProfileID] = createLineCoordinatesPerProfile(currentRowId, coordinates)
                setMarkersPerProfile(tempMarks)

                setReplaceValues(true)
                setClickPoint(false);
                setCurrentPoint(0);
                setActivePickPointRowId(-1);
            }
        });

        return null;
    };

    const handleBackButton = () => {
        setDetailedView(false);
    }

    const handleClickProfile = (rowID: number) => {
        setDetailedView(true);
        let group = rowsMP[rowID-1].group;
        let name = rowsMP[rowID-1].name;
        let typeOfProfile = rowsMP[rowID-1].typeOfProfile;
        let image;
        if(rowsMP[rowID-1].imagedAttached !== '' && rowsMP[rowID-1].imagedAttached !== '/profiles/NoImageFound.png'){
            image = rowsMP[rowID-1].imagedAttached.split("profiles%2F")[1].split("?")[0]
        }else{
            image = ''
        }

        setSelectedDetailedProfile(group.concat(": ",name));
        setSelectedDetailedProfileAttachedImageName(image)
        setSelectedDetailedProfileID(rowID-1);
        setSelectedTypeOfProfile(typeOfProfile)

        handleGetAllMPCodes();
    }

    const handlePrevious = () => {
        if(rowsMP.length <= 1){
            setWarningNoMoreProfiles(true);
            setTimeout(() => {
                setWarningNoMoreProfiles(false);
            }, 5000);
        }else if(selectedDetailedProfileID - 1 >= 0){
            let group = rowsMP[selectedDetailedProfileID-1].group;
            let name = rowsMP[selectedDetailedProfileID-1].name;
            let typeOfProfile = rowsMP[selectedDetailedProfileID-1].typeOfProfile;
            let image;
            if(rowsMP[selectedDetailedProfileID-1].imagedAttached !== '' && rowsMP[selectedDetailedProfileID-1].imagedAttached !== '/profiles/NoImageFound.png'){
                image = rowsMP[selectedDetailedProfileID-1].imagedAttached.split("profiles%2F")[1].split("?")[0]
            }else{
                image = ''
            }
            setSelectedDetailedProfile(group.concat(": ",name));
            setSelectedDetailedProfileAttachedImageName(image)
            setSelectedDetailedProfileID(selectedDetailedProfileID-1);
            setSelectedTypeOfProfile(typeOfProfile);
        }else if(selectedDetailedProfileID - 1 < 0){
            let group = rowsMP[rowsMP.length-1].group;
            let name = rowsMP[rowsMP.length-1].name;
            let typeOfProfile = rowsMP[rowsMP.length-1].typeOfProfile;
            let image;
            if(rowsMP[rowsMP.length-1].imagedAttached !== '' && rowsMP[rowsMP.length-1].imagedAttached !== '/profiles/NoImageFound.png'){
                image = rowsMP[rowsMP.length-1].imagedAttached.split("profiles%2F")[1].split("?")[0]
            }else{
                image = ''
            }
            setSelectedDetailedProfile(group.concat(": ",name));
            setSelectedDetailedProfileAttachedImageName(image)
            setSelectedDetailedProfileID(rowsMP.length-1);
            setSelectedTypeOfProfile(typeOfProfile);
        }
    }

    const handleNext = () => {
        if(rowsMP.length <= 1){
            setWarningNoMoreProfiles(true);
            setTimeout(() => {
                setWarningNoMoreProfiles(false);
            }, 5000);
        }else if(selectedDetailedProfileID + 1 < rowsMP.length){
            let group = rowsMP[selectedDetailedProfileID+1].group;
            let name = rowsMP[selectedDetailedProfileID+1].name;
            let typeOfProfile = rowsMP[selectedDetailedProfileID+1].typeOfProfile;
            let image;
            if(rowsMP[selectedDetailedProfileID+1].imagedAttached !== '' && rowsMP[selectedDetailedProfileID+1].imagedAttached !== '/profiles/NoImageFound.png'){
                image = rowsMP[selectedDetailedProfileID+1].imagedAttached.split("profiles%2F")[1].split("?")[0]
            }else{
                image = ''
            }
            setSelectedDetailedProfile(group.concat(": ",name));
            setSelectedDetailedProfileAttachedImageName(image)
            setSelectedDetailedProfileID(selectedDetailedProfileID+1);
            setSelectedTypeOfProfile(typeOfProfile);
        }else if(selectedDetailedProfileID + 1 >= rowsMP.length){
            let group = rowsMP[0].group;
            let name = rowsMP[0].name;
            let typeOfProfile = rowsMP[0].typeOfProfile;
            let image;
            if(rowsMP[0].imagedAttached !== '' && rowsMP[0].imagedAttached !== '/profiles/NoImageFound.png'){
                image = rowsMP[0].imagedAttached.split("profiles%2F")[1].split("?")[0]
            }else{
                image = ''
            }
            setSelectedDetailedProfile(group.concat(": ",name));
            setSelectedDetailedProfileAttachedImageName(image)
            setSelectedDetailedProfileID(0);
            setSelectedTypeOfProfile(typeOfProfile);
        }
    }


    const handleRequestSortMPPC = (
        event: React.MouseEvent<unknown>,
        property: keyof MPPC,
    ) => {
        const isAsc = orderByMPPC === property && orderMPPC === 'asc';
        setOrderMPPC(isAsc ? 'desc' : 'asc');
        setOrderByMPPC(property);
    };

    const handleSelectAllClickMPPC = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rowsMPPC.map((n) => n.id);
            setSelectedMPPC(newSelected);
            return;
        }
        setSelectedMPPC([]);
    };

    const handleClickMPPC = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelectedMPPC(newSelected);
    };

    const handleChangePageMPPC = (event: unknown, newPage: number) => {
        setPageMPPC(newPage);
    };

    const handleChangeRowsPerPageMPPC = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageMPPC(parseInt(event.target.value, 10));
        setPageMPPC(0);
    };

    const handleChangeDenseMPPC = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDenseMPPC(event.target.checked);
    };

    const isSelectedMPPC = (id: number) => selectedMPPC.indexOf(id) !== -1;

    const emptyRowsMPPC =
        pageMPPC > 0 ? Math.max(0, (1 + pageMPPC) * rowsPerPageMPPC - rowsMPPC.length) : 0;

    const visibleRowsMPPC = React.useMemo(
        () => rowsMPPC.slice().sort(getComparator(orderMPPC, orderByMPPC)).slice(
            pageMPPC * rowsPerPageMPPC,
            pageMPPC * rowsPerPageMPPC + rowsPerPageMPPC),
        [MPPCTableData,replaceValues,rowsMPPC, orderMPPC, orderByMPPC, pageMPPC, rowsPerPageMPPC],
    );


    return (
        <div
            className="main-wrapper full-screen">
            {alertSuccessVisible && (
                <Slide
                    direction="left"
                    in={alertSuccessVisible}
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
                            The
                            monitoring
                            profile
                            was
                            successfully
                            added.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertSuccessEditVisible && (
                <Slide
                    direction="left"
                    in={alertSuccessEditVisible}
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
                            The
                            monitoring
                            profile
                            was
                            successfully
                            updated.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertFailedVisible && (
                <Slide
                    direction="left"
                    in={alertFailedVisible}
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
            {alertFailedSelectVisible && (
                <Slide
                    direction="left"
                    in={alertFailedSelectVisible}
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
                            Choose
                            the
                            desired
                            monitoring
                            profile
                            in
                            order
                            to
                            edit
                            the
                            fields.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertNothingSelected && (
                <Slide
                    direction="left"
                    in={alertNothingSelected}
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
                            No
                            selection
                            detected.
                            Please
                            select
                            the
                            groups
                            first
                            in
                            order
                            to
                            set
                            the
                            monitoring
                            profiles.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertWrongFileType && (
                <Slide
                    direction="left"
                    in={alertWrongFileType}
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
                            The system does not support the type of file that you tried to upload. Please check if the file type is one of the supported types: .png | .svg | .jpg | .jpeg
                        </Alert>
                    </Box>
                </Slide>
            )}
            {warningNoMoreProfiles && (
                <Slide
                    direction="left"
                    in={warningNoMoreProfiles}
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
                            severity="warning"
                            sx={{alignItems: 'center'}}>
                            <AlertTitle
                                sx={{textAlign: 'left'}}>Warning</AlertTitle>
                            There is only one monitoring profile selected.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {!detailedView ? (
            <>
                <div
                    className="new-button">
                    <div
                        className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                        <button
                            type="button"
                            className="py-2 px-4  bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                            onClick={handleOpenNew}>
                            New
                        </button>
                    </div>
                    <Modal
                        open={openNew}
                        onClose={handleCloseNew}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <Box
                            sx={{
                                position: 'absolute' as 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 400,
                                bgcolor: 'background.paper',
                                border: '2px solid #000',
                                boxShadow: 24,
                                p: 4,
                                borderRadius: 2,
                                '& .close-button': {
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                },
                            }}>
                            <IconButton
                                className="close-button"
                                aria-label="close"
                                onClick={handleCloseNew}>
                                <Clear/>
                            </IconButton>
                            <div
                                className='pt-1 pl-10 pb-5'>
                                <Listbox>
                                    <Listbox.Label
                                        className="pr-1 text-2xl font-medium leading-6 text-gray-900 text-left">Add
                                        monitoring
                                        profile</Listbox.Label>
                                </Listbox>
                            </div>
                            {!missingFieldGroupName ? (
                                <>
                                    <TextField
                                        required
                                        id="outlined-required"
                                        label="Group Name"
                                        onChange={(e) => handleGroupName(e.target.value)}
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 300
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextField
                                        error
                                        id="outlined-error-text"
                                        label="Group Name *"
                                        sx={{
                                            mt: 2,
                                            ml: 2,
                                            width: 300
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            color: 'red',
                                            mt: 1,
                                            ml: 2
                                        }}>
                                        Missing
                                        group
                                        name.
                                    </Box>
                                </>
                            )}
                            {!missingFieldMeasurements ? (
                                <>
                                    <FormControl
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 300
                                        }}>
                                        <InputLabel
                                            id="multiple-chip-label">Measurements
                                            *</InputLabel>
                                        <Select
                                            labelId="multiple-chip-label"
                                            id="multiple-chip"
                                            multiple
                                            value={selectedMeasurements}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="Measurements *"/>}
                                            renderValue={(selected) => (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5
                                                    }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={value}/>
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {testMeasurements.map((m) => (
                                                <MenuItem
                                                    key={m}
                                                    value={m}
                                                    style={getStyles(m, selectedMeasurements, theme)}
                                                >
                                                    {m}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            ) : (
                                <>
                                    <FormControl
                                        error
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 300
                                        }}>
                                        <InputLabel
                                            id="multiple-chip-label">Measurements
                                            *</InputLabel>
                                        <Select
                                            labelId="multiple-chip-label"
                                            id="multiple-chip"
                                            multiple
                                            value={selectedMeasurements}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="Measurements *"/>}
                                            renderValue={(selected) => (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5
                                                    }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={value}/>
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {testMeasurements.map((m) => (
                                                <MenuItem
                                                    key={m}
                                                    value={m}
                                                    style={getStyles(m, selectedMeasurements, theme)}
                                                >
                                                    {m}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Box
                                            sx={{
                                                color: 'red',
                                                mt: 1
                                            }}>
                                            Missing
                                            measurement(s).
                                        </Box>
                                    </FormControl>
                                </>
                            )}
                            <TextField
                                disabled
                                id="outlined-disabled"
                                label={selectedInclinometers === 0 ? 'Inclinometers' : selectedInclinometers.toString()}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    ml: 2,
                                    width: selectedInclinometers === 0 ? 130 : ((selectedInclinometers < 100) ? 50 : 60)
                                }}
                            />
                            {errorMessage && (
                                <Box
                                    sx={{
                                        color: 'red',
                                        mt: 2,
                                        ml: 2
                                    }}>
                                    {errorMessage}
                                </Box>
                            )}
                            <div
                                className="submit-button">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </Box>
                    </Modal>
                    <div
                        className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                        <button
                            type="button"
                            className="py-2 px-4  bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                            onClick={handleOpenEdit}>
                            Edit
                            existing
                            profile
                            group
                        </button>
                    </div>
                    <Modal
                        open={openEdit}
                        onClose={handleCloseEdit}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <Box
                            sx={{
                                position: 'absolute' as 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 460,
                                bgcolor: 'background.paper',
                                border: '2px solid #000',
                                boxShadow: 24,
                                p: 4,
                                borderRadius: 2,
                                '& .close-button': {
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                },
                            }}>
                            <IconButton
                                className="close-button"
                                aria-label="close"
                                onClick={handleCloseEdit}>
                                <Clear/>
                            </IconButton>
                            <div
                                className='pt-1 pl-7 '>
                                <Listbox>
                                    <Listbox.Label
                                        className="pr-1 text-2xl font-medium leading-6 text-gray-900 text-left">Edit
                                        a
                                        monitoring
                                        profile
                                        group</Listbox.Label>
                                </Listbox>
                            </div>
                            <div
                                className='pl-4 pr-4 pb-5 pt-5'>
                                <Box
                                    sx={{mb: 2}}>
                                    Select
                                    a
                                    monitoring
                                    profile
                                    group:
                                </Box>
                                <FormControl
                                    fullWidth>
                                    <InputLabel
                                        id="simple-select-label">Group</InputLabel>
                                    <Select
                                        labelId="simple-select-label"
                                        id="simple-select"
                                        value={selectedMPEdit.group}
                                        label="Group"
                                        onChange={(e) => handleSelectedMPEdit(e.target.value)}
                                    >
                                        {monitoringProfiles.map((m) => (
                                            <MenuItem
                                                key={m.id}
                                                value={m.group}>{m.group}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            {!missingFieldGroupName ? (
                                <>
                                    <TextField
                                        key={selectedGroupEdit}
                                        required
                                        id="outlined-required"
                                        label="Group Name"
                                        defaultValue={selectedGroupEdit}
                                        onChange={(e) => handleGroupNameEdit(e.target.value)}
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 360
                                        }}
                                        InputProps={{
                                            disabled: selectedMPEdit.group === '',
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextField
                                        error
                                        id="outlined-error-text"
                                        label="Group Name *"
                                        key={selectedGroupEdit}
                                        defaultValue={selectedGroupEdit}
                                        onChange={(e) => handleGroupNameEdit(e.target.value)}
                                        sx={{
                                            mt: 2,
                                            ml: 2,
                                            width: 360
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            color: 'red',
                                            mt: 1,
                                            ml: 2
                                        }}>
                                        Missing
                                        group
                                        name.
                                    </Box>
                                </>
                            )}
                            {!missingFieldMeasurements ? (
                                <>
                                    <FormControl
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 360
                                        }}>
                                        <InputLabel
                                            id="multiple-chip-label">Measurements
                                            *</InputLabel>
                                        <Select
                                            labelId="multiple-chip-label"
                                            id="multiple-chip"
                                            multiple
                                            key={selectedMPEdit.group}
                                            defaultValue={selectedMeasurementsEdit}
                                            onChange={handleChangeEdit}
                                            input={
                                                <OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="Measurements *"/>}
                                            renderValue={(selected) => (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5
                                                    }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={value}/>
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                            inputProps={{
                                                disabled: selectedMPEdit.group === '',
                                            }}
                                        >
                                            {testMeasurements.map((m) => (
                                                <MenuItem
                                                    key={m}
                                                    value={m}
                                                    style={getStyles(m, selectedMeasurementsEdit, theme)}
                                                >
                                                    {m}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            ) : (
                                <>
                                    <FormControl
                                        error
                                        sx={{
                                            mt: 2,
                                            mb: 2,
                                            ml: 2,
                                            width: 360
                                        }}>
                                        <InputLabel
                                            id="multiple-chip-label">Measurements
                                            *</InputLabel>
                                        <Select
                                            labelId="multiple-chip-label"
                                            id="multiple-chip"
                                            multiple
                                            key={selectedMeasurementsEdit.length !== 0 ? selectedMeasurementsEdit[selectedMeasurementsEdit.length] : "id"}
                                            defaultValue={selectedMeasurementsEdit}
                                            onChange={handleChangeEdit}
                                            input={
                                                <OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="Measurements *"/>}
                                            renderValue={(selected) => (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5
                                                    }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={value}/>
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {testMeasurements.map((m) => (
                                                <MenuItem
                                                    key={m}
                                                    value={m}
                                                    style={getStyles(m, selectedMeasurementsEdit, theme)}
                                                >
                                                    {m}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Box
                                            sx={{
                                                color: 'red',
                                                mt: 1
                                            }}>
                                            Missing
                                            measurement(s).
                                        </Box>
                                    </FormControl>
                                </>
                            )}
                            <TextField
                                disabled
                                id="outlined-disabled"
                                label={selectedInclinometersEdit === 0 ? 'Inclinometers' : selectedInclinometersEdit.toString()}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    ml: 2,
                                    width: selectedInclinometersEdit === 0 ? 130 : ((selectedInclinometersEdit < 100) ? 50 : 60)
                                }}
                            />
                            {errorMessage && (
                                <Box
                                    sx={{
                                        color: 'red',
                                        mt: 2,
                                        ml: 2
                                    }}>
                                    {errorMessage}
                                </Box>
                            )}
                            <div
                                className="submit-button">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleSubmitEdit}
                                >
                                    Submit
                                    changes
                                </button>
                            </div>
                        </Box>
                    </Modal>
                </div>
                <div
                    className="filter-container-monitProfile">
                    <Box
                        sx={{width: '100%'}}>
                        <Paper
                            sx={{
                                width: '100%',
                                mb: 2
                            }}>
                            <EnhancedTableToolbar
                                numSelected={selected.length}
                                onDelete={handleDelete}
                            />
                            <TableContainer>
                                <Table
                                    sx={{minWidth: 750}}
                                    aria-labelledby="tableTitle"
                                    size={dense ? 'small' : 'medium'}
                                >
                                    <EnhancedTableHead
                                        numSelected={selected.length}
                                        order={order}
                                        orderBy={orderBy}
                                        onSelectAllClick={handleSelectAllClick}
                                        onRequestSort={handleRequestSort}
                                        rowCount={rows.length}
                                    />
                                    <TableBody>
                                        {visibleRows.map((row, index) => {
                                            const isItemSelected = isSelected(row.id);
                                            if (isItemSelected && !checkedGroups.includes(row.id)) {
                                                let tempCheck = checkedGroups;
                                                tempCheck.push(row.id);
                                                setCheckedGroups(tempCheck);
                                            } else if (!isItemSelected && checkedGroups.includes(row.id)) {
                                                let tempCheck = checkedGroups;
                                                tempCheck = tempCheck.filter(toRemove => toRemove !== row.id);
                                                setCheckedGroups(tempCheck);
                                            }

                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <TableRow
                                                    hover
                                                    onClick={(event) => handleClick(event, row.id)}
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    key={row.id}
                                                    selected={isItemSelected}
                                                    sx={{cursor: 'pointer'}}
                                                >
                                                    <TableCell
                                                        padding="checkbox">
                                                        <Checkbox
                                                            color="primary"
                                                            checked={isItemSelected}
                                                            inputProps={{
                                                                'aria-labelledby': labelId,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        align="left">{row.group}</TableCell>
                                                    <TableCell
                                                        align="center">{row.measurements}</TableCell>
                                                    <TableCell
                                                        align="center">{row.inclinometers}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {emptyRows > 0 && (
                                            <TableRow
                                                style={{
                                                    height: (dense ? 33 : 53) * emptyRows,
                                                }}
                                            >
                                                <TableCell
                                                    colSpan={6}/>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                    </Box>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: groupSelected ? 'center' : 'flex-end',
                            gap: '60px',
                            paddingTop: '15px'
                        }}>
                        {groupSelected && (
                            <>
                                <div>
                                    <button
                                        type="button"
                                        className="py-3 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                        onClick={handleOpenNewProfile}
                                    >
                                        New
                                        profile
                                    </button>
                                    <Modal
                                        open={openNewProfile}
                                        onClose={handleCloseNewProfile}
                                        aria-labelledby="modal-title"
                                        aria-describedby="modal-description"
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute' as 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 800,
                                                bgcolor: 'background.paper',
                                                border: '2px solid #000',
                                                boxShadow: 24,
                                                p: 4,
                                                borderRadius: 2,
                                                '& .close-button': {
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                },
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                            <IconButton
                                                className="close-button"
                                                aria-label="close"
                                                onClick={handleCloseNewProfile}>
                                                <Clear/>
                                            </IconButton>
                                            <div
                                                className="top-section"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    paddingBottom: '15px'
                                                }}>
                                                <Listbox>
                                                    <Listbox.Label
                                                        className="text-2xl font-medium leading-6 text-gray-900">
                                                        Add
                                                        profile
                                                    </Listbox.Label>
                                                </Listbox>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    width: '100%',
                                                    justifyContent: 'space-between',
                                                    gap: 2
                                                }}>
                                                <div
                                                    className="left-side"
                                                    style={{flex: 1}}>
                                                    <FormControl
                                                        sx={{
                                                            mt: 2,
                                                            mb: 2,
                                                            ml: 2,
                                                            width: 300
                                                        }}>
                                                        <InputLabel
                                                            id="simple-select-label">Group
                                                            *</InputLabel>
                                                        <Select
                                                            labelId="simple-select-label"
                                                            id="simple-select"
                                                            value={selectedGroupProfileNew}
                                                            label="Group * "
                                                            onChange={(e) => handleSelectedGroupProfileNew(e.target.value)}
                                                        >
                                                            {monitoringProfiles.map((m) => (
                                                                <MenuItem
                                                                    key={m.id}
                                                                    value={m.group}>{m.group}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    {!missingFieldProfileNameNew ? (
                                                        <>
                                                            <TextField
                                                                required
                                                                id="outlined-required"
                                                                label="Name"
                                                                onChange={(e) => handleNameProfileNew(e.target.value)}
                                                                sx={{
                                                                    mt: 2,
                                                                    mb: 2,
                                                                    ml: 2,
                                                                    width: 300
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextField
                                                                error
                                                                id="outlined-error-text"
                                                                label="Name *"
                                                                sx={{
                                                                    mt: 2,
                                                                    ml: 2,
                                                                    width: 300
                                                                }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    color: 'red',
                                                                    mt: 1,
                                                                    ml: 2
                                                                }}>
                                                                Missing
                                                                profile
                                                                name.
                                                            </Box>
                                                        </>
                                                    )}
                                                    {!missingFieldProfileDescriptionNew ? (
                                                        <>
                                                            <TextField
                                                                required
                                                                id="outlined-required"
                                                                label="Description"
                                                                onChange={(e) => handleDescriptionProfileNew(e.target.value)}
                                                                sx={{
                                                                    mt: 2,
                                                                    mb: 2,
                                                                    ml: 2,
                                                                    width: 300
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextField
                                                                error
                                                                id="outlined-error-text"
                                                                label="Description *"
                                                                sx={{
                                                                    mt: 2,
                                                                    ml: 2,
                                                                    width: 300
                                                                }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    color: 'red',
                                                                    mt: 1,
                                                                    ml: 2
                                                                }}>
                                                                Missing
                                                                profile
                                                                description.
                                                            </Box>
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    className="right-side"
                                                    style={{flex: 1}}>
                                                    <FormControl
                                                        sx={{
                                                            mt: 2,
                                                            mb: 2,
                                                            ml: 4,
                                                            width: 300
                                                        }}>
                                                        <InputLabel
                                                            id="simple-select-label">Type
                                                            Of
                                                            Profile
                                                            *</InputLabel>
                                                        <Select
                                                            labelId="simple-select-label"
                                                            id="simple-select"
                                                            value={selectedTypeOfProfileNew}
                                                            label="Type of Profile * "
                                                            onChange={(e) => handleSelectedTypeOfProfileNew(e.target.value)}
                                                        >
                                                            {typeOfProfile.map((m) => (
                                                                <MenuItem
                                                                    key={m.id}
                                                                    value={m.name}>{m.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    {!missingSelectedInclinometers ? (
                                                        <>
                                                            <FormControl
                                                                sx={{
                                                                    mt: 2,
                                                                    mb: 2,
                                                                    ml: 4,
                                                                    width: 300
                                                                }}>
                                                                <InputLabel
                                                                    id="multiple-chip-label">Inclinometers
                                                                    *</InputLabel>
                                                                <Select
                                                                    labelId="multiple-chip-label"
                                                                    id="multiple-chip"
                                                                    multiple
                                                                    key={selectedInclinometersNew.length !== 0 ? selectedInclinometersNew[selectedInclinometersNew.length] : "id"}
                                                                    defaultValue={selectedInclinometersNew}
                                                                    onChange={handleChangeSelectedIncNew}
                                                                    input={
                                                                        <OutlinedInput
                                                                            id="select-multiple-chip"
                                                                            label="Inclinometers *"/>}
                                                                    renderValue={(selected) => (
                                                                        <Box
                                                                            sx={{
                                                                                display: 'flex',
                                                                                flexWrap: 'wrap',
                                                                                gap: 0.5
                                                                            }}>
                                                                            {selected.map((value) => (
                                                                                <Chip
                                                                                    key={value}
                                                                                    label={value}/>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                    MenuProps={MenuProps}
                                                                    inputProps={{
                                                                        disabled: selectedGroupProfileNew === '',
                                                                    }}
                                                                >
                                                                    {availableInclinometersNew.map((m) => (
                                                                        <MenuItem
                                                                            key={m}
                                                                            value={m}
                                                                            style={getStyles(m, selectedInclinometersNew, theme)}
                                                                        >
                                                                            {m}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FormControl
                                                                error
                                                                sx={{
                                                                    mt: 2,
                                                                    mb: 2,
                                                                    ml: 4,
                                                                    width: 300
                                                                }}>
                                                                <InputLabel
                                                                    id="multiple-chip-label">Inclinometers
                                                                    *</InputLabel>
                                                                <Select
                                                                    labelId="multiple-chip-label"
                                                                    id="multiple-chip"
                                                                    multiple
                                                                    key={selectedInclinometersNew.length !== 0 ? selectedInclinometersNew[selectedInclinometersNew.length] : "id"}
                                                                    defaultValue={selectedInclinometersNew}
                                                                    onChange={handleChangeSelectedIncNew}
                                                                    input={
                                                                        <OutlinedInput
                                                                            id="select-multiple-chip"
                                                                            label="Measurements *"/>}
                                                                    renderValue={(selected) => (
                                                                        <Box
                                                                            sx={{
                                                                                display: 'flex',
                                                                                flexWrap: 'wrap',
                                                                                gap: 0.5
                                                                            }}>
                                                                            {selected.map((value) => (
                                                                                <Chip
                                                                                    key={value}
                                                                                    label={value}/>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                    MenuProps={MenuProps}
                                                                >
                                                                    {availableInclinometersNew.map((m) => (
                                                                        <MenuItem
                                                                            key={m}
                                                                            value={m}
                                                                            style={getStyles(m, selectedInclinometersNew, theme)}
                                                                        >
                                                                            {m}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                                <Box
                                                                    sx={{
                                                                        color: 'red',
                                                                        mt: 1
                                                                    }}>
                                                                    Missing
                                                                    inclinometer(s).
                                                                </Box>
                                                            </FormControl>
                                                        </>
                                                    )}
                                                    <Button
                                                        component="label"
                                                        role={undefined}
                                                        variant="contained"
                                                        tabIndex={-1}
                                                        startIcon={
                                                            <CloudUpload/>}
                                                        sx={{
                                                            backgroundColor: '#10b981',
                                                            '&:hover': {
                                                                backgroundColor: '#047857',
                                                            },
                                                            mt: 3,
                                                            mb: 2,
                                                            ml: 10,
                                                            width: 200
                                                        }}
                                                    >
                                                        Upload
                                                        image
                                                        <VisuallyHiddenInput
                                                            type="file"
                                                            id={`fileInput-${fileInputRefs.length}`}
                                                            onChange={(e) => handleFileChange(e, fileInputRefs.length)}
                                                            ref={(e) => (fileInputRefs[fileInputRefs.length] = e as HTMLInputElement)}//fileInputRef}
                                                        />
                                                    </Button>
                                                    {errorMessage && (
                                                        <Box
                                                            sx={{
                                                                color: 'red',
                                                                mt: 2,
                                                                ml: 2
                                                            }}>
                                                            {errorMessage}
                                                        </Box>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className="submit-button-profile"
                                                style={{width: '60%'}}>
                                                <button
                                                    type="button"
                                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                                    onClick={handleSubmitProfile}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </Box>
                                    </Modal>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        className="py-3 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                        onClick={handleEditProfilePopUp}
                                    >
                                        Edit
                                        profile
                                    </button>
                                </div>
                            </>
                        )}
                        <div
                            style={{
                                paddingLeft: groupSelected ? '25%' : '0%'
                        }}>
                            <button
                                type="button"
                                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                onClick={handleSubmitGroups}
                            >
                                Define
                                selected
                                groups
                            </button>
                        </div>
                    </div>
                </div>
                {groupSelected && (

                    <div
                        className="filter-container-monitProfile">
                        <Box
                            sx={{width: '100%'}}>
                            <Paper
                                sx={{
                                    width: '100%',
                                    mb: 2
                                }}>
                                <EnhancedTableToolbarMP
                                    numSelected={selectedMP.length}/>
                                <TableContainer>
                                    <Table
                                        sx={{minWidth: 750}}
                                        aria-labelledby="tableTitle2"
                                        size={denseMP ? 'small' : 'medium'}
                                    >
                                        <EnhancedTableHeadMP
                                            //numSelected={selectedMP.length}
                                            order={orderMP}
                                            orderBy={orderByMP}
                                            //onSelectAllClick={handleSelectAllClickMP}
                                            onRequestSort={handleRequestSortMP}
                                            rowCount={rowsMP.length}
                                        />
                                        <TableBody>
                                            {visibleRowsMP.map((row, index) => {
                                                const isItemSelectedMP = isSelected(row.id);
                                                const labelIdMP = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        //onClick={(event) => handleClickMP(event, row.id)}
                                                        role="checkbox"
                                                        //aria-checked={isItemSelectedMP}
                                                        tabIndex={-1}
                                                        key={row.id}
                                                        //selected={isItemSelectedMP}
                                                        sx={{cursor: 'pointer'}}
                                                    >
                                                        <TableCell
                                                            onClick={() => handleClickProfile(row.id)}
                                                            align="left">{row.id}</TableCell>
                                                        <TableCell
                                                            onClick={() => handleClickProfile(row.id)}
                                                            align="center">{row.group}</TableCell>
                                                        <TableCell
                                                            onClick={() => handleClickProfile(row.id)}
                                                            align="center">{row.name}</TableCell>
                                                        <TableCell
                                                            onClick={() => handleClickProfile(row.id)}
                                                            align="center">{row.description}</TableCell>
                                                        <TableCell
                                                            align="center">{row.typeOfProfile}</TableCell>
                                                        <TableCell
                                                            align="center">
                                                            <IconButton
                                                                className="hasImage-button"
                                                                aria-label="close">
                                                                {row.hasImage ?
                                                                    <CheckBoxRounded/> :
                                                                    <CheckBoxOutlineBlankRounded/>}
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell
                                                            align="center">
                                                            <Button
                                                                component="label"
                                                                role={undefined}
                                                                variant="contained"
                                                                tabIndex={-1}
                                                                startIcon={
                                                                    <CloudUpload/>}
                                                                sx={{
                                                                    backgroundColor: '#10b981',
                                                                    '&:hover': {
                                                                        backgroundColor: '#047857',
                                                                    },
                                                                }}
                                                                key={row.id}
                                                                onClick={(e) => {
                                                                    //fileInputRef.current?.click();
                                                                    //const fileInputRefAux = document.getElementById(`fileInput-${row.id}`);
                                                                    //fileInputRef.value = null;
                                                                    //fileInputRefAux?.click();
                                                                    fileInputRefs[row.id].click();
                                                                }}
                                                            >
                                                                Upload
                                                                image
                                                                <VisuallyHiddenInput
                                                                    type="file"
                                                                    id={`fileInput-${row.id}`}
                                                                    onChange={(e) => handleFileChange(e, row.id)}
                                                                    ref={(e) => (fileInputRefs[row.id] = e as HTMLInputElement)}//fileInputRef}
                                                                    />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {emptyRowsMP > 0 && (
                                                <TableRow
                                                    style={{
                                                        height: (dense ? 33 : 53) * emptyRowsMP,
                                                    }}
                                                >
                                                    <TableCell
                                                        colSpan={6}/>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={rowsMP.length}
                                    rowsPerPage={rowsPerPageMP}
                                    page={pageMP}
                                    onPageChange={handleChangePageMP}
                                    onRowsPerPageChange={handleChangeRowsPerPageMP}
                                />
                            </Paper>
                        </Box>
                    </div>
                )}
            </>
            ):(
                <>
                    <div>
                        <div
                            className="flex pb-5">
                            <div
                                className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleBackButton}>
                                    <ArrowBack
                                        sx={{color: 'white'}}/>
                                    Back
                                    to
                                    Groups
                                </button>
                            </div>
                            <div
                                className="pt-1.5 pl-4 pr-4">
                                <Typography
                                    variant="h5"
                                    gutterBottom>
                                    {selectedDetailedProfile}
                                </Typography>
                            </div>
                            <div
                                className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handlePrevious}>
                                    <NavigateBefore
                                        sx={{color: 'white'}}/>
                                    previous
                                </button>
                            </div>
                            <div
                                className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleNext}>
                                    <NavigateNext
                                        sx={{color: 'white'}}/>
                                    next
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                paddingLeft: '210px'
                            }}>
                            <Typography
                                variant="h5"
                                gutterBottom>
                                Plan
                            </Typography>
                        </div>
                        <div
                            className="parentContainer">
                            {(selectedTypeOfProfile !== typeOfProfile[0].name) ? (
                                <div
                                    className="flex pb-5 availableImageContainer">
                                    <div
                                        style={{paddingLeft: '10px'}}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    id={selectedDetailedProfileID.toString().concat("plan")}
                                                    checked={planCheckboxs[selectedDetailedProfileID].check}
                                                    onChange={(event)=>(handlePlanCheckbox(event, "other"))}
                                                    color="success"/>}
                                            label="Use available image from profile"
                                        />
                                        <FormControl>
                                            <Select
                                                labelId="simple-select-label"
                                                id="simple-select"
                                                value={selectFromCodeList === '' ? '' : selectFromCodeList}
                                                onChange={(e) => {
                                                    handleSelectFromCodeList(e.target.value)
                                                }}
                                                sx={{height: '40px'}}
                                            >
                                                {profilesCodeList.map((p, index) => (
                                                    <MenuItem
                                                        key={p}
                                                        value={p}>{p}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex pb-5 availableImageContainer">
                                    <div
                                        className="availableImageName">
                                        <IconButton
                                            className=""
                                            aria-label="close">
                                            <InsertDriveFile/>
                                        </IconButton>
                                        <div
                                            className="imageNameContainer">
                                            {selectedDetailedProfileAttachedImageName !== '' ? (
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom>
                                                    {selectedDetailedProfileAttachedImageName}
                                                </Typography>
                                            ) : (
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom>
                                                    No
                                                    file
                                                    available
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    {(selectedDetailedProfileAttachedImageName !== '') ? (
                                        <div
                                            style={{paddingLeft: '10px'}}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        id={selectedDetailedProfileID.toString().concat("plan")}
                                                        checked={planCheckboxs[selectedDetailedProfileID].check}
                                                        color="success"
                                                        onChange={(event)=>(handlePlanCheckbox(event, "own"))}
                                                    />}
                                                label="Use available image"
                                            />
                                        </div>) : (
                                        <div
                                            style={{paddingLeft: '10px'}}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        disabled/>}
                                                label="Use available image"
                                            />
                                        </div>)}
                                </div>)}
                        </div>
                        <div
                            className="tableAndContainer">
                            <div
                                className="tableAndContainerT">
                                <Box
                                    sx={{width: '100%'}}>
                                    <Paper
                                        sx={{
                                            width: '100%',
                                            mb: 2
                                        }}>
                                        <EnhancedTableToolbarMPPC
                                            numSelected={selectedMPPC.length}/>
                                        <TableContainer>
                                            <Table
                                                sx={{minWidth: 550}}
                                                aria-labelledby="tableTitle2"
                                                size='small'//{denseMPPC ? 'small' : 'medium'}
                                            >
                                                <EnhancedTableHeadMPPC
                                                    //numSelected={selectedMP.length}
                                                    order={orderMPPC}
                                                    orderBy={orderByMPPC}
                                                    //onSelectAllClick={handleSelectAllClickMP}
                                                    onRequestSort={handleRequestSortMPPC}
                                                    rowCount={rowsMPPC.length}
                                                />
                                                <TableBody>
                                                    {visibleRowsMPPC.map((row, index) => {
                                                        const isItemSelectedMP = isSelected(row.id);
                                                        const labelIdMP = `enhanced-table-checkbox-${index}`;

                                                        return (
                                                            <TableRow
                                                                hover
                                                                //onClick={(event) => handleClickMP(event, row.id)}
                                                                role="checkbox"
                                                                //aria-checked={isItemSelectedMP}
                                                                tabIndex={-1}
                                                                key={row.id}
                                                                //selected={isItemSelectedMP}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    height: '20px',
                                                                    backgroundColor: (activePickPointRowId === row.id) ? '#d4d4d4' : '#ffffff'
                                                                }}
                                                            >
                                                                <TableCell
                                                                    align="left">{row.id}</TableCell>
                                                                <TableCell
                                                                    align="center">{row.groupMP}</TableCell>
                                                                <TableCell
                                                                    align="center">I{row.inc}</TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <IconButton
                                                                        className="hasImage-button"
                                                                        aria-label="close">
                                                                        {row.hasPoint ?
                                                                            <CheckBoxRounded/> :
                                                                            <CheckBoxOutlineBlankRounded/>}
                                                                    </IconButton>
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    {(selectedTypeOfProfile === typeOfProfile[0].name && planCheckboxs[selectedDetailedProfileID].check) ? (
                                                                        <Button
                                                                        component="label"
                                                                        role={undefined}
                                                                        variant="contained"
                                                                        tabIndex={-1}
                                                                        startIcon={
                                                                            <Place/>}
                                                                        sx={{
                                                                            backgroundColor: '#10b981',
                                                                            '&:hover': {
                                                                                backgroundColor: '#047857',
                                                                            },
                                                                            fontSize: '0.75rem',
                                                                            padding: '8px 8px',
                                                                        }}
                                                                        onClick={() => handlePickPoint(row.id, row.inc)}
                                                                    >
                                                                        Pick
                                                                        point
                                                                    </Button>): (
                                                                        <Button
                                                                            disabled
                                                                            component="label"
                                                                            role={undefined}
                                                                            variant="contained"
                                                                            tabIndex={-1}
                                                                            startIcon={
                                                                                <Place/>}
                                                                            sx={{
                                                                                backgroundColor: '#10b981',
                                                                                '&:hover': {
                                                                                    backgroundColor: '#047857',
                                                                                },
                                                                                fontSize: '0.75rem',
                                                                                padding: '8px 8px',
                                                                            }}
                                                                            onClick={() => handlePickPoint(row.id, row.inc)}
                                                                        >
                                                                            Pick
                                                                            point
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {emptyRowsMPPC > 0 && (
                                                        <TableRow
                                                            style={{
                                                                height: (denseMPPC ? 33 : 53) * emptyRowsMPPC,
                                                            }}
                                                        >
                                                            <TableCell
                                                                colSpan={6}/>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={rowsMPPC.length}
                                            rowsPerPage={rowsPerPageMPPC}
                                            page={pageMPPC}
                                            onPageChange={handleChangePageMPPC}
                                            onRowsPerPageChange={handleChangeRowsPerPageMPPC}
                                        />
                                    </Paper>
                                </Box>
                            </div>
                            <div
                                className="rowCanvas-container">
                                {emptyPhoto &&
                                    <div
                                        className="maps"
                                        style={{
                                            width: '600px',
                                            height: '400px'
                                        }}>
                                        <MapContainer
                                            center={[41.55648, -6.88924]}//{[41.5559, -6.8889]}
                                            zoom={17} //13
                                            scrollWheelZoom={false}
                                            style={{
                                                width: '100%',
                                                height: '100%'
                                            }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <TileLayer
                                                attribution='&copy; <a href="https://localhost:3000/">Lincs</a>'
                                                url=""
                                            />
                                            {markersPerProfile[selectedDetailedProfileID].pm.map((marker, index) => (
                                                <Marker
                                                    key={index}
                                                    position={marker.latLng}
                                                    icon={/*new Icon({
                                                        iconUrl: '/marker-icon-green.png',*/
                                                        createCustomIcon(marker.id)}
                                                //iconSize: [25, 41],
                                                //iconAnchor: [12, 41]
                                                //})}
                                                >
                                                    <Popup>
                                                        <div style={{ width: '180px'}}>
                                                            <h3 style={{
                                                                textAlign: 'center',
                                                                fontSize: '20px'
                                                            }}>Inclinometer {marker.id}</h3>
                                                            <p>Location: {marker.latLng.lat}, {marker.latLng.lng}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                            {clickPoint && (
                                                <MapClickHandler/>)}
                                        </MapContainer>
                                    </div>
                                }
                                {(!emptyPhoto && planCheckActive && !planCheckActiveOwn) && (
                                    <img
                                        src={planCheckActiveImgSrc}
                                        width={600}
                                        height={400}
                                        alt=''
                                        style={{border: '1px solid black'}}/>
                                )}
                                <div
                                    id="konvaContainer"
                                    className="tableAndContainerC"></div>
                                {selectedTypeOfProfile === typeOfProfile[1].name && (
                                    <div>
                                        <div
                                            style={{
                                                paddingTop: '30px',
                                            }}>
                                            <Typography
                                                align='left'
                                                variant="h5"
                                                gutterBottom>
                                                Cross
                                                section
                                            </Typography>
                                        </div>
                                        <div
                                            className="flex pb-5 availableImageContainer">
                                            <div
                                                className="availableImageName">
                                                <IconButton
                                                    className=""
                                                    aria-label="close">
                                                    <InsertDriveFile/>
                                                </IconButton>
                                                <div
                                                    className="imageNameContainer">
                                                    {selectedDetailedProfileAttachedImageName !== '' ? (
                                                        <Typography
                                                            variant="subtitle1"
                                                            gutterBottom>
                                                            {selectedDetailedProfileAttachedImageName}
                                                        </Typography>
                                                    ) : (
                                                        <Typography
                                                            variant="subtitle1"
                                                            gutterBottom>
                                                            No
                                                            file
                                                            available
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                            {(selectedDetailedProfileAttachedImageName !== '') ? (
                                                <div
                                                    style={{paddingLeft: '10px'}}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                id={selectedDetailedProfileID.toString().concat("cross")}
                                                                checked={crossSectionCheckboxs[selectedDetailedProfileID].check}
                                                                color="success"
                                                                onChange={(event)=>(handleCrossSectionCheckbox(event))}
                                                            />}
                                                        label="Use available image"
                                                    />
                                                </div>) : (
                                                <div
                                                    style={{paddingLeft: '10px'}}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                disabled/>}
                                                        label="Use available image"
                                                    />
                                                </div>)}
                                        </div>

                                    </div>)}
                            </div>
                        </div>
                        <div style={{display: 'flex',justifyContent: 'flex-end'}}>
                            {(crossSectionCheckboxs[selectedDetailedProfileID].check && (selectedDetailedProfileAttachedImageName !== '') && (selectedTypeOfProfile === typeOfProfile[1].name)) && (
                                <div style={{paddingRight: '16px'}}>
                                <Card sx={{ minWidth: 275 }}>
                                    <CardHeader
                                        title="Map the image to coordinates"
                                        disableTypography
                                        sx={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '20px'}}
                                    />
                                    <CardContent>
                                        <div
                                            className="selectCoordRow">
                                            <div
                                                className="selectCoordColumn1">
                                                <FormControl sx={{paddingBottom: '15px', paddingRight: '10px'}}>
                                                    <Select
                                                        labelId="simple-select-label"
                                                        id="simple-select"
                                                        value={coordIncs.length === 0 ? "" : selectedIncTopBottom}
                                                        onChange={(e) => {
                                                            setSelectedIncTopBottom(Number(e.target.value))
                                                        }}
                                                        sx={{height: '40px'}}
                                                    >
                                                        {coordIncs.map((c, index) => (
                                                            <MenuItem
                                                                key={c}
                                                                value={c}>{c}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div
                                                className="selectCoordColumn2">
                                                <div style={{paddingBottom: '18px'}}>
                                                <Button
                                                    component="label"
                                                    role={undefined}
                                                    variant="contained"
                                                    tabIndex={-1}
                                                    startIcon={
                                                        <Place/>}
                                                    sx={{
                                                        backgroundColor: '#10b981',
                                                        '&:hover': {
                                                            backgroundColor: '#047857',
                                                        },
                                                        fontSize: '0.75rem',
                                                        padding: '8px 22px',
                                                    }}
                                                    onClick={() => {handlePickPointCrossSection("top");setClickTop(true)}}
                                                >
                                                    Pick
                                                    top
                                                </Button>
                                                </div>
                                                <div>
                                                <Button
                                                    component="label"
                                                    role={undefined}
                                                    variant="contained"
                                                    tabIndex={-1}
                                                    startIcon={
                                                        <Place/>}
                                                    sx={{
                                                        backgroundColor: '#10b981',
                                                        '&:hover': {
                                                            backgroundColor: '#047857',
                                                        },
                                                        fontSize: '0.75rem',
                                                        padding: '8px 8px',
                                                    }}
                                                    onClick={() => {handlePickPointCrossSection("bottom");setClickBottom(true)}}
                                                >
                                                    Pick
                                                    bottom
                                                </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>)}
                            <div>
                                <div
                                    id="konvaContainerCrossSection"
                                    className="tableAndContainerC"></div>
                            </div>
                            </div>
                    </div>
                </>
            )}
        </div>

    );
}

export default MonitoringProfiles;
