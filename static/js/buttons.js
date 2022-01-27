const electron = require("electron");
const { ipcRenderer } = electron;

application_buttons = document.querySelectorAll("button.application");

for (let [index, button] of application_buttons.entries()) {
    button.addEventListener("click", () => {
        ipcRenderer.send("page:change", button.id);
    });

    setTimeout(() => {
        button.style.opacity = 1;
        button.style.animation = "button-in 2s";
    }, ( index + 1 ) * 200);
}