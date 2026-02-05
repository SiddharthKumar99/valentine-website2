/* =====================================================
   Final Scroll Valentine (Divya)
   - Scroll-snap flow + prev/next floating controls
   - Progress dots (IntersectionObserver)
   - Envelope v2 open/close
   - Memories: gift -> fade reveal
   - Soundtrack: track cards + play/pause + progress + shuffle/stop
   - Question: NO random move + tease text, YES grows & unlock gifts
   - Gift section: locked until YES, modal gifts
===================================================== */

const story = document.getElementById("story");
const panels = Array.from(document.querySelectorAll(".panel"));
const dotsEl = document.getElementById("dots");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const player = document.getElementById("player");
const musicToggle = document.getElementById("musicToggle");

const envelopeBtn = document.getElementById("envelopeBtn");

const memoryGrid = document.getElementById("memoryGrid");

const tracksWrap = document.getElementById("tracks");
const shuffleBtn = document.getElementById("shuffleBtn");
const stopBtn = document.getElementById("stopBtn");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnArea = document.getElementById("btnArea");
const teaseBubble = document.getElementById("teaseBubble");
const questionGif = document.getElementById("questionGif");
const noPopup = document.getElementById("noPopup");
const noPopupGif = document.getElementById("noPopupGif");
const noPopupText = document.getElementById("noPopupText");

const giftRow = document.getElementById("giftRow");
const giftLockHint = document.getElementById("giftLockHint");
const backToTop = document.getElementById("backToTop");

const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const modalMusicBtn = document.getElementById("modalMusicBtn");
const modalGif = document.getElementById("modalGif");
const modalKicker = document.getElementById("modalKicker");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

const nowPlaying = document.getElementById("nowPlaying");
const npName = document.getElementById("npName");
const npPlayPause = document.getElementById("npPlayPause");
const npSeek = document.getElementById("npSeek");
const npTime = document.getElementById("npTime");
const npDur = document.getElementById("npDur");

const noOverlay = document.getElementById("noOverlay");
const noModalGif = document.getElementById("noModalGif");
const noModalTitle = document.getElementById("noModalTitle");
const noModalText = document.getElementById("noModalText");
const noModalOk = document.getElementById("noModalOk");
const noModalYes = document.getElementById("noModalYes");

/* Helpers add (format time) */
function fmtTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}


/* ---------- Helpers ---------- */
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function scrollToPanel(index) {
  const el = panels[clamp(index, 0, panels.length - 1)];
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Progress dots ---------- */
let activeIndex = 0;

function renderDots() {
  dotsEl.innerHTML = "";
  panels.forEach((_, i) => {
    const d = document.createElement("span");
    d.className = "dotp" + (i === activeIndex ? " active" : "");
    dotsEl.appendChild(d);
  });
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      activeIndex = panels.indexOf(e.target);
      renderDots();
    }
  });
}, { root: story, threshold: 0.6 });

panels.forEach(p => io.observe(p));
renderDots();

/* ---------- Prev/Next ---------- */
prevBtn.addEventListener("click", () => scrollToPanel(activeIndex - 1));
nextBtn.addEventListener("click", () => scrollToPanel(activeIndex + 1));

/* ---------- Music toggle ---------- */
let musicEnabled = false;

musicToggle.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  musicToggle.textContent = musicEnabled ? "⏸" : "♪";
  if (!musicEnabled) player.pause();
});

/* ---------- Buckets (for YES/NO mood) ---------- */
const buckets = {
  love: [
    "assets/AudioTracks/O_Soniye.m4a",
    "assets/AudioTracks/Sang_Rahiyo.webm",
    "assets/AudioTracks/tera ban jaaunga.m4a",
    "assets/AudioTracks/tum jo aaye.m4a",
    "assets/AudioTracks/perfect.mp3",
    "assets/AudioTracks/Finding_Her.webm",
  ],
  rejection: [
    "assets/AudioTracks/Aise_Kyun.webm",
    "assets/AudioTracks/DARKHAAST.webm",
    "assets/AudioTracks/Dooron_Dooron.mp4",
    "assets/AudioTracks/Shiddat_Title.webm",
  ]
};

