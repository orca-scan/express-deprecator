const express = require('express');
const expressMute = require('../index.js');

const app = express();
app.use(express.json());
app.use(expressMute()); // default config path

app.get('/', (req, res) => {
    res.status(200).json({ ok: true });
});

app.post('/', (req, res) => {
    res.status(200).send({ ok: true });
});

module.exports = app;
