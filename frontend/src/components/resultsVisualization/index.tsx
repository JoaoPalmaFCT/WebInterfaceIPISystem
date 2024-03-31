import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import React, { PureComponent } from 'react';
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

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

interface InclinometerData {
    inc: string;
    sensorID: string;
    field: string;
    measurement: string;
    time: string;
    value: number;
}

/*
interface ChartProps {
    data: {
        inc: string;
        sensorID: string;
        time: string;
        value: number;
    }[]
}*/
interface ChartProps {
    graphData: InclinometerData[];
}

interface ChartPropsInc {
    graphData: InclinometerData[];
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

const getUniqueDates = (graphData: InclinometerData[]) => {
    let tempDateArray : String[] = []

    graphData.map(g => {
            tempDateArray.push(g.time)
    })

    const uniqueDates = new Set(tempDateArray);
    return Array.from(uniqueDates);
}

const generateRandomHexColor = (): string => {
    const color = Math.floor(Math.random() * 16777215);
    const hexColor = color.toString(16).padStart(6, '0');

    return `#${hexColor}`;
};

const Chart: React.FC<ChartPropsInc> = ({ graphData }) => {
    let data : InclinometerData[][] = [];
    let colorArray : string[] = []

    const uniqueDates = getUniqueDates(graphData)
    const numberOfDates = uniqueDates.length;

    for(let i = 0; i < numberOfDates; i++) {
        let tempArray : InclinometerData[] = []
        graphData.map(g => {
            if(g.time === uniqueDates[i]) {
                tempArray.push(g)
            }
        })
        data[i] = tempArray
        data[i].sort((a, b) => Number(a.sensorID) - Number(b.sensorID))

        colorArray.push(generateRandomHexColor());
    }

    return (
        <div className="wrapper">
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        //data={graphData.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))}
                        margin={{ top: 15, right: 20, left: 20, bottom: 15 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sensorID" allowDuplicatedCategory={false}/>
                        <YAxis dataKey="value" />
                        <Tooltip />
                        <Legend />
                        {data.map((incData, i) => (
                            <Line key={`${incData[i].time}`} type="monotone" dataKey="value" data={incData} stroke={colorArray[i]} activeDot={{ r: 8 }}/>
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};


const ChartTemp: React.FC<ChartProps> = ({ graphData }) => {
    return (
        <div className="wrapper">
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={graphData.sort((a, b) => Number(a.sensorID) - Number(b.sensorID))}
                        margin={{ top: 15, right: 20, left: 20, bottom: 15 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sensorID" />
                        <YAxis dataKey="value" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

function ResultsVisualization(){

    const numberOfDates = 2;
    const [dataArray, setDataArray] = useState<InclinometerData[]>([]);
    const [selectedInclinometer, setSelectedInclinometer] = useState<Number | null>(1);
    const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2005-05-20 00:00:00"));

    // aX chart data

    const auxData: InclinometerData[] = [];
    //const auxDate: Date = new Date("2023-10-25 00:00:00") && selectedTimestamp.getTime() === auxDate.getTime()
    const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"

    for (const item of dataArray) {
        if (Number(item.inc) === selectedInclinometer && item.field === "aX" && (item.time === auxDate2 || item.time === auxDate)) {
            var angle = item.value;
            var angleRad = angle * (Math.PI / 180);
            item.value = 500 * Math.sin(angleRad);
            auxData.push(item);
        }
    }
    console.log(auxData)


    const [selectedChartData, setSelectedChartData] = useState<InclinometerData[]>(auxData);

    // temperature chart data

    const auxDataTemp: InclinometerData[] = [];

    for (const item of dataArray) {
        if (Number(item.inc) === selectedInclinometer && item.field === "temp" && item.time === auxDate2) {
            auxDataTemp.push(item);
        }
    }

    const [selectedChartDataTemp, setSelectedChartDataTemp] = useState<InclinometerData[]>(auxDataTemp);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getData() as InfluxDataAux[];//getDataFromLastYear() as InfluxDataAux[];
                const mappedData: InclinometerData[] = response.map(i => ({
                    inc: i.inc.split("I")[1],
                    sensorID: i.sensorID,
                    field: i._field,
                    measurement: i._measurement,
                    time: formatDate(i._time),
                    value: i._value
                }));
                setDataArray(mappedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    /*const handleSelectedInclinometer = (inc: number) => {
        setSelectedInclinometer(inc);
    };

    const handleSelectedChartData = (data: InclinometerData) => {
        const auxData: InclinometerData[] = [];
        for (const item of dataArray) {
            if (Number(item.inc) === selectedInclinometer) {
                auxData.push(item);
            }
        }
        setSelectedChartData(auxData)
    }*/

    /*useEffect(() => {
        handleSelectedChartData();
    }, [dataArray, selectedInclinometer]);*/



    console.log(auxData);

    return (<div>
            <Chart graphData={auxData} />
            <ChartTemp graphData={auxDataTemp} />
        </div>

        /*<div className="grid-container">
            <div className="grid-item header">Inc</div>
            <div className="grid-item header">SensorID</div>
            <div className="grid-item header">Field</div>
            <div className="grid-item header">Measurement</div>
            <div className="grid-item header">Time</div>
            <div className="grid-item header">Value</div>
            {dataArray.map(i => (
                <React.Fragment key={i.inc}>
                    <div className="grid-item">{i.inc}</div>
                    <div className="grid-item">{i.sensorID}</div>
                    <div className="grid-item">{i.field}</div>
                    <div className="grid-item">{i.measurement}</div>
                    <div className="grid-item">{i.time}</div>
                    <div className="grid-item">{i.value}</div>
                </React.Fragment>
            ))}
        </div>*/
    );
}

export default ResultsVisualization;