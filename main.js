const fetch = require("node-fetch");
const { readFileSync, writeFileSync } = require('fs');

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const { dev } = argv;
if (dev) require('./hotreload');

const electron = require("electron");
const Store = require('electron-store');
const { URL, format } = require("url");
const path = require("path");
const os = require('os');
const { spawn } = require("child_process");
const {ElectronBlocker, fullLists, Request} = require("@cliqz/adblocker-electron")

const { app, BrowserWindow, BrowserView, Menu, ipcMain, webContents, dialog } = electron;

const store = new Store();

let htmlPath = path.join("file://", __dirname, "html")

let altKey = process.platform == "darwin" ? "Command" : "Ctrl"

let width, height;

app.setLoginItemSettings({
    openAtLogin: true
});

let blocker;
let mainWindow;
app.on("ready", async () => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()

    mainWindow = new BrowserWindow({
        fullscreen: !dev,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    blocker = await ElectronBlocker.fromLists(
        fetch,
        fullLists,
        {
            enableCompression: true,
        },
        {
            path: 'engine.bin',
            read: async (...args) => readFileSync(...args),
            write: async (...args) => writeFileSync(...args),
        },
    );

    let mainURL = new URL(path.join(htmlPath, "main.html"));
    mainWindow.loadURL(mainURL.href);

    mainWindow.on("closed", () => {
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(dev ? mainMenu : null);
});

ipcMain.on("page:navigate", (e, direction) => {
    if (direction == "back")
    {
        mainWindow.getBrowserView().webContents.goBack();
    }
    else if (direction == "forward")
    {
        mainWindow.getBrowserView().webContents.goForward();
    }
});

ipcMain.on("page:change", (e, type, site) => {
    console.log(type, site);

    let html_file, link;

    if (type == 'web') {
        html_file = "web.html";
        link = site
    } else if (type == 'native') {
        html_file = site;
    }

    let mainURL = new URL(path.join(htmlPath, html_file));
    const { height, width } = mainWindow.getContentBounds();

    if (type == 'web') {
        const view = new BrowserView();

        view.webContents.setWindowOpenHandler(({ url }) => {
            view.webContents.loadURL(url);
            return { action: 'deny' };
        })

        blocker.enableBlockingInSession(view.webContents.session);

        mainWindow.setBrowserView(view);
        view.setBounds({ x: 0, y: 0, width: dev ? parseInt(width*0.6) : width, height: parseInt(height * 0.8) });
        view.webContents.on("did-finish-load", () => {
            mainWindow.webContents.send("main:web-loaded");
        });
        view.webContents.loadURL(link);
    } else {
        if (mainWindow.getBrowserView() != undefined) {
            mainWindow.getBrowserView().webContents.destroy();
        }
        mainWindow.setBrowserView(null);
    }
    mainWindow.loadURL(mainURL.href);
});

ipcMain.on("page:print", (e) => {
    let view = mainWindow.getBrowserView();
    let page = view.webContents;
    page.print({
        silent: true,
        printBackground: true,
        deviceName: store.get("default_printer"),
        copies: 1
    }, (succ, err) => {
        if (succ) {
            console.log("printed!");
        } else {
            console.log(err);
        }
    });
});

let toggleMembership = (array, element, mapping) => {
    const index = array.map(mapping).indexOf(mapping(element));

    if (index === -1) {
        array.push(element);
        return true;
    } else {
        array.splice(index, 1);
        return false;
    }
}

ipcMain.handle("page:toggle-favorite", (e) => {
    let view = mainWindow.getBrowserView();
    const url = view.webContents.getURL();
    const title = view.webContents.getTitle();
    const entry = {
        url: url,
        title: title
    }

    let favorites = store.get("favorites", []);
    const isFavorite = toggleMembership(favorites, entry, e => e.url);
    store.set("favorites", favorites);
    return isFavorite;
});

let page_to_print;

ipcMain.on("image:request", async (e, img) => {
    console.log(`requested to print ${img}`);
    let view = new BrowserView();
    page_to_print = view.webContents;
    let mainURL = new URL(path.join(htmlPath, "print.html"));
    page_to_print.loadURL(mainURL.href);
    page_to_print.executeJavaScript(`img.src = "${img}"; printReady`)
        .then(o => {
            console.log("printing...");
            page_to_print.print({
                silent: true,
                printBackground: true,
                deviceName: store.get("default_printer"),
                copies: 1
            }, (succ, err) => {
                if (succ) {
                    console.log("printed!");
                } else {
                    console.log(err);
                }
            });
        }).catch(err => {
            console.error('oof', err);
        })
});

ipcMain.on("image:print", (e) => {
    console.log("printing...");
    page_to_print.print({
        silent: true,
        printBackground: true,
        deviceName: store.get("default_printer"),
        copies: 1
    }, (succ, err) => {
        if (succ) {
            console.log("printed!");
        } else {
            console.log(err);
        }
    });
});

let one_time_event = [];
ipcMain.handle("one-time-event", (e, event_name) => {
    if (one_time_event.includes(event_name))
    {
        return true;
    }
    one_time_event.push(event_name);
    return false;
});

ipcMain.handle("get-url", (e) => {
    return mainWindow.getBrowserView().webContents.getURL();
});

ipcMain.handle("get-printers", async (e) => {
    return mainWindow.webContents.getPrinters();
});

ipcMain.on("power:shut-down", async (e) => {
    let shutdown_command, shutdown_args;
    if (process.platform == "win32") {
        shutdown_command = "shutdown";
        shutdown_args = ['/s', '/t', '0'];
    } else {
        shutdown_command = "sudo";
        shutdown_args = ['shutdown', '-h', 'now'];
    }
    spawn(shutdown_command, shutdown_args);
});

ipcMain.handle("open-dialog", async (e, title) => {
    const options = {
        title : title,
        defaultPath : os.userInfo().homedir,
        buttonLabel : "Select",
        properties : ["openDirectory"]
    }
    
    return await dialog.showOpenDialog(options);
});

ipcMain.on("settings:set", (e, setting, argument) => {
    console.log(`Setting ${setting} to ${argument}`);
    store.set(setting, argument);
});

ipcMain.handle("settings:get", (e, setting, default_value = undefined) => {
    const val = store.get(setting);
    console.log(`Getting ${setting} is ${val}`);
    return val ?? default_value;
});

ipcMain.on("settings:delete", (e, setting) => {
    const val = store.delete(setting);
    console.log(`Deleting ${setting}`);
});

// Create the menu for the main window
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Quit",
                accelerator: `${altKey}+Q`,
                click() {
                    app.quit();
                }
            }
        ]
    }
]

// Fix some weird menu behavior on Mac
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({});
}

// Add devtools item if not in production
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: `${altKey}+I`,
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    })
}




