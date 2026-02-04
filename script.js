// ====== State ======
const reel = document.getElementById("reel");
const sections = Array.from(document.querySelectorAll(".snap"));

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const navDots = document.getElementById("navDots");

const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");

const envelope = document.getElementById("envelope");

const giftGrid = document.getElementById("giftGrid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

const memoryGrid = document.getElementById("memoryGrid");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const tease = document.getElementById("tease");
const qaBox = document.getElementById("qaBox");

const celebrate = document.getElementById("celebrate");
const heartsLayer = document.getElementById("heartsLayer");

// Music
const audio = document.getElementById("audio");
const trackList = document.getElementById("trackList");
const nowTitle = document.getElementById("nowTitle");
const nowMeta = document.getElementById("nowMeta");
const playPauseBtn = document.getElementById("playPauseBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const stopBtn = document.getElementById("stopBtn");
const seek = document.getElementById("seek");
const curTime = document.getElementById("curTime");
const durTime = document.getElementById("durTime");

let currentIndex = 0;
let noClicks = 0;
let yesScale = 1;

// YES unlock persisted
const STORAGE_KEY = "divya_valentine_yes";
const MUSIC_KEY = "divya_valentine_last_track";

// Update these manually
const tracks = [
  { title: "Aise Kyun", artist: "Me ✨", src: "assets/AudioTracks/Aise_Kyun.webm" },
  { title: "Darkhaast", artist: "Us ❤️", src: "assets/AudioTracks/DARKHAAST.webm" },
  { title: "Dooron Dooron", artist: "Again & Again", src: "assets/AudioTracks/Dooron_Dooron.mp4" },
  { title: "Finding Her", artist: "Us ✨", src: "assets/AudioTracks/Finding_Her.webm" },
  { title: "Tera Ban Jaaunga", artist: "Divya ❤️", src: "assets/AudioTracks/tera ban jaaunga.m4a" },
  { title: "O Soniye", artist: "Again & Again", src: "assets/AudioTracks/O_Soniye.m4a" },
  { title: "Jo Tum Mere Ho", artist: "Us ✨", src: "assets/AudioTracks/jo tum mere ho.mp3" },
  { title: "Tum Jo Aaye", artist: "Divya ❤️", src: "assets/AudioTracks/tum jo aaye.m4a" },
  { title: "Sang Rahiyo", artist: "Again & Again", src: "assets/AudioTracks/Sang_Rahiyo.webm" },
  { title: "Perfect", artist: "It's You 😊", src: "assets/AudioTracks/perfect.mp3" },
];

// Gift content
const gifts = {
  1: { title: "Gift 1 — A tiny surprise", text: "A promise: I’ll always find my way back to you. 💗" },
  2: { title: "Gift 2 — A soft promise", text: "No matter what, I choose you again and again. 🫶" },
  3: { title: "Gift 3 — A midnight wish", text: "Meet me in the quiet moments — they’re ours. 🌙" },
};

// ====== Helpers ======
function scrollToSection(idx) {
  const clamped = Math.max(0, Math.min(sections.length - 1, idx));
  sections[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatTime(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function openModal(html) {
  modalBody.innerHTML = html;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
}

// ====== Nav Dots ======
function buildDots() {
  navDots.innerHTML = "";
  sections.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.title = s.dataset.title || `Section ${i + 1}`;
    navDots.appendChild(d);
  });
}
function setActiveDot(i) {
  const dots = Array.from(navDots.children);
  dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
}

buildDots();

// Observe visible section
const io = new IntersectionObserver(
  (entries) => {
    // pick most visible
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const idx = sections.indexOf(visible.target);
    if (idx !== -1) {
      currentIndex = idx;
      setActiveDot(idx);
    }
  },
  { root: reel, threshold: [0.35, 0.55, 0.75] }
);

sections.forEach((s) => io.observe(s));

// Buttons
prevBtn.addEventListener("click", () => scrollToSection(currentIndex - 1));
nextBtn.addEventListener("click", () => scrollToSection(currentIndex + 1));

startBtn?.addEventListener("click", () => scrollToSection(1));
replayBtn?.addEventListener("click", () => scrollToSection(0));

// ====== Envelope v2 ======
envelope?.addEventListener("click", () => {
  envelope.classList.toggle("open");
});

// ====== Gifts lock/unlock ======
function setGiftsLocked(locked) {
  const cards = Array.from(document.querySelectorAll(".giftCard"));
  cards.forEach((c) => c.classList.toggle("locked", locked));
}

function hasYes() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function unlockAll() {
  localStorage.setItem(STORAGE_KEY, "1");
  setGiftsLocked(false);
}

setGiftsLocked(!hasYes());

giftGrid?.addEventListener("click", (e) => {
  const card = e.target.closest(".giftCard");
  if (!card) return;

  if (card.classList.contains("locked")) {
    openModal(`
      <h3 class="modalTitle">Locked 😌</h3>
      <p class="modalText">First answer the final question with <b>YES</b> 💖</p>
    `);
    return;
  }

  const id = card.dataset.gift;
  const g = gifts[id];
  openModal(`
    <h3 class="modalTitle">${g.title}</h3>
    <p class="modalText">${g.text}</p>
    <img src="assets/ourImages/${Math.min(Number(id), 4)}.jpg" alt="gift image" />
  `);
});

// ====== Memories reveal + video support ======
memoryGrid?.addEventListener("click", (e) => {
  const tile = e.target.closest(".memoryTile");
  if (!tile) return;

  const type = tile.dataset.type || "image";
  const src = tile.dataset.src;

  // Images do blur->clear reveal
  if (type === "image") {
    tile.classList.toggle("revealed");
    return;
  }

  // Videos open in modal
  if (type === "video") {
    openModal(`
      <h3 class="modalTitle">Memory ▶</h3>
      <p class="modalText">Press play… and don’t blink 💗</p>
      <video src="${src}" controls playsinline></video>
    `);
  }
});

// ====== Modal close ======
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ====== Valentine YES/NO ======
const noTeases = [
  "Soch lo… 😌",
  "Are you sure? 🙈",
  "Itna bhi bhaav nahi… 😭",
  "Okay… but YES is cuter 💖",
  "Last chance 😏",
  "Divya plsss 🥺",
];

function moveNoButton() {
  const box = qaBox.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const padding = 12;
  const maxX = box.width - btn.width - padding;
  const maxY = box.height - btn.height - padding;

  const x = Math.max(padding, Math.random() * maxX);
  const y = Math.max(padding, Math.random() * maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";
}

function growYes() {
  yesScale = Math.min(1.55, yesScale + 0.08);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.remove("pop");
  void yesBtn.offsetWidth;
  yesBtn.classList.add("pop");
}

noBtn?.addEventListener("click", () => {
  noClicks++;
  moveNoButton();
  growYes();
  tease.textContent = noTeases[Math.min(noClicks - 1, noTeases.length - 1)];
});

function spawnHeartsBurst(count = 22) {
  heartsLayer.classList.add("show");

  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "heart";
    el.textContent = Math.random() > 0.5 ? "💖" : "💗";
    el.style.left = `${Math.random() * (w - 40) + 20}px`;
    el.style.top = `${h - 80}px`;
    el.style.fontSize = `${Math.random() * 14 + 14}px`;
    el.style.animationDuration = `${Math.random() * 1.2 + 2.2}s`;
    el.style.animationDelay = `${Math.random() * 0.25}s`;
    heartsLayer.appendChild(el);

    el.addEventListener("animationend", () => el.remove());
  }

  // auto hide layer after a moment
  setTimeout(() => {
    if (!document.querySelector(".heart")) heartsLayer.classList.remove("show");
  }, 3200);
}

function showCelebrate() {
  celebrate.classList.add("show");
  celebrate.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    celebrate.classList.remove("show");
    celebrate.setAttribute("aria-hidden", "true");
  }, 1800);
}

function autoplayAfterYes() {
  // If nothing selected yet, pick 0
  let idx = Number(localStorage.getItem(MUSIC_KEY) || "0");
  if (!tracks[idx]) idx = 0;
  loadTrack(idx, true);
}

yesBtn?.addEventListener("click", () => {
  unlockAll();
  tease.textContent = "I KNEW IT 💖💖💖";
  spawnHeartsBurst(28);
  showCelebrate();
  autoplayAfterYes();

  // Cute auto scroll to gifts after yes
  setTimeout(() => scrollToSection(2), 700);
});

// ====== Music Player (track list UI) ======
let currentTrack = 0;
let isPlaying = false;

function renderTrackList() {
  trackList.innerHTML = "";
  tracks.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "trackRow" + (i === currentTrack ? " active" : "");
    row.innerHTML = `
      <div class="trackLeft">
        <button class="trackPlay" data-i="${i}" aria-label="Play ${t.title}">
          ${i === currentTrack && isPlaying ? "❚❚" : "▶"}
        </button>
        <div class="trackInfo">
          <div class="trackName">${t.title}</div>
          <div class="trackArtist">${t.artist}</div>
        </div>
      </div>
      <div class="trackRight">${i === currentTrack && isPlaying ? "playing" : ""}</div>
    `;
    trackList.appendChild(row);
  });
}

