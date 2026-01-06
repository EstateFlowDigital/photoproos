type Cleanup = () => void;

let navGuardActive = false;

/**
 * Installs a lightweight navigation guard that:
 * - Logs when anchor clicks are prevented
 * - Detects likely overlay interceptions and reports the top element
 * - Auto-forces navigation if the URL did not change shortly after a click
 *
 * Enable/disable with localStorage key `ppos_nav_guard` ("false" to disable). Defaults to on.
 */
export function enableNavGuard(): Cleanup {
  if (navGuardActive || typeof window === "undefined") {
    return () => {};
  }
  const enabled = window.localStorage.getItem("ppos_nav_guard") !== "false";
  if (!enabled) return () => {};

  navGuardActive = true;

  const clickTracker = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement | null;
    const anchor = target?.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    const isSameOrigin = href.startsWith("/") || href.startsWith(window.location.origin);
    if (!isSameOrigin) return;

    const top = document.elementFromPoint(evt.clientX, evt.clientY) as HTMLElement | null;
    const overlay =
      top && top !== anchor && top !== target
        ? `${top.tagName.toLowerCase()}${top.id ? `#${top.id}` : ""}${
            typeof top.className === "string" && top.className ? `.${top.className.replace(/\s+/g, ".")}` : ""
          }`
        : "";

    if (evt.defaultPrevented) {
      console.warn("[nav-guard] Click prevented", { href, overlay });
      return;
    }

    const startPath = window.location.pathname + window.location.search + window.location.hash;
    window.setTimeout(() => {
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (current === startPath) {
        console.warn("[nav-guard] Navigation stalled, forcing", { href, overlay });
        window.location.href = href;
      }
    }, 900);
  };

  document.addEventListener("click", clickTracker, true);

  return () => {
    document.removeEventListener("click", clickTracker, true);
    navGuardActive = false;
  };
}
