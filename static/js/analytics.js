
const { v4: uuidv4 } = require('uuid');
const userId = ipcRenderer.invoke("settings:get", "userId").then(async (userId) => {
    if (userId && userId.length > 0) return userId;
    const username = await require('username')();
    // UserId = OS Username (only alphanumeric characters) and a GUID, separated by a colon
    userId = username.replace(/[^a-z0-9]/gi,'') + ':' + uuidv4();
    await ipcRenderer.invoke("settings:set", "userId", userId);
    return userId;
}).then(userId => {
    console.log('Analytics UserId: ', userId);
    return userId;
})

console.log('running analytics');

const uploadQueue = JSON.parse(localStorage.getItem('analytics_upload_queue') || '[]');
function SaveUploadQueue() {
    localStorage.setItem('analytics_upload_queue', JSON.stringify(uploadQueue));
}

async function PushUploadQueue() {
    if (uploadQueue.length == 0) return;
    const user = await userId;
    const items = uploadQueue.splice(0, Math.min(100, uploadQueue.length))
    .map(o => {
        o.user = user;
        return o;
    });
    SaveUploadQueue();
    // Queue is not empty. Trigger another upload.
    if (uploadQueue.length > 0) UploadEvent();
    try {
        await fetch('https://capstone.lol/cof/analytics/upload', {
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
        SaveUploadQueue();
        // Trigger another upload.
        UploadEvent();
    }
};

// Batched uploading to preserve data & requests
// Upload once no more events have come in for 2 seconds or until the queue has reached 20 entries
let batchedUpload;
function UploadEvent(payload) {
    if (payload) {
        uploadQueue.push(payload);
        SaveUploadQueue();
    }
    if (uploadQueue.length > 20) {
        clearTimeout(batchedUpload);
        PushUploadQueue();
    }
    if (batchedUpload) clearTimeout(batchedUpload);
    batchedUpload = setTimeout(PushUploadQueue, 2000);
}


// Trigger event upload for events from last page navigation
if (uploadQueue.length > 0) {
    UploadEvent();
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
        result.content = event.target && event.target.innerText.trim();
        if (result.content && result.content.length > 100) result.content = result.content.substr(0, 100) + '...';
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