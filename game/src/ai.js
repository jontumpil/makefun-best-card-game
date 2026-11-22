/* Ember Court — ai.js
   Otak lawan: pola yang bisa dibaca dan dilawan.
   Niat giliran depan SELALU ditampilkan ke pemain, jadi
   pemain bisa menyiapkan perisai atau menyerang lebih dulu. */

var INTENT_LABELS = {
  attack: 'Menyerang',
  big_attack: 'Serangan Besar',
  shield: 'Menumpuk Perisai',
  ember: 'Meramu Ember',
};

/* Rencanakan niat lawan untuk giliran depan.
   Pola: setelah dua giliran menyerang, ia menumpuk perisai;
   bila nyawanya rendah ia meramu ember (pulih); bila pemain
   baru saja memainkan kartu, ia membalas dengan elemen yang
   mengalahkan elemen terakhir pemain. */
function planEnemyIntent(state) {
  var e = state.enemy;
  var p = state.player;
  var turn = state.turn + 1;
  if (e.hp <= 10) return { kind: 'ember', power: 6, note: 'Ia meramu ember untuk pulih.' };
  if (turn % 3 === 0) return { kind: 'shield', power: 8, note: 'Ia menumpuk perisai sebelum menyerang besar.' };
  if (turn % 3 === 1 && state.enemyIntent && state.enemyIntent.kind === 'shield') {
    return { kind: 'big_attack', power: 12, note: 'Serangan besar setelah menumpuk perisai!' };
  }
  var base = 4 + Math.min(6, Math.floor(turn / 2));
  if (p.lastElement) {
    var counter = counterElement(p.lastElement);
    return { kind: 'attack', power: base, element: counter, note: 'Ia membalas dengan ' + ELEMENTS[counter].label + ' (mengalahkan ' + ELEMENTS[p.lastElement].label + ').' };
  }
  return { kind: 'attack', power: base, element: null, note: 'Ia menyerang langsung.' };
}

/* Elemen yang mengalahkan elemen yang diberikan. */
function counterElement(element) {
  var keys = Object.keys(BEATS);
  for (var i = 0; i < keys.length; i++) {
    if (BEATS[keys[i]] === element) return keys[i];
  }
  return 'ember';
}

/* Jalankan giliran lawan: tarik kartu, lalu lakukan niatnya.
   Lawan juga memainkan satu kartu dari tangannya bila ada
   yang cocok dengan niatnya, supaya tangannya terlihat hidup. */
function runEnemyTurn(state) {
  var e = state.enemy;
  var p = state.player;
  e.maxMana = Math.min(EMBER.MAX_MANA, e.maxMana + 1);
  e.mana = e.maxMana;
  e.block = 0;
  if (e.burn > 0) {
    applyDamage(state, e, e.burn, 'Bara membakar ' + e.name);
    e.burn = 0;
    if (state.over) return;
  }
  drawCards(state, e, 1);
  var intent = state.enemyIntent || planEnemyIntent(state);
  addLog(state, e.name + ': ' + INTENT_LABELS[intent.kind] + '.');

  /* Mainkan satu kartu dari tangan yang sejalan dengan niat. */
  var played = null;
  for (var i = 0; i < e.hand.length; i++) {
    var c = e.hand[i];
    var want = (intent.kind === 'shield' && c.type === 'shield') ||
               (intent.kind === 'ember' && c.type === 'ember') ||
               ((intent.kind === 'attack' || intent.kind === 'big_attack') && c.type === 'attack');
    if (want && c.cost <= e.mana) { played = c; e.hand.splice(i, 1); e.discard.push(c); e.mana -= c.cost; break; }
  }
  if (played) {
    e.lastElement = played.element;
    if (played.type === 'attack') {
      var adv = p.lastElement && elementBeats(played.element, p.lastElement);
      var dmg = played.value + (adv ? EMBER.ADVANTAGE_BONUS : 0);
      applyDamage(state, p, dmg, e.name + ' memainkan ' + played.name);
      if (adv) addLog(state, 'Kartu lawan unggul elemen (+' + EMBER.ADVANTAGE_BONUS + ').');
    } else if (played.type === 'shield') {
      e.block += played.value;
      addLog(state, e.name + ' mendapat perisai +' + played.value + '.');
    } else if (played.id === 'c11') {
      drawCards(state, e, 2);
      addLog(state, e.name + ' menarik 2 kartu.');
    } else {
      e.hp = Math.min(e.maxHp, e.hp + played.value);
      addLog(state, e.name + ' memulihkan ' + played.value + ' nyawa.');
    }
    if (state.over) return;
  }

  /* Niat utama: serangan / perisai / ramuan. Bila lawan sudah
     memainkan kartu, kartu itu ADALAH aksinya — niat tidak
     menumpuk di atasnya, supaya giliran lawan tidak menghantam
     dua kali dalam satu giliran. */
  if (played) {
    if (state.over) return;
    state.enemyIntent = planEnemyIntent(state);
    return;
  }
  if (intent.kind === 'attack' || intent.kind === 'big_attack') {
    applyDamage(state, p, intent.power, e.name + ' menyerang');
  } else if (intent.kind === 'shield') {
    e.block += intent.power;
    addLog(state, e.name + ' menumpuk perisai +' + intent.power + '.');
  } else {
    var healed = Math.min(intent.power, e.maxHp - e.hp);
    e.hp += healed;
    addLog(state, e.name + ' memulihkan ' + healed + ' nyawa lewat ramuan ember.');
  }
  if (state.over) return;
  state.enemyIntent = planEnemyIntent(state);
}
