// Browser push for STC Tutors: shows class reminders and other notifications even when the site isn't open.
// Registered by src/components/web-push-registrar.tsx. Nothing here is cached - it only handles push.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "STC Tutors", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "STC Tutors";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/image/STC%20logo%20main.png",
      badge: "/image/STC%20logo%20main.png",
      data: { link: data.link || "/lms-home" },
      // A newer reminder for the same thing replaces the older one instead of stacking.
      tag: data.link || title,
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/lms-home";
  // Only ever open a page on this site.
  const target = new URL(link, self.location.origin);
  if (target.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(target.href);
          return client.focus();
        }
      }
      return self.clients.openWindow(target.href);
    })
  );
});