function setNowPlaying(i) {
  nowTitle.textContent = tracks[i]?.title || "—";
  nowMeta.textContent = tracks[i]?.artist || "—";
}

function loadTrack(i, autoplay = false) {
  currentTrack = i;
  localStorage.setItem(MUSIC_KEY, String(i));

  audio.src = tracks[i].src;
  setNowPlaying(i);

  // reset UI
  seek.value = 0;
  curTime.textContent = "0:00";
  durTime.textContent = "0:00";

  audio.load();

  if (autoplay) {
    audio.play().then(() => {
      isPlaying = true;
      playPauseBtn.textContent = "Pause";
      renderTrackList();
    }).catch(() => {
      // autoplay blocked (shouldn't happen because YES click is user gesture)
      isPlaying = false;
      playPauseBtn.textContent = "Play";
      renderTrackList();
    });
  } else {
    isPlaying = false;
    playPauseBtn.textContent = "Play";
    renderTrackList();
  }
}

function togglePlay() {
  if (!audio.src) loadTrack(currentTrack, false);

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = "Play";
  } else {
    audio.play().then(() => {
      isPlaying = true;
      playPauseBtn.textContent = "Pause";
    }).catch(() => {
      isPlaying = false;
      playPauseBtn.textContent = "Play";
    });
  }
  renderTrackList();
}

