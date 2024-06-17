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
    FormControlLabel
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
import {Icon} from 'leaflet'

const testData = [createData(1, 'Profiles1', 2, 40),
    createData(2, 'Profiles2', 1, 30)];

const testIncValues = ['PK150_200', 10, "PK250_300", 30];

const testMeasurements = ['PK150_200', "PK250_300"];

const typeOfProfile = [
    {
        id: 1,
        name: 'Plan',
    },
    {
        id: 2,
        name: 'Cross section',
    }
]

interface PointsPerProfile {
    id: number;
    points: number[];
}

function createPointPerProfile(
    id: number,
    points: number[]
): PointsPerProfile {
    return {
        id,
        points
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
        label: 'Measurements',
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
                <TableCell padding="checkbox" sx={{ backgroundColor: '#22c55e' }}>
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
                        sx={{ backgroundColor: '#22c55e' }}
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
                }),backgroundColor: '#16a34a'
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
                        sx={{ backgroundColor: '#22c55e' }}
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
                }),backgroundColor: '#16a34a'
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
                        sx={{ backgroundColor: '#22c55e' }}
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
                }),backgroundColor: '#16a34a'
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
    const [firebaseInitialized, setFirebaseInitialized] = React.useState(false);

    firebase.initializeApp(firebaseConfig);
    /*useEffect(() => {
        if(!firebaseInitialized){
            firebase.initializeApp(firebaseConfig);
            setFirebaseInitialized(true);
        }
    }, [firebaseInitialized]);*/

    useEffect(() => {
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
        for(let i = 0; i < 4; i++){
            tempMarks.push(createPointMarkerPerProfile(i+1, []))
            tempPoints.push(createPointPerProfile(i+1, []))
        }
        setMarkersPerProfile(tempMarks);
        setPointsPerProfile(tempPoints);

    }, [page]);

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

    const handleNewMonitProfile = () => {

    }
    const handleEditMonitProfile = () => {

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
            tempMP.push(createDataMP(monitoringProfilesTableData.length + 1, selectedGroupProfileNew, selectedNameProfileNew, selectedDescriptionProfileNew, selectedTypeOfProfileNew, (selectedAttachedImageNew !== ''), selectedAttachedImageNew === '' ? '/profiles/NoImageFound.png' : selectedAttachedImageNew))

            for(let i = 0; i < selectedInclinometersNew.length; i++){
                tempIncPerProfiles.push(createIncPerProfile(tempIncPerProfiles.length + 1, rowsMP.length + 1, selectedGroupProfileNew, selectedInclinometersNew[i].split("(")[1].split(")")[0], Number(selectedInclinometersNew[i].split(" ")[0].split("I")[1])));
            }

            setRowsMP(tempRows);
            setMonitoringProfilesTableData(tempMP)
            setIncPerProfiles(tempIncPerProfiles);

            let tempMarks = markersPerProfile;
            let tempPoints = pointsPerProfile;
            tempMarks.push(createPointMarkerPerProfile(nextId, []));
            tempPoints.push(createPointPerProfile(nextId, []));
            setMarkersPerProfile(tempMarks);
            setPointsPerProfile(tempPoints);

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
                tempData[rowId-1].imagedAttached = downloadURL;
                tempData[rowId-1].hasImage = true;
                setMonitoringProfilesTableData(tempData);
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
            });

    }

    /*const handleUpload = async(file: File) => {
        try {
            const response = await fetch('https://uploadthing.com/api/uploadFiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Uploadthing-Api-Key': 'sk_live_07475a2a81560265aaa2810b12ba31af2cad80a42f2e7da404b4f7230cf53602',
                    'X-Uploadthing-Version': '6.12.0',
                    'UPLOADTHING_URL': 'https://sparrow-organic-abnormally.ngrok-free.app/',
                },
                body: JSON.stringify({
                    files: [{
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    }],
                    acl: 'public-read',
                    metadata: null,
                    contentDisposition: 'inline',
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to upload: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Upload successful:', data);

        }catch (error) {
            console.error('Error during upload:', error);
        }
    }*/


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

    const stageRef = useRef<Konva.Stage | null>(null);
    const pointsLayerRef = useRef<Konva.Layer | null>(null);
    const [positionsArray, setPositionsArray] = React.useState<number[]>([]);
    const [replaceValues, setReplaceValues] = React.useState(false);

    const [emptyPhoto, setEmptyPhoto] = React.useState(false);

    useEffect(() => {
        console.log(selectedDetailedProfile)
        if(selectedDetailedProfile === 'Profiles1: All'){
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, true, [296.2878194833505, 137.46244130721217]),
                createDataMPPC(1, 'PK150_200', 2, false, []),
                createDataMPPC(2, 'PK150_200', 3, false, []),
                createDataMPPC(3, 'PK150_200', 4, false, []),
                createDataMPPC(4, 'PK150_200', 5, false, []),
                createDataMPPC(5, 'PK150_200', 6, false, []),
                createDataMPPC(6, 'PK150_200', 8, false, []),
                createDataMPPC(7, 'PK150_200', 9, false, []),
                createDataMPPC(8, 'PK150_200', 10, false, [])])
            setRowsMPPC(MPPCTableData)
        }else if(selectedDetailedProfile === 'Profiles1: Crest'){
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, false, []),
                createDataMPPC(1, 'PK150_200', 3, false, []),
                createDataMPPC(2, 'PK150_200', 6, false, []),
                createDataMPPC(3, 'PK150_200', 9, false, [])])
            setRowsMPPC(MPPCTableData)
        }else{
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, false, []),
                createDataMPPC(1, 'PK150_200', 2, false, [])])
            setRowsMPPC(MPPCTableData)
        }
    }, [detailedView]);

    useEffect(() => {
        if(selectedDetailedProfile !== 'Profiles1: All' && selectedDetailedProfile !== 'Profiles1: Crest' && selectedDetailedProfile !== 'Profiles1: P5') {

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
            let counter = 0;
            for (let i = 0; i < tempIncValuesFinal.length; i++) {
                tempRows.push(createDataMPPC(counter, tempIncValuesFinal[i].profileGroup, tempIncValuesFinal[i].inc, false, []))
                tempMPPCTableData.push(createDataMPPC(counter, tempIncValuesFinal[i].profileGroup, tempIncValuesFinal[i].inc, false, []))
                counter++;
            }

            setRowsMPPC(tempRows)
            setMPPCTableData(tempMPPCTableData)

        }else if(selectedDetailedProfile === 'Profiles1: All'){
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, true, [296.2878194833505, 137.46244130721217]),
                createDataMPPC(1, 'PK150_200', 2, false, []),
                createDataMPPC(2, 'PK150_200', 3, false, []),
                createDataMPPC(3, 'PK150_200', 4, false, []),
                createDataMPPC(4, 'PK150_200', 5, false, []),
                createDataMPPC(5, 'PK150_200', 6, false, []),
                createDataMPPC(6, 'PK150_200', 8, false, []),
                createDataMPPC(7, 'PK150_200', 9, false, []),
                createDataMPPC(8, 'PK150_200', 10, false, [])])
            setRowsMPPC(MPPCTableData)
        }else if(selectedDetailedProfile === 'Profiles1: Crest'){
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, false, []),
                createDataMPPC(1, 'PK150_200', 3, false, []),
                createDataMPPC(2, 'PK150_200', 6, false, []),
                createDataMPPC(3, 'PK150_200', 9, false, [])])
            setRowsMPPC(MPPCTableData)
        }else{
            setMPPCTableData([createDataMPPC(0, 'PK150_200', 1, false, []),
                createDataMPPC(1, 'PK150_200', 2, false, [])])
            setRowsMPPC(MPPCTableData)
        }
    }, [selectedDetailedProfile, selectedDetailedProfileID]);

    useEffect(() => {
        setRowsMPPC(MPPCTableData)
    }, [MPPCTableData]);

    useEffect(() => {
        for(let i = 0; i < MPPCTableData.length; i++){
            if(!MPPCTableData[i].hasPoint && MPPCTableData[i].pickPoint.length !== 0){
                MPPCTableData[i].hasPoint = true;
                setRowsMPPC(MPPCTableData)
            }
        }
    }, [rowsMPPC, MPPCTableData, positionsArray, replaceValues]);

    useEffect(() => {
        if(positionsArray.length === 0){
            setPositionsArray([296.2878194833505, 137.46244130721217, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0])
        }

        if(stageRef.current && pointsLayerRef.current && replaceValues && !emptyPhoto){
            let stage = stageRef.current;

            if (pointsLayerRef) {
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

            let posCounter = 0;
            for(let i = 0; i < 9; i++){
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
            }
            setReplaceValues(false);
        }else if(replaceValues && emptyPhoto){
            setMarkers(markersPerProfile[selectedDetailedProfileID].pm)

            setReplaceValues(false);
        }
    }, [MPPCTableData, positionsArray, replaceValues]);

    useEffect(() => {
        if(detailedView) {
            let tempData = monitoringProfilesTableData;
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID+1)

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

                    let posCounter = 0;
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
                    }
                }
                pointsLayerRef.current = layer;

                if(selectedData[0].imagedAttached === '/profiles/NoImageFound.png'){
                    if (stageRef.current) {
                        const stage = stageRef.current;
                        stage.destroy();
                    }
                }
            }, 1);
        }else{
            if (stageRef.current) {
                const stage = stageRef.current;
                stage.destroy();
            }
        }
    }, [selectedDetailedProfile, detailedView, monitoringProfilesTableData]);

    useEffect(() => {
        let tempData = monitoringProfilesTableData;
        if(tempData.length !== 0){
            let selectedData = tempData.filter(d => d.id === selectedDetailedProfileID+1)

            if(selectedData[0].imagedAttached === '/profiles/NoImageFound.png'){
                setEmptyPhoto(true)
            }else{
                setEmptyPhoto(false)
            }
        }
    }, [selectedDetailedProfileID]);

    const handlePickPoint = (rowId: number, rowInc: number) => {
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
                    }
                }
            })
        }else if(emptyPhoto){
            setCurrentRowId(rowId)
            setCurrentPoint(rowInc)
            setClickPoint(true);
        }
    }

    //const [markers, setMarkers] = useState<L.LatLng[]>([]);
    const [pointsPerProfile, setPointsPerProfile] = useState<PointsPerProfile[]>([]);
    const [markersPerProfile, setMarkersPerProfile] = useState<PointMarkerPerProfile[]>([]);
    const [markers, setMarkers] = useState<PointMarker[]>([]);
    const [currentRowId, setCurrentRowId] = useState(0);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [clickPoint, setClickPoint] = useState(false);
    const [lineCoordinates, setLineCoordinates] = useState<L.LatLng[]>([]);

    useEffect(() => {
        let coordinates = markers.map(marker => marker.latLng);
        setLineCoordinates(coordinates);
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
                setMarkersPerProfile(tempMarks)

                setReplaceValues(true)
                setClickPoint(false);
                setCurrentPoint(0)
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
                            className="py-2 px-4  bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                            className="py-2 px-4  bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                        className="py-3 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
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
                                                            backgroundColor: '#22c55e',
                                                            '&:hover': {
                                                                backgroundColor: '#15803d',
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
                                                            type="file"/>
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
                                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                        className="py-3 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
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
                                className="py-3 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
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
                                                                    backgroundColor: '#22c55e',
                                                                    '&:hover': {
                                                                        backgroundColor: '#15803d',
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
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
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
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleNext}>
                                    <NavigateNext
                                        sx={{color: 'white'}}/>
                                    next
                                </button>
                            </div>
                        </div>
                        <div style={{paddingLeft: (selectedTypeOfProfile === typeOfProfile[0].name && selectedDetailedProfileAttachedImageName !== '') ? '80px' :
                                (selectedTypeOfProfile !== typeOfProfile[0].name && selectedDetailedProfileAttachedImageName !== '') ? '80px' :'0px',
                                    paddingRight: (selectedTypeOfProfile !== typeOfProfile[0].name && selectedDetailedProfileAttachedImageName === '') ? '10px': '0px'}}>
                        <Typography
                            variant="h6"
                            gutterBottom>
                            Plan
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
                                            variant="h6"
                                            gutterBottom>
                                            {selectedDetailedProfileAttachedImageName}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant="h6"
                                            gutterBottom>
                                            No
                                            file
                                            available
                                        </Typography>
                                    )}
                                </div>
                            </div>
                            {selectedDetailedProfileAttachedImageName !== '' ? (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked
                                        color="success"/>}
                                label="Use available image"
                            />) : (
                                <FormControlLabel
                                control={<Checkbox disabled/>}
                                label="Use available image"
                                />)}
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
                                                                    height: '20px'
                                                                }}
                                                            >
                                                                <TableCell
                                                                    onClick={() => handleClickProfile(row.id)}
                                                                    align="left">{row.id}</TableCell>
                                                                <TableCell
                                                                    onClick={() => handleClickProfile(row.id)}
                                                                    align="center">{row.groupMP}</TableCell>
                                                                <TableCell
                                                                    onClick={() => handleClickProfile(row.id)}
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
                                                                    <Button
                                                                        component="label"
                                                                        role={undefined}
                                                                        variant="contained"
                                                                        tabIndex={-1}
                                                                        startIcon={
                                                                            <Place/>}
                                                                        sx={{
                                                                            backgroundColor: '#22c55e',
                                                                            '&:hover': {
                                                                                backgroundColor: '#15803d',
                                                                            },
                                                                            fontSize: '0.75rem',
                                                                            padding: '8px 8px',
                                                                        }}
                                                                        onClick={() => handlePickPoint(row.id, row.inc)}
                                                                    >
                                                                        Pick
                                                                        point
                                                                    </Button>
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
                            {emptyPhoto &&
                                <div
                                    className="maps"
                                    style={{
                                        width: '600px',
                                        height: '400px'
                                    }}>
                                    <MapContainer
                                        center={[38.66086, -9.20339]}
                                        zoom={13}
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
                                        {markers.map((marker, index) => (
                                            <Marker
                                                key={index}
                                                position={marker.latLng}
                                                icon={new Icon({
                                                    iconUrl: markerIconPng,
                                                    iconSize: [25, 41],
                                                    iconAnchor: [12, 41]
                                                })}>
                                                <Popup>
                                                    Inclinometer {marker.id} -
                                                    Location: {marker.latLng.lat}, {marker.latLng.lng}
                                                </Popup>
                                            </Marker>
                                        ))}
                                        {markers.length > 1 && (
                                            <Polyline positions={lineCoordinates} color="red" />
                                        )}
                                        {clickPoint && (
                                            <MapClickHandler/>)}
                                    </MapContainer>
                                </div>
                            }
                            <div
                                id="konvaContainer"
                                className="tableAndContainerC"></div>
                        </div>
                    </div>
                </>
            )}
        </div>

    );
}

export default MonitoringProfiles;
