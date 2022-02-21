let greeting = document.querySelector("#greeting");
let buttons_div = document.querySelector("#buttons");

let truncateIfNeeded = (string, length) => {
    if (string.length <= length) {
        return string;
    }

    return string.slice(0,length-3) + "...";
}

let init = async () => {
    let username = (await require("electron").ipcRenderer.invoke("settings:get", "username")) ?? os.userInfo().username;
    greeting.innerHTML = `Welcome, ${username}`;

    // Get favorited sites
    let favorites = await ipcRenderer.invoke("settings:get", "favorites");
    if (favorites != undefined)
    {
        for (let entry of favorites)
        {
            console.log(entry);
            let custom_button = document.createElement("button");
            custom_button.classList.add("good", "fancy", "application");
            custom_button.id = `custom-button-${entry.title.toLowerCase()}`;
            custom_button.dataset.applicationType = 'web';
            custom_button.dataset.site = entry.url;
            site_name_text_node = document.createTextNode(truncateIfNeeded(entry.title, 12));
            custom_button.appendChild(site_name_text_node);
            buttons_div.appendChild(custom_button);
        }
    }

    document.dispatchEvent(new Event('initComplete'));
}

init();