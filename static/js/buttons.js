let animate_buttons = () => {
    let buttons = document.querySelectorAll("button.fancy");

    for (let [index, button] of buttons.entries()) {
        if (button.classList.contains("application")) {
            button.addEventListener("click", () => {
                ipcRenderer.send("page:change", button.id);
            });
        }

        if (button.id == "print") {
            button.addEventListener("click", () => {
                ipcRenderer.send("page:print");
            });
        }

        let animation_name;
        if (button.classList.contains("good")) {
            animation_name = "button-in-good";
        } else if (button.classList.contains("bad")) {
            animation_name = "button-in-bad";
        }

        setTimeout(() => {
            button.style.opacity = 1;
            button.style.animation = `${animation_name} 2s`;
        }, ( index + 1 ) * 200);
    }
}

animate_buttons();