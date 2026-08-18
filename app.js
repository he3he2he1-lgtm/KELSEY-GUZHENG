const tracks = [
  { title: "🥺🌧️", file: "audio/track-01.mp3", duration: "03:38" },
  { title: "💃", file: "audio/track-02.mp3", duration: "07:26" },
  { title: "😎", file: "audio/track-03.mp3", duration: "03:31" },
];

const audio = document.querySelector("#audio");
const cards = [...document.querySelectorAll(".track-card")];
const progress = document.querySelector("#progress");
const volume = document.querySelector("#volume");
const currentTime = document.querySelector("#current-time");
const totalTime = document.querySelector("#total-time");
let activeTrack = 0;

function formatTime(value) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateRange(input, percent) {
  input.style.setProperty("--progress", `${percent}%`);
}

function updateCards() {
  cards.forEach((card, index) => {
    const active = index === activeTrack;
    const playing = active && !audio.paused;
    card.classList.toggle("is-active", active);
    card.classList.toggle("is-playing", playing);
    const button = card.querySelector("button");
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} track ${index + 1}, ${tracks[index].title}`);
  });
}

async function selectTrack(index) {
  if (index !== activeTrack) {
    audio.pause();
    activeTrack = index;
    audio.src = tracks[index].file;
    currentTime.textContent = "00:00";
    totalTime.textContent = tracks[index].duration;
    progress.value = "0";
    progress.max = "0";
    updateRange(progress, 0);
    updateCards();
    try {
      await audio.play();
    } catch {
      updateCards();
    }
    return;
  }

  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      updateCards();
    }
  } else {
    audio.pause();
  }
}

cards.forEach((card, index) => {
  card.querySelector("button").addEventListener("click", () => selectTrack(index));
});

audio.addEventListener("play", updateCards);
audio.addEventListener("pause", updateCards);
audio.addEventListener("ended", updateCards);
audio.addEventListener("loadedmetadata", () => {
  progress.max = String(audio.duration || 0);
  totalTime.textContent = Number.isFinite(audio.duration) ? formatTime(audio.duration) : tracks[activeTrack].duration;
});
audio.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(audio.currentTime);
  progress.value = String(audio.currentTime);
  updateRange(progress, audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
});

progress.addEventListener("input", () => {
  audio.currentTime = Number(progress.value);
  updateRange(progress, audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
});

audio.volume = Number(volume.value);
updateRange(volume, audio.volume * 100);
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  updateRange(volume, audio.volume * 100);
});

window.addEventListener("load", () => {
  const qr = document.querySelector("#qr-code");
  const pageUrl = window.location.href.split(/[?#]/)[0];
  if (window.QRCode) {
    new window.QRCode(qr, {
      text: pageUrl,
      width: 76,
      height: 76,
      colorDark: "#09070c",
      colorLight: "#f5f2e9",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  }
});

updateCards();
