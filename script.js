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
const giftUnlockTitle = document.getElementById("giftUnlockTitle");
const giftLockHint = document.getElementById("giftLockHint");
const backToTop = document.getElementById("backToTop");

const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
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

/* background music */
// ===== Background audio (starts after letter continue) =====
let bgAudio;

function startBackgroundAudio() {
  if (bgAudio) return; // already started

  bgAudio = new Audio("./assets/AudioTracks/mainBG.webm");
  bgAudio.preload = "auto";
  bgAudio.loop = true;          // optional
  bgAudio.volume = 0.10;        // optional (0 to 1)

  // Seek safely after metadata is loaded
  const startAt = 20; // seconds
  bgAudio.addEventListener("loadedmetadata", () => {
    try {
      // if duration is shorter, start from 0
      bgAudio.currentTime = Math.min(startAt, (bgAudio.duration || startAt) - 0.2);
    } catch (e) {
      // ignore (some browsers block seek until canplay)
    }
  });

  bgAudio.addEventListener("canplay", () => {
    // try setting again (more reliable on some browsers)
    try { bgAudio.currentTime = 20; } catch (e) { }
  }, { once: true });

  const p = bgAudio.play();
  if (p && typeof p.catch === "function") {
    p.catch(() => {
      // If browser blocks it (rare here), next click anywhere can start it
      const resume = () => {
        bgAudio.play().catch(() => { });
        document.removeEventListener("click", resume);
        document.removeEventListener("touchstart", resume);
      };
      document.addEventListener("click", resume, { once: true });
      document.addEventListener("touchstart", resume, { once: true });
    });
  }
}


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
  if (!musicEnabled) { player.pause(); pauseBG(); }
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

function pauseBG() {
  if (bgAudio && !bgAudio.paused) bgAudio.pause();
}

player.addEventListener("play", pauseBG);