function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
  playPauseBtn.textContent = "Play";
  renderTrackList();
}

function shufflePlay() {
  const i = Math.floor(Math.random() * tracks.length);
  loadTrack(i, true);
}

trackList?.addEventListener("click", (e) => {
  const btn = e.target.closest(".trackPlay");
  if (!btn) return;
  const i = Number(btn.dataset.i);

  if (i === currentTrack) {
    togglePlay();
    return;
  }
  loadTrack(i, true);
});

playPauseBtn?.addEventListener("click", togglePlay);
stopBtn?.addEventListener("click", stopMusic);
shuffleBtn?.addEventListener("click", shufflePlay);

audio.addEventListener("loadedmetadata", () => {
  durTime.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  if (!isFinite(audio.duration) || audio.duration === 0) return;
  const p = (audio.currentTime / audio.duration) * 100;
  seek.value = String(Math.floor(p));
  curTime.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("ended", () => {
  isPlaying = false;
  playPauseBtn.textContent = "Play";
  renderTrackList();
});

seek.addEventListener("input", () => {
  if (!isFinite(audio.duration) || audio.duration === 0) return;
  const p = Number(seek.value) / 100;
  audio.currentTime = audio.duration * p;
});

// init
(function init() {
  // Load last selected track
  let idx = Number(localStorage.getItem(MUSIC_KEY) || "0");
  if (!tracks[idx]) idx = 0;
  loadTrack(idx, false);

  // If already YES, keep gifts unlocked
  if (hasYes()) setGiftsLocked(false);

  renderTrackList();
})();
