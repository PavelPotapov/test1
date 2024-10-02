import { getResponseMock } from "./lib/index.js"
import { API_ENDPOINTS } from "../config/constants/index.js"

export const handlers = [
	getResponseMock({
		endpoint: API_ENDPOINTS.posts.news,
		data: {
			items: ["Hello world!"],
		},
	}),
]
