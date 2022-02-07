const yargs = require('yargs');
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const { dev } = argv;
if (dev) require('./hotreload');

const electron = require("electron");
const Store = require('electron-store');
const { URL, format } = require("url");
const path = require("path");

const {app, BrowserWindow, BrowserView, Menu, ipcMain, webContents} = electron;

const store = new Store();

let htmlPath = path.join("file://", __dirname, "html")

let altKey = process.platform == "darwin" ? "Command" : "Ctrl"

let width, height;

app.setLoginItemSettings({
    openAtLogin: false
});

app.on("ready", () => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    width = primaryDisplay.workAreaSize.width
    height = primaryDisplay.workAreaSize.height
    console.log(width, height);

    mainWindow = new BrowserWindow({
        fullscreen: !dev,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    let mainURL = new URL(path.join(htmlPath, "main.html"));
    mainWindow.loadURL(mainURL.href);

    mainWindow.on("closed", () => {
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(dev ? mainMenu : null);
});

page_links = {
    youtube: "https://www.youtube.com",
    email: "https://mail.google.com",
    search: "https://google.com",
    facebook: "https://facebook.com"
}

ipcMain.on("page:change", (e, p) => {
    let html_file, link;
    if (p.startsWith("custom-button") || Object.keys(page_links).includes(p)) {
        html_file= "web.html";
        if (p.startsWith("custom-button")) {
            let setting = p.replace(/button/g, "link").replace(/-/g, '_');
            link = store.get(setting)
        } else if (Object.keys(page_links).includes(p)) {
            link = page_links[p]
        }
    } else {
        html_file = `${p}.html`;
    }
    let mainURL = new URL(path.join(htmlPath, html_file));
    mainWindow.loadURL(mainURL.href);

    if (p.startsWith("custom-button") || Object.keys(page_links).includes(p)) {
        const view = new BrowserView();
        mainWindow.setBrowserView(view);
        view.setBounds({x:0, y:0, width:width, height:parseInt(height*0.8)});
        view.webContents.loadURL(link);
    } else {
        if (mainWindow.getBrowserView() != undefined) {
            mainWindow.getBrowserView().webContents.destroy();
        }
        mainWindow.setBrowserView(null);
    }
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

ipcMain.on("image:print", (e, img) => {
    let view = new BrowserView();
    let page = view.webContents;
    let mainURL = new URL(path.join(htmlPath, "print.html"));
    page.loadURL(mainURL.href);
    // page.executeJavaScript(`document.body.style.backgroundImage = 'url("${img}")'`);
    page.executeJavaScript(`document.querySelector("#image").src = "${img}";`);
    // mainWindow.setBrowserView(view);
    setTimeout(()=>{
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
    }, 100)
});

ipcMain.handle("get-printers", async (e) => {
    return mainWindow.webContents.getPrinters();
});

ipcMain.on("settings:set", (e, setting, argument) => {
    console.log(`Setting ${setting} to ${argument}`);
    store.set(setting, argument);
});

ipcMain.handle("settings:get", (e, setting) => {
    const val = store.get(setting);
    console.log(`Getting ${setting} is ${val}`);
    return val;
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
