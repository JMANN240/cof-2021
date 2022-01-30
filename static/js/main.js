let greeting = document.querySelector("#greeting");

let init = async () => {
    let username = await ipcRenderer.invoke("settings:get", "username");
    if (username != undefined) {
        greeting.innerHTML = `Welcome, ${username}`;
    }
}

init();