function playTrack(url, opts = {}) {
  const startAt = Number(opts.startAt || 0);

  // Rule: only ONE audio at a time (stop BG + stop current player track)
  pauseBG();
  player.pause();
  try { player.currentTime = 0; } catch (e) { }

  player.src = url;

  const seekAndPlay = () => {
    try { player.currentTime = startAt; } catch (e) { }
    player.play().catch(() => { });
  };

  if (player.readyState >= 1) seekAndPlay();
  else player.addEventListener("loadedmetadata", seekAndPlay, { once: true });
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
// function moveNoRandom() {
//   const areaRect = btnArea.getBoundingClientRect();
//   const btnRect = noBtn.getBoundingClientRect();

//   const pad = 10;

//   // Keep movement tighter (top-right region), so it doesn't fly too much
//   const regionW = areaRect.width * 0.55;
//   const regionH = areaRect.height * 0.45;

//   const maxX = Math.max(pad, regionW - btnRect.width - pad);
//   const maxY = Math.max(pad, regionH - btnRect.height - pad);

//   const x = areaRect.width - regionW + (pad + Math.random() * (maxX - pad));
//   const y = pad + Math.random() * (maxY - pad);

//   noBtn.style.right = "auto";
//   noBtn.style.left = `${x}px`;
//   noBtn.style.top = `${y}px`;

//   noBtn.animate(
//     [{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
//     { duration: 240, easing: "ease-out" }
//   );
// }



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



// noBtn.addEventListener("click", () => {
//   const msg = teaseLines[teaseIndex % teaseLines.length];
//   showTease(msg);
//   showNoPopup(msg);
//   teaseIndex++;
//   showNoModal(msg);


//   makeYesBigger();
//   moveNoRandom();
//   questionGif.src = pickRandom(gifs.no);

//   if (musicEnabled) playTrack(pickRandom(buckets.rejection));
// });


function burstHearts(targetEl) {
  const host = targetEl || document.body;
  const rect = host.getBoundingClientRect();

  // create overlay layer
  const layer = document.createElement("div");
  layer.style.position = "absolute";
  layer.style.left = `${rect.left + window.scrollX}px`;
  layer.style.top = `${rect.top + window.scrollY}px`;
  layer.style.width = `${rect.width}px`;
  layer.style.height = `${rect.height}px`;
  layer.style.pointerEvents = "none";
  layer.style.overflow = "visible";
  layer.style.zIndex = "9999";

  document.body.appendChild(layer);

  const count = 14;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.textContent = "💗";
    h.style.position = "absolute";
    h.style.left = "50%";
    h.style.top = "50%";
    h.style.transform = "translate(-50%, -50%)";
    h.style.fontSize = `${14 + Math.random() * 12}px`;
    h.style.filter = "drop-shadow(0 6px 12px rgba(255,70,140,0.25))";
    layer.appendChild(h);

    const angle = (Math.random() * Math.PI * 2);
    const dist = 70 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (60 + Math.random() * 60);

    const spin = (Math.random() * 140 - 70);
    const duration = 700 + Math.random() * 450;

    h.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.9)", opacity: 0.0 },
        { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1.0, offset: 0.15 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin}deg) scale(1)`, opacity: 0.0 }
      ],
      { duration, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );
  }

  setTimeout(() => layer.remove(), 1400);
}


let noClicks = 0;
noBtn.addEventListener("click", () => {
  const msg = teaseLines[teaseIndex % teaseLines.length];
  showTease(msg);
  showNoPopup(msg);
  teaseIndex++;
  showNoModal(msg);

  noClicks++;

  // ✅ swap positions (2)
  if (btnArea) btnArea.classList.toggle("swapButtons");

  // ✅ romantic burst (3)
  burstHearts(btnArea || yesBtn);

  // (optional) keep your existing yes grow if you want
  // makeYesBigger();

  // YES grows
  // makeYesBigger();

  // ✅ NO must NOT move
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.right = "";
  noBtn.style.bottom = "";
  noBtn.style.transform = "";

  questionGif.src = pickRandom(gifs.no);
  // NO click par koi music play nahi hoga
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
    // moveNoRandom();
  }
}

if (btnArea) {
  btnArea.addEventListener("mousemove", (e) => dodgeIfClose(e.clientX, e.clientY));
  // noBtn.addEventListener("mouseenter", () => moveNoRandom());
}


/* ---------- Gifts lock/unlock ---------- */
function unlockGifts() {
  unlocked = true;
  giftRow.classList.remove("locked");
  giftLockHint.textContent = "Unlocked ✅";
  giftLockHint.style.color = "rgba(42,27,34,0.75)";
  // Update heading after YES
  // if (giftUnlockTitle) giftUnlockTitle.textContent = "Love youuu… I knew you’d say YES 😘";
  if (giftUnlockTitle) {
    giftUnlockTitle.innerHTML = `
    <span class="unlock-text">
      Love youuu… I knew you’d say YES 😘
    </span>
    <br/>
    <img 
      src="assets/GifData/Yes/love1.gif" 
      alt="love"
      class="unlock-img"
    />
  `;
  }

}

yesBtn.addEventListener("click", () => {
  questionGif.src = pickRandom(gifs.yes);

  // Keep UI toggle in sync
  musicEnabled = true;
  musicToggle.textContent = "⏸";

  // ✅ YES par hamesha Qubool play hoga (53s se), and BG + any other tracks stop automatically
  playTrack("assets/AudioTracks/Qubool.webm", { startAt: 53 });

  // Now Playing UI (nice touch)
  if (nowPlaying) nowPlaying.hidden = false;
  if (npName) npName.textContent = "Qubool 💖";
  if (npPlayPause) npPlayPause.textContent = "Pause";

  // reset track buttons UI
  document.querySelectorAll(".trackCard .btn").forEach(b => b.textContent = "Play");
  currentProgress = null;

  unlockGifts();
  // openCollageModal();
  openHeartMemoriesModal();


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


/* ---------- Back to top ---------- */
backToTop.addEventListener("click", () => {
  document.getElementById("p1").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---------- NO default position reset on resize ---------- */

function resetNo() {
  noBtn.style.left = "";
  noBtn.style.bottom = "";
  noBtn.style.right = "";
  noBtn.style.top = "";
  noBtn.style.transform = "";

  if (btnArea) btnArea.classList.remove("swapButtons");
}

window.addEventListener("load", resetNo);
window.addEventListener("resize", resetNo);

/* overlay script password page script */
(() => {
  const overlay = document.getElementById("lockOverlay");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const hintText = document.getElementById("hintText");
  const errorText = document.getElementById("errorText");
  const unlockBtn = document.getElementById("unlockBtn");
  const qCounter = document.getElementById("qCounter");
  const progressBar = document.getElementById("progressBar");
  const skipBtn = document.getElementById("skipBtn");

  /* =========================
     Love Letter Overlay (after unlock)
  ========================= */
  const letterOverlay = document.getElementById("letterOverlay");
  const typedTextEl = document.getElementById("typedText");
  const caretEl = document.getElementById("caret");
  const signatureEl = document.getElementById("signature");
  const letterContinue = document.getElementById("letterContinue");

  // You can change this content anytime (layout stays safe)
  const LETTER_TEXT =
    `Pata hai divya… hum na sirf 3 months se saath hain,
