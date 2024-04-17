import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import React, {
    Fragment,
    PureComponent,
    useRef
} from 'react';
import { useEffect, useState } from "react";
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
    ReferenceLine
} from 'recharts';
import {
    Checkbox,
    DatePicker
} from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

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

interface ChartProps {
    graphData: InclinometerData[];
    //colorArray: string[];
}

interface ChartPropsInc {
    graphData: InclinometerData[];
    //colorArray: string[];
}

interface ChartPropsTotal {
    graphDataX: InclinometerData[];
    graphDataY: InclinometerData[];
    //colorArray: string[];
}

interface ChartPropsClock {
    graphDataA: InclinometerData[];
    graphDataB: InclinometerData[];
    //colorArray: string[];
}

interface ChartPropsDetails {
    graphData: InclinometerData[];
    depth: number;
    //colorArray: string[];
}

interface ChartSoil {
    graphData: SoilData[];
}


const api = new InfluxDB({ url: 'https://positive-presumably-bluegill.ngrok-free.app/', token: '5q-pfsRjWHQvyFZqhQ3Y8BT9CQmUJBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA==' }).getQueryApi('c5936632b4808196');

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

const colorsArray: string[] = [
    "#33A4FF",
    "#1e7226",
    "#33FFD1",
    "#33FF77",
    "#33FFEA",
    "#FF5733",
    "#FF6B33",
    "#33FFFF",
    "#FF1E33",
    "#FFD133",
    "#33FFC1",
    "#33FF8D",
    "#33FF3A",
    "#FF8433",
    "#33E9FF",
    "#33FF67",
    "#FF9933",
    "#FF3833",
    "#FFB333",
    "#33FF0D",
    "#33FF33",
    "#33FF94",
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
    "#33FF4A",
    "#33FF0D",
    "#33FF60",
    "#FFD133",
    "#33FFFF",
    "#33FF94",
    "#33FFA4",
    "#FF7733",
    "#33FF33",
    "#FFBA33"
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
        name: 'Relative displacements',
    },
    {
        id: 3,
        name: 'Sensor angles',
    },
    {
        id: 4,
        name: 'Casing distortions',
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

const getNumberOfSensors = (graphData: InclinometerData[], inc:number) => {
    let sensorNumber = 0;

    graphData.map(g => {
        if(Number(g.inc) === inc && sensorNumber < Number(g.sensorID))
            sensorNumber = Number(g.sensorID)
    })
    return sensorNumber;
}

const getRefDate = (graphData: Inclinometer[]) => {
    let oldestDate = graphData[0].time;

    graphData.map(g => {
        if(oldestDate > g.time)
            oldestDate = g.time
    })

    return oldestDate
}

const getMostRecentDate = (graphData: Inclinometer[]) => {
    let oldestDate = graphData[0].time;

    graphData.map(g => {
        if(oldestDate < g.time)
            oldestDate = g.time
    })

    return oldestDate
}

const getIntervalDates = (graphData: InclinometerData[], initialDate: string, lastDate: string) => {
    let tempData:InclinometerData[] = [];
    graphData.map(g => {
        if(lastDate >= g.time && initialDate <= g.time)
            tempData.push(g)
    })
    console.log(tempData)
    return tempData;
}

const getUniqueDates = (graphData: InclinometerData[]) => {
    let tempDateArray : string[] = []

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
    let tempDateArray : string[] = []

    dataArray.map(d => {
        tempDateArray.push(d.inc)
    })

    const uniqueInc = new Set(tempDateArray);
    return Array.from(uniqueInc);
}

const getUniqueDepth = (inc: number, dataArray: InclinometerData[]) => {
    let tempDateArray : number[] = []

    dataArray.map(d => {
        if(Number(d.inc) === inc)
            tempDateArray.push(d.depth)
    })

    const uniqueSensors = new Set(tempDateArray);
    return Array.from(uniqueSensors);
}

const getDepth = (data: InclinometerData[], inc: number, depth: number) => {
    let numberOfSensors = getNumberOfSensors(data, inc);
    return numberOfSensors/2 - depth + 0.5
}

/*const generateRandomHexColor = (): string => {
    const color = Math.floor(Math.random() * 16777215);
    const hexColor = color.toString(16).padStart(6, '0');

    return `#${hexColor}`;
};*/

const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
                    {payload.map((p, index) => (
                        <div key={index}>
                            {index === 0 &&
                                <p className="label" style={{ margin: 0 }}>{`Sensor ${p.payload.sensorID}`}</p>
                            }
                            <div style={{ display: 'flex', alignItems: 'center', color: p.color }}>
                                <p style={{ margin: 0, width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.color, marginRight: '10px' }}/>
                                <p style={{ margin: 0 }}  className="label">{`${p.value}`}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const getSoilDepth = (depth: number) => {
    switch(depth){
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


const CustomTooltipSoil: React.FC<TooltipProps<any, any>> = ({ active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
                    {payload.map((p, index) => (
                        <div key={index}>
                            <div style={{ display: 'flex', alignItems: 'center', color: p.color }}>
                                <p style={{ margin: 0, width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.color, marginRight: '10px' }}/>
                                <p style={{ margin: 0 }}  className="label">{`${p.name + getSoilDepth(p.value)}`}</p>
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
                    if(g.sensorID === y.sensorID && g.time === y.time){
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

const ChartDataPrepDetailsX = (graphData: InclinometerData[][], depth: number): InclinometerData[][] => {
    let newArray: InclinometerData[][] = [];
    for(let i = 0; i < graphData.length; i++){
        let tempArray: InclinometerData[] = []
        graphData.map(a =>{
            a.map(b =>{
                if(b.depth === depth){
                    tempArray.push(b);
                }
            })
        })
        newArray[i] = tempArray
    }
    return newArray;
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

const Chart: React.FC<ChartPropsInc> = ({ graphData}) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);
    let graphType: string = "A";

    if(data.length > 0 && data[0].length > 0){
        if(data[0][0].field.split("")[1].toUpperCase() === "X"){
            graphType = "A"
        }else{
            graphType = "B"
        }
    }

    return (
        <div className="wrapper">
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart layout="vertical" margin={{top: 25, right: 20, left: 20, bottom: 15}} >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis type="number" dataKey="displacement" orientation="top">
                            <Label value={`${graphType} (mm)`} position="top" />
                        </XAxis>
                        <YAxis dataKey="depth" >
                            <Label value="Depth (m)" position="left" angle={-90} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip/>}/>
                        {graphType === "A" && <Legend align="left" verticalAlign="top" layout="vertical" margin={{right: 50}}/>}

                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`} type="monotone"
                                  dataKey="displacement" data={incData} stroke={colorsArray[i]} activeDot={{r: 8}}/>
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const ChartTotal: React.FC<ChartPropsTotal> = ({ graphDataX, graphDataY}) => {
    let data: InclinometerData[][] = ChartDataPrepTotal(graphDataX, graphDataY);

    return (
        <div className="wrapper">
            {graphDataX.length > 0 && (
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart layout="vertical" margin={{top: 25, right: 20, left: 20, bottom: 15}} >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis type="number" dataKey="displacement" orientation="top">
                            <Label value={`Total (mm)`} position="top" />
                        </XAxis>
                        <YAxis dataKey="depth" >
                            <Label value="Depth (m)" position="left" angle={-90} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend/>
                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`} type="monotone"
                                  dataKey="displacement" data={incData} stroke={colorsArray[i]} activeDot={{r: 8}}/>
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const ChartTemp: React.FC<ChartProps> = ({ graphData}) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);

    return (
        <div className="wrapper" >
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart layout="vertical" margin={{ top: 25, right: 20, left: 20, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="value" orientation="top">
                            <Label value="Temp (ºC)" position="top" />
                        </XAxis>
                        <YAxis dataKey="depth" >
                            <Label value="Depth (m)" position="left" angle={-90} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend />
                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`}  type="monotone"
                                  dataKey="value" data={incData} stroke={colorsArray[i]} activeDot={{ r: 8 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const ChartClock: React.FC<ChartPropsClock> = ({ graphDataA, graphDataB}) => {
    let data: ABData[][] = ChartClockDataPrep(graphDataA, graphDataB);

    return (
        <div
            className="wrapper">
            <svg
                width="100%"
                height="100%"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'

                }}
            >
                <circle
                    cx="49.7%"
                    cy="56.5%"
                    r="180"
                    stroke="black"
                    fill="none"
                />
            </svg>
            {graphDataA.length > 0 && (
                <ResponsiveContainer
                    width="140%"
                    height={300}>
                    <LineChart
                        margin={{
                            top: 25,
                            right: 20,
                            left: 20,
                            bottom: 20
                        }}>
                        <CartesianGrid
                            strokeDasharray="3 3"/>
                        <XAxis
                            type="number"
                            dataKey="b"
                            axisLine={false}>
                            <Label
                                value="B (mm)"
                                position="bottom"/>
                        </XAxis>
                        <ReferenceLine
                            y={0}
                            stroke="#000000"/>
                        <YAxis
                            dataKey="a"
                            axisLine={false}>
                            <Label
                                value="A (mm)"
                                position="left"
                                angle={-90}/>
                        </YAxis>
                        <ReferenceLine
                            x={0}
                            stroke="#000000" />
                        <Tooltip
                            content={
                                <CustomTooltip/>}/>

                        {data.map((d, i) => (
                            <Line
                                name={`${d[i].time.split(" ")[0]}`}
                                key={`${d[i].time}`}
                                type="linear"
                                dataKey="a"
                                data={d}
                                stroke={colorsArray[i]}
                                activeDot={{r: 8}}/>
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const ChartDetails: React.FC<ChartPropsDetails> = ({
                                                       graphData,
                                                       depth
                                                   }) => {
    let initialData: InclinometerData[][] = ChartDataPrep(graphData);
    let data: InclinometerData[][] = ChartDataPrepDetailsX(initialData, depth);

    let graphType: string = "A";

    if (data.length > 0 && data[0].length > 0) {
        if (data[0][0].field.split("")[1].toUpperCase() === "X") {
            graphType = "A"
        }else{
            graphType = "B"
        }
    }

    return (
        <div className="wrapper" >
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart margin={{ top: 25, right: 100, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" allowDuplicatedCategory={false}>
                            <Label value="Dates" position="bottom"/>
                        </XAxis>
                        <YAxis dataKey="displacement">
                            <Label value={`${graphType} (mm)`} position="left" angle={-90} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip/>}/>
                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`}  type="monotone"
                                  dataKey="displacement" data={incData} stroke={colorsArray[i]} activeDot={{ r: 8 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const ChartSoil: React.FC<ChartSoil> = ({ graphData }) => {
    const maxY = Math.max(...graphData.map(soil => soil.depth));
    const data = [{ depth: maxY, ...graphData.reduce((acc, soil) => ({ ...acc, [soil.name]: soil.depth }), {})}];
    const uniqueColors = Array.from(new Set(graphData.map(soil => soil.color)));

    return (
        <div className="wrapper" >
            {graphData.length > 0 && (
                <ResponsiveContainer width="50%" height={720}>
                    <BarChart  data={data} margin={{ top: 50, right: 20, left: 20, bottom: 40 }}>
                        <XAxis type="category" hide={true}/>
                        <YAxis dataKey="depth" type="number" domain={[0, 32]} hide={true}/>
                        <Tooltip content={<CustomTooltipSoil/>}/>
                        <Legend />
                        <Bar key={`$3`} dataKey="Rock" stackId="stack" fill={uniqueColors[3]} />
                        <Bar key={`$2`} dataKey="ZG2B" stackId="stack" fill={uniqueColors[2]} />
                        <Bar key={`$1`} dataKey="ZG2A" stackId="stack" fill={uniqueColors[1]} />
                        <Bar key={`$0`} dataKey="At" stackId="stack" fill={uniqueColors[0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
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

const isDateChecked = (date: string, dates: string[]) => {
    let found: boolean = false;

    dates.map(d =>{
        if(d === date){
            found = true;
        }
    })
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
    for(const item of refDateData){
        if(item.inc === inc && item.sensorID === sensorID){
            auxCumulative = item.cumulative;
        }
    }

    return cumulative-auxCumulative;
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
            if(item.time === refDate && item.field === field){
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



const getDataArrayX = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[], selectedResult: string)  =>{
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


    for(let i = 0; i < array.length; i++){
    //array.map(g => {
        if(array[i].field === "aX"){
            if(array[i].time === uniqueDates[counter]){
               tempArray.push(array[i]);
               if(i + 1 === array.length){
                   data[counter] = tempArray;
                   data[counter].sort((a, b) => {
                       if (Number(a.inc) !== Number(b.inc)) {
                           return Number(a.inc) - Number(b.inc);
                       }
                       return Number(a.sensorID) - Number(b.sensorID);
                   });
               }
            }else if(counter <= numberOfDates){
                if(array[i].time === uniqueDates[counter+1]){
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
        if(i + 1 === array.length) {
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
            if(Number(item.inc) === selectedInc && item.field === "aX"){
                if(selectedResult === results[0].name) {
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
                }else if(selectedResult === results[1].name) {
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
                }else if(selectedResult === results[2].name) {
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
                }else if(selectedResult === results[3].name){
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

const getDataArrayY = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[], selectedResult: string)  =>{

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

    for(let i = 0; i < array.length; i++){
        //array.map(g => {
        if(array[i].field === "aY"){
            if(array[i].time === uniqueDates[counter]){
                tempArray.push(array[i]);
                if(i + 1 === array.length){
                    data[counter] = tempArray;
                    data[counter].sort((a, b) => {
                        if (Number(a.inc) !== Number(b.inc)) {
                            return Number(a.inc) - Number(b.inc);
                        }
                        return Number(a.sensorID) - Number(b.sensorID);
                    });
                }
            }else if(counter <= numberOfDates){
                if(array[i].time === uniqueDates[counter+1]){
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
        if(i + 1 === array.length) {
            data[counter] = tempArray;
            data[counter].sort((a, b) => {
                if (Number(a.inc) !== Number(b.inc)) {
                    return Number(a.inc) - Number(b.inc);
                }
                return Number(a.sensorID) - Number(b.sensorID);
            });
        }
    }

    for (let i = 0; i < numberOfDates; i++) {//numberOfDates
        let cumulative: number = 0;
        for (const item of data[i]) {
            if(Number(item.inc) === selectedInc && item.field === "aY"){
                if(selectedResult === results[0].name) {
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
                }else if(selectedResult === results[1].name) {
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
                }else if(selectedResult === results[2].name) {
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
                }else if(selectedResult === results[3].name){
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

const exportSVG = (svg: SVGElement, graphName: string) => {
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

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


function ResultsVisualization(){

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

    const [toggleTotalChart, setToggleTotalChart] = useState(false);
    const [toggleTempChart, setToggleTempChart] = useState(false);
    const [toggleSelectDates, setToggleSelectDates] = useState(false);
    const [selectedGraphExport, setSelectedGraphExport] = useState<string>("A");
    const [selectedResults, setSelectedResults] = useState(results[0])
    const [selectedVisualization, setSelectedVisualization] = useState(visualization[0])
    const [selectedDatesTypes, setSelectedDatesTypes] = useState(datesTypes[0])
    const [selectedElevation, setSelectedElevation] = useState(elevation[0])


    const [toggleIntervalRef, setToggleIntervalRef] = useState(false);

    useEffect(() => {
        if (!arrayInitialized) {
            fetchData();
        }
    }, [arrayInitialized]);


    useEffect(() => {
        if (!arrayInitialized && (dataArrayX.length > 0 || dataArrayY.length > 0)) {
            setSelectedAXChartData(getDataArrayX(1, dataArrayX, refDateDataX, selectedResults.name));
            setSelectedAYChartData(getDataArrayY(1, dataArrayY, refDateDataY, selectedResults.name));
            //setColorArray(generateColorArray(dataArray));
            setArrayInitialized(true);
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

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        setDepthArray(getUniqueDepth(1, filteredDataArrayX).sort((a, b) => Number(a) - Number(b)));
    }, [filteredDataArrayX]);

    const numberOfInc: string[] = getUniqueInclinometers(filteredDataArrayX).sort((a, b) => Number(a) - Number(b))
    const numberOfDates: string[] = getUniqueDates(dataArrayX)

    const [selectedInclinometer, setSelectedInclinometer] = useState<Number>(1);
    const [selectedDepth, setSelectedDepth] = useState<number>(0.5);
    //const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2005-05-20 00:00:00"));

    const [selectedAXChartData, setSelectedAXChartData] = useState<InclinometerData[]>([]);
    const [selectedAYChartData, setSelectedAYChartData] = useState<InclinometerData[]>([]);
    const [selectedTotalChartData, setSelectedTotalChartData] = useState<InclinometerData[]>([]);


    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredDates, setFilteredDates] = useState<string[]>([]);
    const [checkedDates, setCheckedDates] = useState<string[]>([])

    const handleSelectedResults = (type: string) => {
        let selectedType;
        switch(type){
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
            default:
                selectedType = results[0];
                break;
        }
        console.log(selectedType)
        setSelectedResults(selectedType)
        handleSelectedAXChartData(Number(selectedInclinometer), type);
        handleSelectedAYChartData(Number(selectedInclinometer), type);
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const filtered = numberOfDates.filter(date => date.includes(value));
        setFilteredDates(filtered);
    };

    const handleDateCheck = (value: string) => {
        const isChecked = isDateChecked(value, checkedDates);
        console.log(isChecked)
        const updatedDates = isChecked
            ? checkedDates.filter(date => date !== value)
            : [...checkedDates, value];

        setCheckedDates(updatedDates);

        if(isChecked){
            const updatedFilteredDataArrayX = filteredDataArrayX.filter(data => data.time !== value);
            const updatedFilteredDataArrayY = filteredDataArrayY.filter(data => data.time !== value);
            setFilteredDataArrayX(updatedFilteredDataArrayX)
            setFilteredDataArrayY(updatedFilteredDataArrayY)
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name)
        }else if(!isChecked && !filteredDataArrayX.some(item => item.time === value)){
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

    const handleSelectedInclinometer = (inc: number) => {
        setSelectedInclinometer(inc);
        handleDepthArray(inc);
        handleSelectedAXChartData(inc, selectedResults.name);
        handleSelectedAYChartData(inc, selectedResults.name);
    };

    const handleDepthArray = (inc: number) => {
        setDepthArray(getUniqueDepth(inc, filteredDataArrayX).sort((a, b) => Number(a) - Number(b)));
    };

    const handleSelectedDepth = (depth: string) => {
        setSelectedDepth(Number(depth));
    };

    const handleDatesIntervalChange = (initialDate: string, lastDate: string) => {
        setFilteredDataArrayX(getIntervalDates(dataArrayX, initialDate, lastDate));
        setFilteredDataArrayY(getIntervalDates(dataArrayY, initialDate, lastDate));
        handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
        handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
    };

    const handleFirstDateInterval = (year: number | undefined, month: number | undefined, day: number | undefined) => {
        if(year !== undefined && month !== undefined && day !== undefined){
            let date = year + "-" + month + "-" + day;
            setFilteredDataArrayX(getIntervalDates(dataArrayX, date, getMostRecentDate(filteredDataArrayX)));
            setFilteredDataArrayY(getIntervalDates(dataArrayY, date, getMostRecentDate(filteredDataArrayY)));
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name);
            handleSelectedAYChartData(Number(selectedInclinometer), selectedResults.name);
        }
    };

    const handleLastDateInterval = (year: number | undefined, month: number | undefined, day: number | undefined) => {
        if(year !== undefined && month !== undefined && day !== undefined){
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
        if(toggleTotalChart){
            handleSelectedAXChartData(Number(selectedInclinometer), selectedResults.name)
            setToggleTotalChart(false)
        }else{
            setToggleTotalChart(true)
        }
    };

    const handleToogleTempChart = () => {
        if(toggleTempChart){
            setToggleTempChart(false)
        }else{
            setToggleTempChart(true)
        }
    };

    const handleEarliestDate = (type: boolean) => {
        setToggleIntervalRef(type);
            //set ref earliest date
    };

    const handleToogleSelectDates = () => {
        if(toggleSelectDates){
            setToggleSelectDates(false)
        }else{
            setCheckedDates(numberOfDates)
            setToggleSelectDates(true)
        }
    };



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
        switch (selectedGraphExport){
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

    return (
        <div className="main-wrapper">
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
                                        onChange={(e) => handleFirstDateInterval(e?.getFullYear(), e?.getMonth(), e?.getDay())}
                                        onClean={(e) => handleFirstDateIntervalReset}
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
                                        onClean={(e) => handleLastDateIntervalReset}
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
                                                    className="w-full ms-2 text-sm font-medium text-gray-900 rounded">{date.split(" ")[0]}</label>
                                            </div>
                                        </li>
                                    )) : numberOfDates.map((date, index) => (
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
                                                    className="w-full ms-2 text-sm font-medium text-white rounded hover:text-black">{date.split(" ")[0]}</label>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        </div>
                    )}

                </div>
                <div>
                    <div
                        className="row-container">
                        <div
                            className="column-container middle-column">
                            <div
                                className="filter-container-typeViz">
                                <Listbox
                                    value={"PK150_PK200"}
                                    /*onChange={(selectedOption) => {
                                        setSelectedDatesTypes(selectedOption);
                                        handleToogleSelectDates();
                                    }}*/>
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
                                              className="ml-3 block truncate">{"PK150_PK200"}</span>
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

                                                        <Listbox.Option
                                                            key={"PK150_PK200"}
                                                            className={({active}) =>
                                                                classNames(
                                                                    active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                                )
                                                            }
                                                            value={"PK150_PK200"}
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
                                                                >{"PK150_PK200"}</span>
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
                            <div
                                className="filter-container-graphClock chart-wrapper"
                                ref={chartClock}
                            >
                                <ChartClock
                                    graphDataA={selectedAXChartData}
                                    graphDataB={selectedAYChartData}
                                />
                            </div>

                        </div>
                        <div
                            className="column-container right-column">
                            <div
                                className="filter-container-typeViz">
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
                                                checked={!toggleIntervalRef}
                                                onChange={(e) => {handleEarliestDate(false); handleResetRefDate()}}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "/>
                                            <label
                                                htmlFor="earliestDate"
                                                className="w-full py-3 ms-2 text-sm font-medium text-white-50 ">Earliest
                                                date</label>
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
                                                checked={toggleIntervalRef}
                                                onChange={(e) => handleEarliestDate(true)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  "/>
                                            <label
                                                htmlFor="fromInterval"
                                                className="w-full py-3 ms-2 text-sm font-medium text-white-50">Interval</label>
                                        </div>
                                    </li>
                                </ul>
                                <div
                                    className="pt-3">
                                    {toggleIntervalRef ? (
                                        <select id="selectRefDateId"
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
                                        className="checked:bg-green-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-green-500 appearance-none cursor-pointer"/>
                                    <label
                                        htmlFor="Green"
                                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"/>
                                </div>
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
                        </div>
                    </div>

                    <div
                        className="charts-container">
                        {!toggleTotalChart ? (
                            <>
                                <div
                                    className="chart-wrapper left-graph"
                                    ref={chartAXRef}>
                                    <Chart
                                        graphData={selectedAXChartData}
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
                                        graphDataY={selectedAYChartData}/>
                                </div>
                            </>
                        )}
                        {!toggleTempChart ? (
                            <>
                                <div
                                    className="chart-wrapper"
                                    ref={chartAYRef}>
                                    <Chart
                                        graphData={selectedAYChartData}/>
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="chart-wrapper"
                                    ref={chartTempRef}>
                                    <ChartTemp
                                        graphData={auxDataTemp}/>
                                </div>
                            </>
                        )}
                        <div
                            className="chart-wrapper"
                            ref={chartSoil}>
                            <ChartSoil
                                graphData={soilData}/>
                        </div>
                    </div>

                    <div>
                        <label>Desired
                            depth: </label>
                        <select
                            onChange={(e) => handleSelectedDepth(e.target.value)}
                            style={{
                                padding: '8px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}>
                            {depthArray.map(d => (
                                <option
                                    key={d}
                                    value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <ChartDetails
                            graphData={selectedAXChartData}
                            depth={selectedDepth}/>
                    </div>
                    <div>
                        <ChartDetails
                            graphData={selectedAYChartData}
                            depth={selectedDepth}/>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default ResultsVisualization;