const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const api = new InfluxDB({ url: 'https://positive-presumably-bluegill.ngrok-free.app/', token: '5q-pfsRjWHQvyFZqhQ3Y8BT9CQmUJBAbd4e_paPOo5bMuwDtqSi-vG_PVQMQhs06Fm45PEPDySxu7Z0DLDjJRA==' }).getQueryApi('c5936632b4808196');

export function getData() {

    const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX")';
    const response = api.collectRows(fluxQuery);

    console.log('Query Response:', response);

}

export function getDataFromLastYear() {

    const fluxQuery = 'from(bucket:"inputs") |> range(start: 0) |> filter(fn: (r) => r._measurement == "BarragemX") |> range(start: 2023-01-01T23:30:00Z, stop: 2023-12-31T00:00:00Z)';
    const response = api.collectRows(fluxQuery);

    console.log('Query Response:', response);

}