let default_printer_select = document.querySelector("#default-printer");
let custom_sites_div = document.querySelector("#custom-sites");
let pictures_path_button = document.querySelector("#pictures-path-button");
let pictures_path_input = document.querySelector("#pictures-path");

function editSettings(element) {
    const setting = element.id.replace(/-/g, '_');
    const value = element.value;
    if (value != "") {
        console.log(`Setting ${setting} to ${value}`);
        ipcRenderer.send("settings:set", setting, value)
    } else {
        console.log(`Deleting ${setting}`);
        ipcRenderer.send("settings:delete", setting)
    }
}

// Setup event listener for ipc dialog
pictures_path_button.addEventListener("click", async (e) => {
    let path = await ipcRenderer.invoke("open-dialog", "Select a pictures folder");
    if (!path.canceled) {
        pictures_path_input.value = path.filePaths;
        pictures_path_input.dispatchEvent(new Event('input'));
    }
});

let init = async () =>  {
    let printers = await ipcRenderer.invoke('get-printers');
    let current_default_printer = await ipcRenderer.invoke("settings:get", "default_printer");
    
    for (let printer of printers) { 
        let printer_option = document.createElement("option");
        printer_option.value = printer.name;
        let printer_display_name_node = document.createTextNode(printer.displayName);
        printer_option.appendChild(printer_display_name_node);
        default_printer_select.appendChild(printer_option);
    }

    for (let element of document.querySelectorAll(".valued")) {
        const setting = element.id.replace(/-/g, '_');
        const value = await ipcRenderer.invoke("settings:get", setting);
        if (value != undefined) {
            element.value = value;
        }
        element.addEventListener("input", (e) => {
            editSettings(e.target);
        });
    }

    animate_buttons();
}

init();