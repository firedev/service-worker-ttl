(function Home() {
  let serviceWorker
  let datetimeEl

  const startFetching = () => setTimeout(fetchDatetime, 1000)

  async function fetchDatetime() {
    const res = await fetch('/datetime', {
      method: 'GET',
    }).catch(console.log)
    if (res) {
      datetimeEl.innerText = await res.text()
    }
    startFetching()
  }

  async function ready() {
    datetimeEl = document.getElementById('datetime')
    const registration = await navigator.serviceWorker.register('./sw.js')
    serviceWorker = registration.installing || registration.waiting || registration.active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      serviceWorker = navigator.serviceWorker.controller
    })
    startFetching()
  }
  document.addEventListener('DOMContentLoaded', ready)
}())
