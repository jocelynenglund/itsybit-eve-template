// The App tab.
import { appFrame } from "../views/appFrame.read.js";
import { AppFrame } from "../parts/app.parts.js";
export const appScreen = (book, screen) => AppFrame(appFrame(screen));
