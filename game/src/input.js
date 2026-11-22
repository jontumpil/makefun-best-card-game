/* Ember Court — input.js
   Mouse + keyboard: klik kartu untuk memainkannya,
   tombol Akhiri Giliran, tombol Main / Main Lagi. */

function bindInput(state) {
  var root = document.getElementById('app');
  root.addEventListener('click', function (ev) {
    var target = ev.target;
    if (!target) return;
    var btn = target.closest ? target.closest('button') : null;
    if (btn) {
      if (btn.id === 'btn-play') { startGame(state); render(state); return; }
      if (btn.id === 'btn-end-turn') { endPlayerTurn(state); render(state); return; }
      if (btn.id === 'btn-again') { restartGame(state); render(state); return; }
    }
    var cardNode = target.closest ? target.closest('.card') : null;
    if (cardNode && cardNode.dataset && cardNode.dataset.index !== undefined) {
      var idx = parseInt(cardNode.dataset.index, 10);
      if (!isNaN(idx)) {
        var played = playCard(state, idx);
        if (played) {
          cardNode.classList.add('played');
          setTimeout(function () { render(state); }, 160);
        } else {
          render(state);
        }
      }
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (state.screen === 'title' && (ev.key === 'Enter' || ev.key === ' ')) {
      startGame(state); render(state); return;
    }
    if ((state.screen === 'win' || state.screen === 'loss') && (ev.key === 'Enter' || ev.key === ' ')) {
      restartGame(state); render(state); return;
    }
    if (state.screen !== 'play') return;
    if (ev.key === 'Escape') { render(state); return; }
    if (ev.key >= '1' && ev.key <= '7') {
      var idx = parseInt(ev.key, 10) - 1;
      if (idx < state.player.hand.length) {
        playCard(state, idx);
        setTimeout(function () { render(state); }, 160);
      }
    } else if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      endPlayerTurn(state);
      render(state);
    }
  });
}

/* Mulai duel baru dengan seed yang sama (deck dikocok ulang). */
function restartGame(state) {
  var fresh = newGame(state.seed);
  state.screen = fresh.screen;
  state.turn = fresh.turn;
  state.player = fresh.player;
  state.enemy = fresh.enemy;
  state.log = fresh.log;
  state.playedThisTurn = fresh.playedThisTurn;
  state.elementsThisTurn = fresh.elementsThisTurn;
  state.enemyIntent = fresh.enemyIntent;
  state.stats = fresh.stats;
  state.over = fresh.over;
  state.rng = fresh.rng;
  startGame(state);
}
