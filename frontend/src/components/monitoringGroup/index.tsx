import React, {
    DragEventHandler,
    useEffect,
    useState
} from "react";
import {
    alpha,
    Box,
    Checkbox,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    OutlinedInput,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Theme,
    Toolbar,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {
    visuallyHidden
} from "@mui/utils";
import {
    ArrowBack,
    CheckBoxOutlineBlankRounded,
    CheckBoxRounded,
    Clear,
    Close,
    Delete,
    OpenWith
} from "@mui/icons-material";
import {
    Listbox
} from "@headlessui/react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap
} from "react-leaflet";
import L
    from "leaflet";
import districtsData from './JSON_Municipios_Portugal.json';

interface SoilItem {
    id: number;
    symbol: string;
    color: string;
    description: string;
    thickness: number;
    topLevel: number;
}

interface MonitoringGroup {
    id: number;
    name: string;
    region: string;
    district: string;
    description: string;
    databaseId: number;
}

function createData(
    id: number,
    name: string,
    region: string,
    district: string,
    description: string,
    databaseId: number,
): MonitoringGroup {
    return {
        id,
        name,
        region,
        district,
        description,
        databaseId
    };
}

interface Measurement {
    id: number;
    measurement: string;
    host: string;
}

function createDataMeasurement(
    id: number,
    measurement: string,
    host: string
): Measurement {
    return {
        id,
        measurement,
        host
    };
}

interface Inclinometer {
    id: number;
    measurement: string;
    inclinometer: string;
    azimute: number;
    latitude: number;
    longitude: number;
    topSensor: number;
    casingAngle: number;
}

function createDataInclinometer(
    id: number,
    measurement: string,
    inclinometer: string,
    azimute: number,
    latitude: number,
    longitude: number,
    topSensor: number,
    casingAngle: number
): Inclinometer {
    return {
        id,
        measurement,
        inclinometer,
        azimute,
        latitude,
        longitude,
        topSensor,
        casingAngle
    };
}

interface IncFreq {
    id: number;
    measurement: string;
    inclinometer: string;
    lastRecord: string;
    avgFrequency: string;
}

function createDataIncFreq(
    id: number,
    measurement: string,
    inclinometer: string,
    lastRecord: string,
    avgFrequency: string
): IncFreq {
    return {
        id,
        measurement,
        inclinometer,
        lastRecord,
        avgFrequency
    };
}

interface SensorSpacing {
    id: number;
    spacing: number;
    depth: number;
    level: number;
    referencePoint: boolean;
}

function createDataSensorSpacing(
    id: number,
    spacing: number,
    depth: number,
    level: number,
    referencePoint: boolean
): SensorSpacing {
    return {
        id,
        spacing,
        depth,
        level,
        referencePoint
    };
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



const createCustomIcon = (markerId: number) => {
    return L.divIcon({
        html: `<div class="custom-marker">
                   <img src="/marker-icon-green.png" alt="Marker Icon" />
               </div>`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: ''
    });
};


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
    id: keyof MonitoringGroup;
    label: string;
    numeric: boolean;
}

interface HeadCellMeasurement {
    disablePadding: boolean;
    id: keyof Measurement;
    label: string;
    numeric: boolean;
}

interface HeadCellInclinometer {
    disablePadding: boolean;
    id: keyof Inclinometer;
    label: string;
    numeric: boolean;
}

interface HeadCellIncFreq {
    disablePadding: boolean;
    id: keyof IncFreq;
    label: string;
    numeric: boolean;
}

interface HeadCellSensor {
    disablePadding: boolean;
    id: keyof SensorSpacing;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Name',
    },
    {
        id: 'region',
        numeric: false,
        disablePadding: false,
        label: 'Region',
    },
    {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'Description',
    }
];

const headCellsMeasurement: readonly HeadCellMeasurement[] = [
    {
        id: 'measurement',
        numeric: false,
        disablePadding: true,
        label: 'Measurement',
    },
    {
        id: 'host',
        numeric: false,
        disablePadding: false,
        label: 'host (MacAddress)',
    }
];

const headCellsInclinometer: readonly HeadCellInclinometer[] = [
    {
        id: 'measurement',
        numeric: false,
        disablePadding: true,
        label: 'Measurement',
    },
    {
        id: 'inclinometer',
        numeric: false,
        disablePadding: false,
        label: 'Inclinometer',
    },
    {
        id: 'azimute',
        numeric: false,
        disablePadding: false,
        label: 'Azimute (º)',
    },
    {
        id: 'latitude',
        numeric: false,
        disablePadding: false,
        label: 'Latitude',
    },
    {
        id: 'longitude',
        numeric: false,
        disablePadding: false,
        label: 'Longitude',
    },
    {
        id: 'topSensor',
        numeric: false,
        disablePadding: false,
        label: 'Level of top sensor (m)',
    },
    {
        id: 'casingAngle',
        numeric: false,
        disablePadding: false,
        label: 'Casing angle to horizontal (º)',
    }
];

const headCellsIncFreq: readonly HeadCellIncFreq[] = [
    {
        id: 'measurement',
        numeric: false,
        disablePadding: true,
        label: 'Measurement',
    },
    {
        id: 'inclinometer',
        numeric: false,
        disablePadding: false,
        label: 'Inclinometer',
    },
    {
        id: 'lastRecord',
        numeric: false,
        disablePadding: false,
        label: 'Last recorded date',
    },
    {
        id: 'avgFrequency',
        numeric: false,
        disablePadding: false,
        label: 'Average frequency',
    }
];

const headCellsSensor: readonly HeadCellSensor[] = [
    {
        id: 'id',
        numeric: false,
        disablePadding: true,
        label: 'Sensor ID',
    },
    {
        id: 'spacing',
        numeric: false,
        disablePadding: false,
        label: 'Spacing to next sensor above (m)',
    },
    {
        id: 'depth',
        numeric: false,
        disablePadding: false,
        label: 'Depth since the highest sensor (m)',
    },
    {
        id: 'level',
        numeric: false,
        disablePadding: false,
        label: 'Level (m)',
    },
    {
        id: 'referencePoint',
        numeric: false,
        disablePadding: false,
        label: 'Reference point',
    }
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof MonitoringGroup) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

interface EnhancedTablePropsMeasurement {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Measurement) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

interface EnhancedTablePropsInclinometer {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Inclinometer) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

interface EnhancedTablePropsIncFreq {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof IncFreq) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

interface EnhancedTablePropsSensor {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof SensorSpacing) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof MonitoringGroup) => (event: React.MouseEvent<unknown>) => {
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
                        align={'center'}//headCell.numeric ? 'center' : 'left'}
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

function EnhancedTableHeadMeasurement(props: EnhancedTablePropsMeasurement) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Measurement) => (event: React.MouseEvent<unknown>) => {
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
                {headCellsMeasurement.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}//headCell.numeric ? 'center' : 'left'}
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

function EnhancedTableHeadInclinometer(props: EnhancedTablePropsInclinometer) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Inclinometer) => (event: React.MouseEvent<unknown>) => {
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
                {headCellsInclinometer.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}//headCell.numeric ? 'center' : 'left'}
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

function EnhancedTableHeadIncFreq(props: EnhancedTablePropsIncFreq) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof IncFreq) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsIncFreq.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}
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

