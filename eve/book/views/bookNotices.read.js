// Notes at the top of the book: a new round waiting, a message, EVE updated or a newer EVE out.
export function bookNotices(screen) {
  return {
    newRound: !!screen.newRound,
    message: screen.message || "",
    updated: screen.eveUpdated ? { version: screen.eveUpdated.version, notes: screen.eveUpdated.notes || [] } : null,
    newer: screen.eveUpdate ? { text: screen.eveUpdate, notes: screen.eveNotes || [] } : null
  };
}
