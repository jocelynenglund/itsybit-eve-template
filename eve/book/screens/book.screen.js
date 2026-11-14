// The Book tab: the plan, chapter by chapter, with everything the person can say about it.
import { bookNotices } from "../views/bookNotices.read.js";
import { bookIntro } from "../views/bookIntro.read.js";
import { generalComments } from "../views/generalComments.read.js";
import { searchBox } from "../views/searchBox.read.js";
import { filterSwitch } from "../views/filterSwitch.read.js";
import { foldAll } from "../views/foldAll.read.js";
import { chapterList } from "../views/chapterList.read.js";
import { sliceCard } from "../views/sliceCard.read.js";
import { foldedSlice } from "../views/foldedSlice.read.js";
import { builtSlice } from "../views/builtSlice.read.js";
import { BookNotices, BookIntro, GeneralComments, SearchBox, FilterSwitch, FoldAllButton, ChapterList, SliceCard, FoldedSliceRow, BuiltSliceRow } from "../parts/book.parts.js";

export const bookScreen = (book, screen) => {
  const slice = e => e.as === "built" ? BuiltSliceRow(builtSlice(book, e.id))
    : e.as === "folded" ? FoldedSliceRow(foldedSlice(book, e.id))
    : SliceCard(sliceCard(book, screen, e.id, e.openedBuilt));
  return `<main><div class="wrap stack">
      ${BookNotices(bookNotices(screen))}
      ${BookIntro(bookIntro(book, screen))}
      ${GeneralComments(generalComments(book, screen))}
      ${SearchBox(searchBox(screen))}
      <div class="row spread filters">${FilterSwitch(filterSwitch(book, screen))}${FoldAllButton(foldAll(book, screen))}</div>
      ${ChapterList(chapterList(book, screen), slice)}
    </div></main>`;
};
