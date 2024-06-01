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
    useTheme, Chip, OutlinedInput, Alert, AlertTitle, Slide
} from "@mui/material";
import React, {Fragment, useEffect, useState} from "react";
import {visuallyHidden} from "@mui/utils";
import {Clear, Delete, FilterList} from "@mui/icons-material";
import {Listbox} from "@headlessui/react";
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/react/20/solid";


const testData = [createData(1, 'Profiles1', 2, 40),
    createData(2, 'Profiles2', 1, 30)];

const testIncValues = ['PK150_200', 10, "PK250_300", 30];

const testMeasurements = ['PK150_200', "PK250_300"];

interface MonitoringProfiles {
    id: number;
    group: string;
    measurements: number;
    measurementsList: string[];
    inclinometers: number;
}

function createDataMP(
    id: number,
    group: string,
    measurements: number,
    measurementsList: string[],
    inclinometers: number,
): MonitoringProfiles {
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
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
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
                            'aria-label': 'select all desserts',
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
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
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
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    Select from existing monitoring profiles
                </Typography>
            )}
            {numSelected > 0 && (
                <Tooltip title="Delete">
                    <IconButton>
                        <Delete/>
                    </IconButton>
                </Tooltip>
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
    const [monitoringProfiles, setMonitoringProfiles] = React.useState<MonitoringProfiles[]>([]);

    useEffect(() => {
        setRows([createData(1, 'Profiles1', 2, 10),
            createData(2, 'Profiles2', 1, 30)]);
        setMonitoringProfiles([createDataMP(1, 'Profiles1', 2, ['PK150_200', 'PK250_300'], 10),
            createDataMP(2, 'Profiles2', 1, ['PK250_300'], 30)]);
    }, [page]);

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

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = React.useMemo(
        () => rows.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage],
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
        setSelectedMPEdit(createDataMP(0, '', 0, [], 0))

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

    const [selectedMPEdit, setSelectedMPEdit] = useState<MonitoringProfiles>(createDataMP(0, '', 0, [], 0));
    const [selectedGroupEdit, setSelectedGroupEdit] = useState<string>('');
    const [selectedMeasurementsEdit, setSelectedMeasurementsEdit] = useState<string[]>([]);
    const [selectedInclinometersEdit, setSelectedInclinometersEdit] = useState<number>(0);
    const [selectedMPEditOld, setSelectedMPEditOld] = useState<MonitoringProfiles>(createDataMP(0, '', 0, [], 0));
    const [selectedGroupEditOld, setSelectedGroupEditOld] = useState<string>('');
    const [selectedMeasurementsEditOld, setSelectedMeasurementsEditOld] = useState<string[]>([]);
    const [selectedInclinometersEditOld, setSelectedInclinometersEditOld] = useState<number>(0);

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
            tempMP.push(createDataMP(monitoringProfiles.length + 1, groupName, selectedMeasurements.length, selectedMeasurements, selectedInclinometers));
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
            let tempCreateDataMP = createDataMP(monitoringProfiles.length + 1, selectedGroupEdit, selectedMeasurementsEdit.length, selectedMeasurementsEdit, selectedInclinometersEdit);
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

    return (
        <div className="main-wrapper">
            {alertSuccessVisible && (
                <Slide direction="left" in={alertSuccessVisible} mountOnEnter unmountOnExit>
                <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                    <Alert severity="success"  sx={{ alignItems: 'center' }}>
                        <AlertTitle sx={{ textAlign: 'left' }}>Success</AlertTitle>
                        The monitoring profile was successfully added.
                    </Alert>
                </Box>
                </Slide>
            )}
            {alertSuccessEditVisible && (
                <Slide direction="left" in={alertSuccessEditVisible} mountOnEnter unmountOnExit>
                    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                        <Alert severity="success"  sx={{ alignItems: 'center' }}>
                            <AlertTitle sx={{ textAlign: 'left' }}>Success</AlertTitle>
                            The monitoring profile was successfully updated.
                        </Alert>
                    </Box>
                </Slide>
            )}
            {alertFailedVisible && (
                <Slide direction="left" in={alertFailedVisible} mountOnEnter unmountOnExit>
                <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                    <Alert severity="error"  sx={{ alignItems: 'center' }}>
                        <AlertTitle sx={{ textAlign: 'left' }}>Error</AlertTitle>
                        Some values may be missing. Please fill all the required fields.
                    </Alert>
                </Box>
                </Slide>
            )}
            {alertFailedSelectVisible && (
                <Slide direction="left" in={alertFailedSelectVisible} mountOnEnter unmountOnExit>
                    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                        <Alert severity="error"  sx={{ alignItems: 'center' }}>
                            <AlertTitle sx={{ textAlign: 'left' }}>Error</AlertTitle>
                            Choose the desired monitoring profile in order to edit the fields.
                        </Alert>
                    </Box>
                </Slide>
            )}
            <div className="">
            <div
                className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                <button type="button"
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
                    <Box sx={{
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
                        <IconButton className="close-button" aria-label="close" onClick={handleCloseNew}>
                            <Clear />
                        </IconButton>
                        <div className='pt-1 pl-10 pb-5'>
                            <Listbox>
                                <Listbox.Label
                                    className="pr-1 text-2xl font-medium leading-6 text-gray-900 text-left">Add monitoring profile</Listbox.Label>
                            </Listbox>
                        </div>
                        {!missingFieldGroupName ? (
                            <>
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Group Name"
                                    onChange={(e) => handleGroupName(e.target.value)}
                                    sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}
                                />
                            </>
                        ) : (
                            <>
                                <TextField
                                    error
                                    id="outlined-error-text"
                                    label="Group Name *"
                                    sx={{ mt: 2, ml: 2, width: 300 }}
                                />
                                <Box sx={{ color: 'red', mt: 1, ml: 2 }}>
                                    Missing group name.
                                </Box>
                            </>
                        )}
                        {!missingFieldMeasurements ? (
                            <>
                        <FormControl sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}>
                            <InputLabel id="multiple-chip-label">Measurements *</InputLabel>
                            <Select
                                labelId="multiple-chip-label"
                                id="multiple-chip"
                                multiple
                                value={selectedMeasurements}
                                onChange={handleChange}
                                input={<OutlinedInput id="select-multiple-chip" label="Measurements *" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
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
                                <FormControl error sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}>
                                    <InputLabel id="multiple-chip-label">Measurements *</InputLabel>
                                    <Select
                                        labelId="multiple-chip-label"
                                        id="multiple-chip"
                                        multiple
                                        value={selectedMeasurements}
                                        onChange={handleChange}
                                        input={<OutlinedInput id="select-multiple-chip" label="Measurements *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
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
                                    <Box sx={{ color: 'red', mt: 1 }}>
                                        Missing measurement(s).
                                    </Box>
                                </FormControl>
                            </>
                        )}
                        <TextField
                            disabled
                            id="outlined-disabled"
                            label={selectedInclinometers === 0 ? 'Inclinometers' : selectedInclinometers.toString()}
                            sx={{ mt: 2, mb: 2, ml: 2, width: selectedInclinometers === 0 ? 130 : ((selectedInclinometers < 100) ? 50 : 60)}}
                        />
                        {errorMessage && (
                            <Box sx={{ color: 'red', mt: 2, ml: 2 }}>
                                {errorMessage}
                            </Box>
                        )}
                        <div className="submit-button">
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
                <button type="button"
                        className="py-2 px-4  bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                        onClick={handleOpenEdit}>
                    Edit existing profile
                </button>
            </div>
                <Modal
                    open={openEdit}
                    onClose={handleCloseEdit}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{
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
                        <IconButton className="close-button" aria-label="close" onClick={handleCloseEdit}>
                            <Clear />
                        </IconButton>
                        <div className='pt-1 pl-10 '>
                            <Listbox>
                                <Listbox.Label
                                    className="pr-1 text-2xl font-medium leading-6 text-gray-900 text-left">Edit a monitoring profile</Listbox.Label>
                            </Listbox>
                        </div>
                        <div className='pl-4 pr-4 pb-5 pt-5'>
                            <Box sx={{ mb: 2 }}>
                                Select a monitoring profile:
                            </Box>
                        <FormControl fullWidth>
                            <InputLabel id="simple-select-label">Group</InputLabel>
                            <Select
                                labelId="simple-select-label"
                                id="simple-select"
                                value={selectedMPEdit.group}
                                label="Group"
                                onChange={(e) => handleSelectedMPEdit(e.target.value)}
                            >
                                {monitoringProfiles.map((m) => (
                                    <MenuItem key={m.id} value={m.group}>{m.group}</MenuItem>
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
                                    sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}
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
                                    sx={{ mt: 2, ml: 2, width: 300 }}
                                />
                                <Box sx={{ color: 'red', mt: 1, ml: 2 }}>
                                    Missing group name.
                                </Box>
                            </>
                        )}
                        {!missingFieldMeasurements ? (
                            <>
                                <FormControl sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}>
                                    <InputLabel id="multiple-chip-label">Measurements *</InputLabel>
                                    <Select
                                        labelId="multiple-chip-label"
                                        id="multiple-chip"
                                        multiple
                                        key={selectedMPEdit.group}
                                        defaultValue={selectedMeasurementsEdit}
                                        onChange={handleChangeEdit}
                                        input={<OutlinedInput id="select-multiple-chip" label="Measurements *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
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
                                <FormControl error sx={{ mt: 2, mb: 2, ml: 2, width: 300 }}>
                                    <InputLabel id="multiple-chip-label">Measurements *</InputLabel>
                                    <Select
                                        labelId="multiple-chip-label"
                                        id="multiple-chip"
                                        multiple
                                        key={selectedMeasurementsEdit.length !== 0 ? selectedMeasurementsEdit[selectedMeasurementsEdit.length] :"id"}
                                        defaultValue={selectedMeasurementsEdit}
                                        onChange={handleChangeEdit}
                                        input={<OutlinedInput id="select-multiple-chip" label="Measurements *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
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
                                    <Box sx={{ color: 'red', mt: 1 }}>
                                        Missing measurement(s).
                                    </Box>
                                </FormControl>
                            </>
                        )}
                        <TextField
                            disabled
                            id="outlined-disabled"
                            label={selectedInclinometersEdit === 0 ? 'Inclinometers' : selectedInclinometersEdit.toString()}
                            sx={{ mt: 2, mb: 2, ml: 2, width: selectedInclinometersEdit === 0 ? 130 : ((selectedInclinometersEdit < 100) ? 50 : 60)}}
                        />
                        {errorMessage && (
                            <Box sx={{ color: 'red', mt: 2, ml: 2 }}>
                                {errorMessage}
                            </Box>
                        )}
                        <div className="submit-button">
                            <button
                                type="button"
                                className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                onClick={handleSubmitEdit}
                            >
                                Submit
                            </button>
                        </div>
                    </Box>
                </Modal>
            </div>
        <div className="filter-container-monitProfile">
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
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
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="left">{row.group}</TableCell>
                                        <TableCell align="center">{row.measurements}</TableCell>
                                        <TableCell align="center">{row.inclinometers}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
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
        </div>
            <div className="flex-grow"></div>
        </div>
    );
}

export default MonitoringProfiles;
