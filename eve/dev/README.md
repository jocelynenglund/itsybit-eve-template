# EVE's own tests (for EVE's maintainers)

People using EVE never need this folder: their app's tests run with `node eve/test.mjs`, nothing to install.

This is where EVE tests itself in a real browser:

```
cd eve/dev
npm install      # Playwright, once
npm test         # the Event Book, end to end
```

`book.test.mjs` opens the Event Book on scratch copies of the sample (built, or still being planned) through
`eve/serve.mjs`, and checks what a person sees and does on each tab. The Event Book's views and components have
their own fast tests in `eve/book/tests/` (`node --test "eve/book/tests/*.test.mjs"`), with nothing to install.
