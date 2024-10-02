import { API_ENDPOINTS } from "@shared/config/constants/index.js"

export class MapModel {
	constructor() {
		this.btn = document.querySelector("[data-js-btn]")
		this.#bindEvents()
		console.debug("constructor for MapModel")
	}

	handleClick(e) {
		fetch(API_ENDPOINTS.posts.news)
			.then((res) => {
				return res.json()
			})
			.then((res) => {
				console.debug(res)
			})
	}

	#bindEvents() {
		if (this.btn) {
			this.btn.addEventListener("click", (e) => {
				this.handleClick(e)
			})
		}
	}
}
