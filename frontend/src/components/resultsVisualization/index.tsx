import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import React, { PureComponent } from 'react';
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';

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

interface ChartProps {
    graphData: InclinometerData[];
    colorArray: string[];
}

interface ChartPropsInc {
    graphData: InclinometerData[];
    colorArray: string[];
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

const getUniqueInclinometers = (dataArray: InclinometerData[]) => {
    let tempDateArray : string[] = []

    dataArray.map(d => {
        tempDateArray.push(d.inc)
    })

    const uniqueInc = new Set(tempDateArray);
    return Array.from(uniqueInc);
}

const generateRandomHexColor = (): string => {
    const color = Math.floor(Math.random() * 16777215);
    const hexColor = color.toString(16).padStart(6, '0');

    return `#${hexColor}`;
};

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

const ChartDataPrep = (graphData: InclinometerData[]): InclinometerData[][] => {
    let data: InclinometerData[][] = [];

    const uniqueDates = getUniqueDates(graphData)
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

const Chart: React.FC<ChartPropsInc> = ({ graphData, colorArray }) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);

    return (
        <div className="wrapper">
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart margin={{top: 15, right: 20, left: 20, bottom: 15}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="sensorID" allowDuplicatedCategory={false}/>
                        <YAxis dataKey="value"/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend/>
                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`} type="monotone"
                                  dataKey="value" data={incData} stroke={colorArray[i]} activeDot={{r: 8}}/>
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};


const ChartTemp: React.FC<ChartProps> = ({ graphData, colorArray }) => {
    let data: InclinometerData[][] = ChartDataPrep(graphData);

    return (
        <div className="wrapper">
            {graphData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart margin={{ top: 15, right: 20, left: 20, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sensorID" allowDuplicatedCategory={false}/>
                        <YAxis dataKey="value" />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend />
                        {data.map((incData, i) => (
                            <Line name={`${incData[i].time.split(" ")[0]}`} key={`${incData[i].time}`}  type="monotone" dataKey="value" data={incData} stroke={colorArray[i]} activeDot={{ r: 8 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

const calculateAX = (angle: number) => {
    let angleRad = angle * (Math.PI / 180);
    return 500 * Math.sin(angleRad);
}

const getDataArray = (selectedInc: number, array: InclinometerData[])  =>{
    const auxData: InclinometerData[] = [];
    const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"

    for (const item of array) {
        if (Number(item.inc) === selectedInc && item.field === "aX" && (item.time === auxDate2 || item.time === auxDate)) {
            const updatedItem: InclinometerData = {
                inc: item.inc.split("I")[1],
                sensorID: item.sensorID,
                field: item.field,
                measurement: item.measurement,
                time: formatDate(item.time),
                value: calculateAX(item.value)
            };

            auxData.push(updatedItem);
        }
    }

    return auxData;
}


function ResultsVisualization(){

    const [arrayInitialized, setArrayInitialized] = useState(false);
    const [dataArray, setDataArray] = useState<InclinometerData[]>([]);
    const [colorArray, setColorArray] = useState<string[]>([]);


    useEffect(() => {
        if (!arrayInitialized) {
            fetchData();
        }
    }, [arrayInitialized]);

    useEffect(() => {
        if (!arrayInitialized && dataArray.length > 0) {
            setSelectedAXChartData(getDataArray(1, dataArray));
            setColorArray(generateColorArray(dataArray));
            setArrayInitialized(true);
        }
    }, [dataArray, arrayInitialized]);

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

    const numberOfInc: string[] = getUniqueInclinometers(dataArray).sort((a, b) => Number(a) - Number(b))

    const [selectedInclinometer, setSelectedInclinometer] = useState<Number>(1);
    //const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2005-05-20 00:00:00"));

    const [selectedAXChartData, setSelectedAXChartData] = useState<InclinometerData[]>([]);

    const handleSelectedAXChartData = (inc: number) => {
        setSelectedAXChartData(getDataArray(inc, dataArray));
        setColorArray(generateColorArray(dataArray));
    };

    const handleSelectedInclinometer = (inc: number) => {
        setSelectedInclinometer(inc);
        handleSelectedAXChartData(inc);
    };

    const generateColorArray = (dataArray: InclinometerData[]) => {
        const uniqueDates = getUniqueDates(dataArray)
        return uniqueDates.map(() => generateRandomHexColor());
    };


    // temperature chart data

    const auxDataTemp: InclinometerData[] = [];
    const auxDate: String = "2009-09-22 00:00:00"
    const auxDate2: String = "1984-09-11 00:00:00"

    for (const item of dataArray) {
        if (Number(item.inc) === selectedInclinometer && item.field === "temp" && (item.time === auxDate2 || item.time === auxDate)) {
            auxDataTemp.push(item);
        }
    }

    const [selectedChartDataTemp, setSelectedChartDataTemp] = useState<InclinometerData[]>(auxDataTemp);

    return (<div>
                <div>
                    <label>Select an Inclinometer: </label>
                    <select onChange={(e) => handleSelectedInclinometer(parseInt(e.target.value))}
                            style={{ padding: '8px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        {numberOfInc.map(inc => (
                            <option key={inc} value={inc}>I{inc}</option>
                        ))}
                    </select>
                </div>
                <Chart graphData={selectedAXChartData} colorArray={colorArray}/>
                <ChartTemp graphData={auxDataTemp} colorArray={colorArray}/>
            </div>
    );
}

export default ResultsVisualization;