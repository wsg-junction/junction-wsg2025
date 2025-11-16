self.addEventListener('push', function (event) {
  const {
    data,
    notification: { title, body, actions, requireInteraction },
  } = JSON.parse(event.data.text());

  event.waitUntil(self.registration.showNotification(title, { body, data, requireInteraction }));
});
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const orderId = event.notification.data.orderId;
  // switch (event.action) {
  //   case 'select_alternatives':
  //     event.waitUntil(clients.openWindow(`/customer/orders/${orderId}/alternatives`));
  //     break;
  //   case 'view_order':
  //   default:
  //     event.waitUntil(clients.openWindow(`/customer/orders/${orderId}`));
  //     break;
  // }
  event.waitUntil(
    clients.openWindow(
      event.notification.data.hasMissingItems === 'true'
        ? `/customer/orders/${orderId}/alternatives`
        : `/customer/orders/${orderId}`,
    ),
  );
});
