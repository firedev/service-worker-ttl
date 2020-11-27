"use strict";

;(function Home() {
  let serviceWorker
  const state = {
    online: true,
    server: true,
  }
  let onlineEl
  let serverEl
  let datetimeEl
  let workerEl

  const sendUpdate = () => serviceWorker.postMessage({ state })

  const displayStatus = () => {
    onlineEl.checked = state.online
    serverEl.checked = state.server
  }

  const updateState = ({ target }) => {
    state[target.id] = target.checked
    sendUpdate()
    displayStatus()
  }

  const onMessage = ({ data }) => {
    console.log('home/onMessage', data)
    worker.innerText = JSON.stringify(data.state)
  }

  const startFetching = () => setTimeout(fetchDatetime, 1000)

  async function fetchDatetime() {
    const res = await fetch('/datetime', { method: 'GET' })
    const data = await res.text()
    datetimeEl.innerText = data
    startFetching()
  }

  async function ready() {
    onlineEl = document.getElementById('online')
    serverEl = document.getElementById('server')
    workerEl = document.getElementById('worker')
    datetimeEl = document.getElementById('datetime')
    onlineEl.addEventListener('change', updateState)
    serverEl.addEventListener('change', updateState)

    const registration = await navigator.serviceWorker.register('./sw.js')
    serviceWorker = registration.installing || registration.waiting || registration.active
    navigator.serviceWorker.addEventListener('message', onMessage)

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      serviceWorker = navigator.serviceWorker.controller
      sendUpdate(serviceWorker)
    })
    sendUpdate(serviceWorker)
    displayStatus()
    startFetching()
  }
  document.addEventListener('DOMContentLoaded', ready)
})()
