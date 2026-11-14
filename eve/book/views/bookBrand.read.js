// The book's name and round, at the top of every tab.
export function bookBrand(book) {
  return { title: (book.app || "Your app") + " · Event Book", round: book.round, idea: book.idea };
}
