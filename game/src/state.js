/* Ember Court — state.js
   State permainan + semua aturan: giliran, mana, tarik kartu,
   memainkan kartu, keunggulan elemen, Surge, block, dan burn. */

/* RNG deterministik (mulberry32) dari seed angka. */
function makeRng(seed) {
  var s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newFighter(name, isEnemy) {
  return {
    name: name, isEnemy: !!isEnemy,
    hp: EMBER.START_HP, maxHp: EMBER.START_HP,
    block: 0, burn: 0,
    mana: 0, maxMana: 0,
    deck: [], hand: [], discard: [],
    lastElement: null,
  };
}

function newGame(seed) {
  var rng = makeRng(seed);
  var state = {
    seed: seed, rng: rng,
    screen: 'title',
    turn: 0, round: 1,
    player: newFighter(EMBER.PLAYER_NAME, false),
    enemy: newFighter(EMBER.ENEMY_NAME, true),
    log: [],
    playedThisTurn: [],
    elementsThisTurn: [],
    enemyIntent: null,
    stats: { cardsPlayed: 0, damageDealt: 0, surges: 0, advantages: 0, turns: 0 },
    over: null,
    shake: 0,
    flash: null,
  };
  state.player.deck = buildDeck(rng);
  state.enemy.deck = buildDeck(rng);
  return state;
}

function addLog(state, text) {
  state.log.unshift(text);
  if (state.log.length > 14) state.log.length = 14;
}

function drawCards(state, who, n) {
  for (var i = 0; i < n; i++) {
    if (who.hand.length >= EMBER.MAX_HAND) return;
    if (who.deck.length === 0) {
      who.deck = who.discard.splice(0);
      /* Kocok ulang tumpukan buang. */
      for (var j = who.deck.length - 1; j > 0; j--) {
        var k = Math.floor(state.rng() * (j + 1));
        var tmp = who.deck[j]; who.deck[j] = who.deck[k]; who.deck[k] = tmp;
      }
      if (who.deck.length === 0) return;
    }
    who.hand.push(who.deck.pop());
  }
}

function startPlayerTurn(state) {
  var p = state.player;
  state.turn++;
  state.stats.turns = state.turn;
  p.maxMana = Math.min(EMBER.MAX_MANA, p.maxMana + 1);
  p.mana = p.maxMana;
  p.block = 0;
  state.playedThisTurn = [];
  state.elementsThisTurn = [];
  if (p.burn > 0) {
    applyDamage(state, p, p.burn, 'Bara membakar ' + p.name);
    p.burn = 0;
    if (state.over) return;
  }
  drawCards(state, p, 1);
  state.enemyIntent = planEnemyIntent(state);
  addLog(state, '— Giliran ' + state.turn + ': mana ' + p.mana + '/' + p.maxMana + ' —');
}

function startGame(state) {
  state.screen = 'play';
  state.player.hand = [];
  state.enemy.hand = [];
  drawCards(state, state.player, EMBER.START_HAND);
  drawCards(state, state.enemy, EMBER.START_HAND);
  state.enemyIntent = planEnemyIntent(state);
  addLog(state, 'Duel dimulai! ' + EMBER.ENEMY_NAME + ' menantimu.');
  addLog(state, 'Mainkan kartu, lalu tekan Akhiri Giliran.');
  startPlayerTurn(state);
}

function applyDamage(state, target, amount, why) {
  var blocked = Math.min(target.block, amount);
  target.block -= blocked;
  var real = amount - blocked;
  target.hp = Math.max(0, target.hp - real);
  if (real > 0) {
    state.shake = 10;
    state.flash = target.isEnemy ? 'hit-enemy' : 'hit-player';
  }
  addLog(state, why + ': ' + real + ' damage' + (blocked > 0 ? ' (' + blocked + ' ditahan perisai)' : '') + '.');
  checkOver(state);
  return real;
}

function playCard(state, handIndex) {
  var p = state.player;
  var card = p.hand[handIndex];
  if (!card || state.screen !== 'play') return false;
  if (p.mana < card.cost) {
    addLog(state, 'Mana tidak cukup untuk ' + card.name + ' (butuh ' + card.cost + ').');
    return false;
  }
  p.mana -= card.cost;
  p.hand.splice(handIndex, 1);
  p.discard.push(card);
  state.playedThisTurn.push(card);
  state.stats.cardsPlayed++;

  var foe = state.enemy;
  var advantage = foe.lastElement && elementBeats(card.element, foe.lastElement);
  var surge = state.elementsThisTurn.indexOf(card.element) !== -1;
  var bonus = 0;
  if (advantage) { bonus += EMBER.ADVANTAGE_BONUS; state.stats.advantages++; }
  if (surge) { bonus += EMBER.SURGE_BONUS; state.stats.surges++; }

  var el = ELEMENTS[card.element];
  if (card.type === 'attack') {
    var dmg = card.value + bonus;
    var dealt = applyDamage(state, foe, dmg, card.name + ' menghantam');
    state.stats.damageDealt += dealt;
    if (card.value >= 14) { foe.burn = (foe.burn || 0) + 2; addLog(state, foe.name + ' terbakar! (burn 2)'); }
    if (advantage) addLog(state, 'Keunggulan elemen! ' + el.label + ' mengalahkan ' + ELEMENTS[foe.lastElement].label + ' (+' + EMBER.ADVANTAGE_BONUS + ').');
  } else if (card.type === 'shield') {
    var blk = card.value + bonus;
    p.block += blk;
    addLog(state, card.name + ': perisai +' + blk + '.');
  } else {
    if (card.id === 'c11') {
      drawCards(state, p, 2);
      addLog(state, card.name + ': tarik 2 kartu.');
    } else {
      var healed = Math.min(card.value + bonus, p.maxHp - p.hp);
      p.hp += healed;
      addLog(state, card.name + ': pulih ' + healed + ' nyawa.');
    }
  }
  if (surge) addLog(state, 'SURGE! Dua kartu ' + el.label + ' dalam satu giliran (+' + EMBER.SURGE_BONUS + ').');
  if (state.elementsThisTurn.indexOf(card.element) === -1) state.elementsThisTurn.push(card.element);
  p.lastElement = card.element;
  return true;
}

function checkOver(state) {
  if (state.over) return;
  if (state.enemy.hp <= 0) {
    state.over = 'win';
    state.screen = 'win';
    addLog(state, 'KEMENANGAN! ' + EMBER.ENEMY_NAME + ' tumbang.');
  } else if (state.player.hp <= 0) {
    state.over = 'loss';
    state.screen = 'loss';
    addLog(state, 'Kekalahan... ' + EMBER.ENEMY_NAME + ' menang kali ini.');
  }
}

function endPlayerTurn(state) {
  if (state.screen !== 'play' || state.over) return;
  addLog(state, 'Giliranmu berakhir.');
  runEnemyTurn(state);
  if (state.over) return;
  startPlayerTurn(state);
}