function EnhancedTableHeadSensor(props: EnhancedTablePropsSensor) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof SensorSpacing) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsSensor.map((headCell) => (
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
                    Select the desired groups
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

interface EnhancedTableToolbarPropsMeasurement {
    numSelected: number;
    onDelete: () => void;
}

function EnhancedTableToolbarMeasurement(props: EnhancedTableToolbarPropsMeasurement) {
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
                    Select from available measurements
                </Typography>
            )}
        </Toolbar>
    );
}

interface EnhancedTableToolbarPropsInclinometer {
    numSelected: number;
    onDelete: () => void;
}

function EnhancedTableToolbarInclinometer(props: EnhancedTableToolbarPropsInclinometer) {
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
                    Select from available inclinometers
                </Typography>
            )}
        </Toolbar>
    );
}

function EnhancedTableToolbarIncFreq() {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                backgroundColor: '#047857'
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%'}}
                variant="h6"
                id="tableTitle"
                component="div"
                color="white"
            >
                Select an inclinometer to update
            </Typography>

        </Toolbar>
    );
}

function EnhancedTableToolbarSensor() {

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                backgroundColor: '#047857'
            }}
        >
                <Typography
                    sx={{ flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                    color="white"
                >
                    Set spacing between sensors
                </Typography>

        </Toolbar>
    );
}

interface RecenterMapProps {
    markers: L.LatLng[];
}

const RecenterMap = ({ markers }: RecenterMapProps) => {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const marker = markers[0];
            map.setView(marker, map.getZoom());
        }
    }, [markers, map]);

    return null;
};


