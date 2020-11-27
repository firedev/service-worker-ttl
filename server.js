const PORT = 8080
const fs = require('fs')
const http = require('http')
const REWRITE = {
  '/': '/index.html',
}
const httpServer = http.createServer(handleRequest)
const rewriteURL = (url) => REWRITE[url] || url

const sendJSONResponse = (msg, res, otherHeaders = {}) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
    ...otherHeaders,
  })
  res.end(JSON.stringify(msg))
}

// yyyy-mm-dd hh:mm:ss
const dateTime = () =>
  new Date()
    .toISOString()
    .split('T')
    .map((x) => x.split('.')[0])
    .join(' ')

async function getDateTime(_req, res) {
  sendJSONResponse({ dateTime: dateTime() }, res)
}

async function handleRequest(req, res) {
  console.log(req.url)
  if (/^\/datetime$/.test(req.url)) {
    return getDateTime(req, res)
  }
  fs.readFile(__dirname + rewriteURL(req.url), function (err, data) {
    if (err) {
      res.writeHead(404)
      res.end(JSON.stringify(err))
      return
    }
    if (req.url.match(/.js$/)) {
      res.setHeader('Content-Type', 'text/javascript')
    }
    if (req.url.match(/\/sw.js$/)) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0')
    }
    res.writeHead(200)
    res.end(data)
  })
}

httpServer.listen(PORT)
console.log(`Server started on http://localhost:${PORT}...`)
