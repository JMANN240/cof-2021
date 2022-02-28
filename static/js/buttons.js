let animate_buttons = async () => {
    let have_animated_buttons = await ipcRenderer.invoke("one-time-event", "animate_buttons");
    let buttons = document.querySelectorAll("button.fancy");

    for (let [index, button] of buttons.entries()) {
        if (button.classList.contains("application")) {
            button.addEventListener("click", () => {
                ipcRenderer.send("page:change", button.dataset.applicationType, button.dataset.site);
            });
        }

        if (button.id == "print") {
            button.addEventListener("click", () => {
                ipcRenderer.send("page:print");
            });
        }

        if (button.id == "shut-down") {
            button.addEventListener("click", () => {
                ipcRenderer.send("power:shut-down");
            });
        }

        if (button.id == "favorite") {
            button.addEventListener("click", async () => {
                if (await ipcRenderer.invoke("page:toggle-favorite")) {
                    // It is now a favorite
		            button.innerHTML = '<i class="fas fa-star"></i> Unfavorite';
                } else {
                    // It is now not a favorite
		            button.innerHTML = '<i class="far fa-star"></i> Favorite';
                }
            });
        }

        if (!have_animated_buttons)
        {
            let animation_name;
            if (button.classList.contains("good")) {
                animation_name = "button-in-good";
            } else if (button.classList.contains("bad")) {
                animation_name = "button-in-bad";
            } else if (button.classList.contains("info")) {
                animation_name = "button-in-info";
            }
    
            setTimeout(() => {
                button.style.opacity = 1;
                button.style.animation = `${animation_name} 2s`;
            }, ( index + 1 ) * 250);
        }
        else
        {
            button.style.opacity = 1;
        }
    }
}

document.addEventListener("initComplete", (e) => {
    console.log("animating buttons");
    animate_buttons();
});