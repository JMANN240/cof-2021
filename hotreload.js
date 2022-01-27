
const chokidar = require('chokidar');
const { webContents } = require('electron');

chokidar.watch('.', {
    ignoreInitial: true,
    ignored: ['**/node_modules/**/*', '**/.git/**/*'],
}).on('all', (event, path) => {
    // console.log(event, path);
    const contents = webContents.getAllWebContents();
    const skips = [];
    for (const item of contents) {
        const { devToolsWebContents } = item;
        if (devToolsWebContents) {
            skips.push(devToolsWebContents.id)
        }
    }
    // console.log(contents.length)
    for (const item of contents.filter(o => !skips.includes(o.id))) {
        // console.log(item);
        item.reload();
    }
})