let default_printer_select = document.querySelector("#default-printer");

let init = async () =>  {
    let printers = await ipcRenderer.invoke('get-printers');
    for (let printer of printers) { 
        let printer_option = document.createElement("option");
        printer_option.value = printer.name;
        let printer_display_name_node = document.createTextNode(printer.displayName);
        printer_option.appendChild(printer_display_name_node);
        default_printer_select.appendChild(printer_option);
    }
    console.log(await ipcRenderer.invoke("settings:get", "foo"));
}

init();

default_printer_select.addEventListener("change", (e) => {
    console.log(`Setting default printer to ${default_printer_select.value}`);
    ipcRenderer.send("settings:set", "default_printer", default_printer_select.value)
})