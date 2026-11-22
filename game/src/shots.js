/* Ember Court — shots.js
   State deterministik untuk screenshot: membaca query URL
   ?shot=start|play|win|loss&seed=N dan menyiapkan tampilan
   yang sesuai. Tanpa query, game mulai normal dari judul. */

function readQuery() {
  var q = {};
  var raw = window.location.search.replace(/^\?/, '');
  if (!raw) return q;
  var parts = raw.split('&');
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].split('=');
    if (kv.length === 2) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
  }
  return q;
}

function seedFromQuery(q) {
  var s = parseInt(q.seed || '1', 10);
  return isNaN(s) ? 1 : s;
}

/* Siapkan satu tangan contoh yang fotogenik: campuran elemen,
   biaya, dan jenis, supaya kartu terbaca di screenshot. */
function sampleHand(state, owner) {
  var ids = ['c02', 'c03', 'c10', 'c05', 'c14', 'c08', 't01'];
  var hand = [];
  for (var i = 0; i < ids.length; i++) {
    var c = cardById(ids[i]);
    if (c) hand.push(c);
  }
  owner.hand = hand;
}

function applyShot(state, shot) {
  if (shot === 'start') {
    state.screen = 'title';
    return;
  }
  if (shot === 'play') {
    startGame(state);
    /* Atur ke tengah permainan: nyawa berkurang, mana penuh. */
    state.player.hp = 22; state.player.block = 5;
    state.player.mana = 6; state.player.maxMana = 6;
    state.enemy.hp = 18; state.enemy.block = 3;
    state.turn = 6;
    sampleHand(state, state.player);
    state.enemy.hand = [cardById('c01'), cardById('c07'), cardById('c13'), cardById('c10'), cardById('c16')];
    state.enemyIntent = { kind: 'big_attack', power: 12, note: 'Serangan besar setelah menumpuk perisai!' };
    state.log = [
      'Ratu Bara Sylvania: Serangan Besar.',
      'Hujan Percik menghantam: 11 damage.',
      'Keunggulan elemen! Tide mengalahkan Ember (+3).',
      'SURGE! Dua kartu Ember dalam satu giliran (+2).',
      'Dinding Abu: perisai +5.',
      '— Giliran 6: mana 6/6 —',
    ];
    state.screen = 'play';
    return;
  }
  if (shot === 'win') {
    startGame(state);
    state.enemy.hp = 0;
    state.player.hp = 12;
    state.stats = { cardsPlayed: 23, damageDealt: 47, surges: 4, advantages: 6, turns: 9 };
    state.over = 'win';
    state.screen = 'win';
    return;
  }
  if (shot === 'loss') {
    startGame(state);
    state.player.hp = 0;
    state.enemy.hp = 9;
    state.stats = { cardsPlayed: 19, damageDealt: 31, surges: 2, advantages: 3, turns: 8 };
    state.over = 'loss';
    state.screen = 'loss';
    return;
  }
}

/* Shot yang dikenali: start (judul), play (meja), win, loss.
   Nilai lain diabaikan — game berjalan normal dari judul. */
var SHOT_NAMES = ['start', 'play', 'win', 'loss'];
