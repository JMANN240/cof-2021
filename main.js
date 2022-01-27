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

page_links = {
    youtube: "https://www.youtube.com",
    email: "https://mail.google.com"
}

ipcMain.on("page:change", (e, p) => {
    const html_file = `${p}.html`
    let mainURL = new URL(path.join(htmlPath, html_file));
    mainWindow.loadURL(mainURL.href);

    if (Object.keys(page_links).includes(p)) {
        const view = new BrowserView();
        mainWindow.setBrowserView(view);
        view.setBounds({x:width*0.02,y:height*0.02,width:width*0.96,height:height*0.76});
        view.webContents.loadURL(page_links[p]);
    } else {
        mainWindow.setBrowserView(null);
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
