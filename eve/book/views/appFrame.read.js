// The App tab: still looking, nothing built yet, or the app in a phone- or laptop-sized frame.
export function appFrame(screen) {
  const state = screen.appExists === null ? "checking" : screen.appExists ? "ready" : "missing";
  return { state, url: screen.root + "app/", width: screen.appWidth };
}
