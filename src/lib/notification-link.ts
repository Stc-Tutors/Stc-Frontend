interface RouterLike {
  push: (href: string) => void;
}

// Notification links sometimes point into the platform's other Next.js app
// (Stc-Frontend <-> Stc-SuperAdmin) and arrive as absolute URLs so they work
// regardless of which app the notification is opened from. A same-origin
// absolute link still gets a smooth client-side transition; only a
// genuinely cross-app link needs a full page navigation.
export function navigateToNotificationLink(router: RouterLike, link: string): void {
  if (!/^https?:\/\//i.test(link)) {
    router.push(link);
    return;
  }

  try {
    const url = new URL(link);
    if (url.origin === window.location.origin) {
      router.push(`${url.pathname}${url.search}${url.hash}`);
      return;
    }
  } catch {
    // Not a parseable absolute URL - fall through to a full navigation.
  }

  window.location.href = link;
}
