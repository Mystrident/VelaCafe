self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "New Velaa Cafe order", {
      body: data.body || "A customer has placed an order.",
      icon: "/vela_cafe_logo.jpeg",
      badge: "/favicon.svg",
      data: { url: data.url || "/orders" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