function MonitGroups() {

    const theme = useTheme();

    //Pages
    const [firstPageActive, setFirstPageActive] = React.useState(true);
    const [secondPageActive, setSecondPageActive] = React.useState(false);
    const [thirdPageActive, setThirdPageActive] = React.useState(false);
    const [fourthPageActive, setFourthPageActive] = React.useState(false);
    const [fifthPageActive, setFifthPageActive] = React.useState(false);

    //First page - monitoring groups
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof MonitoringGroup>('id');
    const [selected, setSelected] = React.useState<readonly number[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<MonitoringGroup[]>([]);
    const [checkedGroups, setCheckedGroups] = useState<number[]>([])
    const [groupSelected, setGroupSelected] = useState<boolean>(false);

    const [selectedRegion, setSelectedRegion] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');
    const [description, setDescriptionName] = useState('');
    const [missingFieldGroupName, setMissingFieldGroupName] = useState(false);
    const [missingFieldDescription, setMissingFieldDescription] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [regions, setRegions] = useState<string[]>([]);

    const [selectedGroup, setSelectedGroup] = useState<number>(0);

    const handleChangeDistrict = (event: SelectChangeEvent<typeof selectedDistrict>) => {
        const tempSelectedDistrict = event.target.value as keyof typeof districtsData;
        setSelectedDistrict(tempSelectedDistrict);

        setRegions(districtsData[tempSelectedDistrict]);
        /*
        if (districtsData[tempSelectedDistrict]) {
            setRegions(districtsData[tempSelectedDistrict] as string[]);
        } else {
            setRegions([]);
        }*/

        setSelectedRegion([]);
    };

    const handleChangeRegion = (event: SelectChangeEvent<typeof selectedRegion>) => {
        const {
            target: { value },
        } = event;
        setSelectedRegion(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleGroupName = (newGroupName: string) => {
        setGroupName(newGroupName)
    }

    const handleDescription = (newDescription: string) => {
        setDescriptionName(newDescription)
    }

    const handleSubmitGroup = () => {

    }

    const handleSelectGroup = (event: SelectChangeEvent<typeof selectedGroup>) => {
        const groupId = Number(event.target.value);
        setSelectedGroup(groupId);

        const group = rows.find(g => g.id === groupId);
        if (group) {
            setGroupName(group.name);
            setSelectedDistrict(group.district);
            setSelectedRegion([group.region]);
            setDescriptionName(group.description);
        }
    };

    const handleSubmitGroupEdit = () => {

    }

    //Second page - available measurements
    const [orderMeasurement, setOrderMeasurement] = React.useState<Order>('asc');
    const [orderByMeasurement, setOrderByMeasurement] = React.useState<keyof Measurement>('id');
    const [selectedMeasurement, setSelectedMeasurement] = React.useState<readonly number[]>([]);
    const [pageMeasurement, setPageMeasurement] = React.useState(0);
    const [denseMeasurement, setDenseMeasurement] = React.useState(false);
    const [rowsPerPageMeasurement, setRowsPerPageMeasurement] = React.useState(5);
    const [rowsMeasurement, setRowsMeasurement] = React.useState<Measurement[]>([]);
    const [checkedGroupsMeasurement, setCheckedGroupsMeasurement] = useState<number[]>([])
    const [groupSelectedMeasurement, setGroupSelectedMeasurement] = useState<boolean>(false);

    const [openNew, setOpenNew] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);


    const handleOpenNew = () => setOpenNew(true);

    const handleCloseNew = () => {

        setOpenNew(false)
    };


    const handleOpenEdit = () => setOpenEdit(true);

    const handleCloseEdit = () => {

        setOpenEdit(false)
    };

    const handleRequestSortMeasurement = (
        event: React.MouseEvent<unknown>,
        property: keyof Measurement,
    ) => {
        const isAsc = orderByMeasurement === property && orderMeasurement === 'asc';
        setOrderMeasurement(isAsc ? 'desc' : 'asc');
        setOrderByMeasurement(property);
    };

    const handleSelectAllClickMeasurement = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rowsMeasurement.map((n) => n.id);
            setSelectedMeasurement(newSelected);
            return;
        }
        setSelectedMeasurement([]);
    };

    const handleClickMeasurement = (event: React.MouseEvent<unknown>, id: number) => {
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
        setSelectedMeasurement(newSelected);
    };

    const handleChangePageMeasurement  = (event: unknown, newPage: number) => {
        setPageMeasurement(newPage);
    };

    const handleChangeRowsPerPageMeasurement = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageMeasurement(parseInt(event.target.value, 10));
        setPageMeasurement(0);
    };

    const emptyRowsMeasurement =
        pageMeasurement > 0 ? Math.max(0, (1 + pageMeasurement) * rowsPerPageMeasurement - rowsMeasurement.length) : 0;

    const visibleRowsMeasurement = React.useMemo(
        () => rowsMeasurement.slice().sort(getComparator(orderMeasurement, orderByMeasurement)).slice(
            pageMeasurement * rowsPerPageMeasurement,
            pageMeasurement * rowsPerPageMeasurement + rowsPerPageMeasurement),
        [rowsMeasurement, orderMeasurement, orderByMeasurement, pageMeasurement, rowsPerPageMeasurement],
    );


    //Third page - select inclinometers from measurements
    const [orderInclinometer, setOrderInclinometer] = React.useState<Order>('asc');
    const [orderByInclinometer, setOrderByInclinometer] = React.useState<keyof Inclinometer>('id');
    const [selectedInclinometer, setSelectedInclinometer] = React.useState<readonly number[]>([]);
    const [pageInclinometer, setPageInclinometer] = React.useState(0);
    const [denseInclinometer, setDenseInclinometer] = React.useState(false);
    const [rowsPerPageInclinometer, setRowsPerPageInclinometer] = React.useState(5);
    const [rowsInclinometer, setRowsInclinometer] = React.useState<Inclinometer[]>([]);
    const [checkedGroupsInclinometer, setCheckedGroupsInclinometer] = useState<number[]>([])
    const [groupSelectedInclinometer, setGroupSelectedInclinometer] = useState<boolean>(false);

    const handleRequestSortInclinometer = (
        event: React.MouseEvent<unknown>,
        property: keyof Inclinometer,
    ) => {
        const isAsc = orderByInclinometer === property && orderInclinometer === 'asc';
        setOrderInclinometer(isAsc ? 'desc' : 'asc');
        setOrderByInclinometer(property);
    };

    const handleSelectAllClickInclinometer = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rowsInclinometer.map((n) => n.id);
            setSelectedInclinometer(newSelected);
            return;
        }
        setSelectedInclinometer([]);
    };

    const handleClickInclinometer = (event: React.MouseEvent<unknown>, id: number) => {
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
        setSelectedInclinometer(newSelected);
    };

    const handleChangePageInclinometer  = (event: unknown, newPage: number) => {
        setPageInclinometer(newPage);
    };

    const handleChangeRowsPerPageInclinometer = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageInclinometer(parseInt(event.target.value, 10));
        setPageInclinometer(0);
    };

    const emptyRowsInclinometer =
        pageInclinometer > 0 ? Math.max(0, (1 + pageInclinometer) * rowsPerPageInclinometer - rowsInclinometer.length) : 0;

    const visibleRowsInclinometer = React.useMemo(
        () => rowsInclinometer.slice().sort(getComparator(orderInclinometer, orderByInclinometer)).slice(
            pageInclinometer * rowsPerPageInclinometer,
            pageInclinometer * rowsPerPageInclinometer + rowsPerPageInclinometer),
        [rowsInclinometer, orderInclinometer, orderByInclinometer, pageInclinometer, rowsPerPageInclinometer],
    );

    //Fourth page - set general settings of selected inclinometers
    const [orderIncFreq, setOrderIncFreq] = React.useState<Order>('asc');
    const [orderByIncFreq, setOrderByIncFreq] = React.useState<keyof IncFreq>('id');
    const [pageIncFreq, setPageIncFreq] = React.useState(0);
    const [denseIncFreq, setDenseIncFreq] = React.useState(false);
    const [rowsPerPageIncFreq, setRowsPerPageIncFreq] = React.useState(5);
    const [rowsIncFreq, setRowsIncFreq] = React.useState<IncFreq[]>([]);

    const handleRequestSortIncFreq = (
        event: React.MouseEvent<unknown>,
        property: keyof IncFreq,
    ) => {
        const isAsc = orderByIncFreq === property && orderIncFreq === 'asc';
        setOrderIncFreq(isAsc ? 'desc' : 'asc');
        setOrderByIncFreq(property);
    };

    const handleChangePageIncFreq  = (event: unknown, newPage: number) => {
        setPageIncFreq(newPage);
    };

    const handleChangeRowsPerPageIncFreq = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageIncFreq(parseInt(event.target.value, 10));
        setPageIncFreq(0);
    };

    const emptyRowsIncFreq =
        pageIncFreq > 0 ? Math.max(0, (1 + pageIncFreq) * rowsPerPageIncFreq - rowsIncFreq.length) : 0;

    const visibleRowsIncFreq = React.useMemo(
        () => rowsIncFreq.slice().sort(getComparator(orderIncFreq, orderByIncFreq)).slice(
            pageIncFreq * rowsPerPageIncFreq,
            pageIncFreq * rowsPerPageIncFreq + rowsPerPageIncFreq),
        [rowsIncFreq, orderIncFreq, orderByIncFreq, pageIncFreq, rowsPerPageIncFreq],
    );
    //Fifth page - General Settings / Sensors spacing / Soil Layers

    const [selectedSettingTab, setSelectedSettingTab] = useState<number>(1);

    //General Settings
    const [azimute, setAzimute] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [levelOfTopSensor, setLevelOfTopSensor] = useState('');
    const [casingAngle, setCasingAngle] = useState('');
    const [markers, setMarkers] = useState<L.LatLng[]>([]);

    //Sensors Spacing
    const [orderSensor, setOrderSensor] = React.useState<Order>('asc');
    const [orderBySensor, setOrderBySensor] = React.useState<keyof SensorSpacing>('id');
    const [pageSensor, setPageSensor] = React.useState(0);
    const [denseSensor, setDenseSensor] = React.useState(false);
    const [rowsPerPageSensor, setRowsPerPageSensor] = React.useState(5);
    const [rowsSensor, setRowsSensor] = React.useState<SensorSpacing[]>([]);

    //Soil Layers
    const [soilItems, setSoilItems] = useState<SoilItem[]>([]);
    const [draggingSoilItem, setDraggingSoilItem] = useState<SoilItem | null>(null);
    const [newSymbol, setSymbol] = useState('');
    const [newColor, setColor] = useState('');
    const [newDescription, setDescription] = useState('');
    const [newThickness, setThickness] = useState(0);
    const [newTopLevel, setTopLevel] = useState(0);

    useEffect(() => {

        setSoilItems([ {
                id: 1,
                symbol: 'At',
                color: '#ffe48e',
                description: 'Aterro arenoso',
                thickness: 2.1,
                topLevel: 452.25
            },
            {
                id: 2,
                symbol: 'ZG1',
                color: '#fdba74',
                description: 'Argila',
                thickness: 10.5,
                topLevel: 450.15
            },
            {
                id: 3,
                symbol: 'ZG2A',
                color: '#92400e',
                description: 'Arenito fraturado',
                thickness: 3.2,
                topLevel: 439.65
            },
            {
                id: 4,
                symbol: 'ZG2B',
                color: '#6b7280',
                description: 'Bedrock',
                thickness: 1.7,
                topLevel: 437.95
            }])
    }, [fifthPageActive]);

    const handleChangeGS = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        setter(e.target.value);
    };

    const handleSaveGeneralSettings = () =>{

    }

    useEffect(() => {
        if(latitude !== '' && longitude !== ''){
            let tempM = [];
            tempM.push(new L.LatLng(Number(latitude), Number(longitude)))
            setMarkers(tempM)
        }
    }, [latitude, longitude]);

    useEffect(() => {
        setRows([createData(1, "A12_PK150aPK300", "Macedo de Cavaleiros", "Bragança", "Azibo's dam monitoring group",1)])
    }, [firstPageActive]);

    useEffect(() => {
        setRowsMeasurement([createDataMeasurement(1, "Azibo's dam", "de41c92c9186"), createDataMeasurement(2, "Lab Test", "90f3ec78d23f")])
    }, [secondPageActive]);

    useEffect(() => {
        let checkedMeasureSet = new Set(checkedGroupsMeasurement);
        if(checkedGroupsMeasurement.length === 1){
            if(checkedMeasureSet.has(1)){
                setRowsInclinometer([createDataInclinometer(2, "Azibo's dam", "I1", 180, 41.55680, -6.89017, 606, 90),
                    createDataInclinometer(3, "Azibo's dam", "I2", 180, 41.55648,-6.89018, 591, 90),
                    createDataInclinometer(4, "Azibo's dam", "I3", 180, 41.55679,-6.88922, 606, 90),
                    createDataInclinometer(5, "Azibo's dam", "I4", 180, 41.55648,-6.88924, 591, 90),
                    createDataInclinometer(6, "Azibo's dam", "I5", 180, 41.55614,-6.88925, 576, 90),
                    createDataInclinometer(7, "Azibo's dam", "I6", 180, 41.55676,-6.88857, 606, 90),
                    createDataInclinometer(8, "Azibo's dam", "I8", 180, 41.55614,-6.88856, 576, 90),
                    createDataInclinometer(9, "Azibo's dam", "I9", 180, 41.55675,-6.88767, 606, 90),
                    createDataInclinometer(10, "Azibo's dam", "I10", 180, 41.55644,-6.88767, 591, 90)])
            }else{
                setRowsInclinometer([createDataInclinometer(1, "Lab Test", "I1", 180, 41.55648, -6.89018, 606, 90)])
            }
        }else{
            setRowsInclinometer([createDataInclinometer(1, "Lab Test", "I1", 180, 41.55648, -6.89018, 606, 90)
                ,createDataInclinometer(2, "Azibo's dam", "I1", 180, 41.55680, -6.89017, 606, 90),
                createDataInclinometer(3, "Azibo's dam", "I2", 180, 41.55648,-6.89018, 591, 90),
                createDataInclinometer(4, "Azibo's dam", "I3", 180, 41.55679,-6.88922, 606, 90),
                createDataInclinometer(5, "Azibo's dam", "I4", 180, 41.55648,-6.88924, 591, 90),
                createDataInclinometer(6, "Azibo's dam", "I5", 180, 41.55614,-6.88925, 576, 90),
                createDataInclinometer(7, "Azibo's dam", "I6", 180, 41.55676,-6.88857, 606, 90),
                createDataInclinometer(8, "Azibo's dam", "I8", 180, 41.55614,-6.88856, 576, 90),
                createDataInclinometer(9, "Azibo's dam", "I9", 180, 41.55675,-6.88767, 606, 90),
                createDataInclinometer(10, "Azibo's dam", "I10", 180, 41.55644,-6.88767, 591, 90)
            ])
        }
    }, [thirdPageActive]);

    useEffect(() => {
        //let rowsInc = new Set(rowsInclinometer);
        //console.log(rowsInc)

        let tempRowsIncFreq = [createDataIncFreq(1, "Lab Test", "I1", "2024-04-23", "10 seconds"),
            createDataIncFreq(2, "Azibo's dam", "I1", "2023-10-25", "1.7 years"),
            createDataIncFreq(3, "Azibo's dam", "I2", "2023-10-25", "1.7 years"),
            createDataIncFreq(4, "Azibo's dam", "I3", "2023-10-25", "1.7 years"),
            createDataIncFreq(5, "Azibo's dam", "I4", "2023-10-25", "1.7 years"),
            createDataIncFreq(6, "Azibo's dam", "I5", "2023-10-25", "1.7 years"),
            createDataIncFreq(7, "Azibo's dam", "I6", "2016-06-23", "1.7 years"),
            createDataIncFreq(8, "Azibo's dam", "I8", "2023-10-25", "1.7 years"),
            createDataIncFreq(9, "Azibo's dam", "I9", "2023-10-25", "1.7 years"),
            createDataIncFreq(10, "Azibo's dam", "I10", "2016-06-23", "1.7 years")
        ]

        if(checkedGroupsInclinometer.length > 0){
            let newRowsIncFreq = [];
            for(let i = 0; i < checkedGroupsInclinometer.length; i++){
                let newRow = tempRowsIncFreq[checkedGroupsInclinometer[i]-1]
                newRowsIncFreq.push(newRow)
            }
            setRowsIncFreq(newRowsIncFreq)
        } else {
            setRowsIncFreq(tempRowsIncFreq)
        }
    }, [fourthPageActive]);

    useEffect(() => {
        setRowsSensor([createDataSensorSpacing(1, -1, 17.5, 452.25, true)])
    }, [fifthPageActive]);

    const handleSensorSpacingSet = (sensorId: number, newValue: number) => {

    }

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof MonitoringGroup,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleRequestSortSensor = (
        event: React.MouseEvent<unknown>,
        property: keyof SensorSpacing,
    ) => {
        const isAsc = orderBySensor === property && orderSensor === 'asc';
        setOrderSensor(isAsc ? 'desc' : 'asc');
        setOrderBySensor(property);
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

    const handleChangePageSensor = (event: unknown, newPage: number) => {
        setPageSensor(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeRowsPerPageSensor = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageSensor(parseInt(event.target.value, 10));
        setPageSensor(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDense(event.target.checked);
    };

    const handleChangeDenseSensor = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDenseSensor(event.target.checked);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = React.useMemo(
        () => rows.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage],
    );

    const emptyRowsSensor =
        pageSensor > 0 ? Math.max(0, (1 + pageSensor) * rowsPerPageSensor - rowsSensor.length) : 0;

    const visibleRowsSensor = React.useMemo(
        () => rowsSensor.slice().sort(getComparator(orderSensor, orderBySensor)).slice(
            pageSensor * rowsPerPageSensor,
            pageSensor * rowsPerPageSensor + rowsPerPageSensor),
        [rowsSensor, orderSensor, orderBySensor, pageSensor, rowsPerPageSensor],
    );


    const handleDelete = () => {
        const newRows = rows.filter((row) => !selected.includes(row.id));
        setRows(newRows);
        setSelected([]);
        setCheckedGroups([]);
    };

    const handleSubmitGroups = () => {
        if(checkedGroups.length === 0){
            setGroupSelected(false);
            /*setAlertNothingSelected(true);
            setTimeout(() => {
                setAlertNothingSelected(false);
            }, 5000);*/
        }else{
            setGroupSelected(true);
            let tempRows = []
            let checkedGroupsSet = new Set(checkedGroups);

            /*for (let i = 0; i < rows.length; i++) {
                if (checkedGroupsSet.has(rows[i].id)) {
                    for(let j = 0; j < monitoringProfilesTableData.length; j++) {
                        if(monitoringProfilesTableData[j].group === rows[i].group){
                            tempRows.push(monitoringProfilesTableData[j]);
                        }
                    }
                }
            }*/

            //setRows(tempRows);
            setSecondPageActive(true);
            setFirstPageActive(false);
        }
    }

    const handleSubmitMeasurements = () => {
        if(checkedGroupsMeasurement.length === 0){
            setGroupSelectedMeasurement(false);
            /*setAlertNothingSelected(true);
            setTimeout(() => {
                setAlertNothingSelected(false);
            }, 5000);*/
        }else{
            setGroupSelectedMeasurement(true);
            let tempRows = []
            let checkedMeasurementsSet = new Set(checkedGroupsMeasurement);

            /*for (let i = 0; i < rows.length; i++) {
                if (checkedGroupsSet.has(rows[i].id)) {
                    for(let j = 0; j < monitoringProfilesTableData.length; j++) {
                        if(monitoringProfilesTableData[j].group === rows[i].group){
                            tempRows.push(monitoringProfilesTableData[j]);
                        }
                    }
                }
            }*/

            //setRows(tempRows);
            setThirdPageActive(true);
            setSecondPageActive(false);
        }
    }

    const handleSubmitIncs = () => {
        if(checkedGroupsInclinometer.length === 0){
            setGroupSelectedInclinometer(false);
            /*setAlertNothingSelected(true);
            setTimeout(() => {
                setAlertNothingSelected(false);
            }, 5000);*/
        }else{
            setGroupSelectedInclinometer(true);
            let tempRows = []
            let checkedInclinometerSet = new Set(checkedGroupsInclinometer);

            /*for (let i = 0; i < rows.length; i++) {
                if (checkedGroupsSet.has(rows[i].id)) {
                    for(let j = 0; j < monitoringProfilesTableData.length; j++) {
                        if(monitoringProfilesTableData[j].group === rows[i].group){
                            tempRows.push(monitoringProfilesTableData[j]);
                        }
                    }
                }
            }*/

            //setRows(tempRows);
            setFourthPageActive(true);
            setThirdPageActive(false);
        }
    }

    const handleClickInc = (rowId: number) => {
        setFifthPageActive(true);
        setFourthPageActive(false);
    }

    const handleBackButtonToFirst = () => {
        setFirstPageActive(true);
        setSecondPageActive(false);
    }

    const handleBackButtonToSecond = () => {
        setSecondPageActive(true);
        setThirdPageActive(false);
    }

    const handleBackButtonToThird = () => {
        setThirdPageActive(true);
        setFourthPageActive(false);
    }

    const handleBackButtonToFourth = () => {
        setFourthPageActive(true);
        setFifthPageActive(false);
    }


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: SoilItem) => {
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', '');
        }
        setDraggingSoilItem(item);
    };
    const handleDragEnd = () => {
        setDraggingSoilItem(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        (e as unknown as DragEvent).preventDefault();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: SoilItem) => {
        //const { draggingItem, items } = this.state;
        if (!draggingSoilItem) return;

        const currentIndex = soilItems.indexOf(draggingSoilItem);
        const targetIndex = soilItems.indexOf(targetItem);

        if (currentIndex !== -1 && targetIndex !== -1) {
            soilItems.splice(currentIndex, 1);
            soilItems.splice(targetIndex, 0, draggingSoilItem);
            setSoilItems(soilItems);
        }
    };

    /*const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItemName(e.target.value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItemImage(e.target.value);
    };*/

    const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSymbol(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

    const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setThickness(parseFloat(e.target.value));
    };

    const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopLevel(parseFloat(e.target.value));
    };

    const addNewSoilItem = () => {
        if(newSymbol !== '' && newColor !== '' && newDescription !== '' && newThickness !== 0 && newTopLevel !== 0){

        const newSoilItemId = Math.max(...soilItems.map((item) => item.id)) + 1;
        const newSoilItem: SoilItem = {
            id: newSoilItemId,
            symbol: newSymbol,
            color: newColor,
            description: newDescription,
            thickness: newThickness,
            topLevel: newTopLevel,
        };

        setSoilItems([...soilItems, newSoilItem]);
        setSymbol('');
        setColor('');
        setDescription('');
        setThickness(0);
        setTopLevel(0);
        }
    };

    const deleteSoilItem = (id: number) => {
        setSoilItems(soilItems.filter(item => item.id !== id));
    };

    const [rotationNorth, setRotationNorth] = useState<number>(0)
    const [rotationAB, setRotationAB] = useState<number>(225);

    const handleRotateNorth = (angle: number) => {
        setRotationNorth(angle);
    };


    return (
        <div className="main-wrapper full-screen">
            {firstPageActive && (
                <div
                    className="filter-container-monitProfile">
                    <div
                        className="relative inline-block w-30 mr-2 ml-2 mb-4 align-middle select-none">
                        <button
                            type="button"
                            className="py-2 px-4  bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                            onClick={handleOpenNew}>
                            New
                            group
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
                                className='pt-1 pl-4 pb-5'>
                                <Listbox>
                                    <Listbox.Label
                                        className="text-2xl font-medium leading-6 text-gray-900 text-left">Add
                                        new
                                        group</Listbox.Label>
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
                            <>
                                <FormControl
                                    sx={{
                                        mt: 2,
                                        mb: 2,
                                        ml: 2,
                                        width: 300
                                    }}>
                                    <InputLabel id="district-select-label">District *</InputLabel>
                                    <Select
                                        labelId="district-select-label"
                                        id="district-select"
                                        value={selectedDistrict}
                                        onChange={handleChangeDistrict}
                                        input={<OutlinedInput label="District *" />}
                                    >
                                        {Object.keys(districtsData).map((district) => (
                                            <MenuItem key={district} value={district}>
                                                {district}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl
                                    sx={{
                                        mt: 2,
                                        mb: 2,
                                        ml: 2,
                                        width: 300
                                    }}>
                                    <InputLabel id="region-select-label">Region *</InputLabel>
                                    <Select
                                        labelId="region-select-label"
                                        id="region-select"
                                        multiple
                                        value={selectedRegion}
                                        onChange={handleChangeRegion}
                                        input={<OutlinedInput id="select-multiple-chip" label="Region *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {regions.map((region) => (
                                            <MenuItem key={region} value={region}>
                                                {region}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                            {!missingFieldDescription ? (
                                <>
                                    <TextField
                                        required
                                        id="outlined-required"
                                        label="Description"
                                        onChange={(e) => handleDescription(e.target.value)}
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
                                        group
                                        name.
                                    </Box>
                                </>
                            )}
                            <div
                                className="submit-button">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleSubmitGroup}
                                >
                                    Submit
                                </button>
                            </div>
                        </Box>
                    </Modal>
                    <div
                        className="relative inline-block w-30 mr-2 ml-2 mb-4 align-middle select-none">
                        <button
                            type="button"
                            className="py-2 px-4  bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                            onClick={handleOpenEdit}>
                            Edit
                            existing
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
                            }}
                        >
                            <IconButton
                                className="close-button"
                                aria-label="close"
                                onClick={handleCloseEdit}
                            >
                                <Clear/>
                            </IconButton>
                            <div
                                className='pt-1 pl-18 pb-5'>
                                <Listbox>
                                    <Listbox.Label
                                        className="text-2xl font-medium leading-6 text-gray-900 text-left">Edit group</Listbox.Label>
                                </Listbox>
                            </div>
                            <div
                                className="pt-1 pl-4 pr-4">
                                <FormControl
                                    sx={{
                                        mb: 3,
                                        width: '100%'
                                    }}>
                                    <InputLabel
                                        id="group-select-label">Select
                                        Group
                                        *</InputLabel>
                                    <Select
                                        labelId="group-select-label"
                                        id="group-select"
                                        value={selectedGroup}
                                        onChange={handleSelectGroup}
                                        input={
                                            <OutlinedInput
                                                label="Select Group *"/>}
                                    >
                                        {rows.map((group) => (
                                            <MenuItem
                                                key={group.id}
                                                value={group.id}>
                                                {group.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <TextField
                                required
                                id="outlined-required"
                                label="Group Name"
                                value={groupName}
                                onChange={(e) => handleGroupName(e.target.value)}
                                sx={{
                                    mb: 2,
                                    ml: 2,
                                    width: 300,
                                }}
                            />
                            <FormControl
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    ml: 2,
                                    width: 300
                                }}>
                                <InputLabel
                                    id="district-select-label">District
                                    *</InputLabel>
                                <Select
                                    labelId="district-select-label"
                                    id="district-select"
                                    value={selectedDistrict}
                                    onChange={handleChangeDistrict}
                                    input={
                                        <OutlinedInput
                                            label="District *"/>}
                                >
                                    {Object.keys(districtsData).map((district) => (
                                        <MenuItem
                                            key={district}
                                            value={district}>
                                            {district}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    ml: 2,
                                    width: 300
                                }}>
                                <InputLabel
                                    id="region-select-label">Region
                                    *</InputLabel>
                                <Select
                                    labelId="region-select-label"
                                    id="region-select"
                                    multiple
                                    value={selectedRegion}
                                    onChange={handleChangeRegion}
                                    input={
                                        <OutlinedInput
                                            id="select-multiple-chip"
                                            label="Region *"/>}
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
                                >
                                    {regions.map((region) => (
                                        <MenuItem
                                            key={region}
                                            value={region}>
                                            {region}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                required
                                id="outlined-required"
                                label="Description"
                                value={description}
                                onChange={(e) => handleDescription(e.target.value)}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    ml: 2,
                                    width: 300,
                                }}
                            />
                            <div
                                className="submit-button">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg"
                                    onClick={handleSubmitGroupEdit}
                                >
                                    Save
                                    Changes
                                </button>
                            </div>
                        </Box>
                    </Modal>
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
                                                        align="left">{row.name}</TableCell>
                                                    <TableCell
                                                        align="center">{row.region}</TableCell>
                                                    <TableCell
                                                        align="center">{row.description}</TableCell>
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
                    <div>
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
                </div>)}
            {secondPageActive && (
                <div
                    className="filter-container-monitProfile">
                <div
                    className="relative inline-block w-30 mr-2 ml-2 mb-4 align-middle select-none">
                    <button
                        type="button"
                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                        onClick={handleBackButtonToFirst}>
                        <ArrowBack
                            sx={{color: 'white'}}/>
                        Back
                        to
                        Groups
                    </button>
                </div>
                    <Box
                    sx={{width: '100%'}}>
                    <Paper
                        sx={{
                            width: '100%',
                            mb: 2
                        }}>
                        <EnhancedTableToolbarMeasurement
                            numSelected={selected.length}
                            onDelete={handleDelete}
                        />
                        <TableContainer>
                            <Table
                                sx={{minWidth: 750}}
                                aria-labelledby="tableTitle"
                                size={dense ? 'small' : 'medium'}
                            >
                                <EnhancedTableHeadMeasurement
                                    numSelected={selected.length}
                                    order={orderMeasurement}
                                    orderBy={orderByMeasurement}
                                    onSelectAllClick={handleSelectAllClickMeasurement}
                                    onRequestSort={handleRequestSortMeasurement}
                                    rowCount={rowsMeasurement.length}
                                />
                                <TableBody>
                                    {visibleRowsMeasurement.map((row, index) => {
                                        const isItemSelected = isSelected(row.id);
                                        if (isItemSelected && !checkedGroupsMeasurement.includes(row.id)) {
                                            let tempCheck = checkedGroupsMeasurement;
                                            tempCheck.push(row.id);
                                            setCheckedGroupsMeasurement(tempCheck);
                                        } else if (!isItemSelected && checkedGroupsMeasurement.includes(row.id)) {
                                            let tempCheck = checkedGroupsMeasurement;
                                            tempCheck = tempCheck.filter(toRemove => toRemove !== row.id);
                                            setCheckedGroupsMeasurement(tempCheck);
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
                                                    align="left">{row.measurement}</TableCell>
                                                <TableCell
                                                    align="center">{row.host}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {emptyRowsMeasurement > 0 && (
                                        <TableRow
                                            style={{
                                                height: (dense ? 33 : 53) * emptyRowsMeasurement,
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
                            count={rowsMeasurement.length}
                            rowsPerPage={rowsPerPageMeasurement}
                            page={pageMeasurement}
                            onPageChange={handleChangePageMeasurement}
                            onRowsPerPageChange={handleChangeRowsPerPageMeasurement}
                        />
                    </Paper>
                </Box>
                    <div>
                        <button
                            type="button"
                            className="py-3 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                            onClick={handleSubmitMeasurements}
                        >
                            Define
                            selected
                            measurements
                        </button>
                    </div>
                </div>)}
            {thirdPageActive && (
                <div
                    className="filter-container-monitProfile">
                <div
                    className="relative inline-block w-30 mr-2 ml-2 mb-4 align-middle select-none">
                    <button
                        type="button"
                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                        onClick={handleBackButtonToSecond}>
                        <ArrowBack
                            sx={{color: 'white'}}/>
                        Back
                        to
                        Available
                        Structures
                    </button>
                </div>
                    <Box
                        sx={{width: '100%'}}>
                        <Paper
                            sx={{
                                width: '100%',
                                mb: 2
                            }}>
                            <EnhancedTableToolbarInclinometer
                                numSelected={selected.length}
                                onDelete={handleDelete}
                            />
                            <TableContainer>
                                <Table
                                    sx={{minWidth: 750}}
                                    aria-labelledby="tableTitle"
                                    size={dense ? 'small' : 'medium'}
                                >
                                    <EnhancedTableHeadInclinometer
                                        numSelected={selected.length}
                                        order={orderInclinometer}
                                        orderBy={orderByInclinometer}
                                        onSelectAllClick={handleSelectAllClickInclinometer}
                                        onRequestSort={handleRequestSortInclinometer}
                                        rowCount={rowsInclinometer.length}
                                    />
                                    <TableBody>
                                        {visibleRowsInclinometer.map((row, index) => {
                                            const isItemSelected = isSelected(row.id);
                                            if (isItemSelected && !checkedGroupsInclinometer.includes(row.id)) {
                                                let tempCheck = checkedGroupsInclinometer;
                                                tempCheck.push(row.id);
                                                setCheckedGroupsInclinometer(tempCheck);
                                            } else if (!isItemSelected && checkedGroupsInclinometer.includes(row.id)) {
                                                let tempCheck = checkedGroupsInclinometer;
                                                tempCheck = tempCheck.filter(toRemove => toRemove !== row.id);
                                                setCheckedGroupsInclinometer(tempCheck);
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
                                                        align="left">{row.measurement}</TableCell>
                                                    <TableCell
                                                        align="center">{row.inclinometer}</TableCell>
                                                    <TableCell
                                                        align="center">{row.azimute}</TableCell>
                                                    <TableCell
                                                        align="center">{row.latitude}</TableCell>
                                                    <TableCell
                                                        align="center">{row.longitude}</TableCell>
                                                    <TableCell
                                                        align="center">{row.topSensor}</TableCell>
                                                    <TableCell
                                                        align="center">{row.casingAngle}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {emptyRowsInclinometer > 0 && (
                                            <TableRow
                                                style={{
                                                    height: (dense ? 33 : 53) * emptyRowsInclinometer,
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
                                count={rowsInclinometer.length}
                                rowsPerPage={rowsPerPageInclinometer}
                                page={pageInclinometer}
                                onPageChange={handleChangePageInclinometer}
                                onRowsPerPageChange={handleChangeRowsPerPageInclinometer}
                            />
                        </Paper>
                    </Box>
                    <div>
                        <button
                            type="button"
                            className="py-3 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                            onClick={handleSubmitIncs}
                        >
                            Define
                            selected
                            inclinometers
                        </button>
                    </div>
                </div>)}
            {fourthPageActive && (
                <div
                    className="filter-container-monitProfile">
                <div
                    className="relative inline-block w-30 mr-2 ml-2 mb-4 align-middle select-none">
                    <button
                        type="button"
                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                        onClick={handleBackButtonToThird}>
                        <ArrowBack
                            sx={{color: 'white'}}/>
                        Back
                        to
                        Inclinometer
                        Selection
                    </button>
                </div>
                    <Box
                        sx={{width: '100%'}}>
                        <Paper
                            sx={{
                                width: '100%',
                                mb: 2
                            }}>
                            <EnhancedTableToolbarIncFreq/>
                            <TableContainer>
                                <Table
                                    sx={{minWidth: 750}}
                                    aria-labelledby="tableTitle"
                                    size={dense ? 'small' : 'medium'}
                                >
                                    <EnhancedTableHeadIncFreq
                                        order={orderIncFreq}
                                        orderBy={orderByIncFreq}
                                        onRequestSort={handleRequestSortIncFreq}
                                        rowCount={rowsIncFreq.length}
                                    />
                                    <TableBody>
                                        {visibleRowsIncFreq.map((row, index) => {

                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <TableRow
                                                    hover
                                                    role="checkbox"
                                                    tabIndex={-1}
                                                    key={row.id}
                                                    sx={{cursor: 'pointer'}}
                                                    onClick={() => handleClickInc(row.id)}
                                                >
                                                    <TableCell
                                                        align="center">{row.measurement}</TableCell>
                                                    <TableCell
                                                        align="center">{row.inclinometer}</TableCell>
                                                    <TableCell
                                                        align="center">{row.lastRecord}</TableCell>
                                                    <TableCell
                                                        align="center">{row.avgFrequency}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {emptyRowsIncFreq > 0 && (
                                            <TableRow
                                                style={{
                                                    height: (dense ? 33 : 53) * emptyRowsIncFreq,
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
                                count={rowsIncFreq.length}
                                rowsPerPage={rowsPerPageIncFreq}
                                page={pageIncFreq}
                                onPageChange={handleChangePageIncFreq}
                                onRowsPerPageChange={handleChangeRowsPerPageIncFreq}
                            />
                        </Paper>
                    </Box>
                </div>)}
            {fifthPageActive && (
                <>
                    <div
                        className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                        <button
                            type="button"
                            className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                            onClick={handleBackButtonToFourth}>
                            <ArrowBack
                                sx={{color: 'white'}}/>
                            Back
                            to
                            individual
                            selection
                        </button>
                    </div>
                    <div
                        className="filter-container-settings">
                        <ul className="flex flex-wrap text-base font-medium text-center text-gray-500 border-gray-200 border-black border"
                            style={{}}>
                            <li className="">
                                <a
                                    onClick={() => {
                                        setSelectedSettingTab(1);
                                        //handleToogleSelectDates();
                                    }}
                                    className={`inline-block p-4 border-r border-black cursor-pointer ${selectedSettingTab === 1
                                        ? 'text-white bg-emerald-500'
                                        : 'text-black bg-emerald-200 hover:text-white hover:bg-emerald-700' +
                                        ''}`}>
                                    General Settings
                                </a>
                            </li>
                            <li className="">
                                <a
                                    onClick={() => {
                                        setSelectedSettingTab(2);
                                        //handleToogleSelectDates();
                                    }}
                                    className={`inline-block p-4 border-r border-black cursor-pointer ${selectedSettingTab === 2
                                        ? 'text-white bg-emerald-500'
                                        : 'text-black bg-emerald-200 hover:text-white hover:bg-emerald-700'}`}>
                                    Sensors Spacing
                                </a>
                            </li>
                            <li className="">
                                <a
                                    onClick={() => {
                                        setSelectedSettingTab(3);
                                        //handleToogleSelectDates();
                                    }}
                                    className={`inline-block p-4 cursor-pointer ${selectedSettingTab === 3
                                        ? 'text-white bg-emerald-500'
                                        : 'text-black bg-emerald-200 hover:text-white hover:bg-emerald-700'}`}>
                                    Soil Layers
                                </a>
                            </li>
                        </ul>
                    </div>
                    {selectedSettingTab === 1 && (
                        <div
                            className="container-form-maps">
                            <div
                                className="form-container">
                                <div
                                    className="form-group">
                                    <label>Azimuth
                                        (°)</label>
                                    <input
                                        type="text"
                                        value={azimute}
                                        onChange={(e) => handleChangeGS(e, setAzimute)}
                                    />
                                </div>
                                <div
                                    className="form-group">
                                    <label>Latitude</label>
                                    <input
                                        type="text"
                                        value={latitude}
                                        onChange={(e) => handleChangeGS(e, setLatitude)}
                                    />
                                </div>
                                <div
                                    className="form-group">
                                    <label>Longitude</label>
                                    <input
                                        type="text"
                                        value={longitude}
                                        onChange={(e) => handleChangeGS(e, setLongitude)}
                                    />
                                </div>
                                <div
                                    className="form-group">
                                    <label>Level
                                        of
                                        top
                                        sensor
                                        (m)</label>
                                    <input
                                        type="text"
                                        value={levelOfTopSensor}
                                        onChange={(e) => handleChangeGS(e, setLevelOfTopSensor)}
                                    />
                                </div>
                                <div
                                    className="form-group">
                                    <label>Casing
                                        angle
                                        to
                                        horizontal
                                        plane</label>
                                    <input
                                        type="text"
                                        value={casingAngle}
                                        onChange={(e) => handleChangeGS(e, setCasingAngle)}
                                    />
                                </div>
                                <div
                                    className="relative inline-block w-20 mr-2 align-middle select-none">
                                    <button
                                        type="button"
                                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                        onClick={handleSaveGeneralSettings}>
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="azimute-settings">
                            <div
                                className="azimute">
                                <img
                                    src="/azimuteWithoutArrow.png"
                                    width="200"
                                    height="200"
                                    className="base-image"
                                    style={{transform: `rotate(${rotationAB}deg)`}}
                                />
                                <img
                                    src="/azimuteArrow.png"
                                    width="60"
                                    height="60"
                                    className="overlay-image"
                                    style={{transform: `translate(-50%, -50%) rotate(${rotationNorth}deg)`}}
                                />
                            </div>
                            </div>
                            <div
                                className="maps"
                                style={{
                                    width: '400px',
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
                                    {markers.map((marker, index) => (
                                        <Marker
                                            key={index}
                                            position={marker}
                                            icon={/*new Icon({
                                                        iconUrl: '/marker-icon-green.png',*/
                                                createCustomIcon(index)}
                                            //iconSize: [25, 41],
                                            //iconAnchor: [12, 41]
                                            //})}
                                        >
                                            <Popup>
                                                <div
                                                    style={{width: '180px'}}>
                                                    <h3 style={{
                                                        textAlign: 'center',
                                                        fontSize: '20px'
                                                    }}>Inclinometer</h3>
                                                    <p style={{
                                                        textAlign: 'center'
                                                    }}>Location: {marker.lat}, {marker.lng}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                    <RecenterMap markers={markers} />
                                </MapContainer>
                            </div>
                        </div>
                    )}
                    {selectedSettingTab === 2 && (
                            <div
                                className="filter-container-sensorSpacing">
                                <Box
                                    sx={{width: '100%'}}>
                                    <Paper
                                        sx={{
                                            width: '100%',
                                            mb: 2
                                        }}>
                                        <EnhancedTableToolbarSensor/>
                                        <TableContainer>
                                            <Table
                                                sx={{minWidth: 750}}
                                                aria-labelledby="tableTitle"
                                                size={dense ? 'small' : 'medium'}
                                            >
                                                <EnhancedTableHeadSensor
                                                    order={orderSensor}
                                                    orderBy={orderBySensor}
                                                    onRequestSort={handleRequestSortSensor}
                                                    rowCount={rowsSensor.length}
                                                />
                                                <TableBody>
                                                    {visibleRowsSensor.map((row, index) => {

                                                        const labelId = `enhanced-table-checkbox-${index}`;

                                                        return (
                                                            <TableRow
                                                                hover
                                                                role="checkbox"
                                                                tabIndex={-1}
                                                                key={row.id}
                                                                sx={{cursor: 'pointer'}}
                                                            >
                                                                <TableCell
                                                                    align="center">{row.id}</TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <input
                                                                        type="number"
                                                                        value={row.spacing !== -1 ? row.spacing : ''}
                                                                        onChange={event => handleSensorSpacingSet(row.id, Number(event.target.value))}
                                                                        className="input-field-sensorSpacing"
                                                                    />
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center">{row.depth}</TableCell>
                                                                <TableCell
                                                                    align="center">{row.level}</TableCell>
                                                                <TableCell
                                                                    align="center">
                                                                    <IconButton
                                                                        className="hasImage-button"
                                                                        aria-label="close"
                                                                        style={{paddingRight: row.referencePoint ? '0px': '40px'}}>
                                                                        {row.referencePoint ?
                                                                            <CheckBoxRounded/> :
                                                                            <CheckBoxOutlineBlankRounded/>}
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {emptyRowsSensor > 0 && (
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
                                            count={rowsSensor.length}
                                            rowsPerPage={rowsPerPageSensor}
                                            page={pageSensor}
                                            onPageChange={handleChangePageSensor}
                                            onRowsPerPageChange={handleChangeRowsPerPageSensor}
                                        />
                                    </Paper>
                                </Box>
                            </div>
                    )}
                    {selectedSettingTab === 3 && (
                        <div
                            className="container-sortable-list">
                            <div
                                className="sortable-list">
                                <div
                                    className="new-item">
                                    <div
                                        className="input-container">
                                        <div
                                            className="input-group">
                                            <label
                                                className="input-label">Symbol</label>
                                            <input
                                                type="text"
                                                placeholder="Symbol"
                                                value={newSymbol}
                                                onChange={handleSymbolChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div
                                            className="input-group">
                                            <label
                                                className="input-label">Color</label>
                                            <input
                                                type="color"
                                                value={newColor}
                                                onChange={handleColorChange}
                                                className="input-field color-input"
                                            />
                                        </div>
                                        <div
                                            className="input-group">
                                            <label
                                                className="input-label">Description</label>
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={newDescription}
                                                onChange={handleDescriptionChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div
                                            className="input-group">
                                            <label
                                                className="input-label">Thickness</label>
                                            <input
                                                type="number"
                                                placeholder="Thickness"
                                                value={newThickness}
                                                onChange={handleThicknessChange}
                                                className="input-field-numbers"
                                            />
                                        </div>
                                        <div
                                            className="input-group">
                                            <label
                                                className="input-label">Top
                                                Level</label>
                                            <input
                                                type="number"
                                                placeholder="Top Level"
                                                value={newTopLevel}
                                                onChange={handleTopLevelChange}
                                                className="input-field-numbers"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={addNewSoilItem}
                                        className="add-button">
                                        Add
                                        New
                                        Soil
                                        Layer
                                    </button>
                                </div>
                                <div
                                    className="item-labels">
                                    <span
                                        className="label-openwith"/>
                                    <span
                                        className="label-symbol">Symbol</span>
                                    <span
                                        className="label-color">Color</span>
                                    <span
                                        className="label-description">Description</span>
                                    <span
                                        className="label-thickness">Thickness</span>
                                    <span
                                        className="label-topLevel">Top Level</span>
                                    <span
                                        className="label-delete"/>
                                </div>
                                {soilItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`item ${item === draggingSoilItem ? 'dragging' : ''}`}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, item)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, item)}
                                    >
                                        <div
                                            className="details"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                            <OpenWith
                                                style={{marginRight: '20px'}}/>
                                            <span
                                                className="detail-symbol">{item.symbol}</span>
                                            <div
                                                className="detail-color"
                                                style={{backgroundColor: item.color}}/>
                                            <span
                                                className="detail-description">{item.description}</span>
                                            <span
                                                className="detail-thickness">{item.thickness}</span>
                                            <span
                                                className="detail-topLevel">{item.topLevel}</span>
                                            <Close
                                                onClick={() => deleteSoilItem(item.id)}
                                                style={{marginLeft: 'auto'}}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MonitGroups;