function playTrack(url) {
  player.src = url;
  player.currentTime = 0;
  player.play().catch(() => { });
}

/* ---------- Secret envelope ---------- */
envelopeBtn.addEventListener("click", () => {
  envelopeBtn.classList.toggle("open");
});

/* ---------- Memories reveal ---------- */
if (memoryGrid) {
  memoryGrid.querySelectorAll(".memoryGift").forEach((btn) => {
    const reveal = btn.querySelector(".reveal");
    reveal.style.backgroundImage = `url('${btn.dataset.img}')`;

    btn.addEventListener("click", () => {
      btn.classList.toggle("revealed");
    });
  });
}

/* =====================================================
   OUR SOUNDTRACK
   Add more tracks here ✅
===================================================== */
const soundtrack = [
  // Optional: add cover image like cover: "./assets/TrackCovers/perfect.jpg"
  { name: "Darkhaast ❤️", file: "assets/AudioTracks/DARKHAAST.webm", cover: "assets/musicTrack Cover/darkhaast.png" },
  { name: "Dooron Dooron 💞", file: "assets/AudioTracks/Dooron_Dooron.mp4", cover: "assets/musicTrack Cover/DooronDooron.png" },
  { name: "Jo Tum Mere Ho 😊", file: "assets/AudioTracks/jo tum mere ho.mp3", cover: "assets/musicTrack Cover/joTumMereHo.png" },
  { name: "O Soniye 🥰", file: "assets/AudioTracks/O_Soniye.m4a", cover: "assets/musicTrack Cover/O-soniye.png" },
  { name: "Tera Ban Jaaunga 😉", file: "assets/AudioTracks/tera ban jaaunga.m4a", cover: "assets/musicTrack Cover/teraBanJaaunga.png" },
  { name: "Sang Rahiyo 😚", file: "assets/AudioTracks/Sang_Rahiyo.webm", cover: "assets/musicTrack Cover/sangRahiyo.png" },
  { name: "Finding Her ", file: "assets/AudioTracks/Finding_Her.webm", cover: "assets/musicTrack Cover/findingHer.png" },
  { name: "Perfect", file: "assets/AudioTracks/perfect.mp3", cover: "assets/musicTrack Cover/perfect.png" },
];

let currentProgress = null;

function buildTrackCards() {
  tracksWrap.innerHTML = "";

  soundtrack.forEach((t) => {
    const card = document.createElement("div");
    card.className = "trackCard";

    const left = document.createElement("div");
    left.className = "trackLeft";

    let icon;
    if (t.cover) {
      icon = document.createElement("div");
      icon.className = "trackCover";
      const im = document.createElement("img");
      im.src = t.cover;
      im.alt = t.name;
      icon.appendChild(im);
    } else {
      icon = document.createElement("div");
      icon.className = "trackIcon";
      icon.textContent = "♪";
    }

    const meta = document.createElement("div");
    meta.className = "trackMeta";

    const name = document.createElement("div");
    name.className = "trackName";
    name.textContent = t.name;

    const sub = document.createElement("div");
    sub.className = "trackSub";
    sub.textContent = "Tap play • cute vibe";

    const prog = document.createElement("div");
    prog.className = "progress";
    const bar = document.createElement("span");
    prog.appendChild(bar);

    meta.appendChild(name);
    meta.appendChild(sub);
    meta.appendChild(prog);

    left.appendChild(icon);
    left.appendChild(meta);

    const btn = document.createElement("button");
    btn.className = "btn btnGhost";
    btn.textContent = "Play";

    btn.addEventListener("click", () => {
      // pause same
      if (player.src.includes(t.file) && !player.paused) {
        player.pause();
        btn.textContent = "Play";
        currentProgress = null;
        return;
      }

      // reset all
      document.querySelectorAll(".trackCard .btn").forEach(b => b.textContent = "Play");

      // play selected
      playTrack(t.file);
      musicEnabled = true;
      musicToggle.textContent = "⏸";
      btn.textContent = "Pause";
      currentProgress = bar;


      // Now Playing UI
      if (nowPlaying) nowPlaying.hidden = false;
      if (npName) npName.textContent = t.name;
      if (npPlayPause) npPlayPause.textContent = "Pause";
    });

    card.appendChild(left);
    card.appendChild(btn);
    tracksWrap.appendChild(card);
  });
}

