document.querySelector("#image").addEventListener("load", () => {
    ipcRenderer.send("image:print");
});