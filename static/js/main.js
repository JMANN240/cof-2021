const electron = require("electron");
const { ipcRenderer } = electron;

const email_button = document.querySelector("#email");
email_button.addEventListener("click", () => {
    ipcRenderer.send("page:change", "email.html");
});

const youtube_button = document.querySelector("#youtube");
youtube_button.addEventListener("click", () => {
    ipcRenderer.send("page:change", "youtube.html");
});