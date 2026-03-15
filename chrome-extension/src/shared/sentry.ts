import * as Sentry from "@sentry/browser";

const DSN = "https://b88b0f9c952f28d4e932b91dd3f5bfd0@o4510885436260352.ingest.de.sentry.io/4511049834168400";

export function initSentry(context: "popup" | "background" | "content") {
  try {
    const version = typeof chrome !== "undefined" && chrome.runtime?.getManifest
      ? chrome.runtime.getManifest().version
      : "dev";

    Sentry.init({
      dsn: DSN,
      release: `wordcapture@${version}`,
      environment: typeof chrome !== "undefined" && chrome.runtime?.id ? "production" : "development",
      initialScope: {
        tags: { context },
      },
      beforeSend(event) {
        if (event.exception?.values) {
          for (const ex of event.exception.values) {
            if (ex.value?.includes("Extension context invalidated")) return null;
            if (ex.value?.includes("ResizeObserver loop")) return null;
          }
        }
        return event;
      },
    });
  } catch {
    // silently ignore if Sentry fails to init
  }
}

export { Sentry };
