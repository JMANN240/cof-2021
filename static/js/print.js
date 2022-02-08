// document.querySelector("#image").addEventListener("load", () => {
//     ipcRenderer.send("image:print");
// });
var img = document.querySelector("#image");
var printReady = new Promise(function(resolve, reject) {
    img.onload = function(evt) {
        resolve(evt);
    };
    img.onerror = function(err) {
        reject(err);
    };
});