buildTrackCards();

let isSeeking = false;

if (npPlayPause) {
  npPlayPause.addEventListener("click", () => {
    if (!player.src) return;
    if (player.paused) {
      player.play().catch(() => { });
      npPlayPause.textContent = "Pause";
    } else {
      player.pause();
      npPlayPause.textContent = "Play";
    }
  });
}

if (npSeek) {
  npSeek.addEventListener("input", () => {
    if (!player.duration) return;
    isSeeking = true;
    player.currentTime = Number(npSeek.value);
    if (npTime) npTime.textContent = fmtTime(player.currentTime);
  });

  npSeek.addEventListener("change", () => {
    isSeeking = false;
  });
}

player.addEventListener("loadedmetadata", () => {
  if (!npSeek) return;
  npSeek.max = String(player.duration || 0);
  npSeek.value = String(player.currentTime || 0);
  if (npDur) npDur.textContent = fmtTime(player.duration);
});

player.addEventListener("timeupdate", () => {
  // existing progress bar update stays as-is
  if (!player.duration) return;

  if (!isSeeking && npSeek) {
    npSeek.value = String(player.currentTime);
  }
  if (npTime) npTime.textContent = fmtTime(player.currentTime);
  if (npDur) npDur.textContent = fmtTime(player.duration);
});


player.addEventListener("timeupdate", () => {
  if (!currentProgress || !player.duration) return;
  const pct = (player.currentTime / player.duration) * 100;
  currentProgress.style.width = `${pct}%`;
});

shuffleBtn.addEventListener("click", () => {
  const t = pickRandom(soundtrack);
  document.querySelectorAll(".trackCard .btn").forEach(b => b.textContent = "Play");
  playTrack(t.file);
  musicEnabled = true;
  musicToggle.textContent = "⏸";

  if (nowPlaying) nowPlaying.hidden = false;
  if (npName) npName.textContent = t.name;
  if (npPlayPause) npPlayPause.textContent = "Pause";
  // progress bar will attach when a card is pressed; we keep it simple here
});

stopBtn.addEventListener("click", () => {
  player.pause();
  player.currentTime = 0;
  document.querySelectorAll(".trackCard .btn").forEach(b => b.textContent = "Play");
  currentProgress = null;

  if (npPlayPause) npPlayPause.textContent = "Play";
  if (npSeek) npSeek.value = "0";
  if (npTime) npTime.textContent = "0:00";

});

/* =====================================================
   YES/NO DRAMA
===================================================== */
const teaseLines = [
  "Soch lo achhe se ❤️",
  "Are you sure? 😏",
  "NO thoda mushkil option hai 😜",
  "Ek aur chance? 🥺",
  "Divya… please? 😌",
  "YES wala button cute lag raha hai na? 😄"
];

const gifs = {
  yes: [
    "./assets/GifData/Yes/love1.gif",
    "./assets/GifData/Yes/love2.gif",
    "./assets/GifData/Yes/love3.gif",
    "./assets/GifData/Yes/lovecutie7.gif",
    "./assets/GifData/Yes/lovecutie9.gif"
  ],
  no: [
    "./assets/GifData/No/RejectNo.gif",
    "./assets/GifData/No/breakRej1.gif",
    "./assets/GifData/No/breakRej4.gif",
    "./assets/GifData/No/breakRej7.gif"
  ]
};

