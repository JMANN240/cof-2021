let default_printer_select = document.querySelector("#default-printer");
let custom_sites_div = document.querySelector("#custom-sites");
let pictures_path_button = document.querySelector("#pictures-path-button");

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
    let path = await ipcRenderer.invoke("settings:open-dialog");
    if (!path.canceled) {
        document.querySelector("#pictures-path").value = path.filePaths;
    }
    editSettings(document.querySelector("#pictures-path"));
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

    for (let i = 0; i < 8; i++) {
        // <div class="inset setting centered flex row">
        //     <input type="text" placeholder="Site Name"> : <input type="text" placeholder="Link">
        // </div>
        let site_div = document.createElement("div");
        site_div.classList.add("inset", "setting", "centered", "flex", "row");

        let name_input = document.createElement("input");
        name_input.type = "text";
        name_input.placeholder="Site Name";
        name_input.classList.add("valued");
        name_input.id = `custom_site_${i+1}`;

        let colon = document.createTextNode(":");

        let link_input = document.createElement("input");
        link_input.type = "text";
        link_input.placeholder="Link";
        link_input.classList.add("valued");
        link_input.id = `custom_link_${i+1}`;

        site_div.appendChild(name_input);
        site_div.appendChild(colon);
        site_div.appendChild(link_input);

        custom_sites_div.appendChild(site_div);
    }

    for (let element of document.querySelectorAll(".valued")) {
        const setting = element.id.replace(/-/g, '_');
        const value = await ipcRenderer.invoke("settings:get", setting);
        if (value != undefined) {
            element.value = value;
        }
        element.addEventListener("change", (e) => {
            editSettings(e.target);
        });
    }

    animate_buttons();
}

init();