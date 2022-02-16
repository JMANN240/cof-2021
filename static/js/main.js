let greeting = document.querySelector("#greeting");
let buttons_div = document.querySelector("#buttons");

let init = async () => {
    let username = (await require("electron").ipcRenderer.invoke("settings:get", "username")) ?? os.userInfo().username;
    greeting.innerHTML = `Welcome, ${username}`;

    for (let i = 0; i < 8; i++) {
        // <button class="good fancy application" id="email"><i class="fas fa-envelope"></i> Email</button>
        let site_name = await require("electron").ipcRenderer.invoke("settings:get", `custom_site_${i+1}`);
        if (site_name != undefined) {
            let custom_button = document.createElement("button");
            custom_button.classList.add("good", "fancy", "application");
            custom_button.id = `custom-button-${i+1}`
            site_name_text_node = document.createTextNode(site_name);
            custom_button.appendChild(site_name_text_node);
            buttons_div.appendChild(custom_button);
        }
    }

    animate_buttons();
}

init();