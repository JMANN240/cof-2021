const express = require('express');
const app = express();

const port = 5980;
app.listen(port, () => {
    console.log('Listening on port', port)
})

app.get('/', (req, res) => {
    res.send('Choose Ohio First - 2022 - Symplyfy');
})


const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
let db;
let dbAnalytics;
client.connect().then(() => {
    db = client.db('cof-2022');
    dbAnalytics = db.collection('analytics');
})

app.post('/analytics/upload', express.json(), async (req, res) => {
    console.log('uploaded analytics', req.body);
    await dbAnalytics.insertMany(req.body);
    res.send('uploaded ' + req.body.length)
})

