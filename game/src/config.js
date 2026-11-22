/* Ember Court — config.js
   Data kartu, konstanta aturan, dan roda elemen.
   Satu-satunya tempat angka-angka keseimbangan tinggal. */

var EMBER = {
  GAME_NAME: 'EMBER COURT',
  GAME_TAGLINE: 'Duel kartu para roh bara',
  START_HP: 30,
  MAX_HAND: 7,
  MAX_MANA: 10,
  START_HAND: 4,
  SURGE_BONUS: 2,
  ADVANTAGE_BONUS: 3,
  ENEMY_NAME: 'Ratu Bara Sylvania',
  PLAYER_NAME: 'Penjaga Ember',
};

/* Tiga elemen dan warnanya. Warna + bentuk membedakan kartu,
   bukan hanya teks: merah = Ember, biru = Tide, hijau = Thorn. */
var ELEMENTS = {
  ember: { key: 'ember', label: 'Ember', glyph: '▲', color: '#e2482a', dark: '#8f1d0c' },
  tide:  { key: 'tide',  label: 'Tide',  glyph: '●', color: '#2a7de2', dark: '#123f7d' },
  thorn: { key: 'thorn', label: 'Thorn', glyph: '◆', color: '#2fae5f', dark: '#145c2e' },
};

/* Roda keunggulan: kunci mengalahkan nilai.
   Ember > Thorn, Thorn > Tide, Tide > Ember. */
var BEATS = { ember: 'thorn', thorn: 'tide', tide: 'ember' };

function elementBeats(a, b) {
  return BEATS[a] === b;
}

/* Jenis kartu: serang memberi damage, perisai memberi block,
   ember memberi efek khusus (heal, tarik kartu, atau bakar). */
var CARD_TYPES = {
  attack: { label: 'Serang' },
  shield: { label: 'Perisai' },
  ember:  { label: 'Ember' },
};

/* Kolam kartu. Setiap kartu: id, nama, elemen, biaya mana,
   jenis, nilai, dan teks efek yang tampil di kartu.
   Deck pemain dibangun dari kolam ini (2 salinan tiap kartu). */
var CARD_POOL = [
  { id: 'c01', name: 'Pukulan Bara',   element: 'ember', cost: 1, type: 'attack', value: 4, text: 'Damage 4.' },
  { id: 'c02', name: 'Lidah Api',      element: 'ember', cost: 2, type: 'attack', value: 7, text: 'Damage 7.' },
  { id: 'c03', name: 'Hujan Percik',   element: 'ember', cost: 3, type: 'attack', value: 11, text: 'Damage 11.' },
  { id: 'c04', name: 'Dinding Abu',    element: 'ember', cost: 1, type: 'shield', value: 5, text: 'Block 5.' },
  { id: 'c05', name: 'Nyala Dalam',    element: 'ember', cost: 2, type: 'ember',  value: 5, text: 'Pulih 5 nyawa.' },
  { id: 'c06', name: 'Letusan Mahkota',element: 'ember', cost: 4, type: 'attack', value: 14, text: 'Damage 14. Bakar 2.' },
  { id: 'c07', name: 'Tombak Ombak',   element: 'tide',  cost: 1, type: 'attack', value: 4, text: 'Damage 4.' },
  { id: 'c08', name: 'Arus Deras',     element: 'tide',  cost: 2, type: 'attack', value: 7, text: 'Damage 7.' },
  { id: 'c09', name: 'Gelombang Pasang',element: 'tide', cost: 3, type: 'attack', value: 11, text: 'Damage 11.' },
  { id: 'c10', name: 'Tirai Kabut',    element: 'tide',  cost: 1, type: 'shield', value: 5, text: 'Block 5.' },
  { id: 'c11', name: 'Mata Air',       element: 'tide',  cost: 2, type: 'ember',  value: 2, text: 'Tarik 2 kartu.' },
  { id: 'c12', name: 'Badai Samudra',  element: 'tide',  cost: 4, type: 'attack', value: 14, text: 'Damage 14. Bakar 2.' },
  { id: 'c13', name: 'Duri Merambat',  element: 'thorn', cost: 1, type: 'attack', value: 4, text: 'Damage 4.' },
  { id: 'c14', name: 'Akar Menjalar',  element: 'thorn', cost: 2, type: 'attack', value: 7, text: 'Damage 7.' },
  { id: 'c15', name: 'Hutan Berduri',  element: 'thorn', cost: 3, type: 'attack', value: 11, text: 'Damage 11.' },
  { id: 'c16', name: 'Kulit Kayu',     element: 'thorn', cost: 1, type: 'shield', value: 5, text: 'Block 5.' },
  { id: 'c17', name: 'Bunga Mekar',    element: 'thorn', cost: 2, type: 'ember',  value: 5, text: 'Pulih 5 nyawa.' },
  { id: 'c18', name: 'Rimba Mengamuk', element: 'thorn', cost: 4, type: 'attack', value: 14, text: 'Damage 14. Bakar 2.' },
];

/* Kartu-kartu berat biaya 0: trik murah yang mengisi giliran awal. */
var TRICK_CARDS = [
  { id: 't01', name: 'Percik Kecil', element: 'ember', cost: 0, type: 'attack', value: 2, text: 'Damage 2.' },
  { id: 't02', name: 'Tetes Embun',  element: 'tide',  cost: 0, type: 'shield', value: 3, text: 'Block 3.' },
  { id: 't03', name: 'Tunas Muda',   element: 'thorn', cost: 0, type: 'ember',  value: 2, text: 'Pulih 2 nyawa.' },
];

function buildDeck(rng) {
  var deck = [];
  var i, j;
  for (i = 0; i < CARD_POOL.length; i++) {
    deck.push(CARD_POOL[i]);
    deck.push(CARD_POOL[i]);
  }
  for (j = 0; j < TRICK_CARDS.length; j++) deck.push(TRICK_CARDS[j]);
  /* Acak Fisher-Yates dengan RNG ber-seed agar deterministik. */
  for (i = deck.length - 1; i > 0; i--) {
    var k = Math.floor(rng() * (i + 1));
    var tmp = deck[i]; deck[i] = deck[k]; deck[k] = tmp;
  }
  return deck;
}

function cardById(id) {
  var all = CARD_POOL.concat(TRICK_CARDS);
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}
