import autoprefixer from "autoprefixer"

export default {
	plugins: [
		"postcss-import",
		"postcss-custom-media",
		"postcss-nested",
		autoprefixer({
			overrideBrowserslist: ["last 2 versions"],
		}),
	],
}
