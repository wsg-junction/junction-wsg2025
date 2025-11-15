self.addEventListener('push', function (event) {
  const {
    notification: { title, body },
  } = JSON.parse(event.data.text());

  event.waitUntil(self.registration.showNotification(title, { body }));
});