let teaseIndex = 0;
let yesScale = 1;
let unlocked = false;

function showTease(msg) {
  teaseBubble.textContent = msg;
  teaseBubble.classList.add("show");
  clearTimeout(showTease._t);
  showTease._t = setTimeout(() => teaseBubble.classList.remove("show"), 1100);
}


function showNoPopup(msg) {
  if (!noPopup) return;
  noPopupText.textContent = msg;
  if (noPopupGif) noPopupGif.src = pickRandom(gifs.no);

  noPopup.classList.add("show");
  noPopup.setAttribute("aria-hidden", "false");

  clearTimeout(showNoPopup._t);
  showNoPopup._t = setTimeout(() => {
    noPopup.classList.remove("show");
    noPopup.setAttribute("aria-hidden", "true");
  }, 1400);
}

// function moveNoRandom() {
//   const areaRect = btnArea.getBoundingClientRect();
//   const btnRect = noBtn.getBoundingClientRect();
//   const pad = 6;

//   const maxX = areaRect.width - btnRect.width - pad * 2;
//   const maxY = areaRect.height - btnRect.height - pad * 2;

//   const x = pad + Math.random() * Math.max(0, maxX);
//   const y = pad + Math.random() * Math.max(0, maxY);

//   noBtn.style.left = `${x}px`;
//   noBtn.style.top = `${y}px`;
//   noBtn.style.transform = "translateX(0)";

//   noBtn.animate(
//     [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
//     { duration: 260, easing: "ease-out" }
//   );
// }
function moveNoRandom() {
  const areaRect = btnArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 10;

  // Keep movement tighter (top-right region), so it doesn't fly too much
  const regionW = areaRect.width * 0.55;
  const regionH = areaRect.height * 0.45;

  const maxX = Math.max(pad, regionW - btnRect.width - pad);
  const maxY = Math.max(pad, regionH - btnRect.height - pad);

  const x = areaRect.width - regionW + (pad + Math.random() * (maxX - pad));
  const y = pad + Math.random() * (maxY - pad);

  noBtn.style.right = "auto";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  noBtn.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
    { duration: 240, easing: "ease-out" }
  );
}



// function makeYesBigger() {
//   yesScale = clamp(yesScale + 0.07, 1, 1.55);
//   yesBtn.style.setProperty("--ys", yesScale.toString());

//   // cute pop
//   yesBtn.animate(
//     [
//       { transform: `scale(${yesScale})` },
//       { transform: `scale(${Math.min(yesScale + 0.08, 1.65)})` },
//       { transform: `scale(${yesScale})` }
//     ],
//     { duration: 320, easing: "cubic-bezier(.2,.9,.2,1)" }
//   );

//   const glow = clamp(0.22 + (yesScale - 1) * 0.6, 0.22, 0.55);
//   yesBtn.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.45), 0 30px 80px rgba(255,61,127,${glow})`;
// }
function makeYesBigger() {
  yesScale = clamp(yesScale + 0.10, 1, 1.70);
  yesBtn.style.setProperty("--ys", yesScale.toString());

  yesBtn.animate(
    [
      { transform: `scale(${yesScale})` },
      { transform: `scale(${Math.min(yesScale + 0.10, 1.80)})` },
      { transform: `scale(${yesScale})` }
    ],
    { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)" }
  );
}



