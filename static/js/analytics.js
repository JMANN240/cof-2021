

console.log('running analytics');

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
    } else {
        console.error(`Cannot record event "${event.type}"; no logic specified.`, event)
    }

}

document.addEventListener('click', RecordEvent);

RecordEvent(new CustomEvent("navigation", {
    detail: location
}))