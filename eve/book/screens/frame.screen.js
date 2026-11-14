// What every tab shares: the header above and the feedback bar below.
import { bookBrand } from "../views/bookBrand.read.js";
import { tabSwitch } from "../views/tabSwitch.read.js";
import { progressPills } from "../views/progressPills.read.js";
import { feedbackBar } from "../views/feedbackBar.read.js";
import { emptyBook } from "../views/emptyBook.read.js";
import { BookBrand, TabSwitch, ProgressPills, FeedbackBar, EmptyBook } from "../parts/frame.parts.js";

export const header = (book, screen) => `<header class="top"><div class="wrap">
      ${BookBrand(bookBrand(book))}
      <div class="pills">${TabSwitch(tabSwitch(book, screen))}${ProgressPills(progressPills(book, screen))}</div></div></header>`;
export const bar = (book, screen) => FeedbackBar(feedbackBar(book, screen));
export const empty = screen => EmptyBook(emptyBook(screen));
