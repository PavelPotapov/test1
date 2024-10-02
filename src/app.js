import "./styles.js"
import { MapModel } from "@components/Map/index"

document.addEventListener("DOMContentLoaded", async () => {
	if (process.env.NODE_ENV === "development") {
		const { getMocks } = await import("@shared/api/lib/index")
		await getMocks()
		console.debug("MSW ready")
	}
	new MapModel()
})
