# Ember Court

**Ember Court** adalah duel kartu turn-based orisinal bertema roh bara.
Kamu adalah **Penjaga Ember**, menantang **Ratu Bara Sylvania** dalam
duel kartu sampai salah satu nyawanya habis.

## Cara bermain

- Kedua pihak mulai dengan **30 nyawa**. Tiap giliran manamu naik 1
  (maksimal 10) dan kamu menarik 1 kartu. Tangan maksimal 7 kartu.
- Kartu berbiaya mana: **Serang** memberi damage, **Perisai** memberi
  block yang menahan damage, **Ember** memulihkan nyawa atau menarik kartu.
- Tiga elemen — **Ember** (merah ▲), **Tide** (biru ●), **Thorn**
  (hijau ◆) — dengan roda keunggulan: Ember mengalahkan Thorn, Thorn
  mengalahkan Tide, Tide mengalahkan Ember. Kartu yang unggul atas
  kartu terakhir lawan mendapat **+3**.
- Memainkan dua kartu elemen sama dalam satu giliran memicu
  **SURGE (+2)**.
- Lawan punya pola yang bisa dibaca: ia menumpuk perisai sebelum
  serangan besar, meramu ember saat nyawanya rendah, dan membalas
  elemen terakhir yang kamu mainkan. Niatnya selalu ditampilkan
  sebelum giliranmu berakhir — siapkan perisai atau serang duluan.

## Kontrol

- **Klik** kartu untuk memainkannya (atau tekan **1–7**).
- **Spasi / Enter** mengakhiri giliran.
- **Enter** memulai permainan dari layar judul dan layar akhir.

## Cara menjalankan

Game ini file statis tanpa build step dan tanpa koneksi internet:

```sh
cd game
python3 -m http.server 8080
```

Lalu buka http://localhost:8080/index.html di desktop Chrome.

Untuk screenshot deterministik, tambahkan query:
`?shot=start|play|win|loss&seed=1`.

## Struktur kode

- `game/index.html` — halaman dan urutan pemuatan skrip
- `game/style.css` — semua tampilan (meja, kartu, judul, layar akhir)
- `game/src/config.js` — data kartu dan konstanta aturan
- `game/src/state.js` — state dan aturan permainan
- `game/src/ai.js` — otak lawan dan niatnya
- `game/src/render.js` — menggambar DOM dari state
- `game/src/input.js` — mouse dan keyboard
- `game/src/shots.js` — state deterministik untuk screenshot
- `game/src/main.js` — boot

## make.fun

[![make.fun competition](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![make.fun rank](https://make.fun/badge/best-card-game-20261122-1826/jontumpil/makefun-best-card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![make.fun reward](https://make.fun/badge/best-card-game-20261122-1826/jontumpil/makefun-best-card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
