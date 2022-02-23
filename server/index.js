const express = require('express');
const app = express();

const port = 5980;
app.listen(port, () => {
    console.log('Listening on port', port)
})

app.get('/', (req, res) => {
    res.send('Choose Ohio First - 2022 - Symplyfy');
})

app.post('/analytics/upload', express.json(), (req, res) => {
    console.log('uploaded analytics', req.body);
    res.send('uploaded ' + req.body.length)
})

