import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import React, {
    Fragment,
    PureComponent,
    useEffect,
    useRef
} from 'react';
import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps,
    Label,
    BarChart,
    Bar,
    Brush,
    ReferenceLine,
    LabelList,
    LabelProps,
    LegendProps
} from 'recharts';
import {
    DatePicker//,
    //RangeSlider,
    //Slider
} from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
//import 'rsuite/RangeSlider/styles/index.css';
//import 'rsuite/Slider/styles/index.css';
import {
    Listbox,
    Transition
} from '@headlessui/react'
import {
    CheckIcon,
    ChevronUpDownIcon
} from '@heroicons/react/20/solid'
import Slider
    from '@mui/material/Slider';
import * as Papa from 'papaparse';
import { SyncLoader } from 'react-spinners';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import {
    Table,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    TableSortLabel,
    Box,
    Toolbar,
    alpha,
    Typography,
    FormControlLabel,
    Paper,
    TablePagination,
    TableContainer,
    TableBody,
    Modal,
    Button,
    IconButton
} from '@mui/material';
import {Clear} from "@mui/icons-material";
import { visuallyHidden } from '@mui/utils';
/*
 * INCLINOMETER DATA
 */

interface InfluxDataAux {
    host: string;
    inc: string;
    result: string;
    sensorID: string;
    table: number;
    topic: string;
    _field: string;
    _measurement: string;
    _start: string;
    _stop: string;
    _time: string;
    _value: number;
}

interface InfluxDataAuxTest {
    host: string;
    result: string;
    n: string;
    table: number;
    topic: string;
    _field: string;
    _measurement: string;
    _start: string;
    _stop: string;
    _time: string;
    _value: number;
}

interface Inclinometer {
    inc: string;
    sensorID: string;
    field: string;
    measurement: string;
    time: string;
    depth: number;
    value: number;
}

interface InclinometerData {
    inc: string;
    sensorID: string;
    field: string;
    measurement: string;
    time: string;
    depth: number;
    value: number;
    cumulative: number;
    displacement: number;
    typeOfResult: string;
}

interface ABData {
    inc: string;
    sensorID: string;
    time: string;
    depth: number;
    a: number;
    b: number;
}

interface SoilData {
    id: string;
    name: string;
    depth: number;
    color: string;
}

interface Payload {
    inc: string;
    sensorID: string;
    field: string;
    measurement: string;
    time: string;
    depth: number;
    value: number;
    cumulative: number;
    displacement: number;
    typeOfResult: string;
}

interface PointData {
    index: number;
    dataKey: string;
    cx: number;
    cy: number;
    r: number;
    fill: string;
    strokeWidth: number;
    stroke: string;
    payload: Payload;
    value: number;
}

interface ChartProps {
    graphData: InclinometerData[];
    //colorArray: string[];
    loadingData: boolean;
}

interface ChartPropsInc {
    graphData: InclinometerData[];
    loadingData: boolean;
    refDate: string;
    //colorArray: string[];
}

interface ChartPropsTotal {
    graphDataX: InclinometerData[];
    graphDataY: InclinometerData[];
    loadingData: boolean;
    //colorArray: string[];
}

interface ChartPropsClock {
    graphDataA: InclinometerData[];
    graphDataB: InclinometerData[];
    loadingData: boolean;
    //colorArray: string[];
}

interface ChartPropsDetails {
    graphData: InclinometerData[];
    initialMaxDepth: number;
    minDepth: number;
    maxDepth: number;
    loadingData: boolean;
    //colorArray: string[];
}

interface ChartPropsDetailsTotal {
    graphDataX: InclinometerData[];
    graphDataY: InclinometerData[];
    initialMaxDepth: number;
    minDepth: number;
    maxDepth: number;
    loadingData: boolean;
}

interface ChartSoil {
    graphData: SoilData[];
    loadingData: boolean;
    totalChart: boolean;
    tempChart: boolean;
}

/*
 * PROFILE DATA
 */

interface ChartPropsProfileInc {
    graphData: InclinometerData[];
    loadingData: boolean;
    maxDepthOverall: number;
    maxDepthInc: number;
    maxData: number;
    inc: number;
    numberOfTotalInc: number;
    leftChart: boolean;
}

interface TableData {
    id: number;
    inc: number;
    a: number;
    b: number;
    total: number;
    direction: number;
    node: string;
    level: number;
    date: string;
}

interface TableDataA {
    id: number;
    inc: number;
    a: number;
    node: string;
    level: number;
    date: string;
}

interface TableDataB {
    id: number;
    inc: number;
    b: number;
    node: string;
    level: number;
    date: string;
}

function createTableData(
    id: number,
    inc: number,
    a: number,
    b: number,
    total: number,
    direction: number,
    node: string,
    level: number,
    date: string,
): TableData {
    return {
        id,
        inc,
        a,
        b,
        total,
        direction,
        node,
        level,
        date
    };
}

function createTableDataA(
    id: number,
    inc: number,
    a: number,
    node: string,
    level: number,
    date: string,
): TableDataA {
    return {
        id,
        inc,
        a,
        node,
        level,
        date
    };
}

function createTableDataB(
    id: number,
    inc: number,
    b: number,
    node: string,
    level: number,
    date: string,
): TableDataB {
    return {
        id,
        inc,
        b,
        node,
        level,
        date
    };
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof TableData;
    label: string;
    numeric: boolean;
}

interface HeadCellA {
    disablePadding: boolean;
    id: keyof TableDataA;
    label: string;
    numeric: boolean;
}

interface HeadCellB {
    disablePadding: boolean;
    id: keyof TableDataB;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'inc',
        numeric: true,
        disablePadding: true,
        label: 'Incl',
    },
    {
        id: 'a',
        numeric: true,
        disablePadding: false,
        label: 'A (mm)',
    },
    {
        id: 'b',
        numeric: true,
        disablePadding: false,
        label: 'B (mm)',
    },
    {
        id: 'total',
        numeric: true,
        disablePadding: false,
        label: 'Total (mm)',
    },
    {
        id: 'direction',
        numeric: true,
        disablePadding: false,
        label: 'Direction (º)',
    },
    {
        id: 'node',
        numeric: false,
        disablePadding: false,
        label: 'Node',
    },
    {
        id: 'level',
        numeric: true,
        disablePadding: false,
        label: 'Level (m)',
    },
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        label: 'Date',
    }
];

interface EnhancedTableProps {
    //numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TableData) => void;
    //onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

const headCellsA: readonly HeadCellA[] = [
    {
        id: 'inc',
        numeric: true,
        disablePadding: true,
        label: 'Incl',
    },
    {
        id: 'a',
        numeric: true,
        disablePadding: false,
        label: 'A (mm)',
    },
    {
        id: 'node',
        numeric: false,
        disablePadding: false,
        label: 'Node',
    },
    {
        id: 'level',
        numeric: true,
        disablePadding: false,
        label: 'Level (m)',
    },
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        label: 'Date',
    }
];

interface EnhancedTablePropsA {
    //numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TableDataA) => void;
    //onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

const headCellsB: readonly HeadCellB[] = [
    {
        id: 'inc',
        numeric: true,
        disablePadding: true,
        label: 'Incl',
    },
    {
        id: 'b',
        numeric: true,
        disablePadding: false,
        label: 'B (mm)',
    },
    {
        id: 'node',
        numeric: false,
        disablePadding: false,
        label: 'Node',
    },
    {
        id: 'level',
        numeric: true,
        disablePadding: false,
        label: 'Level (m)',
    },
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        label: 'Date',
    }
];