noBtn.addEventListener("click", () => {
  const msg = teaseLines[teaseIndex % teaseLines.length];
  showTease(msg);
  showNoPopup(msg);
  teaseIndex++;
  showNoModal(msg);


  makeYesBigger();
  moveNoRandom();
  questionGif.src = pickRandom(gifs.no);

  if (musicEnabled) playTrack(pickRandom(buckets.rejection));
});
function showNoModal(msg) {
  if (!noOverlay) return;

  if (noModalGif) noModalGif.src = pickRandom(gifs.no);
  if (noModalText) noModalText.textContent = msg;

  // eye-catch title rotate
  if (noModalTitle) {
    noModalTitle.textContent = pickRandom([
      "Areee… NO? 😭",
      "NO nahi chalega 😜",
      "Ek aur baar soch lo 🥺"
    ]);
  }

  noOverlay.classList.add("show");
  noOverlay.setAttribute("aria-hidden", "false");
}

function hideNoModal() {
  if (!noOverlay) return;
  noOverlay.classList.remove("show");
  noOverlay.setAttribute("aria-hidden", "true");
}

if (noModalOk) noModalOk.addEventListener("click", hideNoModal);
if (noOverlay) noOverlay.addEventListener("click", (e) => { if (e.target === noOverlay) hideNoModal(); });

if (noModalYes) {
  noModalYes.addEventListener("click", () => {
    hideNoModal();
    yesBtn.click(); // direct YES
  });
}


// Make NO harder to click on desktop: it dodges when cursor comes close
let lastDodge = 0;
function dodgeIfClose(clientX, clientY) {
  const now = performance.now();
  if (now - lastDodge < 240) return;

  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);

  if (dist < 90) {
    lastDodge = now;
    moveNoRandom();
  }
}

if (btnArea) {
  btnArea.addEventListener("mousemove", (e) => dodgeIfClose(e.clientX, e.clientY));
  noBtn.addEventListener("mouseenter", () => moveNoRandom());
}


/* ---------- Gifts lock/unlock ---------- */
function unlockGifts() {
  unlocked = true;
  giftRow.classList.remove("locked");
  giftLockHint.textContent = "Unlocked ✅";
  giftLockHint.style.color = "rgba(42,27,34,0.75)";
}

yesBtn.addEventListener("click", () => {
  questionGif.src = pickRandom(gifs.yes);

  musicEnabled = true;
  musicToggle.textContent = "⏸";
  playTrack(pickRandom(buckets.love));

  unlockGifts();

  setTimeout(() => {
    document.getElementById("p8").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 350);
});

/* ---------- Gift modal content ---------- */
const giftContent = {
  1: {
    title: "Gift 1",
    text: "A small promise: I’ll keep choosing you — softly, daily. ❤️",
    gif: "./assets/GifData/Yes/lovecutie2.gif"
  },
  2: {
    title: "Gift 2",
    text: "A cute reminder: you’re my peace. My favorite feeling. 🥺",
    gif: "./assets/GifData/Yes/lovecutie6.gif"
  },
  3: {
    title: "Gift 3",
    text: "A dramatic line: I don’t want perfect… I want YOU. 💝",
    gif: "./assets/GifData/Yes/lovecutie9.gif"
  }
};

document.querySelectorAll(".giftCardBig").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!unlocked) return;
    const id = btn.dataset.gift;
    const g = giftContent[id];

    modalKicker.textContent = "something for you";
    modalTitle.textContent = g.title;
    modalText.textContent = g.text;
    modalGif.src = g.gif;

    overlay.classList.add("show");
  });
});

closeBtn.addEventListener("click", () => overlay.classList.remove("show"));
overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("show"); });

modalMusicBtn.addEventListener("click", () => {
  musicEnabled = true;
  musicToggle.textContent = "⏸";
  playTrack(pickRandom(buckets.love));
});

/* ---------- Back to top ---------- */
backToTop.addEventListener("click", () => {
  document.getElementById("p1").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---------- NO default position reset on resize ---------- */

function resetNo() {
  noBtn.style.left = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.right = "26%";
  noBtn.style.top = "22px";
  noBtn.style.transform = "none";
}

window.addEventListener("load", resetNo);
window.addEventListener("resize", resetNo);
