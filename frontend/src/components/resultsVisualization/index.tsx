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
    Label
} from 'recharts';
import { DatePicker } from 'rsuite';
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

interface ChartPropsDetails {
    graphData: InclinometerData[];
    depth: number;
    //colorArray: string[];
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

const getIntervalDates = (graphData: InclinometerData[], initialDate: string, lastDate: string) => {
    let tempData:InclinometerData[] = [];

    graphData.map(g => {
        if(lastDate <= g.time && initialDate >= g.time)
            tempData.push(g)
    })

    return tempData;
}

const getUniqueDates = (graphData: InclinometerData[]) => {
    let tempDateArray : String[] = []

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
                    tempArray.push(b)
                }
            })
        })
        newArray[i] = tempArray
    }
    return newArray;
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
                <ResponsiveContainer width="40%" height={600}>
                    <LineChart layout="vertical" margin={{top: 25, right: 20, left: 20, bottom: 15}} >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis type="number" dataKey="displacement" orientation="top">
                            <Label value={`${graphType} (mm)`} position="top" />
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

const ChartTotal: React.FC<ChartPropsTotal> = ({ graphDataX, graphDataY}) => {
    let data: InclinometerData[][] = ChartDataPrepTotal(graphDataX, graphDataY);

    return (
        <div className="wrapper">
            {graphDataX.length > 0 && (
                <ResponsiveContainer width="40%" height={600}>
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
                <ResponsiveContainer width="40%" height={600}>
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

const ChartDetails: React.FC<ChartPropsDetails> = ({ graphData, depth}) => {
    let initialData: InclinometerData[][] = ChartDataPrep(graphData);
    let data: InclinometerData[][] = ChartDataPrepDetailsX(initialData, depth);

    let graphType: string = "A";

    if(data.length > 0 && data[0].length > 0){
        if(data[0][0].field.split("")[1].toUpperCase() === "X"){
            graphType = "A"
        }else{
            graphType = "B"
        }
    }

    return (
        <div className="wrapper" >
            {graphData.length > 0 && (
                <ResponsiveContainer width="40%" height={300}>
                    <LineChart margin={{ top: 25, right: 20, left: 20, bottom: 20 }}>
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
                   displacement: 0
               };
               newRefArray.push(updatedItem);
            }
        }
    }

    return newRefArray;
}

const getDataArrayX = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[])  =>{

    const auxDate: String = "2009-09-22 00:00:00"
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

    for (let i = 0; i < 3; i++) {//numberOfDates
        let cumulative: number = 0;
        for (const item of data[i]) {
            if(Number(item.inc) === selectedInc && item.field === "aX"){
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
                    displacement: calculateDisplacement(item.inc, item.sensorID, cumulative, refDateData)
                };
                returnData.push(updatedItem);
            }
        }
    }

    return returnData;
}

const getDataArrayY = (selectedInc: number, array: InclinometerData[], refDateData: InclinometerData[])  =>{

    const auxDate: String = "2009-09-22 00:00:00"
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


    for (let i = 0; i < 3; i++) {//numberOfDates
        let cumulative: number = 0;
        for (const item of data[i]) {
            if(Number(item.inc) === selectedInc && item.field === "aY"){
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
                    displacement: calculateDisplacement(item.inc, item.sensorID, cumulative, refDateData)
                };
                returnData.push(updatedItem);
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
    const [refDate, setRefDate] = useState<string>("");
    const [refDateDataX, setRefDateDataX] = useState<InclinometerData[]>([]);
    const [refDateDataY, setRefDateDataY] = useState<InclinometerData[]>([]);
    const [depthArray, setDepthArray] = useState<number[]>([]);

    const [toggleTotalChart, setToggleTotalChart] = useState(false);
    const [toggleTempChart, setToggleTempChart] = useState(false);
    const [selectedGraphExport, setSelectedGraphExport] = useState<string>("A");
    const [selectedResults, setSelectedResults] = useState(results[1])

    useEffect(() => {
        if (!arrayInitialized) {
            fetchData();
        }
    }, [arrayInitialized]);


    useEffect(() => {
        if (!arrayInitialized && (dataArrayX.length > 0 || dataArrayY.length > 0)) {
            setSelectedAXChartData(getDataArrayX(1, dataArrayX, refDateDataX));
            setSelectedAYChartData(getDataArrayY(1, dataArrayY, refDateDataY));
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
                displacement: 0
            }));

            let auxRefDate = getRefDate(mappedData);
            setRefDate(auxRefDate);
            setRefDateDataX(getRefDateData(auxRefDate, mappedData, "aX"));
            setRefDateDataY(getRefDateData(auxRefDate, mappedData, "aY"));

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

    const [selectedInclinometer, setSelectedInclinometer] = useState<Number>(1);
    const [selectedDepth, setSelectedDepth] = useState<number>(0.5);
    //const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2005-05-20 00:00:00"));

    const [selectedAXChartData, setSelectedAXChartData] = useState<InclinometerData[]>([]);
    const [selectedAYChartData, setSelectedAYChartData] = useState<InclinometerData[]>([]);
    const [selectedTotalChartData, setSelectedTotalChartData] = useState<InclinometerData[]>([]);

    const handleSelectedAXChartData = (inc: number) => {
        setSelectedAXChartData(getDataArrayX(inc, filteredDataArrayX, refDateDataX));
        //setColorArray(generateColorArray(dataArray));
    };

    const handleSelectedAYChartData = (inc: number) => {
        setSelectedAYChartData(getDataArrayY(inc, filteredDataArrayY, refDateDataY));
    };

    const handleSelectedTotalChartData = (inc: number) => {
        //setSelectedTotalChartData();
    };

    const handleSelectedInclinometer = (inc: number) => {
        setSelectedInclinometer(inc);
        handleDepthArray(inc);
        handleSelectedAXChartData(inc);
        handleSelectedAYChartData(inc);
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
        handleSelectedAXChartData(Number(selectedInclinometer));
        handleSelectedAYChartData(Number(selectedInclinometer));
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
            handleSelectedAXChartData(Number(selectedInclinometer))
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



    const chartAXRef = useRef<HTMLDivElement>(null);
    const chartAYRef = useRef<HTMLDivElement>(null);
    const chartTotalRef = useRef<HTMLDivElement>(null);
    const chartTempRef = useRef<HTMLDivElement>(null);

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
        <div>
            <div>

                <div>
                    <label>Select
                        an
                        Inclinometer: </label>
                    <select
                        onChange={(e) => handleSelectedInclinometer(parseInt(e.target.value))}
                        style={{
                            padding: '8px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}>
                        {numberOfInc.map(inc => (
                            <option
                                key={inc}
                                value={inc}>I{inc}</option>
                        ))}
                    </select>
                    <label> Show
                        total
                        displacement: </label>
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
                    <label> Show
                        temperature: </label>
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
                    <div>
                        <DatePicker
                            oneTap
                            placeholder="YYYY-MM-DD"
                            style={{width: 200}}/>
                        <DatePicker
                            oneTap
                            placeholder="YYYY-MM-DD"
                            style={{width: 200}}/>
                    </div>
                    <label>Select
                        the
                        graph
                        to
                        export: </label>
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
                <div>
                    <Listbox value={selectedResults} onChange={setSelectedResults}>
                        {({ open }) => (
                            <>
                                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Type of result</Listbox.Label>
                                <div className="relative mt-2">
                                    <Listbox.Button className="relative w-45 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm sm:leading-6">
                                      <span className="flex items-center">
                                          <span className="ml-3 block truncate">{selectedResults.name}</span>
                                      </span>
                                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                      </span>
                                    </Listbox.Button>
                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="relative z-10 mt-1 max-h-56 w-45 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {results.map((res) => (
                                                <Listbox.Option
                                                    key={res.id}
                                                    className={({ active }) =>
                                                        classNames(
                                                            active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                        )
                                                    }
                                                    value={res}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <div className="flex items-center">
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
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
                    className="charts-container">
                {!toggleTotalChart ? (
                        <>
                            <div
                                className="chart-wrapper"
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
                </div>
                <div>
                    <label>Select
                        the
                        desired
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

    );
}

export default ResultsVisualization;