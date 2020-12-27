console.log(`Service Worker Running 🚀`);

self.addEventListener(`install`, evt => {
    console.log(`Service worker has been installed.`)
})

self.addEventListener(`activate`, evt => {
    console.log(`Service worker has been activated.`)
})

self.addEventListener('message', evt => {
    console.log(`Service Worker: Message recieved.`, evt)

    if (!Object.prototype.hasOwnProperty.call(evt.data, `type`) ||
        !Object.prototype.hasOwnProperty.call(evt.data, `data`)) {
        console.error(`Service worker recieved message with no type or data attached.\nExiting.`);
        return;
    }

    switch(evt.data.type) {

        case "prompt-user-enable-push-notif":
            createSubscription (evt.source.id, evt.data.data);
            break;
    }
})

self.addEventListener('push', e => {
    const data = e.data.json();

    self.registration.showNotification(
        data.title, {
            body: data.body
        }
    )
})

const createSubscription = (client_id, _data_) => {
    if (!Object.prototype.hasOwnProperty.call(_data_, 'applicationServerKey')) {
        console.error(`No applicationServerKey found in data of message recieved by service worker.`);
        return;
    }

    let subscription = self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _data_.applicationServerKey
    })
    subscription
    .then(sub_ => {
        clients.get(client_id)
        .then(client_ => {
            client_.postMessage({
                type: 'prompt-user-enable-push-notif-response',
                data: {
                    subscription: sub_.toJSON()
                }
            })
        })
        .catch(err => console.log(err))

        // self.registration.active.postMessage({
        //     type: 'prompt-user-enable-push-notif-respinse',
        //     data: {
        //         subscription: sub_
        //     }
        // })

        // Send the subscription back to the client
    })
    .catch(err => {
        console.error(`Error occurred creating push notifcation subscription.`)
        console.error(err)
    })
}