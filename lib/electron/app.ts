import createNext from 'next';
import express from 'express';
import isDev from 'electron-is-dev';
import { resolve } from 'path';

console.log('cwd', process.cwd());
console.log('dirname', __dirname);
const next = createNext({
    dev: isDev,
    dir: isDev ? process.cwd() : resolve(__dirname, '../../..'),
})

const mount = express();
export const app = express.Router();
mount.use(app);

let resolvePort;
export const PORT = new Promise(function(resolve) {
    resolvePort = resolve;
})

global['omg'] = Math.random().toString(32);

const handle = next.getRequestHandler();
const prep = next.prepare();
const server = mount.listen(0, function() {
    prep.then(() => {
        resolvePort(server.address().port);
        mount.use((req, res) => {
            handle(req, res);
        })
    })
})

app.get('/what', (req, res) => {
    res.send('hi there');
})

