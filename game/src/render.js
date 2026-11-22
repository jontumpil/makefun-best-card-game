/* Ember Court — render.js
   Menggambar seluruh tampilan dari state: layar judul, meja,
   tangan pemain dan lawan, log, niat lawan, layar akhir. */

function el(tag, cls, text) {
  var node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function cardElement(card, opts) {
  opts = opts || {};
  var e = ELEMENTS[card.element];
  var node = el('div', 'card el-' + card.element + (opts.faceDown ? ' face-down' : ''));
  if (opts.faceDown) {
    node.appendChild(el('div', 'card-back', '◆'));
    node.appendChild(el('div', 'card-back-label', 'EMBER COURT'));
    return node;
  }
  var cost = el('div', 'card-cost', String(card.cost));
  cost.title = 'Biaya mana';
  node.appendChild(cost);
  var glyph = el('div', 'card-glyph', e.glyph);
  glyph.style.color = e.color;
  node.appendChild(glyph);
  node.appendChild(el('div', 'card-name', card.name));
  node.appendChild(el('div', 'card-element', e.label + ' · ' + CARD_TYPES[card.type].label));
  node.appendChild(el('div', 'card-value', card.type === 'attack' ? '⚔ ' + card.value : (card.type === 'shield' ? '🛡 ' + card.value : '✦ ' + card.value)));
  node.appendChild(el('div', 'card-text', card.text));
  if (opts.playable === false) node.classList.add('unplayable');
  if (opts.index !== undefined) node.dataset.index = String(opts.index);
  return node;
}

function fighterPanel(who, isPlayer) {
  var wrap = el('div', 'fighter' + (isPlayer ? ' player' : ' enemy'));
  var nameRow = el('div', 'fighter-name', who.name);
  wrap.appendChild(nameRow);
  var hpRow = el('div', 'fighter-hp');
  var heart = el('span', 'hp-heart', '♥');
  var hpNum = el('span', 'hp-num', String(who.hp));
  var hpMax = el('span', 'hp-max', ' / ' + who.maxHp);
  hpRow.appendChild(heart);
  hpRow.appendChild(hpNum);
  hpRow.appendChild(hpMax);
  if (who.block > 0) hpRow.appendChild(el('span', 'hp-block', '🛡 ' + who.block));
  if (who.burn > 0) hpRow.appendChild(el('span', 'hp-burn', '🔥 ' + who.burn));
  wrap.appendChild(hpRow);
  var bar = el('div', 'hp-bar');
  var fill = el('div', 'hp-fill');
  fill.style.width = Math.max(0, Math.round(100 * who.hp / who.maxHp)) + '%';
  bar.appendChild(fill);
  wrap.appendChild(bar);
  return wrap;
}

function render(state) {
  var root = document.getElementById('app');
  root.innerHTML = '';
  root.className = 'screen-' + state.screen;
  if (state.shake > 0) {
    root.classList.add('shake');
    state.shake = 0;
  }
  if (state.screen === 'title') { renderTitle(state, root); return; }
  if (state.screen === 'win' || state.screen === 'loss') { renderEnd(state, root); return; }
  renderTable(state, root);
}

function renderTitle(state, root) {
  var box = el('div', 'title-box');
  box.appendChild(el('div', 'title-kicker', '◆ ● ▲  DUEL KARTU  ▲ ● ◆'));
  box.appendChild(el('h1', 'title-name', EMBER.GAME_NAME));
  box.appendChild(el('div', 'title-tag', EMBER.GAME_TAGLINE));
  var how = el('div', 'title-how');
  how.innerHTML =
    '<p><b>Cara main:</b> kalian berdua mulai dengan <b>30 nyawa</b>. Tiap giliran manamu naik 1 (maks 10) dan kamu menarik 1 kartu.</p>' +
    '<p>Mainkan kartu dengan mana: <b>Serang</b> memberi damage, <b>Perisai</b> menahan damage, <b>Ember</b> memulihkan atau menarik kartu.</p>' +
    '<p><span class="dot ember-dot">▲</span> Ember mengalahkan Thorn · <span class="dot thorn-dot">◆</span> Thorn mengalahkan Tide · <span class="dot tide-dot">●</span> Tide mengalahkan Ember — kartu yang unggul atas kartu terakhir lawan mendapat <b>+3</b>.</p>' +
    '<p>Dua kartu elemen sama dalam satu giliran memicu <b>SURGE +2</b>. Perhatikan niat lawan — ia selalu jujur tentang rencananya.</p>';
  box.appendChild(how);
  var play = el('button', 'btn btn-big', '▶  MAIN');
  play.id = 'btn-play';
  box.appendChild(play);
  box.appendChild(el('div', 'title-foot', 'Klik kartu untuk memainkannya · Tombol 1–7 memilih kartu · Spasi mengakhiri giliran'));
  root.appendChild(box);
}

function renderTable(state, root) {
  var table = el('div', 'table');

  /* Baris lawan: panel nyawa + tangan tertutup + niat. */
  var foeRow = el('div', 'foe-row');
  foeRow.appendChild(fighterPanel(state.enemy, false));
  var foeHand = el('div', 'foe-hand');
  for (var i = 0; i < state.enemy.hand.length; i++) foeHand.appendChild(cardElement(state.enemy.hand[i], { faceDown: true }));
  foeRow.appendChild(foeHand);
  var intent = el('div', 'intent');
  if (state.enemyIntent) {
    intent.appendChild(el('div', 'intent-label', 'NIAT LAWAN'));
    intent.appendChild(el('div', 'intent-kind', INTENT_LABELS[state.enemyIntent.kind] + (state.enemyIntent.power ? '  ' + state.enemyIntent.power : '')));
    intent.appendChild(el('div', 'intent-note', state.enemyIntent.note || ''));
  }
  foeRow.appendChild(intent);
  table.appendChild(foeRow);

  /* Tengah: roda elemen + log + mana + tombol giliran. */
  var mid = el('div', 'mid-row');
  var wheel = el('div', 'wheel');
  wheel.innerHTML = '<div class="wheel-title">RODA ELEMEN</div><div class="wheel-line"><span class="dot ember-dot">▲</span> Ember &gt; Thorn</div><div class="wheel-line"><span class="dot thorn-dot">◆</span> Thorn &gt; Tide</div><div class="wheel-line"><span class="dot tide-dot">●</span> Tide &gt; Ember</div><div class="wheel-hint">Unggul = +3 · Surge = +2</div>';
  mid.appendChild(wheel);
  var logBox = el('div', 'log-box');
  logBox.appendChild(el('div', 'log-title', 'LOG PERTARUNGAN'));
  var logList = el('div', 'log-list');
  for (var j = 0; j < state.log.length; j++) logList.appendChild(el('div', 'log-line', state.log[j]));
  logBox.appendChild(logList);
  mid.appendChild(logBox);
  var side = el('div', 'side-col');
  var mana = el('div', 'mana-box');
  mana.appendChild(el('div', 'mana-label', 'MANA'));
  mana.appendChild(el('div', 'mana-num', state.player.mana + ' / ' + state.player.maxMana));
  var gems = el('div', 'mana-gems');
  for (var g = 0; g < EMBER.MAX_MANA; g++) gems.appendChild(el('span', 'gem' + (g < state.player.mana ? ' on' : ''), '◆'));
  mana.appendChild(gems);
  side.appendChild(mana);
  side.appendChild(el('div', 'turn-box', 'Giliran ' + state.turn + ' · Deck ' + state.player.deck.length + ' · Buang ' + state.player.discard.length));
  var endBtn = el('button', 'btn btn-end', 'Akhiri Giliran ⏎');
  endBtn.id = 'btn-end-turn';
  side.appendChild(endBtn);
  mid.appendChild(side);
  table.appendChild(mid);

  /* Baris pemain: panel nyawa + tangan terbuka. */
  var meRow = el('div', 'me-row');
  meRow.appendChild(fighterPanel(state.player, true));
  var myHand = el('div', 'my-hand');
  for (var h = 0; h < state.player.hand.length; h++) {
    myHand.appendChild(cardElement(state.player.hand[h], { index: h, playable: state.player.hand[h].cost <= state.player.mana }));
  }
  meRow.appendChild(myHand);
  table.appendChild(meRow);
  root.appendChild(table);
}

function renderEnd(state, root) {
  var won = state.screen === 'win';
  var box = el('div', 'end-box' + (won ? ' won' : ' lost'));
  box.appendChild(el('div', 'end-kicker', won ? '🔥 🔥 🔥' : '💧 💧 💧'));
  box.appendChild(el('h1', 'end-title', won ? 'VICTORY!' : 'DEFEAT'));
  box.appendChild(el('div', 'end-sub', won ? 'Mahkota Ember menjadi milikmu. ' + EMBER.ENEMY_NAME + ' tumbang!' : EMBER.ENEMY_NAME + ' memenangkan duel kali ini. Coba lagi!'));
  var stats = el('div', 'end-stats');
  stats.innerHTML =
    '<div>Kartu dimainkan: <b>' + state.stats.cardsPlayed + '</b></div>' +
    '<div>Damage diberikan: <b>' + state.stats.damageDealt + '</b></div>' +
    '<div>Surge dipicu: <b>' + state.stats.surges + '</b></div>' +
    '<div>Keunggulan elemen: <b>' + state.stats.advantages + '</b></div>' +
    '<div>Giliran dimainkan: <b>' + state.stats.turns + '</b></div>' +
    '<div>Nyawamu tersisa: <b>' + state.player.hp + ' / ' + state.player.maxHp + '</b></div>';
  box.appendChild(stats);
  var again = el('button', 'btn btn-big', won ? '↻  MAIN LAGI' : '↻  COBA LAGI');
  again.id = 'btn-again';
  box.appendChild(again);
  root.appendChild(box);
}
