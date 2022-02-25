let init = async () => {
	console.log("running init");
	const favorites = await ipcRenderer.invoke("settings:get", "favorites", []);
	console.log("got favorites");
	let favorite_button = document.querySelector("#favorite");
	const url = await ipcRenderer.invoke("get-url");
	console.log("got url");
	console.log("favorites", favorites);
	console.log(url);
	let favorite_urls = favorites.map(e => e.url);
	console.log("favorite_urls", favorite_urls);
	if (favorite_urls.includes(url))
	{
		favorite_button = document.querySelector("#favorite");
		favorite_button.innerHTML = '<i class="fas fa-star"></i> Unfavorite';
	}

	// Init forward/back buttons
	document.querySelector("#back").addEventListener("click", (e) => {
		ipcRenderer.send("page:navigate", "back");
	});

	document.querySelector("#forward").addEventListener("click", (e) => {
		ipcRenderer.send("page:navigate", "forward");
	});

	console.log("init complete");
    document.dispatchEvent(new Event('initComplete'));
};

ipcRenderer.once("main:web-loaded", () => {
	console.log("web has loaded");
	init();
});
