// The Look tab.
import { lookCard } from "../views/lookCard.read.js";
import { LookCard } from "../parts/look.parts.js";
export const lookScreen = (book, screen) => `<main><div class="wrap stack">${LookCard(lookCard(book, screen))}</div></main>`;
