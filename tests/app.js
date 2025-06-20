const express = require('express');
const expressMute = require('../index.js');

const app = express();
app.use(express.json());
app.use(expressMute()); // default config path

app.post('/api/login', (req, res) => {
    res.status(200).json({ ok: true });
});

app.get('/api/health', (req, res) => {
    res.status(200).send('Healthy');
});

app.get('/test', (req, res) => {
    res.status(200).send('Healthy');
});

app.post('/', (req, res) => {
    res.status(200).send({ ok: true });
});

module.exports = app;
