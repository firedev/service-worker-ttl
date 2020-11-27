const version = 1
const cacheName = `ttl-${version}`
const state = {
  online: false,
  server: false,
}
const TTL = 10 // sec

async function clearCaches() {
  const cacheNames = await caches.keys()
  const oldCacheNames = cacheNames.filter((cache) => {
    if (/^ttl-\d+$/.test(cache)) {
      let [, cacheVersion] = cache.match(/^ttl-(\d+)$/)
      cacheVersion = (cacheVersion != null) ? Number(cacheVersion) : 0
      return (
        cacheVersion > 0 && cacheVersion !== version
      )
    }
    return false
  })
  return Promise.all(oldCacheNames.map((cache) => caches.delete(cache)))
}

const sendState = () => sendMessage({
  state: {
    ...state,
    TTL: `${TTL} sec`,
  },
})

const onMessage = ({
  data,
}) => {
  console.log('sw/onmessage', data)
  state.online = data.state.online
  state.server = data.state.server
  sendState()
}

async function sendMessage(msg) {
  // eslint-disable-next-line no-undef
  const allClients = await clients.matchAll({
    includeUncontrolled: true,
  })
  return Promise.all(
    allClients.map((client) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = onMessage
      return client.postMessage(msg, [channel.port2])
    }),
  )
}

async function router(req) {
  // const url = new URL(req.url)
  // const reqURL = url.pathname
  // const cache = await caches.open(cacheName)
  return fetch(req.url).catch(console.log)
}

const onFetch = (event) => {
  event.respondWith(router(event.request))
}

async function handleActivation() {
  console.log(`worker v${version} is activated`)
  await clearCaches()
  // eslint-disable-next-line no-undef
  await clients.claim()
}

async function onActivate(event) {
  event.waitUntil(handleActivation())
}

function onInstall() {
  console.log(`worker v${version} is installed`)
  this.skipWaiting()
}

async function main() {
  console.log('sw/main')
}

this.addEventListener('install', onInstall)
this.addEventListener('activate', onActivate)
this.addEventListener('message', onMessage)
this.addEventListener('fetch', onFetch)

main().catch(console.error)
