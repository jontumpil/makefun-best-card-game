/* Ember Court — main.js
   Boot: baca query (?shot=...&seed=...), buat state,
   terapkan shot bila diminta, lalu render dan pasang input. */

(function boot() {
  var q = readQuery();
  var seed = seedFromQuery(q);
  var state = newGame(seed);
  window.__emberCourt = state;
  if (q.shot) applyShot(state, q.shot);
  render(state);
  bindInput(state);
})();

/* State diekspos sebagai window.__emberCourt supaya mudah
   diperiksa dari konsol browser saat play-test. */
