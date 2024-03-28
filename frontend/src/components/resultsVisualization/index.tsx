import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import React, { PureComponent } from 'react';
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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


const api = new InfluxDB({ url: 'https://positive-presumably-bluegill.ngrok-free.app/', token: '5q-pfsRjWHQvyFZqhQ3Y8BT9CQmUJBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA==' }).getQueryApi('c5936632b4808196');

export function getData() {

    const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")';
    const response = api.collectRows(fluxQuery);

    console.log('Query Response:', response);

}

export function getDataFromLastYear() {
    try {
        const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX") |> range(start: 2023-01-01T23:30:00Z, stop: 2023-12-31T00:00:00Z)';
        const response = api.collectRows(fluxQuery);

        console.log('Query Response:', response);

        return response
    } catch (error) {
        throw error;
    }
}


const Chart: React.FC<ChartProps> = ({ graphData }) => {
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

    const [dataArray, setDataArray] = useState<InclinometerData[]>([]);
    const [selectedInclinometer, setSelectedInclinometer] = useState<Number | null>(1);
    const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date("2023-10-25 00:00:00"));



    const auxData: InclinometerData[] = [];
    const auxDate: Date = new Date("2023-10-25 00:00:00")

    for (const item of dataArray) {
        if (Number(item.inc) === selectedInclinometer && selectedTimestamp.getTime() === auxDate.getTime()) {
            auxData.push(item);
        }
    }
    console.log(auxData)


    const [selectedChartData, setSelectedChartData] = useState<InclinometerData[]>(auxData);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getDataFromLastYear() as InfluxDataAux[];
                const mappedData: InclinometerData[] = response.map(i => ({
                    inc: i.inc.split("")[1],
                    sensorID: i.sensorID,
                    field: i._field,
                    measurement: i._measurement,
                    time: i._time,
                    value: i._value
                }));
                setDataArray(mappedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    const handleSelectedInclinometer = (inc: number) => {
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
    }

    /*useEffect(() => {
        handleSelectedChartData();
    }, [dataArray, selectedInclinometer]);*/



    console.log(auxData);

    return (<div>
            <Chart graphData={auxData} />
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