interface EnhancedTablePropsB {
    //numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TableDataB) => void;
    //onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

/*
 *
 * INFLUXDB API QUERIES
 *
 * Queries to get inclinometer data from InfluxDB
 *
 * START
 */

const api = new InfluxDB({
    //url: 'https://positive-presumably-bluegill.ngrok-free.app/',
    url: '//localhost:8086/',
    token: '5q-pfsRjWHQvyFZqhQ3Y8BT9CQmUJBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA=='
}).getQueryApi('c5936632b4808196');

export function getData() {
    try {
        const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")';
        const response = api.collectRows(fluxQuery);

        console.log('Query Response:', response);
        return response
    } catch (error) {
        throw error;
    }
}

export function getTestData() {
    try {
        const fluxQuery = 'from(bucket:"telegraf") |> range(start: 0) |> filter(fn: (r) => r._measurement == "I1")';
        const response = api.collectRows(fluxQuery);

        console.log('Query Response:', response);
        return response
    } catch (error) {
        throw error;
    }
}

/*
export function getDataFromLastYear() {
    try {
        const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX") |> range(start: 2023-01-01T23:30:00Z, stop: 2023-12-31T00:00:00Z)';
        const response = api.collectRows(fluxQuery);

        console.log('Query Response:', response);

        return response
    } catch (error) {
        throw error;
    }
}*/

/*
 * INFLUXDB API QUERIES
 *
 * END
 */

const profilePosArray: number[] = [
    293.9759051572062,137.467221651754,
    307.0369757491928,178.48439409197888,
    384.5834641373972,116.29482793608675,
    397.1268966391787,155.38014872373353,
    405.5478067907014,194.53481986550128,
    435.51871388561534,101.61149271936408,
    458.41490819149766,179.33384655857358,
    498.3038925944048,84.78825478770023,
    513.0379957938668,124.321863311431
]

const colorsArray: string[] = [
    "#33A4FF",
    "#1e7226",
    "#33FFD1",
    "#52d980",
    "#c5a932",
    "#FF5733",
    "#8e27a8",
    "#33FFFF",
    "#9b0e1c",
    "#FFD133",
    "#54419b",
    "#bdb632",
    "#31da36",
    "#FF8433",
    "#172793",
    "#3b7a23",
    "#796088",
    "#FF3833",
    "#FFB333",
    "#c067ec",
    "#b94646",
    "#1dc46a",
    "#33FCFF",
    "#33FFBA",
    "#FF5133",
    "#33FF60",
    "#33FFA4",
    "#3360FF",
    "#33C1FF",
    "#FFEA33",
    "#FF9D33",
    "#3377FF",
    "#33FFE9",
    "#33FF77",
    "#33FF33",
    "#33FFC1",
    "#A033FF",
    "#FF3333",
    "#33FF3A",
    "#2E33FF",
    "#33E9FF",
    "#FF1E33",
    "#338bff",
    "#33FF0D",
    "#33FF60",
    "#FFD133",
    "#33FFFF",
    "#33FF94",
    "#33FFA4",
    "#FF7733",
    "#33FF33",
    "#FFBA33",
    "#FFEA33",
    "#FF9D33",
    "#3377FF",
    "#33FFE9",
    "#33FF77",
    "#33FF33",
    "#33FFC1",
    "#A033FF",
    "#FF3333",
    "#33FF3A",
    "#2E33FF",
    "#33E9FF",
    "#FF1E33",
    "#338bff",
    "#33FF0D",
    "#1a5365",
    "#FFD133",
    "#33FFFF",
    "#33FF94",
    "#7a3f0d",
    "#FF7733",
    "#33FF33"
];

const soilData: SoilData[] = [
    {
        id: "1",
        name: "At",
        //depth: 32,
        depth: 3,
        color: "#ffe48e",
    },
    {
        id: "2",
        name: "ZG2A",
        //depth: 29,
        depth: 17,
        color: "#fdba74",
    },
    {
        id: "3",
        name: "ZG2B",
        //depth: 12,
        depth: 8,
        color: "#92400e",
    },
    {
        id: "4",
        name: "Rock",
        depth: 4,
        color: "#6b7280",
    }
]

const datesTypes = [
    {
        id: 1,
        name: 'Interval',
    },
    {
        id: 2,
        name: 'Select dates',
    }
]

const desiredDepthTypes = [
    {
        id: 1,
        name: 'Slider',
    },
    {
        id: 2,
        name: 'Interval',
    }
]

const visualization = [
    {
        id: 1,
        name: 'Inclinometer',
    },
    {
        id: 2,
        name: 'Profile',
    }
]

const results = [
    {
        id: 1,
        name: 'Cumulative displacements',
    },
    {
        id: 2,
        name: 'Relative cumulative displacements',
    },
    {
        id: 3,
        name: 'Relative displacements',
    },
    {
        id: 4,
        name: 'Sensor angles',
    },
    {
        id: 5,
        name: 'Casing distortions',
    }
]

const resultsProfiles = [
    {
        id: 1,
        name: 'Cumulative displacements',
    },
    {
        id: 2,
        name: 'Relative displacements',
    }
]

const elevation = [
    {
        id: 1,
        name: 'Depth',
    },
    {
        id: 2,
        name: 'Level',
    }
]

const locations = [
    {
        id: 1,
        name: 'Surface',
    },
    {
        id: 2,
        name: 'Max',
    }
]

const profiles = [
    {
        id: 1,
        name: 'All',
    },
    {
        id: 2,
        name: 'Crest',
    },
    {
        id: 3,
        name: 'Mid-slope',
    },
    {
        id: 4,
        name: 'Toe',
    }
]

const orthoDirection = [
    {
        id: 1,
        name: 'A',
    },
    {
        id: 2,
        name: 'B',
    }
]

const exportSelect = [
    {
        id: 1,
        name: 'Results to csv',
    },
    {
        id: 2,
        name: 'Report',
    }
]

let desiredDepth = 0;

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const formatDate = (dateS: string) => {
    const date = new Date(dateS);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const getNumberOfSensors = (graphData: InclinometerData[], inc: number) => {
    let sensorNumber = 0;

    graphData.map(g => {
        if (Number(g.inc) === inc && sensorNumber < Number(g.sensorID))
            sensorNumber = Number(g.sensorID)
    })
    return sensorNumber;
}

const getRefDate = (graphData: Inclinometer[]) => {
    let oldestDate = graphData[0].time;

    graphData.map(g => {
        if (oldestDate > g.time)
            oldestDate = g.time
    })

    return oldestDate
}

const getMostRecentDate = (graphData: Inclinometer[]) => {
    let oldestDate = graphData[0].time;

    graphData.map(g => {
        if (oldestDate < g.time)
            oldestDate = g.time
    })

    return oldestDate
}

const getIntervalDates = (graphData: InclinometerData[], initialDate: string, lastDate: string) => {
    let tempData: InclinometerData[] = [];
    graphData.map(g => {
        if (lastDate >= g.time && initialDate <= g.time)
            tempData.push(g)
    })
    return tempData;
}

const getInitialDatesChecked = (graphData: InclinometerData[]) => {
    let tempDateArray: string[] = []

    let refDate = graphData[0].time;
    tempDateArray.push(refDate);

    let revData = graphData.reverse();
    let lastDate = revData[0].time;
    let counter = 0;

    for (let i = 0; i < revData.length; i++) {
        if (revData[i].time === lastDate && counter < 5) {
            tempDateArray.push(revData[i].time)
        } else if (counter < 5) {
            lastDate = revData[i].time;
            tempDateArray.push(revData[i].time)
            counter++;
        }
    }

    const dates = new Set(tempDateArray);
    return Array.from(dates).sort((date1, date2) => {
        if (date1 < date2) {
            return -1;
        } else if (date1 > date2) {
            return 1;
        } else {
            return 0;
        }
    });
}

const getUniqueDates = (graphData: InclinometerData[]) => {
    let tempDateArray: string[] = []

    graphData.map(g => {
        tempDateArray.push(g.time)
    })

    const uniqueDates = new Set(tempDateArray);
    return Array.from(uniqueDates).sort((date1, date2) => {
        if (date1 < date2) {
            return -1;
        } else if (date1 > date2) {
            return 1;
        } else {
            return 0;
        }
    });
}

const getUniqueInclinometers = (dataArray: InclinometerData[]) => {
    let tempDateArray: string[] = []

    dataArray.map(d => {
        tempDateArray.push(d.inc)
    })

    const uniqueInc = new Set(tempDateArray);
    return Array.from(uniqueInc);
}

const getUniqueDepth = (inc: number, dataArray: InclinometerData[]) => {
    let tempDateArray: number[] = []

    dataArray.map(d => {
        if (Number(d.inc) === inc)
            tempDateArray.push(d.depth)
    })

    const uniqueSensors = new Set(tempDateArray);
    return Array.from(uniqueSensors);
}

const getDepth = (data: InclinometerData[], inc: number, depth: number) => {
    let numberOfSensors = getNumberOfSensors(data, inc);
    let value;
    //if(data[0].measurement === "BarragemX"){
    if (depth === numberOfSensors / 2) {
        value = 0;
    } else {
        value = numberOfSensors / 2 - depth
    }
    /*}else{
        value = depth - 0.5
    }*/
    return value;
}


/*const generateRandomHexColor = (): string => {
    const color = Math.floor(Math.random() * 16777215);
    const hexColor = color.toString(16).padStart(6, '0');

    return `#${hexColor}`;
};*/

/*const CustomTooltip: React.FC<TooltipProps<any, any>> = ({
                                                             active,
                                                             payload,
                                                             label
                                                         }) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="custom-tooltip">
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid black',
                        width: '130px'
                    }}>
                    {payload.map((p, index) => (
                        <div
                            key={index}>
                            {index === 0 &&
                                <p className="label"
                                   style={{margin: 0}}>{`Depth ${p.payload.depth} (m)`}</p>
                            }
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: p.color
                                }}>
                                <p style={{
                                    margin: 0,
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: p.color,
                                    marginRight: '10px',
                                    marginLeft: '20px'
                                }}/>
                                <p style={{margin: 0}}
                                   className="label">{`${p.value.toFixed(2)}`}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};*/


const CustomTooltip: React.FC<TooltipProps<any, any>> = ({
                                                             active,
                                                             payload,
                                                             label
                                                         }) => {
    if (active && payload && payload.length) {
        const sizeLimit = 22;
        const isWideLayout = payload.length > 16;
        const columnCount = isWideLayout ? Math.ceil(payload.length / 21) : 1;
        //const nullPoints: boolean = payload.length>0 ? payload[0].value === payload[1].value : false;
        return (
            <div
                className="custom-tooltip">
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid black',
                        display: 'grid',
                        width: isWideLayout ? '130px * ${columnCount}' : '130px',
                        gridTemplateColumns: `repeat(${columnCount}, auto)`,
                        gap: '10px',
                        gridTemplateRows: 'auto 1fr'
                    }}
                >
                    <p className="label"
                       style={{
                           margin: 0,
                           gridColumn: '1 / -1'
                       }}>{`Depth ${payload[0].payload.depth} (m)`}</p>

                    {payload.map((p, index) => (
                        <div
                            key={index}>
                            {(index <= sizeLimit) ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: p.color
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: 0,
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: p.color,
                                            marginRight: '10px',
                                            marginLeft: '20px'
                                        }}
                                    />
                                    <p style={{margin: 0}}
                                       className="label">{`${p.value.toFixed(2)}`}</p>
                                </div>) : (
                                (index === sizeLimit + 1) ? (
                                    <p className="label-container">{`...`}</p>
                                ) : null
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const CustomTooltipDetails: React.FC<TooltipProps<any, any>> = ({
                                                                    active,
                                                                    payload,
                                                                    label
                                                                }) => {
    if (active && payload && payload.length) {
        const sizeLimit = 66;
        const isWideLayout = payload.length > 22;
        const columnCount = isWideLayout ? Math.ceil(payload.length / 22) : 1;
        payload.sort((a, b) => parseFloat(a.name) - parseFloat(b.name));
        let lastRet = false;
        let discardHMS = payload[0].payload.time.split(" ")[1] === "00:00:00"

        return (
            <div
                className="custom-tooltip">
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '5px',
                        borderRadius: '5px',
                        boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid black',
                        display: 'grid',
                        width: isWideLayout ? '160px * ${columnCount}' : '160px',
                        gridTemplateColumns: `repeat(${columnCount}, auto)`,
                        gap: '5px',
                        gridTemplateRows: 'auto 1fr'
                    }}>
                    <div
                        className=""
                        style={{
                            margin: 0,
                            textAlign: 'center',
                            width: '100%',
                            gridColumn: '1 / -1'
                        }}
                    >
                        {(discardHMS) ? (
                                <p className="label-container">{`${payload[0].payload.time.split(" ")[0]}`}</p>)
                            : (
                                <p className="label-container">{`${payload[0].payload.time}`}</p>
                            )}
                    </div>
                    {payload.map((p, index) => (

                        <div
                            key={index}>
                            {(index <= sizeLimit) ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: p.color
                                    }}>
                                    <p style={{
                                        margin: 0,
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: p.color,
                                        marginRight: '5px',
                                        marginLeft: '5px'
                                    }}/>
                                    <p style={{margin: 0}}
                                       className="label">{`${p.payload.depth}(m): ${p.value.toFixed(2)}`}</p>
                                </div>) : (
                                (index === sizeLimit + 1) ? (
                                    <p className="label-container">{`...`}</p>
                                ) : null
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const getSoilDepth = (depth: number) => {
    switch (depth) {
        case 4:
            return " 29 - 32";
        case 8:
            return " 12 - 29";
        case 17:
            return " 4 - 12";
        case 3:
            return " 0 - 4";
        default:
            return " 0 - 32";
    }
}


const CustomTooltipSoil: React.FC<TooltipProps<any, any>> = ({
                                                                 active,
                                                                 payload,
                                                                 label
                                                             }) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="custom-tooltip">
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid black'
                    }}>
                    {payload.map((p, index) => (
                        <div
                            key={index}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: p.color
                                }}>
                                <p style={{
                                    margin: 0,
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: p.color,
                                    marginRight: '10px'
                                }}/>
                                <p style={{margin: 0}}
                                   className="label">{`${p.name + getSoilDepth(p.value)}`}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const ChartDataPrepTotal = (graphDataX: InclinometerData[], graphDataY: InclinometerData[]): InclinometerData[][] => {
    let data: InclinometerData[][] = [];

    const uniqueDates = getUniqueDates(graphDataX)
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: InclinometerData[] = []
        graphDataX.map(g => {
            if (g.time === uniqueDates[i]) {
                graphDataY.map(y => {
                    if (g.sensorID === y.sensorID && g.time === y.time) {
                        g.field = "total"
                        g.displacement = calculateTotal(g.displacement, y.displacement);
                    }
                })
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }
    return data;
}

const ChartDataPrep = (graphData: InclinometerData[]): InclinometerData[][] => {
    let data: InclinometerData[][] = [];

    const uniqueDates = getUniqueDates(graphData);
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: InclinometerData[] = []
        graphData.map(g => {
            if (g.time === uniqueDates[i]) {
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }

    return data;
}

const ChartDataPrepDetails = (graphData: InclinometerData[], maxD: number, minD: number): InclinometerData[][] => {
    let data: InclinometerData[][] = [];

    if (graphData.length > 0) {
        const uniqueDepths = getUniqueDepth(Number(graphData[0].inc), graphData)
        const filteredDepths = uniqueDepths.filter(depth => depth >= minD && depth <= maxD);

        for (let i = 0; i < filteredDepths.length; i++) {
            let tempArray: InclinometerData[] = []
            graphData.map(g => {
                if (g.depth === filteredDepths[i]) {
                    tempArray.push(g)
                }
            })
            data[i] = tempArray
            data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
        }
    }
    /*const uniqueDates = getUniqueDates(graphData);
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: InclinometerData[] = []
        graphData.map(g => {
            if (g.time === uniqueDates[i]) {
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }
*/
    return data;
}

const ChartDataPrepDetailsTotal = (graphDataX: InclinometerData[], graphDataY: InclinometerData[], maxD: number, minD: number): InclinometerData[][] => {
    /*let data: InclinometerData[][] = [];

    const uniqueDates = getUniqueDates(graphDataX)
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: InclinometerData[] = []
        graphDataX.map(g => {
            if (g.time === uniqueDates[i]) {
                graphDataY.map(y => {
                    if (g.sensorID === y.sensorID && g.time === y.time) {
                        g.field = "total"
                        g.displacement = calculateTotal(g.displacement, y.displacement);
                    }
                })
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }
    return data;*/
    let graphData: InclinometerData[] = []

    const uniqueDates = getUniqueDates(graphDataX)
    const numberOfDates = uniqueDates.length;
    for (let i = 0; i < numberOfDates; i++) {
        //let tempArray: InclinometerData[] = []
        graphDataX.map(g => {
            if (g.time === uniqueDates[i]) {
                graphDataY.map(y => {
                    if (g.sensorID === y.sensorID && g.time === y.time) {
                        g.field = "total"
                        g.displacement = calculateTotal(g.displacement, y.displacement);
                    }
                })
                graphData.push(g)
            }
        })
        //data[i] = tempArray
       // data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }

    let data: InclinometerData[][] = [];

    if (graphData.length > 0) {
        const uniqueDepths = getUniqueDepth(Number(graphData[0].inc), graphData)
        const filteredDepths = uniqueDepths.filter(depth => depth >= minD && depth <= maxD);

        for (let i = 0; i < filteredDepths.length; i++) {
            let tempArray: InclinometerData[] = []
            graphData.map(g => {
                if (g.depth === filteredDepths[i]) {
                    tempArray.push(g)
                }
            })
            data[i] = tempArray
            data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
        }
    }
    /*const uniqueDates = getUniqueDates(graphData);
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: InclinometerData[] = []
        graphData.map(g => {
            if (g.time === uniqueDates[i]) {
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }
*/
    return data;
}

const ChartClockDataPrep = (graphDataA: InclinometerData[], graphDataB: InclinometerData[]): ABData[][] => {
    let data: ABData[][] = [];

    const uniqueDates = getUniqueDates(graphDataA);
    const numberOfDates = uniqueDates.length;

    for (let i = 0; i < numberOfDates; i++) {
        let tempArray: ABData[] = []
        graphDataA.map(g => {
            graphDataB.map(h => {
                if (g.time === uniqueDates[i] && g.time === h.time && g.sensorID === h.sensorID && g.inc && h.inc) {
                    let newEntry: ABData = {
                        depth: g.depth,
                        inc: g.inc,
                        sensorID: g.sensorID,
                        time: g.time,
                        a: g.displacement,
                        b: h.displacement
                    }
                    tempArray.push(newEntry)
                }
            })
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }

    return data;
}

const CustomLabel: React.FC<{
    viewBox: {
        x: number;
        y: number;
    }
    refDate: string;
}> = ({
          viewBox,
          refDate
      }) => {

    let discardHMS = refDate.split(" ")[1] === "00:00:00"

    return (
        <g>
            {discardHMS ? (
                <rect
                    x={viewBox.x - 90}
                    y={viewBox.y + 540}
                    fill="#22c55e"
                    width={90}
                    height={30}
                    stroke="#000000"
                    strokeWidth="1"
                />) : (
                <rect
                    x={viewBox.x - 90}
                    y={viewBox.y + 540}
                    fill="#22c55e"
                    width={90}
                    height={60}
                    stroke="#000000"
                    strokeWidth="1"
                />)}
            <line
                x1={viewBox.x}
                y1={viewBox.y}
                x2={viewBox.x - 570}
                y2={viewBox.y}
                stroke="black"
                transform={`rotate(-90, ${viewBox.x}, ${viewBox.y})`}/>
            {discardHMS ? (
                <text
                    x={viewBox.x}
                    y={viewBox.y}
                    fill="#ffffff"
                    dy={560}
                    dx={-85}
                >
                    {`${refDate.split(" ")[0]}`}
                </text>
            ) : (
                <text
                    x={viewBox.x}
                    y={viewBox.y}
                    fill="#ffffff"
                    dy={560}
                    dx={-85}
                >
                    {`${refDate.split(" ")[0]}`}
                    <tspan
                        x={viewBox.x - 75}
                        dy="1.2em">
                        {`${refDate.split(" ")[1]}`}
                    </tspan>
                </text>
            )}
        </g>
    )
};

const CustomLabelBarChart = (props: LabelProps, label: string) => {
    const {
        x,
        y,
        width,
        height
    } = props;
    const radius = 5;

    const barCenterY = Number(y) + Number(height) / 2;

    return (
        <text
            x={Number(x) + Number(width) / 2}
            y={barCenterY - radius / 2}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="middle"
            dy={3}
        >
            {label}
        </text>
    );
};

const handleClickChart = (payload: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    let pl = payload as unknown as PointData
    desiredDepth = pl.payload.depth;
}

const Chart: React.FC<ChartPropsInc> = ({
                                            graphData,
                                            loadingData,
                                            refDate
                                        }) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);
    let graphType: string = "A";
    let typeOfResult: string = "Cumulative displacements"
    //let refDate: string = "Ref Date";
    let discardHMS: boolean = false;
    let numberOfDates: number = 0;
    let overloadDates: boolean = false;
    let datesData: InclinometerData[][] = data;
    let positionXA: number = -240;
    let positionYA: number = 25;
    let positionXB: number = -700;
    let positionYB: number = 25;

    if (data.length > 0 && data[0].length > 0) {
        if (data[0][0].field.split("")[1].toUpperCase() === "X") {
            graphType = "A"
        } else {
            graphType = "B"
        }
        typeOfResult = data[0][0].typeOfResult;
        //refDate = data[0][0].time;
        discardHMS = data[0][0].time.split(" ")[1] === "00:00:00"
        numberOfDates = data.length
        if (discardHMS && numberOfDates > 22) {
            overloadDates = true;
            let firstSlice = data.slice(0, 11)
            let lastSlice = data.slice(numberOfDates - 12, numberOfDates)
            datesData = [...firstSlice, ...lastSlice]
        } else if (!discardHMS && numberOfDates > 12) {
            overloadDates = true;
            let firstSlice = data.slice(0, 6)
            let lastSlice = data.slice(numberOfDates - 7, numberOfDates)
            datesData = [...firstSlice, ...lastSlice]
        } else {
            overloadDates = false;
        }

        let isWideLayout = numberOfDates > 16;
        let columnCount = isWideLayout ? Math.ceil(numberOfDates / 21) : 1;

        switch (columnCount) {
            case 1:
                positionXA = -240;
                positionYA = 25;
                positionXB = -700;
                positionYB = 25;
                break;
            case 2:
                positionXA = -310;
                positionYA = 25;
                positionXB = -770;
                positionYB = 25;
                break;
            case 3:
                positionXA = -380;
                positionYA = 25;
                positionXB = -840;
                positionYB = 25;
                break;
            default:
                positionXA = -240;
                positionYA = 25;
                positionXB = -700;
                positionYB = 25;
        }
    }

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="100%"
                height={640}>
                {(graphData.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            layout="vertical"
                            margin={{
                                top: 25,
                                right: 10,
                                left: 30,
                                bottom: 55
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                type="number"
                                dataKey="displacement"
                                orientation="top">
                                <Label
                                    value={`${graphType} (mm)`}
                                    position="top"/>
                            </XAxis>
                            <YAxis
                                dataKey="depth"
                                allowDataOverflow={true}>
                                {graphType === "A" &&
                                    <Label
                                        value="Depth (m)"
                                        position="left"
                                        angle={-90}/>}
                            </YAxis>
                            {graphType === "A" &&
                                <Tooltip
                                    content={
                                        <CustomTooltip/>}
                                    position={{
                                        x: positionXA,
                                        y: positionYA
                                    }}/>}
                            {graphType === "B" &&
                                <Tooltip
                                    content={
                                        <CustomTooltip/>}
                                    position={{
                                        x: positionXB,
                                        y: positionYB
                                    }}/>}
                            {graphType === "A" &&
                                <Legend
                                    align="right"
                                    verticalAlign="top"
                                    layout="vertical"
                                    margin={{right: 50}}
                                    wrapperStyle={{
                                        position: 'absolute',
                                        right: -35,
                                        top: 50
                                    }}
                                    payload={
                                        (!overloadDates) ? (data.map((incData, i) => ({
                                            value: discardHMS ? incData[0].time.split(" ")[0] : (
                                                <>{incData[0].time.split(" ")[0]}
                                                    <div>&emsp;&ensp;{incData[0].time.split(" ")[1]}</div>
                                                </>
                                            ),
                                            type: 'line',
                                            color: colorsArray[i]
                                        }))) : ((datesData.map((incData, i) => ({
                                                value: discardHMS ? (i !== 10 ? (incData[0].time.split(" ")[0]) : (<>{'...'}</>))
                                                    : (i !== 6 ? (
                                                        <>{incData[0].time.split(" ")[0]}
                                                            <div>&emsp;&ensp;{incData[0].time.split(" ")[1]}</div>
                                                        </>
                                                    ) : <>{'...'}</>),
                                                type: 'line',
                                                color: discardHMS ? (i !== 10 ? colorsArray[i] : '000000') : (i !== 6 ? colorsArray[i] : '#000000')
                                            })))
                                        )
                                    }/>}
                            {data.map((incData, i) =>
                                (
                                    <Line
                                        name={`${incData[0].time.split(" ")[0]}`}
                                        key={`${incData[0].time}`}
                                        type="monotone"
                                        dataKey="displacement"
                                        data={incData}
                                        stroke={colorsArray[i]}
                                        activeDot={{
                                            r: 8,
                                            onClick: (event, payload) => {
                                                handleClickChart(payload)
                                            }
                                        }}/>
                                ))}
                            {typeOfResult === "Cumulative displacements" &&
                                <ReferenceLine
                                    x={0}
                                    stroke="#000000"
                                    label={
                                        <CustomLabel
                                            viewBox={{
                                                x: 0,
                                                y: 0
                                            }}
                                            refDate={refDate}/>}/>}
                        </LineChart>

                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartTotal: React.FC<ChartPropsTotal> = ({
                                                   graphDataX,
                                                   graphDataY,
                                                   loadingData
                                               }) => {
    let data: InclinometerData[][] = ChartDataPrepTotal(graphDataX, graphDataY);

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="100%"
                height={640}>
                {(graphDataX.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            layout="vertical"
                            margin={{
                                top: 25,
                                right: 10,
                                left: 20,
                                bottom: 55
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                type="number"
                                dataKey="displacement"
                                orientation="top">
                                <Label
                                    value={`Total (mm)`}
                                    position="top"/>
                            </XAxis>
                            <YAxis
                                dataKey="depth">
                                <Label
                                    value="Depth (m)"
                                    position="left"
                                    angle={-90}/>
                            </YAxis>
                            <Tooltip
                                content={
                                    <CustomTooltip/>}/>
                            <Legend
                                align="right"
                                verticalAlign="top"
                                layout="vertical"
                                margin={{right: 50}}
                                wrapperStyle={{
                                    position: 'absolute',
                                    right: -35,
                                    top: 50
                                }}/>
                            {data.map((incData, i) => (
                                <Line
                                    name={`${incData[0].time.split(" ")[0]}`}
                                    key={`${incData[0].time}`}
                                    type="monotone"
                                    dataKey="displacement"
                                    data={incData}
                                    stroke={colorsArray[i]}
                                    activeDot={{r: 8}}/>
                            ))}
                        </LineChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartTemp: React.FC<ChartProps> = ({
                                             graphData,
                                             loadingData
                                         }) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="80%"
                height={600}>
                {(graphData.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            layout="vertical"
                            margin={{
                                top: 25,
                                right: 20,
                                left: 10,
                                bottom: 15
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                type="number"
                                dataKey="value"
                                orientation="top">
                                <Label
                                    value="Temp (ºC)"
                                    position="top"/>
                            </XAxis>
                            <YAxis
                                dataKey="depth">
                                <Label
                                    value="Depth (m)"
                                    position="left"
                                    angle={-90}/>
                            </YAxis>
                            <Tooltip
                                content={
                                    <CustomTooltip/>}/>
                            {data.map((incData, i) => (
                                <Line
                                    name={`${incData[0].time.split(" ")[0]}`}
                                    key={`${incData[0].time}`}
                                    type="monotone"
                                    dataKey="value"
                                    data={incData}
                                    stroke={colorsArray[i]}
                                    activeDot={{r: 8}}/>
                            ))}
                        </LineChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartClock: React.FC<ChartPropsClock> = ({
                                                   graphDataA,
                                                   graphDataB,
                                                   loadingData
                                               }) => {
    let data: ABData[][] = ChartClockDataPrep(graphDataA, graphDataB);

    /*<Tooltip content={<CustomTooltip/>}/>*/

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="117%"
                height={300}>
                {(graphDataA.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            margin={{
                                top: 25,
                                right: 10,
                                left: 35,
                                bottom: 20
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                type="number"
                                dataKey="a"
                                axisLine={false}
                                orientation="top">
                                <Label
                                    value="A (mm)"
                                    position="top"/>
                            </XAxis>
                            <ReferenceLine
                                y={0}
                                stroke="#000000"/>
                            <YAxis
                                dataKey="b"
                                axisLine={false}>
                                <Label
                                    value="B (mm)"
                                    position="left"
                                    angle={-90}/>
                            </YAxis>
                            <ReferenceLine
                                x={0}
                                stroke="#000000"/>

                            {data.map((d, i) => (
                                <Line
                                    name={`${d[0].time.split(" ")[0]}`}
                                    key={`${d[0].time}`}
                                    type="linear"
                                    dataKey="b"
                                    data={d}
                                    stroke={colorsArray[i]}
                                    dot={false}
                                    />
                            ))}
                        </LineChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartDetails: React.FC<ChartPropsDetails> = ({
                                                       graphData,
                                                       initialMaxDepth,
                                                       minDepth,
                                                       maxDepth,
                                                       loadingData
                                                   }) => {
    let maxD = initialMaxDepth - minDepth;
    let minD = Math.abs(0 - (initialMaxDepth - maxDepth));

    let data: InclinometerData[][] = ChartDataPrepDetails(graphData, maxD, minD);
    //let initialData: InclinometerData[][] = ChartDataPrep(graphData);
    //let data: InclinometerData[][] = ChartDataPrepDetailsX(initialData, depth);

    //console.log(data)
    let graphType: string = "A";
    let discardHMS: boolean = false;

    if (data.length > 0 && data[0].length > 0) {
        if (data[0][0].field.split("")[1].toUpperCase() === "X") {
            graphType = "A"
        } else {
            graphType = "B"
        }

        discardHMS = data[0][0].time.split(" ")[1] === "00:00:00"
    }
//domain={[minD, maxD]}
//{data.map((date, i) => {}(`${date[i].time.split(" ")[0]}` ))}
    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="80%"
                height={320}>
                {(graphData.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            margin={{
                                top: 25,
                                right: 100,
                                left: 15,
                                bottom: 20
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="time"
                                tickFormatter={(date) => {
                                    return (discardHMS) ? (date.split(" ")[0]) : (date)
                                }}
                                allowDuplicatedCategory={false}>
                                <Label
                                    value="Dates"
                                    position="bottom"/>
                            </XAxis>
                            <YAxis
                                dataKey="displacement">
                                <Label
                                    value={`${graphType} (mm)`}
                                    position="left"
                                    angle={-90}/>
                            </YAxis>
                            {graphType === "A" &&
                                <Tooltip
                                    content={
                                        <CustomTooltipDetails/>}
                                    position={{
                                        x: -400,
                                        y: 10
                                    }}/>}
                            {graphType === "B" &&
                                <Tooltip
                                    content={
                                        <CustomTooltipDetails/>}
                                    position={{
                                        x: -400,
                                        y: -310
                                    }}/>}
                            {data.map((incData, i) => (
                                <Line
                                    name={`${incData[0].depth}`}
                                    key={`${incData[0].depth}`}
                                    type="monotone"
                                    dataKey="displacement"
                                    data={incData}
                                    stroke={colorsArray[i]}
                                    activeDot={{r: 8}}/>
                            ))}
                        </LineChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartDetailsTotal: React.FC<ChartPropsDetailsTotal> = ({
                                                       graphDataX,
                                                       graphDataY,
                                                       initialMaxDepth,
                                                       minDepth,
                                                       maxDepth,
                                                       loadingData
                                                   }) => {
    let maxD = initialMaxDepth - minDepth;
    let minD = Math.abs(0 - (initialMaxDepth - maxDepth));

    let data: InclinometerData[][] = ChartDataPrepDetailsTotal(graphDataX, graphDataY, maxD, minD);
    //let initialData: InclinometerData[][] = ChartDataPrep(graphData);
    //let data: InclinometerData[][] = ChartDataPrepDetailsX(initialData, depth);

    //console.log(data)
    let graphType: string = "A";
    let discardHMS: boolean = false;

    if (data.length > 0 && data[0].length > 0) {
        graphType = "Total"

        discardHMS = data[0][0].time.split(" ")[1] === "00:00:00"
    }
//domain={[minD, maxD]}
//{data.map((date, i) => {}(`${date[i].time.split(" ")[0]}` ))}
    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width="80%"
                height={320}>
                {(graphDataX.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            margin={{
                                top: 25,
                                right: 100,
                                left: 15,
                                bottom: 20
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="time"
                                tickFormatter={(date) => {
                                    return (discardHMS) ? (date.split(" ")[0]) : (date)
                                }}
                                allowDuplicatedCategory={false}>
                                <Label
                                    value="Dates"
                                    position="bottom"/>
                            </XAxis>
                            <YAxis
                                dataKey="displacement">
                                <Label
                                    value={`${graphType} (mm)`}
                                    position="left"
                                    angle={-90}/>
                            </YAxis>
                            <Tooltip
                                content={
                                    <CustomTooltipDetails/>}
                                position={{
                                    x: -400,
                                    y: -250
                                }}/>
                            {data.map((incData, i) => (
                                <Line
                                    name={`${incData[0].depth}`}
                                    key={`${incData[0].depth}`}
                                    type="monotone"
                                    dataKey="displacement"
                                    data={incData}
                                    stroke={colorsArray[i]}
                                    activeDot={{r: 8}}/>
                            ))}
                        </LineChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

const ChartSoil: React.FC<ChartSoil> = ({
                                            graphData,
                                            loadingData,
                                            totalChart,
                                            tempChart
                                        }) => {
    const maxY = Math.max(...graphData.map(soil => soil.depth));
    const data = [{
        depth: maxY, ...graphData.reduce((acc, soil) => ({
            ...acc,
            [soil.name]: soil.depth
        }), {})
    }];
    const uniqueColors = Array.from(new Set(graphData.map(soil => soil.color)));

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width={(totalChart && !tempChart) ? "25%" :"40%"}
                height={640}>
                {(graphData.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <BarChart
                            data={data}
                            margin={{
                                top: 50,
                                right: 0,
                                left: 0,
                                bottom: 40
                            }}>
                            <XAxis
                                type="category"
                                hide={true}/>
                            <YAxis
                                dataKey="depth"
                                type="number"
                                domain={[0, 32]}
                                hide={true}/>
                            <Tooltip
                                content={
                                    <CustomTooltipSoil/>}/>
                            <Bar
                                key={`$3`}
                                dataKey="Rock"
                                stackId="stack"
                                fill={uniqueColors[3]}>
                                <LabelList
                                    dataKey="Rock"
                                    position="inside"
                                    content={(props) => CustomLabelBarChart(props, "Rock")}/>
                            </Bar>
                            <Bar
                                key={`$2`}
                                dataKey="ZG2B"
                                stackId="stack"
                                fill={uniqueColors[2]}>
                                <LabelList
                                    dataKey="Rock"
                                    position="inside"
                                    content={(props) => CustomLabelBarChart(props, "ZG2B")}/>
                            </Bar>
                            <Bar
                                key={`$1`}
                                dataKey="ZG2A"
                                stackId="stack"
                                fill={uniqueColors[1]}>
                                <LabelList
                                    dataKey="Rock"
                                    position="inside"
                                    content={(props) => CustomLabelBarChart(props, "ZG2A")}/>
                            </Bar>
                            <Bar
                                key={`$0`}
                                dataKey="At"
                                stackId="stack"
                                fill={uniqueColors[0]}>
                                <LabelList
                                    dataKey="Rock"
                                    position="inside"
                                    content={(props) => CustomLabelBarChart(props, "At")}/>
                            </Bar>
                        </BarChart>
                    )}
            </ResponsiveContainer>
        </div>
    );
};

/*{data.map((d, i) => (
))}

const ChartSoil: React.FC<ChartSoil> = ({graphData}) => {
    //let data: InclinometerData[][] = ChartDataPrep(graphData);
    const uniqueColors = Array.from(new Set(graphData.map(soil => soil.color)));

    return (
        <div className="wrapper" >
            {graphData.length > 0 && (
                <ResponsiveContainer width="30%" height={300}>
                    <BarChart data={graphData} stackOffset="sign" margin={{ top: 25, right: 20, left: 20, bottom: 20 }}>
                        <XAxis dataKey="depth"/>
                        <YAxis  />
                        <Tooltip />
                        <Legend />
                        {graphData.map((soil, i) => (
                            <Bar dataKey="depth"  key={`${soil.id}`} stackId="stack" fill={soil.color}/>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};*/


const ChartProfileA: React.FC<ChartPropsProfileInc> = ({
                                            graphData,
                                            loadingData,
                                            maxDepthOverall,
                                            maxDepthInc,
                                            maxData,
                                            inc,
                                            numberOfTotalInc,
                                            leftChart
                                        }) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);
    let graphType: string = "A";
    let typeOfResult: string = "Cumulative displacements"
    let refDate: string = "Ref Date";
    let discardHMS: boolean = false;
    let numberOfDates: number = 0;
    let overloadDates: boolean = false;
    let datesData: InclinometerData[][] = data;
    let positionXA: number = -240;
    let positionYA: number = 25;
    let positionXB: number = -700;
    let positionYB: number = 25;

    if (data.length > 0 && data[0].length > 0) {
        if (data[0][0].field.split("")[1].toUpperCase() === "X") {
            graphType = "A"
        } else {
            graphType = "B"
        }

        typeOfResult = data[0][0].typeOfResult;
        refDate = data[0][0].time;
        discardHMS = data[0][0].time.split(" ")[1] === "00:00:00"
        numberOfDates = data.length
        if (discardHMS && numberOfDates > 22) {
            overloadDates = true;
            let firstSlice = data.slice(0, 11)
            let lastSlice = data.slice(numberOfDates - 12, numberOfDates)
            datesData = [...firstSlice, ...lastSlice]
        } else if (!discardHMS && numberOfDates > 12) {
            overloadDates = true;
            let firstSlice = data.slice(0, 6)
            let lastSlice = data.slice(numberOfDates - 7, numberOfDates)
            datesData = [...firstSlice, ...lastSlice]
        } else {
            overloadDates = false;
        }

        let isWideLayout = numberOfDates > 16;
        let columnCount = isWideLayout ? Math.ceil(numberOfDates / 21) : 1;

        switch (columnCount) {
            case 1:
                positionXA = -240;
                positionYA = 25;
                positionXB = -700;
                positionYB = 25;
                break;
            case 2:
                positionXA = -310;
                positionYA = 25;
                positionXB = -770;
                positionYB = 25;
                break;
            case 3:
                positionXA = -380;
                positionYA = 25;
                positionXB = -840;
                positionYB = 25;
                break;
            default:
                positionXA = -240;
                positionYA = 25;
                positionXB = -700;
                positionYB = 25;
        }
    }

    return (
        <div
            className="wrapper">
            <ResponsiveContainer
                width={leftChart ? "100%": "60%"}
                height={(maxDepthOverall === 51) ? 640 : ((maxDepthOverall === 26) ? 340: 280)}>
                {(graphData.length === 0 || loadingData) ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                            <SyncLoader
                                color="#22C55E"/>
                        </div>
                    )
                    : (
                        <LineChart
                            layout="vertical"
                            margin={{
                                top: 45,
                                right: 0,
                                left: leftChart ? 60: 0,
                                bottom: 45
                            }}>

                            <XAxis
                                type="number"
                                dataKey="displacement"
                                orientation="top"
                                domain={[-maxData, maxData]}
                                allowDataOverflow={true}
                                hide
                            >
                                <Label
                                    value={`${graphType} (mm)`}
                                    position="top"/>
                            </XAxis>
                            <YAxis
                                dataKey="depth"
                                domain={[0, maxDepthOverall]}
                                allowDataOverflow={true}
                                hide
                            >
                                {graphType === "A" &&
                                    <Label
                                        value="Depth (m)"
                                        position="left"
                                        angle={-90}/>}
                            </YAxis>
                            {graphType === "A" &&
                                <Tooltip
                                    content={
                                        <CustomTooltip/>}
                                    position={{
                                        x: positionXA,
                                        y: positionYA
                                    }}/>}
                            {graphType === "B" &&
                                <Tooltip
                                    content={
                                        <CustomTooltip/>}
                                    position={{
                                        x: positionXB,
                                        y: positionYB
                                    }}/>}
                            {leftChart &&
                                <Legend
                                    align="right"
                                    verticalAlign="top"
                                    layout="vertical"
                                    margin={{right: 50}}
                                    wrapperStyle={{
                                        position: 'absolute',
                                        left: -65,
                                        top: 50
                                    }}
                                    payload={
                                        (!overloadDates) ? (data.map((incData, i) => ({
                                            value: discardHMS ? incData[0].time.split(" ")[0] : (
                                                <>{incData[0].time.split(" ")[0]}
                                                    <div>&emsp;&ensp;{incData[0].time.split(" ")[1]}</div>
                                                </>
                                            ),
                                            type: 'line',
                                            color: colorsArray[i]
                                        }))) : ((datesData.map((incData, i) => ({
                                                value: discardHMS ? (i !== 10 ? (incData[0].time.split(" ")[0]) : (<>{'...'}</>))
                                                    : (i !== 6 ? (
                                                        <>{incData[0].time.split(" ")[0]}
                                                            <div>&emsp;&ensp;{incData[0].time.split(" ")[1]}</div>
                                                        </>
                                                    ) : <>{'...'}</>),
                                                type: 'line',
                                                color: discardHMS ? (i !== 10 ? colorsArray[i] : '000000') : (i !== 6 ? colorsArray[i] : '#000000')
                                            })))
                                        )
                                    }/>}
                            {data.map((incData, i) =>
                                (
                                    <Line
                                        name={`${incData[0].time.split(" ")[0]}`}
                                        key={`${incData[0].time}`}
                                        type="monotone"
                                        dataKey="displacement"
                                        data={incData}
                                        stroke={colorsArray[i]}
                                        activeDot={{
                                            r: 8,
                                            onClick: (event, payload) => {
                                                handleClickChart(payload)
                                            }
                                        }}/>
                                ))}
                            {typeOfResult === "Cumulative displacements" &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{ x: 0, y: 0 }, { x: 0, y: maxDepthInc}]}
                                    >
                                    <Label
                                    value={`I${inc}`}
                                    position="top"
                                    dy={-25}
                                    />
                                    <Label
                                        value={'0 (m)'}
                                        position="top"
                                        dy={-5}
                                    />
                                    <Label
                                        value={`${maxDepthInc} (m)`}
                                        position="bottom"
                                        dy={5}
                                    />
                                    </ReferenceLine>}
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: -maxData + 5.5,
                                        y: maxDepthOverall - 10
                                    }, {
                                        x: -maxData + 5.5,
                                        y: maxDepthOverall - 0.5
                                    }]}
                                >
                                    <Label
                                        value={`Depth (m)`}
                                        position="left"
                                        angle={-90}
                                        dy={-30}
                                        dx={-10}
                                    />
                                </ReferenceLine>
                            }
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: -maxData +  5.5,
                                        y: maxDepthOverall - 10
                                    }, {
                                        x: -maxData + 11,
                                        y: maxDepthOverall - 9
                                    }]}
                                >
                                </ReferenceLine>
                            }
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: -maxData + 5.5,
                                        y: maxDepthOverall - 10
                                    }, {
                                        x: -maxData,
                                        y: maxDepthOverall - 9
                                    }]}
                                >
                                </ReferenceLine>
                            }
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: -maxData + 5.5,
                                        y: maxDepthOverall-0.5,
                                    }, {
                                        x: (numberOfTotalInc >= 4) ? -maxData+140 : ((numberOfTotalInc === 3 ) ? -maxData+110 : -maxData+90),
                                        y: maxDepthOverall-0.5
                                    }]}
                                >
                                    <Label
                                        value={graphType === 'A' ? `A (mm)` : `B (mm)` }
                                        position="bottom"
                                        dy={0}
                                        dx={0}
                                    />
                                </ReferenceLine>}
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: (numberOfTotalInc >= 4) ? -maxData+140 : ((numberOfTotalInc === 3 ) ? -maxData+110 : -maxData+90),
                                        y: maxDepthOverall-0.5
                                    }, {
                                        x: (numberOfTotalInc >= 4) ? -maxData+130 : ((numberOfTotalInc === 3 ) ? -maxData+100 : -maxData+80),
                                        y: maxDepthOverall-1
                                    }]}
                                />}
                            {leftChart &&
                                <ReferenceLine
                                    //x={0}
                                    stroke="#000000"
                                    segment={[{
                                        x: (numberOfTotalInc >= 4) ? -maxData+140 : ((numberOfTotalInc === 3 ) ? -maxData+110 : -maxData+90),
                                        y: maxDepthOverall-0.5
                                    }, {
                                        x: (numberOfTotalInc >= 4) ? -maxData+130 : ((numberOfTotalInc === 3 ) ? -maxData+100 : -maxData+80),
                                        y: maxDepthOverall
                                    }]}
                                />}
                        </LineChart>

                    )}
            </ResponsiveContainer>
        </div>
    );
};

const calculateTopValueSlider = (numSensors: number) => {
    return numSensors / 2 - 0.5;
}

const isDateChecked = (date: string, dates: string[]) => {
    let found: boolean = false;

    dates.map(d => {
        if (d === date) {
            found = true;
        }
    })
    return found
}


const areAllDatesChecked = (numberOfDates: number, checkedDates: string[]) => {
    let found: boolean = false;

    if (checkedDates.length === numberOfDates) {
        found = true;
    }

    return found
}

const casingDistortions = (angle: number) => {
    let angleRad = angle * (Math.PI / 180);
    return 100 * Math.sin(angleRad);
}

const calculateTotal = (A: number, B: number) => Math.sqrt(A ** 2 + B ** 2);

const calculateAngle = (angle: number) => {
    let angleRad = angle * (Math.PI / 180);
    return 500 * Math.sin(angleRad);//Math.abs()
}

const calculateDisplacement = (inc: string, sensorID: string, cumulative: number, refDateData: InclinometerData[]) => {
    let auxCumulative = 0;
    for (const item of refDateData) {
        if (item.inc === inc && item.sensorID === sensorID) {
            auxCumulative = item.cumulative;
        }
    }

    return cumulative - auxCumulative;
}

const getRefDateData = (refDate: string, array: InclinometerData[], field: string) => {
    let auxArray: InclinometerData[][] = []

    array.sort((a, b) => Number(a.inc) - Number(b.inc))

    const uniqueInc = getUniqueInclinometers(array)
    const numberOfInc = uniqueInc.length;

    for (let i = 0; i < numberOfInc; i++) {
        let tempArray: InclinometerData[] = []
        array.map(g => {
            if (g.inc === uniqueInc[i]) {
                tempArray.push(g)
            }
        })
        auxArray[i] = tempArray
        auxArray[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    }

    let newRefArray: InclinometerData[] = []

    for (let i = 0; i < numberOfInc; i++) {
        let cumulative: number = 0;
        for (const item of auxArray[i]) {
            if (item.time === refDate && item.field === field) {
                let val = Math.abs(calculateAngle(item.value));
                cumulative += val;
                const updatedItem: InclinometerData = {
                    inc: item.inc,
                    sensorID: item.sensorID,
                    field: item.field,
                    measurement: item.measurement,
                    time: item.time,
                    depth: getDepth(auxArray[i], Number(item.inc), item.depth),
                    value: val,
                    cumulative: cumulative,
                    displacement: 0,
                    typeOfResult: item.typeOfResult
                };
                newRefArray.push(updatedItem);
            }
        }
    }

    return newRefArray;
}


const getDataArrayX = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[], selectedResult: string) => {
    let data: InclinometerData[][] = [];
    let returnData: InclinometerData[] = [];

    const uniqueDates = getUniqueDates(array)
    const numberOfDates = uniqueDates.length;
    array.sort((date1, date2) => {
        if (date1.time < date2.time) {
            return -1;
        } else if (date1.time > date2.time) {
            return 1;
        } else {
            return 0;
        }
    })//.sort((a, b) => Number(a.time) - Number(b.time))

    let counter = 0;
    let tempArray: InclinometerData[] = []


    for (let i = 0; i < array.length; i++) {
        //array.map(g => {
        if (array[i].field === "aX") {
            if (array[i].time === uniqueDates[counter]) {
                tempArray.push(array[i]);
                if (i + 1 === array.length) {
                    data[counter] = tempArray;
                    data[counter].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                }
            } else if (counter <= numberOfDates) {
                if (array[i].time === uniqueDates[counter + 1]) {
                    data[counter] = tempArray;
                    data[counter].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                    //.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
                    tempArray = [];
                    tempArray.push(array[i])
                    counter++;
                }
            }
        }
        if (i + 1 === array.length) {
            data[counter] = tempArray;
            data[counter].sort((a, b) => {
                if (Number(a.inc) !== Number(b.inc)) {
                    return Number(a.inc) - Number(b.inc);
                }
                return Number(a.sensorID) - Number(b.sensorID);
            });
        }
    }

    /*for (let i = 0; i < numberOfDates; i++) {//3
        let tempArray: InclinometerData[] = []
        array.map(g => {
            if (!checkIfDateAlreadyAdded(g.time, data)) { // uniqueDates[i]
                tempArray.push(g)
            }
        })
        data[i] = tempArray;
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID));
    }*/

    //data[0] = tempArray//data[i] = tempArray
    //data[1] = tempArray2
    //data[2] = tempArray3
    //data[0].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    //data[1].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    //data[2].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))

    /* const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"
    const auxDate3: String = "1986-10-01 00:00:00"

    let data: InclinometerData[][] = [];
    let returnData: InclinometerData[] = [];

    //const uniqueDates = getUniqueDates(array)
    //const numberOfDates = uniqueDates.length;

    //for (let i = 0; i < 2; i++) {//numberOfDates
        let tempArray: InclinometerData[] = []
        let tempArray2: InclinometerData[] = []
        let tempArray3: InclinometerData[] = []
        array.map(g => {
            if(g.field === "aX"){
            if (g.time === auxDate) { // uniqueDates[i]
                tempArray.push(g)
            }else if(g.time === auxDate2){
                tempArray2.push(g)
            }else if(g.time === auxDate3){
                tempArray3.push(g)
            }}
        })
    data[0] = tempArray//data[i] = tempArray
    data[1] = tempArray2
    data[2] = tempArray3
    data[0].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    data[1].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    data[2].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
*/

    for (let i = 0; i < numberOfDates; i++) {//3numberOfDates
        let cumulative: number = 0;
        for (const item of data[i]) {
            if (Number(item.inc) === selectedInc && item.field === "aX") {
                if (selectedResult === results[0].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulative += val;
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulative,
                        displacement: calculateDisplacement(item.inc, item.sensorID, cumulative, refDateData),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[1].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulative += val;
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulative,
                        displacement: cumulative,
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[2].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: calculateAngle(item.value),
                        cumulative: 0,
                        displacement: calculateAngle(item.value),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[3].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: item.value,
                        cumulative: 0,
                        displacement: item.value,
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[4].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: casingDistortions(item.value),
                        cumulative: 0,
                        displacement: casingDistortions(item.value),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                }

            }
        }
    }


    return returnData;
}

const getDataArrayY = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[], selectedResult: string) => {

    /*const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"
    const auxDate3: String = "1986-10-01 00:00:00"

    let data: InclinometerData[][] = [];
    let returnData: InclinometerData[] = [];

    //const uniqueDates = getUniqueDates(array)
    //const numberOfDates = uniqueDates.length;

    //for (let i = 0; i < 2; i++) {//numberOfDates
    let tempArray: InclinometerData[] = []
    let tempArray2: InclinometerData[] = []
    let tempArray3: InclinometerData[] = []
    array.map(g => {
        if (g.time === auxDate) { // uniqueDates[i]
            tempArray.push(g)
        }else if(g.time === auxDate2){
            tempArray2.push(g)
        }else if(g.time === auxDate3){
            tempArray3.push(g)
        }
    })
    data[0] = tempArray//data[i] = tempArray
    data[1] = tempArray2
    data[2] = tempArray3
    data[0].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    data[1].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    data[2].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
    //}
*/
    let data: InclinometerData[][] = [];
    let returnData: InclinometerData[] = [];

    const uniqueDates = getUniqueDates(array)
    const numberOfDates = uniqueDates.length;
    array.sort((date1, date2) => {
        if (date1.time < date2.time) {
            return -1;
        } else if (date1.time > date2.time) {
            return 1;
        } else {
            return 0;
        }
    })//.sort((a, b) => Number(a.time) - Number(b.time))

    let counter = 0;
    let tempArray: InclinometerData[] = []

    for (let i = 0; i < array.length; i++) {
        //array.map(g => {
        if (array[i].field === "aY") {
            if (array[i].time === uniqueDates[counter]) {
                tempArray.push(array[i]);
                if (i + 1 === array.length) {
                    data[counter] = tempArray;
                    data[counter].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                }
            } else if (counter <= numberOfDates) {
                if (array[i].time === uniqueDates[counter + 1]) {
                    data[counter] = tempArray;
                    data[counter].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                    //.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
                    tempArray = [];
                    tempArray.push(array[i])
                    counter++;
                }
            }
        }
        if (i + 1 === array.length) {
            data[counter] = tempArray;
            data[counter].sort((a, b) => {
                if (Number(a.inc) !== Number(b.inc)) {
                    return Number(a.inc) - Number(b.inc);
                }
                return Number(a.sensorID) - Number(b.sensorID);
            });
        }
    }

    for (let i = 0; i < numberOfDates; i++) {
        let cumulative: number = 0;
        for (const item of data[i]) {
            if (Number(item.inc) === selectedInc && item.field === "aY") {
                if (selectedResult === results[0].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulative += val;
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulative,
                        displacement: calculateDisplacement(item.inc, item.sensorID, cumulative, refDateData),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[1].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulative += val;
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulative,
                        displacement: cumulative,
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[2].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: calculateAngle(item.value),
                        cumulative: 0,
                        displacement: calculateAngle(item.value),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[3].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: item.value,
                        cumulative: 0,
                        displacement: item.value,
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                } else if (selectedResult === results[4].name) {
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(data[i], Number(item.inc), item.depth),
                        value: casingDistortions(item.value),
                        cumulative: 0,
                        displacement: casingDistortions(item.value),
                        typeOfResult: selectedResult
                    };
                    returnData.push(updatedItem);
                }
            }
        }
    }

    return returnData;
}

const getFiveMostRecent = (data: InclinometerData[][]) => {

    let newData: InclinometerData[][] = [];
    let refDate = data[0];
    let revData = data.reverse();

    for (let i = 0; i < 5; i++) {
        newData.push(revData[i])
    }
    newData.push(refDate);
    //console.log(newData.reverse())
    return newData.reverse();
}

const getFiveMostRecentClock = (data: ABData[][]) => {

    let newData: ABData[][] = [];
    let refDate = data[0];
    let revData = data.reverse();

    for (let i = 0; i < 5; i++) {
        newData.push(revData[i])
    }
    newData.push(refDate);
    //console.log(newData.reverse())
    return newData.reverse();
}

/*
const getFiveMostRecent = (data: InclinometerData[]) => {

    console.log(data)
    let newData: InclinometerData[] = [];

    let revData = data.reverse();
    let lastDate = revData[0].time;
    let counter = 0;

    for(let i = 0; i < revData.length; i++){
        if(revData[i].time === lastDate && counter < 5){
            newData.push(revData[i])
        }else if(counter < 5){
            lastDate = revData[i].time;
            newData.push(revData[i])
            counter++;
        }
    }

    console.log(newData.reverse())
    return newData.reverse();
}*/

const filterTestData = (data: InclinometerData[]): InclinometerData[] => {
    let filteredData: InclinometerData[] = [];
    let prevTimestampX: string | null = null;
    let prevTimestampY: string | null = null;
    let interval = 30;

    data.map((d, index) => {
        const currentTimestamp = d.time;
        if (d.field === "aX") {
            if (prevTimestampX !== null) {
                const prevTimeComponents = prevTimestampX.split(":");
                const currentTimeComponents = currentTimestamp.split(":");
                const prevSec = Number(prevTimeComponents[2]);
                const currentSec = Number(currentTimeComponents[2]);
                const prevMin = Number(prevTimeComponents[1]);
                const currentMin = Number(currentTimeComponents[1]);

                const timeDifference = (currentMin - prevMin) * 60 + (currentSec - prevSec);

                if (timeDifference >= interval) {
                    filteredData.push(d);
                    prevTimestampX = currentTimestamp;
                } else if (timeDifference === 0) {
                    filteredData.push(d);
                    prevTimestampX = currentTimestamp;
                }
            } else {
                filteredData.push(d);
                prevTimestampX = currentTimestamp;
            }
        } else if (d.field === "aY") {
            if (prevTimestampY !== null) {
                const prevTimeComponents = prevTimestampY.split(":");
                const currentTimeComponents = currentTimestamp.split(":");
                const prevSec = Number(prevTimeComponents[2]);
                const currentSec = Number(currentTimeComponents[2]);
                const prevMin = Number(prevTimeComponents[1]);
                const currentMin = Number(currentTimeComponents[1]);

                const timeDifference = (currentMin - prevMin) * 60 + (currentSec - prevSec);

                if (timeDifference >= interval) {
                    filteredData.push(d);
                    prevTimestampY = currentTimestamp;
                } else if (timeDifference === 0) {
                    filteredData.push(d);
                    prevTimestampX = currentTimestamp;
                }
            } else {
                filteredData.push(d);
                prevTimestampY = currentTimestamp;
            }
        }
    })

    return filteredData;
}

const exportSVG = (svg: SVGElement, graphName: string) => {
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});

    if (typeof window.saveAs === 'function') {
        window.saveAs(blob, 'chart-export.svg');
    } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart-' + graphName + '.svg';
        link.click();
        window.URL.revokeObjectURL(url);
    }
};

const exportCSV = (data: InclinometerData[], filename: string) => {
    // Convert data to CSV format
    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }
    /*const dataToExport = data;

    const csvString = parse(dataToExport);

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();

    URL.revokeObjectURL(link.href);*/
};

interface PopupProps {
    open: boolean;
    handleClose: () => void;
}

const PopupCSV: React.FC<PopupProps> = ({ open, handleClose }) => {

    const [selectedExport, setSelectedExport] = useState(exportSelect[0])


    return (
        <Modal
            open={open}
            onClose={handleClose}
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
                '& .close-button': {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                },
            }}>
                <IconButton className="close-button" aria-label="close" onClick={handleClose}>
                    <Clear />
                </IconButton>
                <div
                    className="filter-container-elevation">
                    <Listbox
                        value={selectedExport}
                        onChange={setSelectedExport}>
                        {({open}) => (
                            <>
                                <Listbox.Label
                                    className="block text-lg font-medium leading-6 text-gray-900 text-left">Export results</Listbox.Label>
                                <div
                                    className="relative mt-2">
                                    <Listbox.Button
                                        className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedExport.name}</span>
                                      </span>
                                        <span
                                            className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                    </Listbox.Button>
                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options
                                            className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {exportSelect.map((res) => (
                                                <Listbox.Option
                                                    key={res.id}
                                                    className={({active}) =>
                                                        classNames(
                                                            active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                        )
                                                    }
                                                    value={res}
                                                >
                                                    {({
                                                          selected,
                                                          active
                                                      }) => (
                                                        <>
                                                            <div
                                                                className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                            </div>

                                                            {selected ? (
                                                                <span
                                                                    className={classNames(
                                                                        active ? 'text-white' : 'text-green-600',
                                                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                    )}
                                                                >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Listbox>
                </div>
            </Box>
        </Modal>
    );
};


/*
 * PROFILE SECTION
 */

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (typeof b[orderBy] === 'number' && typeof a[orderBy] === 'number') {
        if (Number(b[orderBy]) - Number(a[orderBy]) < 0) {
            return -1;
        }
        if (Number(b[orderBy]) - Number(a[orderBy]) > 0) {
            return 1;
        }
        return 0;
    }else{
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }
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

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof TableData) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}//{headCell.numeric ? 'right' : 'left'}
                        padding={'normal'}//{headCell.disablePadding ? 'none' : 'normal'}
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


function EnhancedTableHeadA(props: EnhancedTablePropsA) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof TableDataA) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsA.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}//{headCell.numeric ? 'right' : 'left'}
                        padding={'normal'}//{headCell.disablePadding ? 'none' : 'normal'}
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


function EnhancedTableHeadB(props: EnhancedTablePropsB) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof TableDataB) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCellsB.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}//{headCell.numeric ? 'right' : 'left'}
                        padding={'normal'}//{headCell.disablePadding ? 'none' : 'normal'}
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

const getTableValues = (selectedInc: number, arrayX: InclinometerData[], arrayY: InclinometerData[], refDateDataX: InclinometerData[], refDateDataY: InclinometerData[], selectedResult: string, selectedLocation: string) : InclinometerData[][] => {

    let dataX: InclinometerData[][] = [];
    let dataY: InclinometerData[][] = [];
    //let dataTotal: InclinometerData[][] = [];
    let returnData: InclinometerData[] = [];
    let returnDataX: InclinometerData[] = [];
    let returnDataY: InclinometerData[] = [];
    let returnDataTotal: InclinometerData[] = [];
    let returnDataArray: InclinometerData[][] = [];


    const uniqueDates = getUniqueDates(arrayX)
    const numberOfDates = uniqueDates.length;

    arrayX.sort((date1, date2) => {
        if (date1.time < date2.time) {
            return -1;
        } else if (date1.time > date2.time) {
            return 1;
        } else {
            return 0;
        }
    })
    arrayY.sort((date1, date2) => {
        if (date1.time < date2.time) {
            return -1;
        } else if (date1.time > date2.time) {
            return 1;
        } else {
            return 0;
        }
    })

    let counterX = 0;
    let tempArrayX: InclinometerData[] = []

    for (let i = 0; i < arrayX.length; i++) {
        //array.map(g => {
        if (arrayX[i].field === "aX") {
            if (arrayX[i].time === uniqueDates[counterX]) {
                tempArrayX.push(arrayX[i]);
                if (i + 1 === arrayX.length) {
                    dataX[counterX] = tempArrayX;
                    dataX[counterX].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                }
            } else if (counterX <= numberOfDates) {
                if (arrayX[i].time === uniqueDates[counterX + 1]) {
                    dataX[counterX] = tempArrayX;
                    dataX[counterX].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                    //.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
                    tempArrayX = [];
                    tempArrayX.push(arrayX[i])
                    counterX++;
                }
            }
        }
        if (i + 1 === arrayX.length) {
            dataX[counterX] = tempArrayX;
            dataX[counterX].sort((a, b) => {
                if (Number(a.inc) !== Number(b.inc)) {
                    return Number(a.inc) - Number(b.inc);
                }
                return Number(a.sensorID) - Number(b.sensorID);
            });
        }
    }

    let counterY = 0;
    let tempArrayY: InclinometerData[] = []

    for (let i = 0; i < arrayY.length; i++) {
        //array.map(g => {
        if (arrayY[i].field === "aY") {
            if (arrayY[i].time === uniqueDates[counterY]) {
                tempArrayY.push(arrayY[i]);
                if (i + 1 === arrayY.length) {
                    dataY[counterY] = tempArrayY;
                    dataY[counterY].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                }
            } else if (counterY <= numberOfDates) {
                if (arrayY[i].time === uniqueDates[counterY + 1]) {
                    dataY[counterY] = tempArrayY;
                    dataY[counterY].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                    //.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))
                    tempArrayY = [];
                    tempArrayY.push(arrayY[i])
                    counterY++;
                }
            }
        }
        if (i + 1 === arrayY.length) {
            dataY[counterY] = tempArrayY;
            dataY[counterY].sort((a, b) => {
                if (Number(a.inc) !== Number(b.inc)) {
                    return Number(a.inc) - Number(b.inc);
                }
                return Number(a.sensorID) - Number(b.sensorID);
            });
        }
    }

    let maxSensor = getNumberOfSensors(arrayX, selectedInc);

    for (let i = 0; i < numberOfDates; i++) {
        let cumulative: number = 0;
        for (const item of dataX[i]) {
            if (Number(item.inc) === selectedInc && item.field === "aX") {
                if (selectedResult === resultsProfiles[0].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulative += val;
                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(dataX[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulative,
                        displacement: calculateDisplacement(item.inc, item.sensorID, cumulative, refDateDataX),
                        typeOfResult: selectedResult
                    };
                    if(maxSensor === Number(item.sensorID)){
                        returnData.push(updatedItem);
                        returnDataX.push(updatedItem);
                    }
                } else if (selectedResult === resultsProfiles[1].name) {
                    if(maxSensor === Number(item.sensorID)){
                        const updatedItem: InclinometerData = {
                            inc: item.inc,
                            sensorID: item.sensorID,
                            field: item.field,
                            measurement: item.measurement,
                            time: item.time,
                            depth: getDepth(dataX[i], Number(item.inc), item.depth),
                            value: calculateAngle(item.value),
                            cumulative: 0,
                            displacement: calculateAngle(item.value),
                            typeOfResult: selectedResult
                        };
                        returnData.push(updatedItem);
                        returnDataX.push(updatedItem);
                    }
                }
            }
        }
    }

    for (let i = 0; i < numberOfDates; i++) {
        let cumulativeY: number = 0;
        for (const item of dataY[i]) {
            if (Number(item.inc) === selectedInc && item.field === "aY") {
                if (selectedResult === resultsProfiles[0].name) {
                    let val = Math.abs(calculateAngle(item.value));
                    cumulativeY += val;

                    const updatedItem: InclinometerData = {
                        inc: item.inc,
                        sensorID: item.sensorID,
                        field: item.field,
                        measurement: item.measurement,
                        time: item.time,
                        depth: getDepth(dataY[i], Number(item.inc), item.depth),
                        value: val,
                        cumulative: cumulativeY,
                        displacement: calculateDisplacement(item.inc, item.sensorID, cumulativeY, refDateDataY),
                        typeOfResult: selectedResult
                    };
                    if(maxSensor === Number(item.sensorID)){
                        returnData.push(updatedItem);
                        returnDataY.push(updatedItem);
                    }
                } else if (selectedResult === resultsProfiles[1].name) {
                    if(maxSensor === Number(item.sensorID)){
                        const updatedItem: InclinometerData = {
                            inc: item.inc,
                            sensorID: item.sensorID,
                            field: item.field,
                            measurement: item.measurement,
                            time: item.time,
                            depth: getDepth(dataY[i], Number(item.inc), item.depth),
                            value: calculateAngle(item.value),
                            cumulative: 0,
                            displacement: calculateAngle(item.value),
                            typeOfResult: selectedResult
                        };
                        returnData.push(updatedItem);
                        returnDataY.push(updatedItem);
                    }
                }
            }
        }
    }

    for (let i = 0; i < numberOfDates; i++) {
        let tempData = returnData;
        let found = false;
        tempData.map(g => {
            if (g.time === uniqueDates[i]) {
                tempData.map(y => {
                    if (g.sensorID === y.sensorID && g.time === y.time && g.field !== y.field && !found) {
                        //g.field = "total"
                        //g.displacement = calculateTotal(g.displacement, y.displacement);
                        const updatedItem: InclinometerData = {
                            inc: g.inc,
                            sensorID: g.sensorID,
                            field: "total",
                            measurement: g.measurement,
                            time: g.time,
                            depth: getDepth(dataX[i], Number(g.inc), g.depth),
                            value: calculateAngle(g.value),
                            cumulative: 0,
                            displacement: calculateTotal(g.displacement, y.displacement),
                            typeOfResult: selectedResult
                        };
                        returnData.push(updatedItem);
                        returnDataTotal.push(updatedItem);
                        found = true;
                    }
                })
            }
        })
    }

    returnDataArray.push(returnData);
    returnDataArray.push(returnDataX);
    returnDataArray.push(returnDataY);
    returnDataArray.push(returnDataTotal);

    return returnDataArray;
};


function ResultsVisualization() {

    const [arrayInitialized, setArrayInitialized] = useState(false);
    const [dataArrayX, setDataArrayX] = useState<InclinometerData[]>([]);
    const [dataArrayY, setDataArrayY] = useState<InclinometerData[]>([]);
    const [dataArrayTemp, setDataArrayTemp] = useState<InclinometerData[]>([]);
    const [filteredDataArrayX, setFilteredDataArrayX] = useState<InclinometerData[]>([]);
    const [filteredDataArrayY, setFilteredDataArrayY] = useState<InclinometerData[]>([]);
    const [filteredDataArrayTemp, setFilteredDataArrayTemp] = useState<InclinometerData[]>([]);
    //const [colorArray, setColorArray] = useState<string[]>([]);
    const [earliestRefDate, setEarliestRefDate] = useState<string>("");
    const [refEarliestDateDataX, setEarliestRefDateDataX] = useState<InclinometerData[]>([]);
    const [refEarliestDateDataY, setEarliestRefDateDataY] = useState<InclinometerData[]>([]);
    const [refDate, setRefDate] = useState<string>("");
    const [refDateDataX, setRefDateDataX] = useState<InclinometerData[]>([]);
    const [refDateDataY, setRefDateDataY] = useState<InclinometerData[]>([]);
    const [depthArray, setDepthArray] = useState<number[]>([]);
    const [defaultDatesGraph, setDefaultDatesGraph] = useState(true);

    const [toggleTotalChart, setToggleTotalChart] = useState(false);
    const [toggleTempChart, setToggleTempChart] = useState(false);
    const [toggleSelectDates, setToggleSelectDates] = useState(false);
    const [toggleDepthInterval, setToggleDepthInterval] = useState(false);
    const [selectedGraphExport, setSelectedGraphExport] = useState<string>("A");
    const [selectedResults, setSelectedResults] = useState(results[0])
    const [selectedVisualization, setSelectedVisualization] = useState(visualization[0])
    const [selectedDatesTypes, setSelectedDatesTypes] = useState(datesTypes[0])
    const [selectedDesiredDepth, setSelectedDesiredDepth] = useState(desiredDepthTypes[0])
    const [selectedElevation, setSelectedElevation] = useState(elevation[0])

    const [topValueSlider, setTopValueSlider] = useState<number>(32)
    const [lowerValueSlider, setLowerValueSlider] = useState<number>(0)
    const [stepValueSlider, setStepValueSlider] = useState<number>(5)
    const [selectedValuesSlider, setSelectedValuesSlider] = useState<number[]>([0, 32])

    const [lastToggleRef, setLastToggleRef] = useState<number>(0);
    const [toggleIntervalRef, setToggleIntervalRef] = useState(false);

    const [selectedMeasurement, setSelectedMeasurement] = useState<string>("PK150_PK200")

    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        setLoadingData(true)
        if (selectedMeasurement === "PK150_PK200") {
            fetchData();
        } else if (selectedMeasurement === "PK250_PK300") {
            fetchTestData()
        }
    }, [selectedMeasurement]);

    useEffect(() => {
        if (!arrayInitialized) {
            //fetchData();
            setSelectedMeasurement("PK150_PK200");
        }
    }, [arrayInitialized]);

    useEffect(() => {
        if (!arrayInitialized && (dataArrayX.length > 0 || dataArrayY.length > 0)) {
            setMaxDepthInc((getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5);
            setMaxDepthGraph((getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5);
            setMinDepthGraph(0);

            setTopValueSlider((getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5);
            setLowerValueSlider(0);

            setSelectedFirstDesiredDepth(0);
            setSelectedLastDesiredDepth((getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5);
            setOriginalFirstDesiredDepth(0);
            setOriginalLastDesiredDepth((getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5);
            //setSelectedAXChartData(getDataArrayX(1, dataArrayX, refDateDataX, selectedResults.name));
            //setSelectedAYChartData(getDataArrayY(1, dataArrayY, refDateDataY, selectedResults.name));

            //let initialDataX = getFiveMostRecent(getDataArrayX(1, dataArrayX, refDateDataX, selectedResults.name))
            //let initialDataY = getFiveMostRecent(getDataArrayY(1, dataArrayY, refDateDataY, selectedResults.name))
            //setFilteredDataArrayX(initialDataX)
            //setFilteredDataArrayY(initialDataY)
            //setSelectedAXChartData(getFiveMostRecent(getDataArrayX(1, dataArrayX, refDateDataX, selectedResults.name)));
            //setSelectedAYChartData(getFiveMostRecent(getDataArrayY(1, dataArrayY, refDateDataY, selectedResults.name)));
            setArrayInitialized(true);
            handleStepSlider();
        }
    }, [dataArrayX, dataArrayY, arrayInitialized]);

    async function fetchData() {
        try {
            const response = await getData() as InfluxDataAux[];//getDataFromLastYear() as InfluxDataAux[];
            const mappedData: InclinometerData[] = response.map(i => ({
                inc: i.inc.split("I")[1],
                sensorID: i.sensorID,
                field: i._field,
                measurement: i._measurement,
                time: formatDate(i._time),
                depth: Number(i.sensorID) * 0.5,
                value: i._value,
                cumulative: 0,
                displacement: 0,
                typeOfResult: results[0].name
            }));

            /*let auxRefDate = getRefDate(mappedData);
            setRefDate(auxRefDate);
            setRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));
            setEarliestRefDate(auxRefDate);
            setEarliestRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setEarliestRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));

            setDataArrayX(mappedData);
            setFilteredDataArrayX(mappedData);
            setDataArrayY(mappedData);
            setFilteredDataArrayY(mappedData);
            setDataArrayTemp(mappedData);
            setFilteredDataArrayTemp(mappedData);*/
            defineInitialValues(mappedData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const defineInitialValues = (mappedData: InclinometerData[]) => {
        if (selectedMeasurement === "PK250_PK300") {
            let auxRefDate = getRefDate(mappedData);
            setRefDate(auxRefDate);
            setRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));
            setEarliestRefDate(auxRefDate);
            setEarliestRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setEarliestRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));

            mappedData.sort((date1, date2) => {
                if (date1.time < date2.time) {
                    return -1;
                } else if (date1.time > date2.time) {
                    return 1;
                } else {
                    return 0;
                }
            })

            console.log(mappedData)
            let newTestData = filterTestData(mappedData);
            console.log(newTestData)
            setDataArrayX(newTestData);
            setFilteredDataArrayX(newTestData);
            setDataArrayY(newTestData);
            setFilteredDataArrayY(newTestData);
            setDataArrayTemp(newTestData);
            setFilteredDataArrayTemp(newTestData);

            setSelectedInclinometer(1);


            setMaxDepthInc((getNumberOfSensors(newTestData, Number(1)) / 2) - 0.5);
            setMaxDepthGraph((getNumberOfSensors(newTestData, Number(1)) / 2) - 0.5);
            setMinDepthGraph(0);

            setTopValueSlider((getNumberOfSensors(newTestData, Number(1)) / 2) - 0.5);
            setLowerValueSlider(0);

            setSelectedFirstDesiredDepth(0);
            setSelectedLastDesiredDepth((getNumberOfSensors(newTestData, Number(1)) / 2) - 0.5);
            setOriginalFirstDesiredDepth(0);
            setOriginalLastDesiredDepth((getNumberOfSensors(newTestData, Number(1)) / 2) - 0.5);
            handleStepSlider();


        } else {
            let auxRefDate = getRefDate(mappedData);
            setRefDate(auxRefDate);
            setRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));
            setEarliestRefDate(auxRefDate);
            setEarliestRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setEarliestRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));

            setDataArrayX(mappedData);
            setFilteredDataArrayX(mappedData);
            setDataArrayY(mappedData);
            setFilteredDataArrayY(mappedData);
            setDataArrayTemp(mappedData);
            setFilteredDataArrayTemp(mappedData);

            setSelectedInclinometer(1);
        }
    };

    useEffect(() => {
        setDepthArray(getUniqueDepth(1, filteredDataArrayX).sort((a, b) => Number(a) - Number(b)));
    }, [filteredDataArrayX]);

    async function fetchTestData() {
        try {
            const response = await getTestData() as InfluxDataAuxTest[];
            const mappedData: InclinometerData[] = response.map(i => ({
                inc: i._measurement.split("I")[1],
                sensorID: i.n,
                field: i._field,
                measurement: i._measurement,
                time: formatDate(i._time),
                depth: Number(i.n) * 0.5,
                value: i._value,
                cumulative: 0,
                displacement: 0,
                typeOfResult: results[0].name
            }));

            defineInitialValues(mappedData.filter(i => i.field !== "sensors_spacing"));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    const numberOfMeasurements: string[] = ["PK150_PK200", "PK250_PK300"]
    const numberOfInc: string[] = getUniqueInclinometers(filteredDataArrayX).sort((a, b) => Number(a) - Number(b))
    const numberOfDates: string[] = getUniqueDates(dataArrayX)

    const [selectedInclinometer, setSelectedInclinometer] = useState<Number>(1);
    const [selectedDepth, setSelectedDepth] = useState<number>(0.5);
    const [maxDepthInc, setMaxDepthInc] = useState<number>(32);
    const [maxDepthGraph, setMaxDepthGraph] = useState<number>(32);
    const [minDepthGraph, setMinDepthGraph] = useState<number>(0);

    const [selectedFirstDesiredDepth, setSelectedFirstDesiredDepth] = useState<number>(0);
    const [selectedLastDesiredDepth, setSelectedLastDesiredDepth] = useState<number>(31.5);
    const [originalFirstDesiredDepth, setOriginalFirstDesiredDepth] = useState<number>(0);
    const [originalLastDesiredDepth, setOriginalLastDesiredDepth] = useState<number>(31.5);

    //const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2005-05-20 00:00:00"));

    const [selectedAXChartData, setSelectedAXChartData] = useState<InclinometerData[]>([]);
    const [selectedAYChartData, setSelectedAYChartData] = useState<InclinometerData[]>([]);
    const [selectedTotalChartData, setSelectedTotalChartData] = useState<InclinometerData[]>([]);


    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredDates, setFilteredDates] = useState<string[]>([]);
    const [checkedDates, setCheckedDates] = useState<string[]>([])
    const [initialCheckedDates, setInitialCheckedDates] = useState<string[]>([])


    const handleSelectedResults = (type: string) => {
        let selectedType;
        switch (type) {
            case results[0].name:
                selectedType = results[0];
                break;
            case results[1].name:
                selectedType = results[1];
                break;
            case results[2].name:
                selectedType = results[2];
                break;
            case results[3].name:
                selectedType = results[3];
                break;
            case results[4].name:
                selectedType = results[4];
                break;
            default:
                selectedType = results[0];
                break;
        }

        setSelectedResults(selectedType)
        handleSelectedAXChartData(Number(selectedInclinometer), type);
        handleSelectedAYChartData(Number(selectedInclinometer), type);
    }

    useEffect(() => {
        if (filteredDataArrayX.length === dataArrayX.length && filteredDataArrayX.length > 0 && defaultDatesGraph) {
            defaultCheckedDates();
        }
    }, [filteredDataArrayX]);

    useEffect(() => {
        setDefaultDatesGraph(true);
    }, [selectedMeasurement]);

    const defaultCheckedDates = () => {
        let defaultDataX: InclinometerData[] = [];
        let defaultDataY: InclinometerData[] = [];
        let checkedDatesInitial: string[] = [];

        const refValuesX = dataArrayX.filter(item => item.time === refDate);
        const refValuesY = dataArrayX.filter(item => item.time === refDate);
        defaultDataX = defaultDataX.concat(refValuesX);
        defaultDataY = defaultDataY.concat(refValuesY);

        let revDataX = filteredDataArrayX.reverse();
        let revDataY = filteredDataArrayY.reverse();

        let revDates = numberOfDates.reverse();

        for (let i = 0; i < 5; i++) {
            let newDateToAddX = revDataX.filter(item => item.time === revDates[i])
            let newDateToAddY = revDataY.filter(item => item.time === revDates[i])
            defaultDataX = defaultDataX.concat(newDateToAddX);
            defaultDataY = defaultDataY.concat(newDateToAddY);
            checkedDatesInitial = checkedDatesInitial.concat(revDates[i]);
        }

        checkedDatesInitial = checkedDatesInitial.concat(refDate);
        checkedDatesInitial.reverse();
        defaultDataX.reverse();
        defaultDataY.reverse();
        setInitialCheckedDates(checkedDatesInitial);
        setFilteredDataArrayX(defaultDataX)
        setFilteredDataArrayY(defaultDataY)
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)

        setDefaultDatesGraph(false);
    }

    const defaultCheckedDatesClock = () => {
        //let defaultData = getFiveMostRecentClock()
    }

    const handleAllDatesCheck = () => {
        const areAllChecked = areAllDatesChecked(numberOfDates.length, checkedDates);

        if (areAllChecked) {
            setCheckedDates(initialCheckedDates);
            defaultCheckedDates();
        } else {
            setCheckedDates(numberOfDates);
            setFilteredDataArrayX(dataArrayX)
            setFilteredDataArrayY(dataArrayY)
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)
        }
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const filtered = numberOfDates.filter(date => date.includes(value));
        setFilteredDates(filtered);
    };

    const handleDateCheck = (value: string) => {
        const isChecked = isDateChecked(value, checkedDates);
        const updatedDates = isChecked
            ? checkedDates.filter(date => date !== value)
            : [...checkedDates, value];

        setCheckedDates(updatedDates);

        if (isChecked) {
            const updatedFilteredDataArrayX = filteredDataArrayX.filter(data => data.time !== value);
            const updatedFilteredDataArrayY = filteredDataArrayY.filter(data => data.time !== value);
            setFilteredDataArrayX(updatedFilteredDataArrayX)
            setFilteredDataArrayY(updatedFilteredDataArrayY)
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)
        } else if (!isChecked && !filteredDataArrayX.some(item => item.time === value)) {
            const oldValuesX = dataArrayX.filter(item => item.time === value);
            const oldValuesY = dataArrayX.filter(item => item.time === value);
            const updatedFilteredDataArrayX = filteredDataArrayX.concat(oldValuesX);
            const updatedFilteredDataArrayY = filteredDataArrayY.concat(oldValuesY);
            setFilteredDataArrayX(updatedFilteredDataArrayX)
            setFilteredDataArrayY(updatedFilteredDataArrayY)
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)
        }
    };

    useEffect(() => {
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)
        setLoadingData(false)
    }, [checkedDates, refDate, filteredDataArrayX]);

    const handleSelectedAXChartData = (inc: number, selectedType: string) => {
        setSelectedAXChartData(getDataArrayX(inc, filteredDataArrayX, refDateDataX, selectedType));
        //setColorArray(generateColorArray(dataArray));
    };

    const handleSelectedAYChartData = (inc: number, selectedType: string) => {
        setSelectedAYChartData(getDataArrayY(inc, filteredDataArrayY, refDateDataY, selectedType));
    };

    const handleSelectedTotalChartData = (inc: number) => {
        //setSelectedTotalChartData();
    };

    const handleSelectedMeasurement = (m: string) => {
        setSelectedMeasurement(m);
        handleStepSlider();
    };

    const handleSelectedInclinometer = (inc: number) => {
        setSelectedInclinometer(inc);
        handleDepthArray(inc);
        handleSelectedAXChartData(inc, selectedResults.name);
        handleSelectedAYChartData(inc, selectedResults.name);
        handleStepSlider();
        let maxDepth = (getNumberOfSensors(filteredDataArrayX, inc) / 2) - 0.5;

        setMaxDepthInc(maxDepth);
        setTopValueSlider(maxDepth);
        setLowerValueSlider(0);

        setMaxDepthGraph(maxDepth);
        setMinDepthGraph(0);
        setSelectedFirstDesiredDepth(0);
        setSelectedLastDesiredDepth(maxDepth);
        setOriginalFirstDesiredDepth(0);
        setOriginalLastDesiredDepth(maxDepth);
        handleDepthReset(inc);
    };

    const handleDepthArray = (inc: number) => {
        setDepthArray(getUniqueDepth(inc, filteredDataArrayX).sort((a, b) => Number(a) - Number(b)));
    };

    const handleSelectedDepth = (depth: string) => {
        setSelectedDepth(Number(depth));
    };

    useEffect(() => {
        setSelectedDepth(Number(desiredDepth));
    }, [desiredDepth]);

    const handleStepSlider = () => {
        let maxDepth = (getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer)) / 2) - 0.5;
        setStepValueSlider(1);//100/Math.ceil(maxDepth));
    }

    const minDistance = 1;
    const handleSliderChange = (event: Event, value: number | number[], activeThumb: number) => {//(range: number[]) => {

        //console.log(value as number[])
        let v = value as number[]

        /*if (activeThumb === 0) {
            setMinDepthGraph(Math.min(v[0], maxDepthGraph - minDistance))
            //setMaxDepthGraph(maxDepthGraph)
            setSelectedValuesSlider([Math.min(v[0], maxDepthGraph - minDistance), maxDepthGraph])
            //setValue1([Math.min(newValue[0], value1[1] - minDistance), value1[1]]);
        } else {
            //setMinDepthGraph(minDepthGraph)
            setMaxDepthGraph(Math.max(v[1], minDepthGraph + minDistance))
            setSelectedValuesSlider([minDepthGraph, Math.max(v[1], minDepthGraph + minDistance)])
            //setValue1([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
        }*/

        setMinDepthGraph(v[0])
        setMaxDepthGraph(v[1])
        setSelectedValuesSlider(v)
        setSelectedFirstDesiredDepth(maxDepthInc - v[1]);
        setSelectedLastDesiredDepth(maxDepthInc - v[0]);
    }

    /*useEffect(() => {
        setSelectedValuesSlider(selectedValuesSlider)
    }, [lowerValueSlider, maxDepthGraph]);*/

    useEffect(() => {
        //setMinDepthGraph(minDepthGraph)
        //setLowerValueSlider(lowerValueSlider)
        console.log("min " + minDepthGraph + " | " + lowerValueSlider)
    }, [minDepthGraph, lowerValueSlider]);

    useEffect(() => {
        //setMaxDepthGraph(maxDepthGraph)
        //setTopValueSlider(topValueSlider)
        console.log("max " + maxDepthGraph + " | " + topValueSlider)
    }, [maxDepthGraph, topValueSlider]);

    const handleDatesIntervalChange = (initialDate: string, lastDate: string) => {
        setFilteredDataArrayX(getIntervalDates(dataArrayX, initialDate, lastDate));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, initialDate, lastDate));
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    };

