const electron = require("electron");
const Store = require('electron-store');
const { URL, format } = require("url");
const path = require("path");

const {app, BrowserWindow, BrowserView, Menu, ipcMain} = electron;

const store = new Store();

let htmlPath = path.join("file://", __dirname, "html")

let altKey = process.platform == "darwin" ? "Command" : "Ctrl"

let width, height;

app.on("ready", () => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    width = primaryDisplay.workAreaSize.width
    height = primaryDisplay.workAreaSize.height
    console.log(width, height);

    mainWindow = new BrowserWindow({
        fullscreen: true,
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
    Menu.setApplicationMenu(mainMenu);
});

ipcMain.on("page:change", (e, p) => {
    let mainURL = new URL(path.join(htmlPath, p));

    console.log(p);

    if (p == "youtube.html") {
        const view = new BrowserView();
        mainWindow.setBrowserView(view);
        view.setBounds({x:width*0.02,y:height*0.02,width:width*0.96,height:height*0.76});
        view.webContents.loadURL("https://www.youtube.com");
    } else {
        mainWindow.loadURL(mainURL.href);
    }
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