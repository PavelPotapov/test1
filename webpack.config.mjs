import path, { join } from "path"
import { fileURLToPath, pathToFileURL } from "url"
import HtmlWebpackPlugin from "html-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import fs from "fs"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import CssMinimizerPlugin from "css-minimizer-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import webpack from "webpack"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir = path.resolve(__dirname, "./src")
const buildDir = path.resolve(__dirname, "./build")
const pagesDir = path.resolve(__dirname, "./src/pages")
const publicDir = path.resolve(__dirname, "public")

const addPCSSImports = (dir) => {
	const files = fs.readdirSync(dir)
	let imports = ""

	for (const file of files) {
		const filePath = path.join(dir, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory()) {
			// Рекурсивно обрабатываем подкаталоги
			imports += addPCSSImports(filePath)
		} else if (file.endsWith(".pcss")) {
			// Генерация импорта для .pcss файлов с относительным путем
			const relativePath = path.relative(path.join(__dirname, "src"), filePath)
			imports += `import "./${relativePath.replace(/\\/g, "/")}";\n`
		}
	}

	return imports
}

const writeStylesToFile = () => {
	const pcssImports = addPCSSImports(baseDir)

	const stylesPath = path.join(baseDir, "styles.js")
	// Удаление старых импортов .pcss
	let stylesContent = fs.existsSync(stylesPath)
		? fs.readFileSync(stylesPath, "utf8")
		: ""

	// Удаление предыдущих импортов
	stylesContent = stylesContent.replace(/import ".*\.pcss";\n/g, "")
	stylesContent = stylesContent.replace(/^\s*[\r\n]/gm, "") // Удаление пустых строк

	// Запись новых импортов в styles.js
	fs.writeFileSync(stylesPath, `${pcssImports}\n${stylesContent}`)
}

export const generatePages = async (isDev) => {
	const pageFiles = fs.readdirSync(pagesDir)

	const plugins = await Promise.all(
		pageFiles
			.filter((file) => file.endsWith(".js"))
			.map(async (file) => {
				const pageName = file.split(".")[0]
				// Используем pathToFileURL для корректной обработки путей, ВАЖНО!
				const pageModuleUrl = pathToFileURL(join(pagesDir, file)).href
				const { default: pageContent } = await import(pageModuleUrl)

				return new HtmlWebpackPlugin({
					filename: `${pageName}.html`,
					templateContent: pageContent(),
					minify: {
						collapseWhitespace: !isDev,
					},
				})
			})
	)

	return plugins
}

const foldersForCopy = ["assets"]
const copyFolders = (folders) => {
	return folders.map((folder) => {
		const fromPath = path.resolve(__dirname, "public", folder)
		const toPath = path.resolve(__dirname, "build", folder)
		if (!fs.existsSync(fromPath)) {
			console.warn(`Source folder "${fromPath}" does not exist.`)
		}

		return {
			from: fromPath,
			to: toPath,
			noErrorOnMissing: true,
		}
	})
}

export default async (env, { mode }) => {
	const isDev = mode === "development" ? true : false
	const pages = await generatePages(isDev)
	writeStylesToFile()
	return {
		mode: isDev ? "development" : "production",
		entry: path.join(baseDir, "app.js"),
		output: {
			path: buildDir,
			filename: "[name].[contenthash].bundle.js",
			clean: true,
		},
		module: {
			rules: [
				{
					test: /\.pcss$/,
					use: [
						isDev ? "style-loader" : MiniCssExtractPlugin.loader,
						{
							loader: "css-loader",
							options: {
								importLoaders: 1,
								sourceMap: isDev ? true : false,
							},
						},
						"postcss-loader",
					],
				},
				{
					test: /\.(png|jpe?g|gif|svg)$/i,
					type: "asset/resource",
					generator: {
						filename: "assets/images/[name][ext]",
					},
				},
			],
		},
		plugins: [
			...pages,
			new CopyPlugin({
				patterns: [...copyFolders(foldersForCopy)],
			}),
			new MiniCssExtractPlugin({
				filename: "styles/[name][hash].css",
			}),
			new webpack.DefinePlugin({
				"process.env.API_URL": JSON.stringify(
					process.env.API_URL || "http://localhost:8888"
				),
			}),
		],
		devServer: {
			static: {
				directory: publicDir,
			},
			port: 8888,
			open: true,
			historyApiFallback: true,
			hot: true,
			watchFiles: [
				"src/**/*.js",
				"src/**/*.pcss",
				"src/**/*.html",
				"src/**/*.json",
			],
		},
		resolve: {
			alias: {
				"@assets": path.resolve(__dirname, "public/assets"),
				"@app": path.resolve(__dirname, "src/app"),
				"@components": path.resolve(__dirname, "src/components"),
				"@shared": path.resolve(__dirname, "src/shared"),
			},
			extensions: [".js", ".pcss"],
		},
		devtool: isDev ? "eval-source-map" : "source-map",
		optimization: {
			minimize: isDev ? false : true,
			minimizer: [
				new CssMinimizerPlugin(), // Минификация CSS
				new TerserPlugin(), // Минификация JavaScript
			],
		},
	}
}
