const electron = require("electron");
const { ipcRenderer } = electron;

application_buttons = document.querySelectorAll("button.fancy");

for (let [index, button] of application_buttons.entries()) {
    if (button.classList.contains("application")) {
        button.addEventListener("click", () => {
            ipcRenderer.send("page:change", button.id);
        });
    }
    if (button.classList.contains("good")) {
        setTimeout(() => {
            button.style.opacity = 1;
            button.style.animation = "button-in-good 2s";
        }, ( index + 1 ) * 200);
    }
    if (button.classList.contains("bad")) {
        setTimeout(() => {
            button.style.opacity = 1;
            button.style.animation = "button-in-bad 2s";
        }, ( index + 1 ) * 200);
    }
}