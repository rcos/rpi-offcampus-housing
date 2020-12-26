console.log(`Service Worker Running 🚀`);

self.addEventListener(`install`, evt => {
    console.log(`Service worker has been installed.`)
})

self.addEventListener(`activate`, evt => {
    console.log(`Service worker has been activated.`)
})