    const handleFirstDateInterval = (year: number | undefined, month: number | undefined, day: number | undefined) => {
        if (year !== undefined && month !== undefined && day !== undefined) {
            let date = year + "-" + month + "-" + day;
            setFilteredDataArrayX(getIntervalDates(dataArrayX, date, getMostRecentDate(filteredDataArrayX)));
            setFilteredDataArrayY(getIntervalDates(dataArrayY, date, getMostRecentDate(filteredDataArrayY)));
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
        }
    };

    const handleLastDateInterval = (year: number | undefined, month: number | undefined, day: number | undefined) => {
        if (year !== undefined && month !== undefined && day !== undefined) {
            let date = year + "-" + month + "-" + day;
            setFilteredDataArrayX(getIntervalDates(dataArrayX, getRefDate(filteredDataArrayX), date));
            setFilteredDataArrayY(getIntervalDates(dataArrayY, getRefDate(filteredDataArrayY), date));
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
        }
    };

    const handleFirstDateIntervalReset = () => {
        setFilteredDataArrayX(getIntervalDates(dataArrayX, earliestRefDate, getMostRecentDate(filteredDataArrayX)));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, earliestRefDate, getMostRecentDate(filteredDataArrayY)));
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    };

    const handleLastDateIntervalReset = () => {
        setFilteredDataArrayX(getIntervalDates(dataArrayX, getRefDate(filteredDataArrayX), getMostRecentDate(dataArrayX)));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, getRefDate(filteredDataArrayY), getMostRecentDate(dataArrayY)));
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    };

    const handleResetDates = () => {
        setFilteredDataArrayX(getIntervalDates(dataArrayX, earliestRefDate, getMostRecentDate(dataArrayX)));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, earliestRefDate, getMostRecentDate(dataArrayY)));
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    }

    const handleFirstDesiredDepth = (d: string) => {
        setSelectedValuesSlider([selectedValuesSlider[0], topValueSlider - Number(d)])

        setSelectedFirstDesiredDepth(Number(d))
        setMaxDepthGraph(topValueSlider - Number(d));
    };

    const handleLastDesiredDepth = (d: string) => {
        setSelectedValuesSlider([topValueSlider - Number(d), selectedValuesSlider[1]])

        setSelectedLastDesiredDepth(Number(d))
        setMinDepthGraph(topValueSlider - Number(d));
    };

    const handleDesiredDepthIntervalReset = () => {
        /*setMinDepthGraph(originalFirstDesiredDepth)
        setLowerValueSlider(originalFirstDesiredDepth)
        setMaxDepthGraph(originalLastDesiredDepth)
        setTopValueSlider(originalLastDesiredDepth)
        setSelectedFirstDesiredDepth(originalFirstDesiredDepth)
        setSelectedLastDesiredDepth(originalLastDesiredDepth)
        setSelectedValuesSlider([0, (getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer))/2)-0.5])*/
        let maxDepth = (getNumberOfSensors(filteredDataArrayX, selectedInclinometer.valueOf()) / 2) - 0.5;
        console.log(maxDepth)
        setMinDepthGraph(0)
        setLowerValueSlider(0)
        setMaxDepthGraph(maxDepth)
        setTopValueSlider(maxDepth)
        setSelectedFirstDesiredDepth(0)
        setSelectedLastDesiredDepth(maxDepth)
        setSelectedValuesSlider([0, maxDepth])
    };

    const handleDepthReset = (inc: number) => {
        /*setMinDepthGraph(originalFirstDesiredDepth)
        setLowerValueSlider(originalFirstDesiredDepth)
        setMaxDepthGraph(originalLastDesiredDepth)
        setTopValueSlider(originalLastDesiredDepth)
        setSelectedFirstDesiredDepth(originalFirstDesiredDepth)
        setSelectedLastDesiredDepth(originalLastDesiredDepth)
        setSelectedValuesSlider([0, (getNumberOfSensors(filteredDataArrayX, Number(selectedInclinometer))/2)-0.5])*/
        let maxDepth = (getNumberOfSensors(filteredDataArrayX, inc) / 2) - 0.5;
        console.log(maxDepth)
        setMinDepthGraph(0)
        setLowerValueSlider(0)
        setMaxDepthGraph(maxDepth)
        setTopValueSlider(maxDepth)
        setSelectedFirstDesiredDepth(0)
        setSelectedLastDesiredDepth(maxDepth)
        setSelectedValuesSlider([0, maxDepth])
    };

    const handleRefDate = (newRef: string) => {
        setRefDate(newRef);
        setRefDateDataX(getRefDateData(newRef, dataArrayX, "aX"));
        setRefDateDataY(getRefDateData(newRef, dataArrayY, "aY"));

        setFilteredDataArrayX(getIntervalDates(dataArrayX, newRef, getMostRecentDate(filteredDataArrayX)));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, newRef, getMostRecentDate(filteredDataArrayX)));
        setFilteredDataArrayTemp(getIntervalDates(dataArrayTemp, newRef, getMostRecentDate(filteredDataArrayX)));

        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
        //handleTemp
    };

    const handleResetRefDate = () => {
        handleRefDate(earliestRefDate)
    };

    /*const generateColorArray = (dataArray: InclinometerData[]) => {
        const uniqueDates = getUniqueDates(dataArray)
        return uniqueDates.map(() => generateRandomHexColor());
    };*/


    // temperature chart data

    const auxDataTemp: InclinometerData[] = [];
    const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"
    const auxDate3: String = "1986-10-01 00:00:00"

    for (const item of dataArrayTemp) {
        if (Number(item.inc) === selectedInclinometer && item.field === "temp" && (item.time === auxDate2 || item.time === auxDate || item.time === auxDate3)) {
            auxDataTemp.push(item);
        }
    }

    const [selectedChartDataTemp, setSelectedChartDataTemp] = useState<InclinometerData[]>(auxDataTemp);

    const handleToogleTotalChart = () => {
        if (toggleTotalChart) {
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            setToggleTotalChart(false)
            setToggleTempChart(false)
        } else {
            setToggleTotalChart(true)
        }
    };

    const handleToogleTempChart = () => {
        if (toggleTempChart) {
            setToggleTempChart(false)
        } else {
            setToggleTempChart(true)
        }
    };

    const handleEarliestDate = (type: boolean) => {
        setToggleIntervalRef(type);
        //set ref earliest date
    };

    const handleToogleSelectDates = () => {
        if (toggleSelectDates) {
            setToggleSelectDates(false)
        } else {
            let uniqueD = getUniqueDates(filteredDataArrayX)
            setCheckedDates(uniqueD)
            /*console.log(checkedDates)
            if(defaultDatesGraph){
                let initialDatesChecked = getInitialDatesChecked(filteredDataArrayX)
                setCheckedDates(initialDatesChecked)
            }else{

            }*/
            setToggleSelectDates(true)
        }
    };

    const handleToogleDepthInterval = () => {
        if (toggleDepthInterval) {
            setToggleDepthInterval(false)
        } else {
            setToggleDepthInterval(true)
        }
    };

    const handleToogleReference = (n: number) => {
        if (n === lastToggleRef) {
            return true;
        }
        return false;
    }

    const handleGetClosestDate = (date: string) => {

        let newDataX = getIntervalDates(dataArrayX, date, getMostRecentDate(filteredDataArrayX))
        let newDataY = getIntervalDates(dataArrayY, date, getMostRecentDate(filteredDataArrayX))
        setFilteredDataArrayX(newDataX);
        setFilteredDataArrayY(newDataY);
        setFilteredDataArrayTemp(getIntervalDates(dataArrayTemp, date, getMostRecentDate(filteredDataArrayX)));

        let newRef = getRefDate(newDataX);

        setRefDate(newRef);
        setRefDateDataX(getRefDateData(newRef, dataArrayX, "aX"));
        setRefDateDataY(getRefDateData(newRef, dataArrayY, "aY"));

        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    }


    const chartClock = useRef<HTMLDivElement>(null);
    const chartAXRef = useRef<HTMLDivElement>(null);
    const chartAYRef = useRef<HTMLDivElement>(null);
    const chartTotalRef = useRef<HTMLDivElement>(null);
    const chartTempRef = useRef<HTMLDivElement>(null);
    const chartSoil = useRef<HTMLDivElement>(null);

    const handleSelectedGraphExport = (graph: string) => {
        setSelectedGraphExport(graph);
    };

    const handleExportSVG = () => {
        let chartRef;
        let graphName;
        switch (selectedGraphExport) {
            case "A":
                chartRef = chartAXRef;
                graphName = "A"
                break;
            case "B":
                chartRef = chartAYRef;
                graphName = "B"
                break;
            case "TOTAL":
                chartRef = chartTotalRef;
                graphName = "Total"
                break;
            case "TEMP":
                chartRef = chartTempRef;
                graphName = "Temp"
                break;
            default:
                chartRef = chartAXRef;
                graphName = "A"
        }

        if (chartRef.current) {
            const svg = chartRef.current.querySelector('svg');
            if (svg) {
                exportSVG(svg, graphName);
            } else {
                console.error('Chart SVG element not found');
            }
        } else {
            console.error('Chart reference not set');
        }
    };

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleExportCSV = () => {
        //if(selectedAXChartData !== [])
        //    exportCSV(selectedAXChartData, "AData");
    }

    /*
     * PROFILES SECTION
     */

    const [selectedResultsProfiles, setSelectedResultsProfiles] = useState(resultsProfiles[0]);

    const handleSelectedResultsProfiles = (type: string) => {
        let selectedType;
        switch (type) {
            case resultsProfiles[0].name:
                selectedType = resultsProfiles[0];
                break;
            case resultsProfiles[1].name:
                selectedType = resultsProfiles[1];
                break;
            default:
                selectedType = resultsProfiles[0];
                break;
        }

        setSelectedResultsProfiles(selectedType)
    }

    const [profileInitialized, setProfileInitialized] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
    const [selectedOrthoDirection, setSelectedOrthoDirection] = useState(orthoDirection[0]);
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);
    const [toggleArrows, setToggleArrows] = useState(false);
    const [arrowsAPointValues, setArrowsAPointValues] = useState<InclinometerData[][]>([]);
    const [arrowsBPointValues, setArrowsBPointValues] = useState<InclinometerData[][]>([]);
    const [arrowsTotalPointValues, setArrowsTotalPointValues] = useState<InclinometerData[][]>([]);

    const [profileIncChart, setProfileIncChart] = useState<number[]>([1,3,6,9]);
    const [depthProfilesArray, setDepthProfilesArray] = useState<number[]>([31.5,39.5,51,34.5]);
    const [maxProfileDepth, setMaxProfileDepth] = useState<number>(51);
    const [maxProfileDisplacementX, setMaxProfileDisplacementX] = useState<number>(131.85);
    const [maxProfileDisplacementY, setMaxProfileDisplacementY] = useState<number>(94.04);
    const [selectedProfileArrayChartDataX, setSelectedProfileArrayChartDataX] = useState<InclinometerData[][]>([]);
    const [selectedProfileArrayChartDataY, setSelectedProfileArrayChartDataY] = useState<InclinometerData[][]>([]);

    const stageRef = useRef<Konva.Stage | null>(null);
    const arrowLayerRef = useRef<Konva.Layer | null>(null);
    const profileLineLayerRef = useRef<Konva.Layer | null>(null);

    useEffect(() => {
        if(selectedVisualization.name === visualization[1].name && !profileInitialized){
            updateTableData();
            setTimeout(function() {
                const stage = new Konva.Stage({
                    container: 'konvaContainer',
                    width: 600,
                    height: 400
                });
                stageRef.current = stage;
                setProfileInitialized(true)

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
                backgroundImage.src = '/profiles/imagePlan3.png';

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

                let posCounter = 0;
                for(let i = 0; i < 9; i++){
                    let shape = new Konva.Circle({
                        x: profilePosArray[posCounter],
                        y: profilePosArray[posCounter+1],
                        fill: 'red',
                        radius: 5,
                    });
                    group.add(shape);
                    posCounter += 2;
                }
                /*stage.on('click', function () {
                    let pos = group.getRelativePointerPosition();
                    if(pos !== null){
                        let shape = new Konva.Circle({
                            x: pos.x,
                            y: pos.y,
                            fill: 'red',
                            radius: 5,
                        });
                        console.log(pos.x + " | " + pos.y)
                        group.add(shape);
                    }
                });*/


            },1);
        }else if(selectedVisualization.name === visualization[0].name && profileInitialized){
            setProfileInitialized(false)
            if (stageRef.current) {
                const stage = stageRef.current;
                stage.destroy();
                if(toggleArrows){
                    handleToogleArrows()
                }
            }
        }
    }, [selectedVisualization]);


    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof TableData>('inc');
    //const [selected, setSelected] = React.useState<readonly number[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const [rows, setRows] = useState<TableData[]>([]);
    const [rowsA, setRowsA] = useState<TableData[]>([]);
    const [rowsB, setRowsB] = useState<TableData[]>([]);

    const updateTableData = () => {
        let newTableRows = [];
        let newTableRowsA = [];
        let newTableRowsB = [];
        let uniqueDates: string[];
        let counter = 1;
        if(checkedDates.length === 0){
            uniqueDates = initialCheckedDates;
        }else{
            uniqueDates = checkedDates;
        }
        let arrowsTotalPointValuesAux: InclinometerData[][] = [];
        let arrowsAPointValuesAux: InclinometerData[][] = [];
        let arrowsBPointValuesAux: InclinometerData[][] = [];

        //if(selectedProfile.name === "All"){
            for (let i = 0; i < numberOfInc.length; i++){
                let generatedData = getTableValues(Number(numberOfInc[i]), filteredDataArrayX, filteredDataArrayY, refDateDataX, refDateDataY, selectedResultsProfiles.name, 'Surface');
                //console.log(generatedData)
                let mostRecentDate = ""
                if(generatedData[1].length !== 0){
                    mostRecentDate = getMostRecentDate(generatedData[1]);
                }
                arrowsAPointValuesAux.push(generatedData[1].filter(item => item.time === mostRecentDate))
                arrowsBPointValuesAux.push(generatedData[2].filter(item => item.time === mostRecentDate))
                arrowsTotalPointValuesAux.push(generatedData[3].filter(item => item.time === mostRecentDate))

                for(let j = 0; j < uniqueDates.length; j++){
                    let tempData = generatedData[0].filter(item => item.time === uniqueDates[j])
                    //console.log(tempData)
                    if(tempData.length > 0){
                        let newData = createTableData(counter, Number(numberOfInc[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        let newDataA = createTableData(counter, Number(numberOfInc[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        let newDataB = createTableData(counter, Number(numberOfInc[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        counter++;
                        newTableRows.push(newData)
                        newTableRowsA.push(newDataA)
                        newTableRowsB.push(newDataB)
                    }
                }
            }
            setRows(newTableRows);
            setRowsA(newTableRowsA);
            setRowsB(newTableRowsB);
            setArrowsAPointValues(arrowsAPointValuesAux);
            setArrowsBPointValues(arrowsBPointValuesAux);
            setArrowsTotalPointValues(arrowsTotalPointValuesAux);
        /*}else {
            for (let i = 0; i < profileIncChart.length; i++){
                let generatedData = getTableValues(Number(profileIncChart[i]), filteredDataArrayX, filteredDataArrayY, refDateDataX, refDateDataY, selectedResultsProfiles.name, 'Surface');

                let mostRecentDate = ""
                if(generatedData[1].length !== 0){
                    mostRecentDate = getMostRecentDate(generatedData[1]);
                }
                arrowsAPointValuesAux.push(generatedData[1].filter(item => item.time === mostRecentDate))
                arrowsBPointValuesAux.push(generatedData[2].filter(item => item.time === mostRecentDate))
                arrowsTotalPointValuesAux.push(generatedData[3].filter(item => item.time === mostRecentDate))

                for(let j = 0; j < uniqueDates.length; j++){
                    let tempData = generatedData[0].filter(item => item.time === uniqueDates[j])
                    //console.log(tempData)
                    if(tempData.length > 0){
                        let newData = createTableData(counter, Number(profileIncChart[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        let newDataA = createTableData(counter, Number(profileIncChart[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        let newDataB = createTableData(counter, Number(profileIncChart[i]), tempData[0].displacement, tempData[1].displacement, tempData[2].displacement, 90, 'Surface', Math.floor(Math.random() * (432 - 398) + 398), uniqueDates[j])
                        counter++;
                        newTableRows.push(newData)
                        newTableRowsA.push(newDataA)
                        newTableRowsB.push(newDataB)
                    }
                }
            }
            setRows(newTableRows);
            setRowsA(newTableRowsA);
            setRowsB(newTableRowsB);
            setArrowsAPointValues(arrowsAPointValuesAux);
            setArrowsBPointValues(arrowsBPointValuesAux);
            setArrowsTotalPointValues(arrowsTotalPointValuesAux);
        }*/
    }

    /*useEffect(() => {
        updateTableData();
    }, [checkedDates]);
    */
    useEffect(() => {
        updateTableData();

        let profileInc: number[] = [];
        if(selectedProfile.name === profiles[1].name){
            setProfileIncChart([1,3,6,9])
            setDepthProfilesArray([31.5,39.5,51,34.5])
            setMaxProfileDepth(51)
            profileInc = [1,3,6,9];
        }else if(selectedProfile.name === profiles[2].name){
            setProfileIncChart([2,4,10])
            setDepthProfilesArray([14.5,26,20])
            setMaxProfileDepth(26)
            profileInc = [2,4,10];
        }else if(selectedProfile.name === profiles[3].name){
            setProfileIncChart([5,8])
            setDepthProfilesArray([16.5,20.5])
            setMaxProfileDepth(20.5)
            profileInc = [5,8];
        }

        if(selectedProfile.name !== "All" && selectedOrthoDirection.name === "A"){
            let tempArray: InclinometerData[][] = [];
            for (let i = 0; i < profileInc.length; i++) {
                tempArray[i] = getDataArrayX(profileInc[i], filteredDataArrayX, refDateDataX, selectedResultsProfiles.name)
            }
            setSelectedProfileArrayChartDataX(tempArray)

        }else if(selectedProfile.name !== "All" && selectedOrthoDirection.name === "B"){
            let tempArray: InclinometerData[][] = [];
            for (let i = 0; i < profileInc.length; i++) {
                tempArray[i] = getDataArrayY(profileInc[i], filteredDataArrayY, refDateDataY, selectedResultsProfiles.name)
            }
            setSelectedProfileArrayChartDataY(tempArray)
        }
    }, [selectedProfile, checkedDates, selectedOrthoDirection, selectedResultsProfiles]);

    useEffect(() => {
        let profileLine: number[] = [];
        if(selectedProfile.name === profiles[1].name){
            setProfileIncChart([1,3,6,9])
            setDepthProfilesArray([31.5,39.5,51,34.5])
            setMaxProfileDepth(51)
            profileLine = [1,3,6,9];
        }else if(selectedProfile.name === profiles[2].name){
            setProfileIncChart([2,4,10])
            setDepthProfilesArray([14.5,26,20])
            setMaxProfileDepth(26)
            profileLine = [2,4,10];
        }else if(selectedProfile.name === profiles[3].name){
            setProfileIncChart([5,8])
            setDepthProfilesArray([16.5,20.5])
            setMaxProfileDepth(20.5)
            profileLine = [5,8];
        }
        handleToogleProfileLine(profileLine);
    }, [selectedProfile]);

    // only for testing
    /*const rows = [
        createTableData(1, 'I1', 1, 2, 3, 90, 'SURFACE', 415.1, '2023-10-13'),
        createTableData(2, 'I2', 2, 3, 5, 90, 'SURFACE', 425.1, '2023-10-23')
    ];*/

    /*const comparisonCharts = () => {
        let maxDepth = 0;
        let maxDisplacement = 0;
        for(let i = 0; i < profileIncChart.length; i++){
            if()
            if(arrowData[i][0].depth - 0.5 > maxDepth){
                maxDepth = arrowData[i][0].depth - 0.5
            }
            if(arrowData[i][0].displacement > maxDisplacement){
                maxDisplacement = arrowData[i][0].displacement
            }
        }
        setMaxProfileDepth(maxDepth);
        setMaxProfileDisplacement(maxDisplacement);
    }*/

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof TableData,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleRequestSortA = (
        event: React.MouseEvent<unknown>,
        property: keyof TableDataA,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleRequestSortB = (
        event: React.MouseEvent<unknown>,
        property: keyof TableDataB,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
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

    //const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const emptyRowsA =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsA.length) : 0;

    const emptyRowsB =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsB.length) : 0;

    const visibleRows = React.useMemo(
        () => rows.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage],
    );

    const visibleRowsA = React.useMemo(
        () => rowsA.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [rowsA, order, orderBy, page, rowsPerPage],
    );

    const visibleRowsB = React.useMemo(
        () => rowsB.slice().sort(getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage),
        [rowsB, order, orderBy, page, rowsPerPage],
    );

    useEffect(() => {

    }, [rows]);


    const handleToogleArrows = () => {
        if (toggleArrows) {
            setToggleArrows(false)
            if (stageRef.current && arrowLayerRef.current) {
                const stage = stageRef.current;
                const layer = arrowLayerRef.current;
                layer.destroy();
                arrowLayerRef.current = null;
            }
        } else {
            setToggleArrows(true)
            //if(selectedProfile.name === "All") {
                if (stageRef.current) {
                    let stage = stageRef.current;
                    let layer = new Konva.Layer({
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 5,
                    });
                    stage.add(layer);
                    arrowLayerRef.current = layer;

                    let group = new Konva.Group({
                        x: 30,
                        rotation: 10,
                        scaleX: 1,
                    });
                    layer.add(group);

                    let maxDepth = 0;
                    let maxDisplacement = 0;
                    let arrowData = arrowsTotalPointValues;
                    for(let i = 0; i < numberOfInc.length; i++){
                        if(arrowData[i][0].depth - 0.5 > maxDepth){
                            maxDepth = arrowData[i][0].depth - 0.5
                        }
                        if(Math.abs(arrowData[i][0].displacement) > maxDisplacement){
                            maxDisplacement = Math.abs(arrowData[i][0].displacement)
                        }
                    }

                    const refPointX1 = 293.9759051572062;
                    const refPointY1 = 137.467221651754;
                    const refPointX2 = 320.0369757491928;
                    const refPointY2 = 172.48439409197888;
                    let posCounter = 0;

                    for(let i = 0; i < numberOfInc.length; i++) {
                        //let testValueX = ((x3-x1)*97.97)/100
                        //let testValueY = ((y3-y1)*31.5)/51
                        let refPointIncX1 = profilePosArray[posCounter]
                        let refPointIncY1 = profilePosArray[posCounter+1]
                        let newX = refPointIncX1 + ((refPointX2 - refPointX1) * arrowData[i][0].displacement) / maxDisplacement
                        let newY = refPointIncY1 + ((refPointY2 - refPointY1) * (arrowData[i][0].depth-0.5)) / maxDepth

                        let arrow = new Konva.Arrow({
                            points: [refPointIncX1, refPointIncY1, newX, newY],
                            pointerLength: 5,
                            pointerWidth: 10,
                            fill: 'black',
                            stroke: 'black',
                            strokeWidth: 3
                        })
                        group.add(arrow)
                        posCounter += 2;
                    }
                }
            /*}else if(selectedProfile.name !== "All" && selectedOrthoDirection.name === "A"){
                if (stageRef.current) {
                    let stage = stageRef.current;
                    let layer = new Konva.Layer({
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 5,
                    });
                    stage.add(layer);
                    arrowLayerRef.current = layer;

                    let group = new Konva.Group({
                        x: 30,
                        rotation: 10,
                        scaleX: 1,
                    });
                    layer.add(group);

                    let maxDepth = 0.1;
                    let maxDisplacement = 0.1;
                    let arrowData = arrowsAPointValues;
                    console.log(arrowData)
                    for(let i = 0; i < profileIncChart.length; i++){
                        if(depthProfilesArray[i] > maxDepth){
                            maxDepth = depthProfilesArray[i]
                        }
                        if(arrowData[i] && arrowData[i][0]){
                        if(Math.abs(arrowData[i][0].displacement) > maxDisplacement){
                            maxDisplacement = Math.abs(arrowData[i][0].displacement)
                        }}
                    }

                    let counter = 0;
                    let counterArray: number[] = []
                    for(let i = 0; i < numberOfInc.length; i++){
                        for(let j = 0; j < profileIncChart.length; j++){
                            if(Number(numberOfInc[i]) === profileIncChart[j]){
                                counterArray.push(counter)
                            }
                        }
                        counter += 2;
                    }

                    const refPointX1 = 293.9759051572062;
                    const refPointY1 = 137.467221651754;
                    const refPointX2 = 320.0369757491928;
                    const refPointY2 = 172.48439409197888;
                    let posCounter = 0;
                    let nextInc = 0;

                    for(let i = 0; i < numberOfInc.length; i++) {
                        if(Number(numberOfInc[i]) === profileIncChart[nextInc]){

                            let posValue = counterArray[posCounter]
                            let refPointIncX1 = profilePosArray[posValue]
                            let refPointIncY1 = profilePosArray[posValue+1]
                            //console.log(" displ " + arrowData[nextInc][0].displacement + " | " +maxDisplacement + " | " + depthProfilesArray[nextInc] + " | " + maxDepth)
                            let newX = refPointIncX1
                            if(arrowData[nextInc] && arrowData[nextInc][0]) {
                                let newX = refPointIncX1 + Number((((refPointX2 - refPointX1) * arrowData[nextInc][0].displacement) / maxDisplacement).toFixed(14))
                            }
                            let newY = refPointIncY1 + Number((((refPointY2 - refPointY1) * (depthProfilesArray[nextInc])) / maxDepth).toFixed(14))

                            console.log(newX + " A| " + newY)
                            let arrow = new Konva.Arrow({
                                points: [refPointIncX1, refPointIncY1, newX, newY],
                                pointerLength: 5,
                                pointerWidth: 10,
                                fill: 'black',
                                stroke: 'black',
                                strokeWidth: 3
                            })
                            group.add(arrow)
                            posCounter++;
                            nextInc++;
                        }
                    }
                }
            }else if(selectedProfile.name !== "All" && selectedOrthoDirection.name === "B"){
                if (stageRef.current) {
                    let stage = stageRef.current;
                    let layer = new Konva.Layer({
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 5,
                    });
                    stage.add(layer);
                    arrowLayerRef.current = layer;

                    let group = new Konva.Group({
                        x: 30,
                        rotation: 10,
                        scaleX: 1,
                    });
                    layer.add(group);

                    let maxDepth = 0.1;
                    let maxDisplacement = 0.1;
                    let arrowData = arrowsBPointValues;
                    console.log("B: " + arrowData)
                    for(let i = 0; i < profileIncChart.length; i++){
                        if(depthProfilesArray[i] > maxDepth){
                            maxDepth = depthProfilesArray[i]
                        }
                        if(arrowData[i] && arrowData[i][0]){
                        if (Math.abs(arrowData[i][0].displacement) > maxDisplacement) {
                                maxDisplacement = Math.abs(arrowData[i][0].displacement)
                        }}
                    }

                    let counter = 0;
                    let counterArray: number[] = []
                    for(let i = 0; i < numberOfInc.length; i++){
                        for(let j = 0; j < profileIncChart.length; j++){
                            if(Number(numberOfInc[i]) === profileIncChart[j]){
                                counterArray.push(counter)
                            }
                        }
                        counter += 2;
                    }

                    const refPointX1 = 293.9759051572062;
                    const refPointY1 = 137.467221651754;
                    const refPointX2 = 320.0369757491928;
                    const refPointY2 = 172.48439409197888;
                    let posCounter = 0;
                    let nextInc = 0;

                    for(let i = 0; i < numberOfInc.length; i++) {
                        if(Number(numberOfInc[i]) === profileIncChart[nextInc]){

                            let posValue = counterArray[posCounter]
                            let refPointIncX1 = profilePosArray[posValue]
                            let refPointIncY1 = profilePosArray[posValue+1]
                            let newX = refPointIncX1;
                            if(arrowData[nextInc] && arrowData[nextInc][0]) {
                                newX = refPointIncX1 + Number((((refPointX2 - refPointX1) * arrowData[nextInc][0].displacement) / maxDisplacement).toFixed(14))
                            }
                            let newY = refPointIncY1 + Number((((refPointY2 - refPointY1) * (depthProfilesArray[nextInc])) / maxDepth).toFixed(14))
                            console.log(newX + " B| " + newY)
                            let arrow = new Konva.Arrow({
                                points: [refPointIncX1, refPointIncY1, newX, newY],
                                pointerLength: 5,
                                pointerWidth: 10,
                                fill: 'black',
                                stroke: 'black',
                                strokeWidth: 3
                            })
                            group.add(arrow)
                            posCounter++;
                            nextInc++;
                        }
                    }
                }
            }*/
        }
    };

    const handleToogleProfileLine = (profileLine: number[]) => {
        if (selectedProfile.name !== "All") {
            if (stageRef.current) {
                let stage = stageRef.current;
                if(profileLineLayerRef.current !== null){
                    const oldLayer = profileLineLayerRef.current;
                    oldLayer.destroy();
                    profileLineLayerRef.current = null;
                }

                let layer = new Konva.Layer({
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 5,
                });
                stage.add(layer);
                profileLineLayerRef.current = layer;

                let group = new Konva.Group({
                    x: 30,
                    rotation: 10,
                    scaleX: 1,
                });
                layer.add(group);

                let incliLine: number[] = []
                if(profileLine.length !== 0){
                    incliLine = profileLine
                }else{
                    incliLine = profileIncChart
                }

                let pointsArray: number[]  = [];
                for(let i = 0; i < numberOfInc.length; i++) {
                    for(let j = 0; j < incliLine.length; j++) {
                        if(Number(numberOfInc[i]) === incliLine[j]){
                            pointsArray.push(profilePosArray[i*2])
                            pointsArray.push(profilePosArray[i*2+1])
                        }
                    }
                }

                let arrayLength = pointsArray.length;
                pointsArray.push(pointsArray[arrayLength-2]+100)
                pointsArray.push(pointsArray[arrayLength-1]-25)
                let auxPoint1 = pointsArray[0];
                let auxPoint2 = pointsArray[1];
                pointsArray.unshift(auxPoint1-100, auxPoint2+25)

                let line = new Konva.Line({
                    points: pointsArray,
                    stroke: 'green',
                    strokeWidth: 5,
                    lineJoin: 'round',
                    dash: [10, 10],
                });

                group.add(line);
            }
        } else {
            if(stageRef.current && profileLineLayerRef.current){
                 const stage = stageRef.current;
                 const layer = profileLineLayerRef.current;
                 layer.destroy();
                 profileLineLayerRef.current = null;
            }
        }
    };

    const [selectedExport, setSelectedExport] = useState(exportSelect[0])

    return (
        <div className="main-wrapper">
            { selectedVisualization.name === visualization[0].name ? (
                /*
                 * INCLINOMETER SECTION
                 */
                <div
                className="row-container">
                <div
                    className="column-container left-column">
                    <div
                        className="filter-container-typeViz">
                        <Listbox
                            value={selectedVisualization}
                            onChange={setSelectedVisualization}>
                            {({open}) => (
                                <>
                                    <Listbox.Label
                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Type
                                        of
                                        visualization</Listbox.Label>
                                    <div
                                        className="relative mt-2 ">
                                        <Listbox.Button
                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedVisualization.name}</span>
                                      </span>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                        </Listbox.Button>
                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {visualization.map((viz) => (
                                                    <Listbox.Option
                                                        key={viz.id}
                                                        className={({active}) =>
                                                            classNames(
                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                            )
                                                        }
                                                        value={viz}
                                                    >
                                                        {({
                                                              selected,
                                                              active
                                                          }) => (
                                                            <>
                                                                <div
                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {viz.name}
                          </span>
                                                                </div>

                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? 'text-white' : 'text-green-600',
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                        )}
                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>
                    </div>
                    <div
                        className="filter-container-typeViz">
                        <Listbox
                            value={selectedResults}
                            onChange={(selectResultOption) => {
                                handleSelectedResults(selectResultOption.name)
                            }}>
                            {({open}) => (
                                <>
                                    <Listbox.Label
                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Type
                                        of
                                        result</Listbox.Label>
                                    <div
                                        className="relative mt-2">
                                        <Listbox.Button
                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedResults.name}</span>
                                      </span>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                        </Listbox.Button>
                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {results.map((res) => (
                                                    <Listbox.Option
                                                        key={res.id}
                                                        className={({active}) =>
                                                            classNames(
                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                            )
                                                        }
                                                        value={res}
                                                    >
                                                        {({
                                                              selected,
                                                              active
                                                          }) => (
                                                            <>
                                                                <div
                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                                </div>

                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? 'text-white' : 'text-green-600',
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                        )}
                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>
                    </div>
                    <div
                        className="filter-container-typeViz">
                        <Listbox
                            value={selectedDatesTypes}
                            onChange={(selectedOption) => {
                                setSelectedDatesTypes(selectedOption);
                                handleToogleSelectDates();
                            }}>
                            {({open}) => (
                                <>
                                    <Listbox.Label
                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Dates</Listbox.Label>
                                    <div
                                        className="relative mt-2">
                                        <Listbox.Button
                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedDatesTypes.name}</span>
                                      </span>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                        </Listbox.Button>
                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {datesTypes.map((dat) => (
                                                    <Listbox.Option
                                                        key={dat.id}
                                                        className={({active}) =>
                                                            classNames(
                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                            )
                                                        }
                                                        value={dat}
                                                    >
                                                        {({
                                                              selected,
                                                              active
                                                          }) => (
                                                            <>
                                                                <div
                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{dat.name}</span>
                                                                </div>

                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? 'text-white' : 'text-green-600',
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                        )}
                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>
                    </div>
                    {!toggleSelectDates && (
                        <div
                            className="filter-container-typeViz">
                            <div
                                className="column-container">
                                <div
                                    className="pb-8 flex items-center">
                                    <div
                                        className="pr-2">
                                        <Listbox>
                                            <Listbox.Label
                                                className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">First</Listbox.Label>
                                        </Listbox>
                                    </div>
                                    <DatePicker
                                        oneTap
                                        placeholder="YYYY-MM-DD"
                                        style={{width: 190}}
                                        onChange={(e) => {
                                            handleFirstDateInterval(e?.getFullYear(), e?.getMonth(), e?.getDay())
                                            if (lastToggleRef == 1) {
                                                if (e?.getFullYear() !== undefined && e?.getMonth() !== undefined && e?.getDay() !== undefined) {
                                                    let date = e?.getFullYear() + "-" + e?.getMonth() + "-" + e?.getDay();
                                                    let expectedDate = handleGetClosestDate(date);
                                                    //handleRefDate(expectedDate);

                                                }
                                            }
                                        }}
                                        onClean={handleFirstDateIntervalReset}
                                    />
                                </div>
                                <div
                                    className="flex items-center">
                                    <div
                                        className="pr-2">
                                        <Listbox>
                                            <Listbox.Label
                                                className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Last</Listbox.Label>
                                        </Listbox>
                                    </div>
                                    <DatePicker
                                        oneTap
                                        placeholder="YYYY-MM-DD"
                                        style={{width: 190}}
                                        onChange={(e) => handleLastDateInterval(e?.getFullYear(), e?.getMonth(), e?.getDay())}
                                        onClean={handleLastDateIntervalReset}
                                    />
                                </div>
                                <div
                                    className="relative inline-block pl-12 pt-5 w-30 mr-2 ml-2 align-middle select-none">
                                    <button
                                        type="button"
                                        className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                        onClick={handleResetDates}>Reset
                                        dates
                                    </button>
                                </div>
                            </div>

                        </div>)}
                    {toggleSelectDates && (
                        <div
                            className="pl-6 pt-5">
                            <div
                                id="dropdownSearch"
                                className="z-10 bg-white rounded-lg shadow w-60 dark:bg-green-500">
                                <div
                                    className="p-3">
                                    <label
                                        htmlFor="input-group-search"
                                        className="sr-only">Search</label>
                                    <div
                                        className="relative">
                                        <div
                                            className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-900"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20">
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="input-group-search"
                                            className="bg-green-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                                            placeholder="Search date"
                                            value={searchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}/>
                                    </div>
                                </div>
                                <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700"
                                    aria-labelledby="dropdownSearchButton">
                                    {searchTerm ? filteredDates.map((date, index) => (
                                        <li key={index}>
                                            <div
                                                className="flex items-center p-2 rounded hover:bg-gray-100 ">
                                                <input
                                                    id={`checkbox-item-${index}`}
                                                    type="checkbox"
                                                    value={`${date}`}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 "
                                                    checked={isDateChecked(date, checkedDates)}
                                                    onChange={(e) => handleDateCheck(e.target.value)}
                                                />
                                                <label
                                                    htmlFor={`checkbox-item-${index}`}
                                                    className="w-full ms-2 text-sm font-medium text-gray-900 rounded">{date.split(" ")[1] === "00:00:00" ? date.split(" ")[0]: date}</label>
                                            </div>
                                        </li>
                                    )) : (
                                        <>
                                        <li>
                                            <div className="flex items-center p-2 rounded hover:bg-gray-100">
                                                <input
                                                    id="checkbox-all-dates"
                                                    type="checkbox"
                                                    value={'All dates'}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    checked={areAllDatesChecked(numberOfDates.length, checkedDates)}
                                                    onChange={handleAllDatesCheck}
                                                />
                                                <label htmlFor="checkbox-all-dates" className="w-full ms-2 text-sm font-medium text-white rounded hover:text-black">All Dates</label>
                                            </div>
                                        </li>
                                        {
                                        numberOfDates.map((date, index) => (
                                        <li key={index}>
                                            <div
                                                className="flex items-center p-2 rounded hover:bg-gray-100 ">
                                                <input
                                                    id={`checkbox-item-${index}`}
                                                    type="checkbox"
                                                    value={`${date}`}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 "
                                                    checked={isDateChecked(date, checkedDates)}
                                                    onChange={(e) => handleDateCheck(e.target.value)}
                                                />
                                                <label
                                                    htmlFor={`checkbox-item-${index}`}
                                                    className="w-full ms-2 text-sm font-medium text-white rounded hover:text-black">{date.split(" ")[1] === "00:00:00" ? date.split(" ")[0]: date}</label>
                                            </div>
                                        </li>
                                    ))}
                                        </>
                                    )}
                                </ul>

                            </div>
                        </div>
                    )}
                    <div
                        className="filter-container-typeDepth">
                        <Listbox
                            value={selectedDesiredDepth}
                            onChange={(selectedOption) => {
                                setSelectedDesiredDepth(selectedOption);
                                handleToogleDepthInterval();
                            }}>
                            {({open}) => (
                                <>
                                    <Listbox.Label
                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Desired depth</Listbox.Label>
                                    <div
                                        className="relative mt-2">
                                        <Listbox.Button
                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedDesiredDepth.name}</span>
                                      </span>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                        </Listbox.Button>
                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {desiredDepthTypes.map((dat) => (
                                                    <Listbox.Option
                                                        key={dat.id}
                                                        className={({active}) =>
                                                            classNames(
                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                            )
                                                        }
                                                        value={dat}
                                                    >
                                                        {({
                                                              selected,
                                                              active
                                                          }) => (
                                                            <>
                                                                <div
                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{dat.name}</span>
                                                                </div>

                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? 'text-white' : 'text-green-600',
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                        )}
                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>
                    </div>
                {toggleDepthInterval && (
                    <div
                        className="filter-container-typeViz">
                        <div
                            className="column-container">
                            <div
                                className="pb-8 flex items-center">
                                <div
                                    className="pr-2">
                                    <Listbox>
                                        <Listbox.Label
                                            className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">First</Listbox.Label>
                                    </Listbox>
                                </div>
                                <Listbox
                                    value={selectedFirstDesiredDepth}
                                    onChange={(selectedOption) => {
                                        setSelectedFirstDesiredDepth(selectedOption);
                                        handleFirstDesiredDepth(selectedOption.toString());
                                    }}>
                                    {({open}) => (
                                        <>
                                            <div
                                                className="relative mt-2">
                                                <Listbox.Button
                                                    className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedFirstDesiredDepth.toString()}</span>
                                      </span>
                                                    <span
                                                        className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                </Listbox.Button>
                                                <Transition
                                                    show={open}
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options
                                                        className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {depthArray.filter(value => value < selectedLastDesiredDepth).map((d) => (
                                                            <Listbox.Option
                                                                key={d}
                                                                className={({active}) =>
                                                                    classNames(
                                                                        active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                        'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                    )
                                                                }
                                                                value={d}
                                                            >
                                                                {({
                                                                      selected,
                                                                      active
                                                                  }) => (
                                                                    <>
                                                                        <div
                                                                            className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{d}</span>
                                                                        </div>

                                                                        {selected ? (
                                                                            <span
                                                                                className={classNames(
                                                                                    active ? 'text-white' : 'text-green-600',
                                                                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                )}
                                                                            >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                            <div
                                className="flex items-center">
                                <div
                                    className="pr-2">
                                    <Listbox>
                                        <Listbox.Label
                                            className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Last</Listbox.Label>
                                    </Listbox>
                                </div>
                                <Listbox
                                    value={selectedLastDesiredDepth}
                                    onChange={(selectedOption) => {
                                        setSelectedLastDesiredDepth(selectedOption);
                                        handleLastDesiredDepth(selectedOption.toString());
                                    }}>
                                    {({open}) => (
                                        <>
                                            <div
                                                className="relative mt-2">
                                                <Listbox.Button
                                                    className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedLastDesiredDepth.toString()}</span>
                                      </span>
                                                    <span
                                                        className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                </Listbox.Button>
                                                <Transition
                                                    show={open}
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options
                                                        className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {depthArray.filter(value => value > selectedFirstDesiredDepth && value <= topValueSlider).map((d) => (
                                                            <Listbox.Option
                                                                key={d}
                                                                className={({active}) =>
                                                                    classNames(
                                                                        active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                        'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                    )
                                                                }
                                                                value={d}
                                                            >
                                                                {({
                                                                      selected,
                                                                      active
                                                                  }) => (
                                                                    <>
                                                                        <div
                                                                            className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{d}</span>
                                                                        </div>

                                                                        {selected ? (
                                                                            <span
                                                                                className={classNames(
                                                                                    active ? 'text-white' : 'text-green-600',
                                                                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                )}
                                                                            >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                            <div
                                className="relative inline-block pl-12 pt-5 w-30 mr-2 ml-2 align-middle select-none">
                                <button
                                    type="button"
                                    className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                    onClick={handleDesiredDepthIntervalReset}>Reset interval
                                </button>
                            </div>
                        </div>

                    </div>)}
                </div>
                <div>
                    <div
                        className="row-container">
                        <div
                            className="column-container middle-column">
                            <div
                                className="middle-col-select">
                                <div
                                    className="filter-container-typeViz">
                                    <Listbox
                                        value={selectedMeasurement}
                                        onChange={(selectedOption) => {
                                            setSelectedMeasurement(selectedOption);
                                            handleSelectedMeasurement(selectedOption.toString());
                                        }}>
                                        {({open}) => (
                                            <>
                                                <Listbox.Label
                                                    className="block text-lg font-medium leading-6 text-gray-900 text-left">Measurement</Listbox.Label>
                                                <div
                                                    className="relative mt-2">
                                                    <Listbox.Button
                                                        className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedMeasurement}</span>
                                      </span>
                                                        <span
                                                            className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                    </Listbox.Button>
                                                    <Transition
                                                        show={open}
                                                        as={Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options
                                                            className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                            {numberOfMeasurements.map((m) => (
                                                                <Listbox.Option
                                                                    key={m}
                                                                    className={({active}) =>
                                                                        classNames(
                                                                            active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                        )
                                                                    }
                                                                    value={m}
                                                                >
                                                                    {({
                                                                          selected,
                                                                          active
                                                                      }) => (
                                                                        <>
                                                                            <div
                                                                                className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{m}</span>
                                                                            </div>

                                                                            {selected ? (
                                                                                <span
                                                                                    className={classNames(
                                                                                        active ? 'text-white' : 'text-green-600',
                                                                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                    )}
                                                                                >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                            <div
                                className="filter-container-typeViz">
                                <Listbox
                                    value={selectedInclinometer}
                                    onChange={(selectedOption) => {
                                        setSelectedInclinometer(selectedOption);
                                       handleSelectedInclinometer(parseInt(selectedOption.toString()));
                                    }}>
                                    {({open}) => (
                                        <>
                                            <Listbox.Label
                                                className="block text-lg font-medium leading-6 text-gray-900 text-left">Inclinometer</Listbox.Label>
                                            <div
                                                className="relative mt-2">
                                                <Listbox.Button
                                                    className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">I{selectedInclinometer.toString()}</span>
                                      </span>
                                                    <span
                                                        className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                </Listbox.Button>
                                                <Transition
                                                    show={open}
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options
                                                        className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {numberOfInc.map((inc) => (
                                                            <Listbox.Option
                                                                key={inc}
                                                                className={({active}) =>
                                                                    classNames(
                                                                        active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                        'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                    )
                                                                }
                                                                value={inc}
                                                            >
                                                                {({
                                                                      selected,
                                                                      active
                                                                  }) => (
                                                                    <>
                                                                        <div
                                                                            className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >I{inc}</span>
                                                                        </div>

                                                                        {selected ? (
                                                                            <span
                                                                                className={classNames(
                                                                                    active ? 'text-white' : 'text-green-600',
                                                                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                )}
                                                                            >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                            </div>
                            <div
                                className="filter-container-graphClock chart-wrapper"
                                ref={chartClock}
                            >
                                <ChartClock
                                    graphDataA={selectedAXChartData}
                                    graphDataB={selectedAYChartData}
                                    loadingData={loadingData}
                                />
                            </div>

                        </div>
                        <div
                            className="column-container right-column">
                            <div
                                className="filter-container-ref">
                                <Listbox>
                                    <Listbox.Label
                                        className="block text-lg font-medium leading-6 text-gray-900 text-left pb-2">Reference</Listbox.Label>
                                </Listbox>

                                <ul className="items-center w-300 text-base font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-green-500 dark:border-gray-700 dark:text-white">
                                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                        <div
                                            className="flex items-center ps-3 pr-1">
                                            <input
                                                id="earliestDate"
                                                type="radio"
                                                value="false"
                                                name="list-radio"
                                                checked={handleToogleReference(0)}
                                                onChange={(e) => {
                                                    handleEarliestDate(false);
                                                    handleResetRefDate()
                                                    setLastToggleRef(0)
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "/>
                                            <label
                                                htmlFor="earliestDate"
                                                className="w-full py-3 ms-2 text-sm font-medium text-white-50 ">Earliest
                                                date</label>
                                        </div>
                                    </li>
                                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                        <div
                                            className="flex items-center ps-3">
                                            <input
                                                id="fromselectdate"
                                                type="radio"
                                                value="true"
                                                name="list-radio"
                                                checked={handleToogleReference(1)}
                                                onChange={(e) => {
                                                    handleEarliestDate(true)
                                                    setLastToggleRef(1)

                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  "/>
                                            <label
                                                htmlFor="fromselectdate"
                                                className="w-full py-3 ms-2 text-sm font-medium text-white-50">Select<br/>date</label>
                                        </div>
                                    </li>
                                    <li className="w-full dark:border-gray-600">
                                        <div
                                            className="flex items-center ps-3">
                                            <input
                                                id="fromInterval"
                                                type="radio"
                                                value="true"
                                                name="list-radio"
                                                checked={handleToogleReference(2)}
                                                onChange={(e) => {
                                                    handleEarliestDate(false)
                                                    handleResetRefDate()
                                                    setLastToggleRef(2)
                                                    setSelectedDatesTypes(datesTypes[0]);
                                                    if(toggleSelectDates) {
                                                        handleToogleSelectDates();
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  "/>
                                            <label
                                                htmlFor="fromInterval"
                                                className="w-full py-3 ms-2 text-sm font-medium text-white-50">From interval</label>
                                        </div>
                                    </li>
                                </ul>
                                <div
                                    className="pt-3">
                                    {toggleIntervalRef ? (
                                        <select
                                            id="selectRefDateId"
                                            onChange={(e) => handleRefDate(e.target.value)}
                                            style={{
                                                padding: '8px',
                                                fontSize: '16px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc'
                                            }}>
                                            {numberOfDates.map(date => (
                                                <option
                                                    key={date}
                                                    value={date}>{date.split(" ")[0]}</option>
                                            ))}
                                        </select>) : (
                                        <select
                                            onChange={(e) => handleRefDate(e.target.value)}
                                            style={{
                                                padding: '8px',
                                                fontSize: '16px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc'
                                            }}
                                            disabled>
                                                <option
                                                    key={earliestRefDate}
                                                    value={earliestRefDate}>{earliestRefDate.split(" ")[0]}</option>

                                        </select>
                                    )}
                                </div>
                            </div>
                            <div
                                className="filter-container-elevation">
                                <Listbox
                                    value={selectedElevation}
                                    onChange={setSelectedElevation}>
                                    {({open}) => (
                                        <>
                                            <Listbox.Label
                                                className="block text-lg font-medium leading-6 text-gray-900 text-left">Elevation</Listbox.Label>
                                            <div
                                                className="relative mt-2">
                                                <Listbox.Button
                                                    className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedElevation.name}</span>
                                      </span>
                                                    <span
                                                        className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                </Listbox.Button>
                                                <Transition
                                                    show={open}
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options
                                                        className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {elevation.map((res) => (
                                                            <Listbox.Option
                                                                key={res.id}
                                                                className={({active}) =>
                                                                    classNames(
                                                                        active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                        'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                    )
                                                                }
                                                                value={res}
                                                            >
                                                                {({
                                                                      selected,
                                                                      active
                                                                  }) => (
                                                                    <>
                                                                        <div
                                                                            className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                                        </div>

                                                                        {selected ? (
                                                                            <span
                                                                                className={classNames(
                                                                                    active ? 'text-white' : 'text-green-600',
                                                                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                )}
                                                                            >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                            <div
                                className="filter-container-typeInputs1">
                                <Listbox>
                                    <Listbox.Label
                                        className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Show
                                        total
                                        displacement</Listbox.Label>
                                </Listbox>
                                <div
                                    className="relative inline-block w-10 mr-2 align-middle select-none">
                                    <input
                                        id="Green"
                                        type="checkbox"
                                        onChange={(e) => handleToogleTotalChart()}
                                        className="checked:bg-green-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-green-500 appearance-none cursor-pointer"/>
                                    <label
                                        htmlFor="Green"
                                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"/>
                                </div>
                            </div>
                            <div
                                className="filter-container-typeInputs2">
                                <Listbox>
                                    <Listbox.Label
                                        className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Show
                                        temperature</Listbox.Label>
                                </Listbox>
                                <div
                                    className="relative inline-block w-10 mr-2 align-middle select-none">
                                    <input
                                        id="Green"
                                        type="checkbox"
                                        onChange={(e) => handleToogleTempChart()}
                                        className={`checked:bg-green-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 ${!toggleTotalChart ? 'border-gray-500' : 'border-green-500'} appearance-none cursor-pointer ${!toggleTotalChart ? 'opacity-50' : ''}`}
                                        disabled={!toggleTotalChart}
                                        style={{ transform: (!toggleTotalChart && toggleTempChart) ? 'translateX(-50%)' : 'none' }}
                                    />
                                    <label
                                        htmlFor="Green"
                                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"/>
                                </div>
                            </div>
                            <div className="export-data">
                                <div
                                    className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                                <button type="button"
                                        className="py-2 px-4  bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                        onClick={handleOpen}>
                                    Export data
                                </button>
                                </div>
                            </div>
                            <Modal
                                open={open}
                                onClose={handleClose}
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
                                    '& .close-button': {
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                    },
                                }}>
                                    <IconButton className="close-button" aria-label="close" onClick={handleClose}>
                                        <Clear />
                                    </IconButton>
                                    <div
                                        className="filter-container-elevation">
                                        <Listbox
                                            value={selectedExport}
                                            onChange={setSelectedExport}>
                                            {({open}) => (
                                                <>
                                                    <Listbox.Label
                                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Export
                                                        results</Listbox.Label>
                                                    <div
                                                        className="relative mt-2">
                                                        <Listbox.Button
                                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedExport.name}</span>
                                      </span>
                                                            <span
                                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            show={open}
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options
                                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                {exportSelect.map((res) => (
                                                                    <Listbox.Option
                                                                        key={res.id}
                                                                        className={({active}) =>
                                                                            classNames(
                                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                            )
                                                                        }
                                                                        value={res}
                                                                    >
                                                                        {({
                                                                              selected,
                                                                              active
                                                                          }) => (
                                                                            <>
                                                                                <div
                                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                                                </div>

                                                                                {selected ? (
                                                                                    <span
                                                                                        className={classNames(
                                                                                            active ? 'text-white' : 'text-green-600',
                                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                        )}
                                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                    <div
                                                        className="filter-container-typeViz">
                                                        <Listbox>
                                                            <Listbox.Label
                                                                className="pb-4 block text-lg font-medium leading-6 text-gray-900 text-left">Graph
                                                                to
                                                                export</Listbox.Label>
                                                        </Listbox>
                                                        <select
                                                            onChange={(e) => handleSelectedGraphExport(e.target.value)}
                                                            style={{
                                                                padding: '8px',
                                                                fontSize: '16px',
                                                                borderRadius: '5px',
                                                                border: '1px solid #ccc'
                                                            }}>
                                                            {!toggleTotalChart && (
                                                                <option
                                                                    key={"A"}
                                                                    value={"A"}>A
                                                                </option>)};
                                                            {!toggleTempChart && (
                                                                <option
                                                                    key={"B"}
                                                                    value={"B"}>B
                                                                </option>)}
                                                            {toggleTotalChart && (
                                                                <option
                                                                    key={"TOTAL"}
                                                                    value={"TOTAL"}>Total
                                                                </option>)}
                                                            {toggleTempChart && (
                                                                <option
                                                                    key={"TEMP"}
                                                                    value={"TEMP"}>Temp
                                                                </option>)}

                                                        </select>
                                                        <div
                                                            className="relative inline-block w-30 mr-2 ml-2 align-middle select-none">
                                                            <button
                                                                type="button"
                                                                className="py-2 px-4  bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                                                onClick={handleExportSVG}>Export
                                                                SVG
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </Listbox>
                                    </div>
                                </Box>
                            </Modal>
                        </div>
                    </div>

                    <div
                        className="charts-container">
                        <div
                            className="filter-container-slider">
                            <div
                                className="container-slider">
                                <Slider
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            color: "#22c55e"
                                        },
                                        '& .MuiSlider-track': {
                                            color: "#15803d"
                                        },
                                        '& .MuiSlider-rail': {
                                            color: "#86efac"
                                        },
                                        '& .MuiSlider-active': {
                                            color: "#15803d"
                                        }
                                    }}
                                    //getAriaLabel={() => 'Temperature range'}
                                    orientation="vertical"
                                    min={lowerValueSlider}
                                    step={1}
                                    marks
                                    max={topValueSlider}
                                    value={selectedValuesSlider}
                                    onChange={handleSliderChange}
                                    valueLabelDisplay="on"
                                    valueLabelFormat={value =>
                                        <div>{`${Math.abs(maxDepthInc - value)} (m)`}</div>}
                                    disableSwap
                                    //getAriaValueText={valuetext}
                                />

                            </div>
                        </div>
                        {!toggleTotalChart ? (
                            <>
                                <div
                                    className="chart-wrapper left-graph"
                                    ref={chartAXRef}>
                                    <Chart
                                        graphData={selectedAXChartData}
                                        loadingData={loadingData}
                                        refDate={refDate}
                                    />
                                </div>
                                <div
                                    className="chart-wrapper"
                                    ref={chartAYRef}>
                                    <Chart
                                        graphData={selectedAYChartData}
                                        loadingData={loadingData}
                                        refDate={refDate}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="chart-wrapper"
                                    ref={chartTotalRef}>

                                    <ChartTotal
                                        graphDataX={selectedAXChartData}
                                        graphDataY={selectedAYChartData}
                                        loadingData={loadingData}/>
                                </div>
                            </>
                        )}
                        {!toggleTempChart ? (
                            <>

                            </>
                        ) : (
                            <>
                                <div
                                    className="chart-wrapper"
                                    ref={chartTempRef}>
                                    <ChartTemp
                                        graphData={auxDataTemp}
                                        loadingData={loadingData}/>
                                </div>
                            </>
                        )}
                        <div
                            className="chart-wrapper"
                            ref={chartSoil}>
                            <ChartSoil
                                graphData={soilData}
                                loadingData={loadingData}
                                totalChart={toggleTotalChart}
                                tempChart={toggleTempChart}/>
                        </div>
                    </div>
                    {!toggleTotalChart ? (
                        <>
                    <div>
                        <ChartDetails
                            graphData={selectedAXChartData}
                            initialMaxDepth={maxDepthInc}
                            minDepth={minDepthGraph}
                            maxDepth={maxDepthGraph}
                            loadingData={loadingData}
                        />
                    </div>
                    <div>
                        <ChartDetails
                            graphData={selectedAYChartData}
                            initialMaxDepth={maxDepthInc}
                            minDepth={minDepthGraph}
                            maxDepth={maxDepthGraph}
                            loadingData={loadingData}
                        />
                    </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <ChartDetailsTotal
                                    graphDataX={selectedAXChartData}
                                    graphDataY={selectedAYChartData}
                                    initialMaxDepth={maxDepthInc}
                                    minDepth={minDepthGraph}
                                    maxDepth={maxDepthGraph}
                                    loadingData={loadingData}
                                />
                        </div>
                        </>
                        )}
                </div>
            </div> ): (
                /*
                 * PROFILE SECTION
                 */
                <div
                    className="row-container">
                    <div
                        className="column-container left-column-p">
                        <div
                            className="filter-container-typeViz">
                            <Listbox
                                value={selectedVisualization}
                                onChange={setSelectedVisualization}>
                                {({open}) => (
                                    <>
                                        <Listbox.Label
                                            className="block text-lg font-medium leading-6 text-gray-900 text-left">Type
                                            of
                                            visualization</Listbox.Label>
                                        <div
                                            className="relative mt-2 ">
                                            <Listbox.Button
                                                className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedVisualization.name}</span>
                                      </span>
                                                <span
                                                    className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                            </Listbox.Button>
                                            <Transition
                                                show={open}
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options
                                                    className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {visualization.map((viz) => (
                                                        <Listbox.Option
                                                            key={viz.id}
                                                            className={({active}) =>
                                                                classNames(
                                                                    active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                )
                                                            }
                                                            value={viz}
                                                        >
                                                            {({
                                                                  selected,
                                                                  active
                                                              }) => (
                                                                <>
                                                                    <div
                                                                        className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {viz.name}
                          </span>
                                                                    </div>

                                                                    {selected ? (
                                                                        <span
                                                                            className={classNames(
                                                                                active ? 'text-white' : 'text-green-600',
                                                                                'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                            )}
                                                                        >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Listbox>
                        </div>
                        <div
                            className="filter-container-typeViz">
                            <Listbox
                                value={selectedResultsProfiles}
                                onChange={(selectResultOption) => {
                                    handleSelectedResultsProfiles(selectResultOption.name)
                                }}>
                                {({open}) => (
                                    <>
                                        <Listbox.Label
                                            className="block text-lg font-medium leading-6 text-gray-900 text-left">Type
                                            of
                                            result</Listbox.Label>
                                        <div
                                            className="relative mt-2">
                                            <Listbox.Button
                                                className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedResultsProfiles.name}</span>
                                      </span>
                                                <span
                                                    className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                            </Listbox.Button>
                                            <Transition
                                                show={open}
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options
                                                    className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {resultsProfiles.map((res) => (
                                                        <Listbox.Option
                                                            key={res.id}
                                                            className={({active}) =>
                                                                classNames(
                                                                    active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                )
                                                            }
                                                            value={res}
                                                        >
                                                            {({
                                                                  selected,
                                                                  active
                                                              }) => (
                                                                <>
                                                                    <div
                                                                        className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                                    </div>

                                                                    {selected ? (
                                                                        <span
                                                                            className={classNames(
                                                                                active ? 'text-white' : 'text-green-600',
                                                                                'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                            )}
                                                                        >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Listbox>
                        </div>
                        <div
                            className="filter-container-typeViz">
                            <Listbox
                                value={selectedDatesTypes}
                                onChange={(selectedOption) => {
                                    setSelectedDatesTypes(selectedOption);
                                    handleToogleSelectDates();
                                }}>
                                {({open}) => (
                                    <>
                                        <Listbox.Label
                                            className="block text-lg font-medium leading-6 text-gray-900 text-left">Dates</Listbox.Label>
                                        <div
                                            className="relative mt-2">
                                            <Listbox.Button
                                                className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedDatesTypes.name}</span>
                                      </span>
                                                <span
                                                    className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                            </Listbox.Button>
                                            <Transition
                                                show={open}
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options
                                                    className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {datesTypes.map((dat) => (
                                                        <Listbox.Option
                                                            key={dat.id}
                                                            className={({active}) =>
                                                                classNames(
                                                                    active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                )
                                                            }
                                                            value={dat}
                                                        >
                                                            {({
                                                                  selected,
                                                                  active
                                                              }) => (
                                                                <>
                                                                    <div
                                                                        className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{dat.name}</span>
                                                                    </div>

                                                                    {selected ? (
                                                                        <span
                                                                            className={classNames(
                                                                                active ? 'text-white' : 'text-green-600',
                                                                                'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                            )}
                                                                        >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Listbox>
                        </div>
                        {!toggleSelectDates && (
                            <div
                                className="filter-container-typeViz">
                                <div
                                    className="column-container">
                                    <div
                                        className="pb-8 flex items-center">
                                        <div
                                            className="pr-2">
                                            <Listbox>
                                                <Listbox.Label
                                                    className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">First</Listbox.Label>
                                            </Listbox>
                                        </div>
                                        <DatePicker
                                            oneTap
                                            placeholder="YYYY-MM-DD"
                                            style={{width: 190}}
                                            onChange={(e) => {
                                                handleFirstDateInterval(e?.getFullYear(), e?.getMonth(), e?.getDay())
                                                if (lastToggleRef == 1) {
                                                    if (e?.getFullYear() !== undefined && e?.getMonth() !== undefined && e?.getDay() !== undefined) {
                                                        let date = e?.getFullYear() + "-" + e?.getMonth() + "-" + e?.getDay();
                                                        let expectedDate = handleGetClosestDate(date);
                                                        //handleRefDate(expectedDate);

                                                    }
                                                }
                                            }}
                                            onClean={handleFirstDateIntervalReset}
                                        />
                                    </div>
                                    <div
                                        className="flex items-center">
                                        <div
                                            className="pr-2">
                                            <Listbox>
                                                <Listbox.Label
                                                    className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Last</Listbox.Label>
                                            </Listbox>
                                        </div>
                                        <DatePicker
                                            oneTap
                                            placeholder="YYYY-MM-DD"
                                            style={{width: 190}}
                                            onChange={(e) => handleLastDateInterval(e?.getFullYear(), e?.getMonth(), e?.getDay())}
                                            onClean={handleLastDateIntervalReset}
                                        />
                                    </div>
                                    <div
                                        className="relative inline-block pl-12 pt-5 w-30 mr-2 ml-2 align-middle select-none">
                                        <button
                                            type="button"
                                            className="py-2 px-4 bg-green-500 hover:bg-green-700 focus:ring-green-400 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                                            onClick={handleResetDates}>Reset
                                            dates
                                        </button>
                                    </div>
                                </div>

                            </div>)}
                        {toggleSelectDates && (
                            <div
                                className="pl-6 pt-5">
                                <div
                                    id="dropdownSearch"
                                    className="z-10 bg-white rounded-lg shadow w-60 dark:bg-green-500">
                                    <div
                                        className="p-3">
                                        <label
                                            htmlFor="input-group-search"
                                            className="sr-only">Search</label>
                                        <div
                                            className="relative">
                                            <div
                                                className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                <svg
                                                    className="w-4 h-4 text-gray-900"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 20 20">
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="input-group-search"
                                                className="bg-green-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                                                placeholder="Search date"
                                                value={searchTerm}
                                                onChange={(e) => handleSearchChange(e.target.value)}/>
                                        </div>
                                    </div>
                                    <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700"
                                        aria-labelledby="dropdownSearchButton">
                                        {searchTerm ? filteredDates.map((date, index) => (
                                            <li key={index}>
                                                <div
                                                    className="flex items-center p-2 rounded hover:bg-gray-100 ">
                                                    <input
                                                        id={`checkbox-item-${index}`}
                                                        type="checkbox"
                                                        value={`${date}`}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 "
                                                        checked={isDateChecked(date, checkedDates)}
                                                        onChange={(e) => handleDateCheck(e.target.value)}
                                                    />
                                                    <label
                                                        htmlFor={`checkbox-item-${index}`}
                                                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded">{date.split(" ")[1] === "00:00:00" ? date.split(" ")[0]: date}</label>
                                                </div>
                                            </li>
                                        )) : (
                                            <>
                                                <li>
                                                    <div className="flex items-center p-2 rounded hover:bg-gray-100">
                                                        <input
                                                            id="checkbox-all-dates"
                                                            type="checkbox"
                                                            value={'All dates'}
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                            checked={areAllDatesChecked(numberOfDates.length, checkedDates)}
                                                            onChange={handleAllDatesCheck}
                                                        />
                                                        <label htmlFor="checkbox-all-dates" className="w-full ms-2 text-sm font-medium text-white rounded hover:text-black">All Dates</label>
                                                    </div>
                                                </li>
                                                {
                                                    numberOfDates.map((date, index) => (
                                                        <li key={index}>
                                                            <div
                                                                className="flex items-center p-2 rounded hover:bg-gray-100 ">
                                                                <input
                                                                    id={`checkbox-item-${index}`}
                                                                    type="checkbox"
                                                                    value={`${date}`}
                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 "
                                                                    checked={isDateChecked(date, checkedDates)}
                                                                    onChange={(e) => handleDateCheck(e.target.value)}
                                                                />
                                                                <label
                                                                    htmlFor={`checkbox-item-${index}`}
                                                                    className="w-full ms-2 text-sm font-medium text-white rounded hover:text-black">{date.split(" ")[1] === "00:00:00" ? date.split(" ")[0]: date}</label>
                                                            </div>
                                                        </li>
                                                    ))}
                                            </>
                                        )}
                                    </ul>

                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <div
                            className="row-container left-column-profile">
                            <div
                                className="column-container middle-column">
                                <div
                                    className="middle-col-select">
                                    <div
                                        className="filter-container-typeViz">
                                        <Listbox
                                            value={selectedProfile}
                                            onChange={(selectedOption) => {
                                                setSelectedProfile(selectedOption);
                                            }}>
                                            {({open}) => (
                                                <>
                                                    <Listbox.Label
                                                        className="block text-lg font-medium leading-6 text-gray-900 text-left">Profile</Listbox.Label>
                                                    <div
                                                        className="relative mt-2">
                                                        <Listbox.Button
                                                            className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedProfile.name}</span>
                                      </span>
                                                            <span
                                                                className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            show={open}
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options
                                                                className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                {profiles.map((m) => (
                                                                    <Listbox.Option
                                                                        key={m.id}
                                                                        className={({active}) =>
                                                                            classNames(
                                                                                active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                            )
                                                                        }
                                                                        value={m}
                                                                    >
                                                                        {({
                                                                              selected,
                                                                              active
                                                                          }) => (
                                                                            <>
                                                                                <div
                                                                                    className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{m.name}</span>
                                                                                </div>

                                                                                {selected ? (
                                                                                    <span
                                                                                        className={classNames(
                                                                                            active ? 'text-white' : 'text-green-600',
                                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                        )}
                                                                                    >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                </>
                                            )}
                                        </Listbox>
                                    </div>
                                    {selectedProfile.name !== "All" && (
                                        <div
                                            className="filter-container-typeViz">
                                            <Listbox
                                                value={selectedOrthoDirection}
                                                onChange={(selectedOption) => {
                                                    setSelectedOrthoDirection(selectedOption);
                                                }}>
                                                {({open}) => (
                                                    <>
                                                        <Listbox.Label
                                                            className="block text-lg font-medium leading-6 text-gray-900 text-left">Results</Listbox.Label>
                                                        <div
                                                            className="relative mt-2">
                                                            <Listbox.Button
                                                                className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedOrthoDirection.name}</span>
                                      </span>
                                                                <span
                                                                    className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                            </Listbox.Button>
                                                            <Transition
                                                                show={open}
                                                                as={Fragment}
                                                                leave="transition ease-in duration-100"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <Listbox.Options
                                                                    className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                    {orthoDirection.map((m) => (
                                                                        <Listbox.Option
                                                                            key={m.id}
                                                                            className={({active}) =>
                                                                                classNames(
                                                                                    active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                                )
                                                                            }
                                                                            value={m}
                                                                        >
                                                                            {({
                                                                                  selected,
                                                                                  active
                                                                              }) => (
                                                                                <>
                                                                                    <div
                                                                                        className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >{m.name}</span>
                                                                                    </div>

                                                                                    {selected ? (
                                                                                        <span
                                                                                            className={classNames(
                                                                                                active ? 'text-white' : 'text-green-600',
                                                                                                'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                            )}
                                                                                        >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    ))}
                                                                </Listbox.Options>
                                                            </Transition>
                                                        </div>
                                                    </>
                                                )}
                                            </Listbox>
                                        </div>
                                    )}
                                    <div className="azimute">
                                    <img
                                        src="/azimute.png"
                                        width="200"
                                        height="200"
                                    />
                                    </div>
                                </div>
                            </div>
                            <div
                                className="column-container right-column">
                                <div
                                    className="filter-container-ref">
                                    <Listbox>
                                        <Listbox.Label
                                            className="block text-lg font-medium leading-6 text-gray-900 text-left pb-2">Reference</Listbox.Label>
                                    </Listbox>

                                    <ul className="items-center w-300 text-base font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-green-500 dark:border-gray-700 dark:text-white">
                                        <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                            <div
                                                className="flex items-center ps-3 pr-1">
                                                <input
                                                    id="earliestDate"
                                                    type="radio"
                                                    value="false"
                                                    name="list-radio"
                                                    checked={handleToogleReference(0)}
                                                    onChange={(e) => {
                                                        handleEarliestDate(false);
                                                        handleResetRefDate()
                                                        setLastToggleRef(0)
                                                    }}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "/>
                                                <label
                                                    htmlFor="earliestDate"
                                                    className="w-full py-3 ms-2 text-sm font-medium text-white-50 ">Earliest
                                                    date</label>
                                            </div>
                                        </li>
                                        <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                            <div
                                                className="flex items-center ps-3">
                                                <input
                                                    id="fromselectdate"
                                                    type="radio"
                                                    value="true"
                                                    name="list-radio"
                                                    checked={handleToogleReference(1)}
                                                    onChange={(e) => {
                                                        handleEarliestDate(true)
                                                        setLastToggleRef(1)

                                                    }}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  "/>
                                                <label
                                                    htmlFor="fromselectdate"
                                                    className="w-full py-3 ms-2 text-sm font-medium text-white-50">Select<br/>date</label>
                                            </div>
                                        </li>
                                        <li className="w-full dark:border-gray-600">
                                            <div
                                                className="flex items-center ps-3">
                                                <input
                                                    id="fromInterval"
                                                    type="radio"
                                                    value="true"
                                                    name="list-radio"
                                                    checked={handleToogleReference(2)}
                                                    onChange={(e) => {
                                                        handleEarliestDate(false)
                                                        handleResetRefDate()
                                                        setLastToggleRef(2)
                                                        setSelectedDatesTypes(datesTypes[0]);
                                                        if (toggleSelectDates) {
                                                            handleToogleSelectDates();
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  "/>
                                                <label
                                                    htmlFor="fromInterval"
                                                    className="w-full py-3 ms-2 text-sm font-medium text-white-50">From
                                                    interval</label>
                                            </div>
                                        </li>
                                    </ul>
                                    <div
                                        className="pt-3">
                                        {toggleIntervalRef ? (
                                            <select
                                                id="selectRefDateId"
                                                onChange={(e) => handleRefDate(e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    fontSize: '16px',
                                                    borderRadius: '5px',
                                                    border: '1px solid #ccc'
                                                }}>
                                                {numberOfDates.map(date => (
                                                    <option
                                                        key={date}
                                                        value={date}>{date.split(" ")[0]}</option>
                                                ))}
                                            </select>) : (
                                            <select
                                                onChange={(e) => handleRefDate(e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    fontSize: '16px',
                                                    borderRadius: '5px',
                                                    border: '1px solid #ccc'
                                                }}
                                                disabled>
                                                <option
                                                    key={earliestRefDate}
                                                    value={earliestRefDate}>{earliestRefDate.split(" ")[0]}</option>

                                            </select>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="filter-container-elevation">
                                    <Listbox
                                        value={selectedLocation}
                                        onChange={setSelectedLocation}>
                                        {({open}) => (
                                            <>
                                                <Listbox.Label
                                                    className="block text-lg font-medium leading-6 text-gray-900 text-left">Location</Listbox.Label>
                                                <div
                                                    className="relative mt-2">
                                                    <Listbox.Button
                                                        className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span
                                          className="flex items-center">
                                          <span
                                              className="ml-3 block truncate">{selectedLocation.name}</span>
                                      </span>
                                                        <span
                                                            className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"/>
                                      </span>
                                                    </Listbox.Button>
                                                    <Transition
                                                        show={open}
                                                        as={Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options
                                                            className="absolute z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                            {locations.map((res) => (
                                                                <Listbox.Option
                                                                    key={res.id}
                                                                    className={({active}) =>
                                                                        classNames(
                                                                            active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                        )
                                                                    }
                                                                    value={res}
                                                                >
                                                                    {({
                                                                          selected,
                                                                          active
                                                                      }) => (
                                                                        <>
                                                                            <div
                                                                                className="flex items-center">
                                                                <span
                                                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                                >
                            {res.name}
                          </span>
                                                                            </div>

                                                                            {selected ? (
                                                                                <span
                                                                                    className={classNames(
                                                                                        active ? 'text-white' : 'text-green-600',
                                                                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                                    )}
                                                                                >
                            <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"/>
                          </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </>
                                        )}
                                    </Listbox>
                                </div>
                                <div
                                    className="filter-container-typeInputsLocation">
                                    <Listbox>
                                        <Listbox.Label
                                            className="pr-1 text-base font-medium leading-6 text-gray-900 text-left">Show
                                            arrows</Listbox.Label>
                                    </Listbox>
                                    <div
                                        className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            id="Green"
                                            type="checkbox"
                                            onChange={(e) => handleToogleArrows()}
                                            className="checked:bg-green-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-green-500 appearance-none cursor-pointer"/>
                                        <label
                                            htmlFor="Green"
                                            className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            id="konvaContainer"
                            className="container-profile"></div>
                        <div className="flex-charts-container">
                        {(selectedProfile.name !== "All" && selectedOrthoDirection.name === "A") && selectedProfileArrayChartDataX.length > 0 &&(
                            profileIncChart.map((inc, index) => (
                                <div className="chart-wrapper2" key={index}>
                                    <ChartProfileA
                                        graphData={selectedProfileArrayChartDataX[index]}
                                        loadingData={loadingData}
                                        maxDepthOverall={maxProfileDepth}
                                        maxDepthInc={depthProfilesArray[index]}
                                        maxData={maxProfileDisplacementX+2}
                                        inc={inc}
                                        numberOfTotalInc={profileIncChart.length}
                                        leftChart={index === 0}
                                    />
                                </div>))

                        )}
                            {(selectedProfile.name !== "All" && selectedOrthoDirection.name === "B") && selectedProfileArrayChartDataY.length > 0 &&(
                                profileIncChart.map((inc, index) => (
                                    <div className="chart-wrapper2" key={index}>
                                        <ChartProfileA
                                            graphData={selectedProfileArrayChartDataY[index]}
                                            loadingData={loadingData}
                                            maxDepthOverall={maxProfileDepth}
                                            maxDepthInc={depthProfilesArray[index]}
                                            maxData={maxProfileDisplacementY+2}
                                            inc={inc}
                                            numberOfTotalInc={profileIncChart.length}
                                            leftChart={index === 0}
                                        />
                                    </div>))

                            )}
                        </div>
                        {(selectedProfile.name !== "All" && selectedOrthoDirection.name === "B") && (
                            <div>

                            </div>
                        )}
                        <div
                            className="filter-container-typeSummary">
                            <Listbox>
                            <Listbox.Label
                                    className="block text-lg font-medium leading-6 text-gray-900 text-left pb-2">Summary
                                    of
                                    Results</Listbox.Label>
                            </Listbox>
                        </div>
                        {selectedProfile.name === "All" && (
                        <Box
                            sx={{width: '100%'}}>
                            <Paper
                                sx={{
                                    width: '100%',
                                    mb: 2
                                }}>
                                <TableContainer>
                                    <Table
                                        sx={{minWidth: 750}}
                                        aria-labelledby="tableTitle"
                                        size={dense ? 'small' : 'medium'}
                                    >
                                        <EnhancedTableHead
                                            order={order}
                                            orderBy={orderBy}
                                            onRequestSort={handleRequestSort}
                                            rowCount={rows.length}
                                        />
                                        <TableBody>
                                            {visibleRows.map((row, index) => {
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        tabIndex={-1}
                                                        key={row.id}
                                                        sx={{cursor: 'pointer'}}
                                                    >
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                            padding="none"
                                                            align="center"
                                                        >
                                                            {row.inc}
                                                        </TableCell>
                                                        <TableCell
                                                            align="center">{parseFloat(row.a.toFixed(2))}</TableCell>
                                                        <TableCell
                                                            align="center">{parseFloat(row.b.toFixed(2))}</TableCell>
                                                        <TableCell
                                                            align="center">{parseFloat(row.total.toFixed(2))}</TableCell>
                                                        <TableCell
                                                            align="center">{row.direction}</TableCell>
                                                        <TableCell
                                                            align="center">{row.node}</TableCell>
                                                        <TableCell
                                                            align="center">{row.level}</TableCell>
                                                        <TableCell
                                                            align="center">{row.date.split(" ")[0]}</TableCell>
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
                                    //sx={{ backgroundColor: '#22c55e' }}
                                />
                            </Paper>
                        </Box>)}
                        {(selectedProfile.name !== "All" && selectedOrthoDirection.name === "A") && (
                            <Box
                                sx={{width: '100%'}}>
                                <Paper
                                    sx={{
                                        width: '100%',
                                        mb: 2
                                    }}>
                                    <TableContainer>
                                        <Table
                                            sx={{minWidth: 750}}
                                            aria-labelledby="tableTitle"
                                            size={dense ? 'small' : 'medium'}
                                        >
                                            <EnhancedTableHeadA
                                                order={order}
                                                orderBy={orderBy}
                                                onRequestSort={handleRequestSortA}
                                                rowCount={rowsA.length}
                                            />
                                            <TableBody>
                                                {visibleRowsA.map((row, index) => {
                                                    const labelId = `enhanced-table-checkbox-${index}`;

                                                    return (
                                                        <TableRow
                                                            hover
                                                            tabIndex={-1}
                                                            key={row.id}
                                                            sx={{cursor: 'pointer'}}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                id={labelId}
                                                                scope="row"
                                                                padding="none"
                                                                align="center"
                                                            >
                                                                {row.inc}
                                                            </TableCell>
                                                            <TableCell
                                                                align="center">{parseFloat(row.a.toFixed(2))}</TableCell>
                                                            <TableCell
                                                                align="center">{row.node}</TableCell>
                                                            <TableCell
                                                                align="center">{row.level}</TableCell>
                                                            <TableCell
                                                                align="center">{row.date.split(" ")[0]}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                {emptyRowsA > 0 && (
                                                    <TableRow
                                                        style={{
                                                            height: (dense ? 33 : 53) * emptyRowsA,
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
                                        count={rowsA.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        //sx={{ backgroundColor: '#22c55e' }}
                                    />
                                </Paper>
                            </Box>)}
                        {(selectedProfile.name !== "All" && selectedOrthoDirection.name === "B") && (
                            <Box
                                sx={{width: '100%'}}>
                                <Paper
                                    sx={{
                                        width: '100%',
                                        mb: 2
                                    }}>
                                    <TableContainer>
                                        <Table
                                            sx={{minWidth: 750}}
                                            aria-labelledby="tableTitle"
                                            size={dense ? 'small' : 'medium'}
                                        >
                                            <EnhancedTableHeadB
                                                order={order}
                                                orderBy={orderBy}
                                                onRequestSort={handleRequestSortB}
                                                rowCount={rows.length}
                                            />
                                            <TableBody>
                                                {visibleRowsB.map((row, index) => {
                                                    const labelId = `enhanced-table-checkbox-${index}`;

                                                    return (
                                                        <TableRow
                                                            hover
                                                            tabIndex={-1}
                                                            key={row.id}
                                                            sx={{cursor: 'pointer'}}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                id={labelId}
                                                                scope="row"
                                                                padding="none"
                                                                align="center"
                                                            >
                                                                {row.inc}
                                                            </TableCell>
                                                            <TableCell
                                                                align="center">{parseFloat(row.b.toFixed(2))}</TableCell>
                                                            <TableCell
                                                                align="center">{row.node}</TableCell>
                                                            <TableCell
                                                                align="center">{row.level}</TableCell>
                                                            <TableCell
                                                                align="center">{row.date.split(" ")[0]}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                {emptyRowsB > 0 && (
                                                    <TableRow
                                                        style={{
                                                            height: (dense ? 33 : 53) * emptyRowsB,
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
                                        //sx={{ backgroundColor: '#22c55e' }}
                                    />
                                </Paper>
                            </Box>)}
                    </div>
                </div>
            )}
            <div
                className="page-footer">
            </div>
        </div>

    );
}

export default ResultsVisualization;