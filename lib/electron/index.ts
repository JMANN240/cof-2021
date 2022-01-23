
import isDev from 'electron-is-dev';
import { createWriteStream } from "fs";
if (!isDev) {
    var access = createWriteStream('log.txt');
    process.stdout.write = process.stderr.write = access.write.bind(access);
    process.on('unhandledRejection', (e) => {
        // console.error(e);
    })
}

declare global {
    var WEB: string;
    // var WEB: ((...paths: string[]) => string) & string
}

import { app, BrowserWindow } from "electron";

import { PORT } from "./app";
// import { join } from 'path';

app.on('ready', async () => {

    const APP_PORT = await PORT;
    const APP_URL = `http://localhost:${APP_PORT}`;
    global['WEB'] = APP_URL;
    // @ts-ignore
    // global['WEB'] = Object.assign(function(...paths: string[]) {
    //     return join(APP_URL, ...paths);
    // }, {
    //     prototype: {
    //     // __proto__: {
    //         toString() {
    //             console.log('running tostring')
    //             return APP_URL
    //         }
    //     }
    // })

    const browser = new BrowserWindow({
        height: 800,
        width: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // preload: somefile
        }
    })

    // browser.loadURL(`data:text/html,waiting for port...`)

    
    console.log({ APP_PORT })
    // let APP_PORT: number = 0;
    // if (isDev) {
    //     const { scripts } = require(resolve(process.cwd(), '..', 'app', 'package.json'));
    //     APP_PORT = Number((scripts['dev'].split('port').pop().match(/\d+/) || [3000])[0]);
    // } else {
        
    // }

    browser.loadURL(`http://localhost:${APP_PORT}`)
    // browser.loadURL(`data:text/html,the port is ${APP_PORT}`)
})

app.on('window-all-closed', app.quit);

