// Retire a service worker left by an earlier deployment. Vite does not generate one.

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
      });
  }
}