but kabhi aisa laga hi nahi ki ye bas "just 3 months hue".

It feels like we’ve been together for so long, and already shared so many moments —
cute memories, quality time, aur thodi si duniya saath explore ki.

Ye humara first Valentine hai,
aur main is relationship ke liye genuinely grateful hoon.
Haan, kuch cheezein perfect nahi thi,
but mujhe lagta hai agar hum saath hote,
to sab kuch solve ho sakta hai.

Aajkal humari baat nahi hoti,
aur honestly… I miss those moments.`;

  let typingDone = false;
  let typingTimer = null;

  function showLetterOverlay() {
    if (!letterOverlay) return;

    // reset state each time (fresh on reload)
    typingDone = false;
    if (typingTimer) clearTimeout(typingTimer);
    typedTextEl.textContent = "";
    signatureEl.hidden = true;
    letterContinue.hidden = true;
    caretEl.style.display = "inline-block";

    letterOverlay.style.display = "grid";
    // allow transition to apply
    requestAnimationFrame(() => letterOverlay.classList.add("show"));
    startTyping(LETTER_TEXT);
  }

  function hideLetterOverlay() {
    if (!letterOverlay) return;

    letterOverlay.classList.remove("show");
    letterOverlay.classList.add("fadeout");
    setTimeout(() => {
      letterOverlay.classList.remove("fadeout");
      letterOverlay.style.display = "none";
    }, 380);
  }

  function instantFinishTyping() {
    if (typingTimer) clearTimeout(typingTimer);
    typedTextEl.textContent = LETTER_TEXT;
    typingDone = true;
    caretEl.style.display = "none";
    signatureEl.hidden = false;
    letterContinue.hidden = false;
  }

  function calcDelay(ch) {
    // slower + cute pauses
    if (ch === "." || ch === ",") return 180;
    if (ch === "—") return 220;
    if (ch === "\n") return 240;
    return 55;
  }

  function startTyping(text) {
    let i = 0;
    function step() {
      typedTextEl.textContent += text[i] ?? "";
      const d = calcDelay(text[i] ?? "");
      i += 1;

      // auto-scroll to keep latest line visible (future-proof for long text)
      typedTextEl.parentElement.scrollTop = typedTextEl.parentElement.scrollHeight;

      if (i < text.length) {
        typingTimer = setTimeout(step, d);
      } else {
        typingDone = true;
        caretEl.style.display = "none";
        signatureEl.hidden = false;
        letterContinue.hidden = false;
      }
    }
    typingTimer = setTimeout(step, 380); // small initial delay
  }

  // tap anywhere to continue
  if (letterOverlay) {
    letterOverlay.addEventListener("click", (e) => {
      // If they clicked the button, the button handler will run
      if (e.target && e.target.id === "letterContinue") return;

      if (!typingDone) {
        instantFinishTyping();
        return;
      }
      hideLetterOverlay();
    });
  }

  if (letterContinue) {
    letterContinue.addEventListener("click", () => {
      hideLetterOverlay();
      startBackgroundAudio();
    });
  }



  // ✅ EDIT THESE (make it personal)
  const questions = [
    {
      q: "Humne first time jab bat ki wo kon sa din th..??",
      a: ["sunday"],   // accepted answers
      hint: "Hint: Wednesday, Friday, Valentine-Day, "
    },
    {
      q: "Jab mai tumhe irritate krta hu ya extra Love ❤️ show krta hu tum kya kahti ho mujhe",
      a: ["bahe", "chup rho aap", "pta hai mujhe", "chup rho"], // accepted answers
      hint: "Hint: socho babu socho"
    }
  ];

  const cuteWrong = [
    "Hmmm… not the one. Try again, my love 💖",
    "Nope 😌 but you’re still cute.",
    "Close-ish… but not quite 😭",
    "Think harder… I believe in you 🥺",
    "help kar deta hu -( chup ho jao, pagal, i know ) but in your way"

  ];


  const normalize = (s) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ""); // remove spaces

  let idx = 0;
  let tries = 0;

  function showOverlay() {
    overlay.style.display = "grid";
    overlay.setAttribute("aria-hidden", "false");
    render();
    setTimeout(() => answerInput.focus(), 150);
  }

  function hideOverlay() {
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
  }

  function render() {
    const total = questions.length;
    const item = questions[idx];
    questionText.textContent = item.q;
    hintText.textContent = item.hint;
    qCounter.textContent = `Question ${idx + 1}/${total}`;
    progressBar.style.width = `${(idx / total) * 100}%`;
    errorText.textContent = "";
    answerInput.value = "";
  }

  function unlockSuccess() {
    progressBar.style.width = "100%";
    // localStorage.setItem(STORAGE_KEY, "yes");
    // cute little exit animation feel
    overlay.style.opacity = "0";
    overlay.style.transform = "scale(1.01)";
    overlay.style.transition = "opacity 250ms ease, transform 250ms ease";
    setTimeout(() => { hideOverlay(); showLetterOverlay(); }, 260);
  }

  function checkAnswer() {
    const item = questions[idx];
    const input = normalize(answerInput.value);
    const ok = item.a.map(normalize).includes(input);

    if (ok) {
      idx++;
      tries = 0;

      if (idx >= questions.length) {
        unlockSuccess();
      } else {
        render();
      }
      return;
    }

    // wrong answer
    tries++;
    errorText.textContent = cuteWrong[Math.floor(Math.random() * cuteWrong.length)];

    // optional: after 3 wrong tries show stronger hint
    if (tries >= 3) {
      hintText.textContent = item.hint + " (Think of our chats 😌)";
    }

    // tiny shake animation
    overlay.animate(
      [{ transform: "translateX(0px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0px)" }],
      { duration: 220, iterations: 1 }
    );
  }

  // “I forgot” -> show answer style hint (without revealing fully)
  skipBtn.addEventListener("click", () => {
    const item = questions[idx];
    errorText.textContent = `Okay 🥺 it starts with “${item.a[0][0].toUpperCase()}”`;
    answerInput.focus();
  });

  unlockBtn.addEventListener("click", checkAnswer);

  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });

  // boot
  // const unlocked = localStorage.getItem(STORAGE_KEY) === "yes";
  // if (!unlocked) showOverlay();
  // else hideOverlay();
  showOverlay()
})();
const hmModal = document.getElementById("heartMemoriesModal");
const hmCloseBtn = document.getElementById("hmCloseBtn");
const hmOkBtn = document.getElementById("hmOkBtn");
const hmCanvas = document.getElementById("hmCanvas");
const hmWrap = document.getElementById("hmCanvasWrap");

/* ✅ Put your 40 image paths here */
const HEART_IMAGES = [
  "assets/ourImages/1.jpg",
  "assets/ourImages/2.jpg",
  "assets/ourImages/3.jpg",
  "assets/ourImages/4.jpg",
  "assets/ourImages/5.jpg",
  "assets/ourImages/6.jpg",
  "assets/ourImages/7.jpg",
  "assets/ourImages/8.jpg",
  "assets/ourImages/9.jpg",
  "assets/ourImages/10.jpg",
  "assets/ourImages/11.jpg",
  "assets/ourImages/12.jpg",
  "assets/ourImages/13.jpg",
  "assets/ourImages/14.jpg",
  "assets/ourImages/15.jpg",
  "assets/ourImages/16.jpg",
  "assets/ourImages/17.jpg",
  "assets/ourImages/18.jpg",
  "assets/ourImages/19.jpg",
  "assets/ourImages/20.jpg",
  "assets/ourImages/21.jpg",
  "assets/ourImages/22.jpg",
  "assets/ourImages/23.jpg",
  "assets/ourImages/24.jpg",
  "assets/ourImages/25.jpg",
  "assets/ourImages/26.jpg",
  "assets/ourImages/27.jpg",
  "assets/ourImages/28.jpg",
  "assets/ourImages/29.jpg",
  "assets/ourImages/30.jpg",
  "assets/ourImages/31.jpg",
  "assets/ourImages/32.jpg",
  "assets/ourImages/33.jpg",
  "assets/ourImages/34.jpg",
  "assets/ourImages/35.jpg",
  "assets/ourImages/36.jpg",
  "assets/ourImages/37.jpg",
  "assets/ourImages/38.jpg",
  "assets/ourImages/39.jpg",
  "assets/ourImages/40.jpg",
];

function openHeartMemoriesModal() {
  hmModal.classList.add("is-open");
  hmModal.setAttribute("aria-hidden", "false");
  drawHeartMosaic(HEART_IMAGES);
}

function closeHeartMemoriesModal() {
  hmModal.classList.remove("is-open");
  hmModal.setAttribute("aria-hidden", "true");
}

hmCloseBtn?.addEventListener("click", closeHeartMemoriesModal);
hmOkBtn?.addEventListener("click", closeHeartMemoriesModal);
hmModal?.addEventListener("click", (e) => { if (e.target === hmModal) closeHeartMemoriesModal(); });

window.addEventListener("resize", () => {
  if (hmModal.classList.contains("is-open")) drawHeartMosaic(HEART_IMAGES);
});

function heartPath(ctx, w, h) {
  // normalize heart to canvas size
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.92);

  ctx.bezierCurveTo(w * 0.35, h * 0.83, w * 0.14, h * 0.70, w * 0.14, h * 0.40);
  ctx.bezierCurveTo(w * 0.14, h * 0.25, w * 0.25, h * 0.16, w * 0.36, h * 0.19);
  ctx.bezierCurveTo(w * 0.43, h * 0.21, w * 0.47, h * 0.28, w * 0.50, h * 0.34);

  ctx.bezierCurveTo(w * 0.53, h * 0.28, w * 0.57, h * 0.21, w * 0.64, h * 0.19);
  ctx.bezierCurveTo(w * 0.75, h * 0.16, w * 0.86, h * 0.25, w * 0.86, h * 0.40);
  ctx.bezierCurveTo(w * 0.86, h * 0.70, w * 0.65, h * 0.83, w * 0.50, h * 0.92);

  ctx.closePath();
}

async function loadImages(srcs) {
  const imgs = await Promise.all(srcs.map(src => new Promise((res) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  })));
  return imgs.filter(Boolean);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function drawHeartMosaic(srcs) {
  if (!hmCanvas || !hmWrap) return;

  const rect = hmWrap.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  hmCanvas.width = Math.floor(rect.width * dpr);
  hmCanvas.height = Math.floor(rect.height * dpr);

  const ctx = hmCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width;
  const h = rect.height;

  ctx.clearRect(0, 0, w, h);

  // Heart background
  ctx.save();
  heartPath(ctx, w, h);
  ctx.clip();

  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "rgba(255,92,144,0.78)");
  grd.addColorStop(1, "rgba(255,64,120,0.55)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  const images = await loadImages(srcs);
  const pics = shuffle(images);
  if (!pics.length) {
    ctx.restore();
    return;
  }

  // TILE SIZE: small tiles => heart shape clear
  const tile = Math.max(46, Math.min(86, Math.floor(w / 9)));
  const gap = Math.max(6, Math.floor(tile * 0.10));

  let idx = 0;

  // draw grid tiles, but only inside heart clip
  for (let y = 0; y < h; y += (tile + gap)) {
    for (let x = 0; x < w; x += (tile + gap)) {
      const im = pics[idx % pics.length];
      idx++;

      // little random jitter for “collage vibe”
      const jx = (Math.random() - 0.5) * gap;
      const jy = (Math.random() - 0.5) * gap;

      const px = x + jx;
      const py = y + jy;

      // draw polaroid frame
      const r = 14;
      const fw = tile;
      const fh = tile * 1.08;

      // white frame
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, px, py, fw, fh, r);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fill();

      // inner image
      const pad = Math.floor(fw * 0.10);
      const ix = px + pad;
      const iy = py + pad;
      const iw = fw - pad * 2;
      const ih = fh - pad * 2 - Math.floor(fh * 0.10);

      // cover-crop draw
      drawCover(ctx, im, ix, iy, iw, ih);

      // soft shadow
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;

      ctx.restore();
    }
  }

  ctx.restore();

  // Heart outline + drop shadow
  ctx.save();
  ctx.lineWidth = Math.max(3, w * 0.007);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 18;
  heartPath(ctx, w, h);
  ctx.stroke();
  ctx.restore();

  // bottom shadow (outside heart)
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.filter = "blur(10px)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.90, w * 0.22, h * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const rr = w / h;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (ir > rr) {
    // image wider
    sh = img.height;
    sw = sh * rr;
    sx = (img.width - sw) / 2;
  } else {
    // image taller
    sw = img.width;
    sh = sw / rr;
    sy = (img.height - sh) / 2;
  }

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, Math.min(14, w * 0.16));
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}
