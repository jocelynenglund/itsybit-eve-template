// Look and feel: what the person said about how the app should feel, or the form to say it.
export const MOODS = ["Calm", "Playful", "Bold", "Minimal", "Warm", "Cosy", "Elegant", "Techy", "Fresh", "Serious"];
export const TYPES = ["Rounded and friendly", "Clean and modern", "Classic, with serifs", "Handwritten", "Typewriter / code"];
export const THEMES = [["light", "Light"], ["dark", "Dark"], ["both", "Both (follow the device)"], ["", "No preference"]];
export const DEVICES = [["phone", "Mostly on a phone"], ["laptop", "Mostly on a laptop"], ["both", "Both"]];

export function lookCard(book, screen) {
  if (screen.lookForm) {
    const f = screen.lookForm;
    return { form: { ...f, moods: MOODS.map(m => ({ name: m, on: f.moods.includes(m) })), canAddColour: f.colours.length < 4,
      themes: THEMES, types: TYPES.map(t => [t, t]).concat([["", "No preference"]]), devices: DEVICES } };
  }
  const L = book.look;
  const summary = [];
  if (L) {
    if (L.moods && L.moods.length) summary.push({ text: L.moods.join(", ") });
    if (L.colours && L.colours.length) summary.push({ colours: L.colours });
    const theme = THEMES.find(t => t[0] === L.theme && t[0]); if (theme) summary.push({ text: theme[1] });
    if (L.type) summary.push({ text: L.type });
    const dev = DEVICES.find(d => d[0] === L.device);
    if (dev) summary.push({ text: dev[1] + (L.where ? ", " + L.where : "") }); else if (L.where) summary.push({ text: L.where });
    if (L.likes) summary.push({ text: "like " + L.likes });
  }
  return { form: null, summary, isNew: book.lookNew, notes: (summary.length && L.notes) || "", canChange: !book.locked };
}
