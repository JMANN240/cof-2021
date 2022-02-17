document.addEventListener("DOMContentLoaded", () => {
	init();
	animate_buttons();
});

let init = async () => {
	const favorites = await ipcRenderer.invoke("settings:get", "favorites");
	let favorite_button = document.querySelector("#favorite");///
	const url = await ipcRenderer.invoke("get-url");
	favorite_button.innerHTML = favorites;///
	//favorite_button.innerHTML = url + "|" + favorites;
	if (favorites.includes(url))
	{
		favorite_button.innerHTML = favorites + "---" + url;///
		// favorite_button = document.querySelector("#favorite");
		// favorite_button.innerHTML = '<i class="fas fa-star"></i>';
		// favorite_button.innerHTML += " Unfavorite";
	}
};