/* eslint-disable no-restricted-globals */

const version = 3
const cacheName = `ttl-${version}`
const TTL = 10 // sec

async function clearCaches() {
  const cacheNames = await caches.keys()
  const oldCacheNames = cacheNames.filter((cache) => {
    if (/^ttl-\d+$/.test(cache)) {
      let [, cacheVersion] = cache.match(/^ttl-(\d+)$/)
      cacheVersion = cacheVersion != null ? Number(cacheVersion) : 0
      return cacheVersion > 0 && cacheVersion !== version
    }
    return false
  })
  return Promise.all(oldCacheNames.map((cache) => caches.delete(cache)))
}

function notFoundResponse() {
  console.log('page not found')
  return new Response('', {
    status: 404,
    statusText: 'Not Found',
  })
}

function isFresh(cachedRequest) {
  const requestDate = new Date(cachedRequest.headers.get('date'))
  const secondsCached = new Date() - requestDate
  console.log(`cached for ${parseInt(secondsCached / 1000, 10)} sec`)
  const fresh = new Date() - requestDate < TTL * 1000
  return fresh
}

async function router(req) {
  const { pathname } = new URL(req.url)
  const cache = await caches.open(cacheName)
  const cachedRequest = await cache.match(pathname)
  if (cachedRequest && isFresh(cachedRequest)) {
    return cachedRequest
  }
  const res = await fetch(req.url).catch(console.log)
  if (res && res.ok) {
    await cache.put(pathname, res.clone())
    return res
  }
  return cachedRequest || notFoundResponse()
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
  self.skipWaiting()
}

async function main() {
  console.log(`worker v${version} started`)
}

self.addEventListener('install', onInstall)
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch)

main().catch(console.error)
