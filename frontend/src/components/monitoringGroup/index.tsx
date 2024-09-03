import React, {
    DragEventHandler,
    useEffect,
    useState
} from "react";
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
    Tooltip,
    Typography
} from "@mui/material";
import {
    visuallyHidden
} from "@mui/utils";
import {
    ArrowBack,
    CheckBoxOutlineBlankRounded,
    CheckBoxRounded,
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
    description: string;
    databaseId: number;
}

function createData(
    id: number,
    name: string,
    region: string,
    description: string,
    databaseId: number,
): MonitoringGroup {
    return {
        id,
        name,
        region,
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

    //Pages
    const [firstPageActive, setFirstPageActive] = React.useState(false); // colocar true
    const [secondPageActive, setSecondPageActive] = React.useState(false);
    const [thirdPageActive, setThirdPageActive] = React.useState(false);
    const [fourthPageActive, setFourthPageActive] = React.useState(false);
    const [fifthPageActive, setFifthPageActive] = React.useState(true); // true para testar

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

    //Second page - available measurements
    const [orderMeasurement, setOrderMeasurement] = React.useState<Order>('asc');
    const [orderByMeasurement, setOrderByMeasurement] = React.useState<keyof Measurement>('id');
    const [selectedMeasurement, setSelectedMeasurement] = React.useState<readonly number[]>([]);
    const [pageMeasurement, setPageMeasurement] = React.useState(0);
    const [denseMeasurement, setDenseMeasurement] = React.useState(false);
    const [rowsPerPageMeasurement, setRowsPerPageMeasurement] = React.useState(5);
    const [rowsMeasurement, setRowsMeasurement] = React.useState<Measurement[]>([]);
    const [checkedGroupsMeasurement, setCheckedGroupsMeasurement] = useState<number[]>([])
    const [groupSelectedMeasurement, setGroupSelectedMeasurement
    ] = useState<boolean>(false);


    //Third page - select inclinometers from measurements


    //Fourth page - set general settings of selected inclinometers


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
        setRows([createData(1, "A12_PK150aPK300", "Macedo de Cavaleiros", "Azibo's dam monitoring group",1)])
    }, [firstPageActive]);

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
                    className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
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
                </div>)}
            {thirdPageActive && (
                <div
                    className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
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
                </div>)}
            {fourthPageActive && (
                <div
                    className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
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
                            General
                            Settings
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