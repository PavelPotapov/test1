import { Map } from "../components/Map/index.js"

const IndexPage = () => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Home Page</title>
    </head>
    <body>
      <header>
        <h1>Welcome to the Home Page</h1>
      </header>
      <main>
        <p>This is the home page content! 11</p>
        <div>
            ${Map("карта")}
        </div>
      </main>
    </body>
  </html>
`

export default IndexPage
