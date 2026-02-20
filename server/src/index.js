const express = require('express');
const bodyParser = require('express').json;
require('dotenv').config();

const complaintsRouter = require('./routes/complaints');
const analyticsRouter = require('./routes/analytics');

const app = express();
app.use(bodyParser());

app.use('/complaints', complaintsRouter);
app.use('/analytics', analyticsRouter);

app.get('/', (req, res) => res.json({ service: 'fixora-server', status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Fixora server listening on port ${PORT}`));
