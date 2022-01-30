const os = require('os');
const fs = require('fs');
const path = require("path");

let images = document.querySelector("#images");

const pictures_path = path.join(os.homedir(), "Pictures");

console.log(pictures_path);

let image_view = document.querySelector("#imageView");
let print_button = document.querySelector("#image-print");
let exit_button = document.querySelector("#exit");
let modal = document.querySelector("#previewModal");

print_button.addEventListener("click", () => {
    ipcRenderer.send("image:print", image_view.src);
});

exit_button.addEventListener("click", () => {
    modal.style.display = "none";
    modal.style.animation = null;
});

fs.readdir(pictures_path, { withFileTypes: true }, (err, files) => {
    for (let file of files.filter( file => file.name.match(/png|jpg|jpeg|gif|tiff/gi) !== null )) {
        let node = document.createElement("img")
        node.classList.add("clickable");
        const picSource = path.join(pictures_path, file.name);
        console.log(picSource);
        node.src = picSource;
        node.addEventListener("click", () => {
            document.querySelector("#imageView").src = picSource;
            modal.style.display = "flex";
            modal.style.animationName = "fade-in";
        });
        images.appendChild(node);
    }
});