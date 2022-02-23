
const { ipcRenderer } = require('electron');
const { v4: uuidv4 } = require('uuid');
const username = ipcRenderer.invoke("settings:get", "username");
const userId = new Promise(async function(resolve) {
    resolve((await username) + ':' + uuidv4());
});

console.log('running analytics');

const uploadQueue = [];
async function PushUploadQueue() {
    if (uploadQueue.length == 0) return;
    const user = await userId;
    const items = uploadQueue.splice(0, Math.min(100, uploadQueue.length))
    .map(o => {
        o.user = user;
        return o;
    });
    // Queue is not empty. Trigger another upload.
    if (uploadQueue.length > 0) UploadEvent();
    try {
        await fetch('https://host.com/cof-2022/analytics/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(items),
        })
    } catch(e) {
        // Failed to push
        // Put items back at the beginning of the queue
        uploadQueue.unshift(...items);
        // Trigger another upload.
        UploadEvent();
    }
};

// Batched uploading to preserve data & requests
// Upload once no more events have come in for 2 seconds or until the queue has reached 20 entries
let batchedUpload;
function UploadEvent(payload) {
    if (payload) uploadQueue.push(payload);
    if (uploadQueue.length > 20) {
        clearTimeout(batchedUpload);
        PushUploadQueue();
    }
    if (batchedUpload) clearTimeout(batchedUpload);
    batchedUpload = setTimeout(PushUploadQueue, 2000);
}

function RecordEvent(event) {
    let result;
    if (event instanceof MouseEvent) {
        console.log(event);
        result = {}
    } else if (event instanceof CustomEvent) {
        result = {
            detail: event.detail,
        }
    }
    if (result) {
        if (result === true) result = {};
        result.type = event.type;
        result.path = event.path.filter(o => o && o.localName)
            .map(o => (
                o.localName
                + (o.id ? '#' + o.id : '')
                + (o.classList ?
                    [...o.classList.values()].map(o2 => '.' + o2)
                    : '').join('')
            ));
        result.time = {
            epoc: Date.now(),
            local: new Date().toLocaleString(),
            utc: new Date().toUTCString(),
        }
        result.page = location.href;
    }
    if (result) {
        console.log(JSON.parse(JSON.stringify(result)))
        UploadEvent(result);
    } else {
        console.error(`Cannot record event "${event.type}"; no logic specified.`, event)
    }

}

document.addEventListener('click', RecordEvent);

RecordEvent(new CustomEvent("navigation", {
    detail: location
}))