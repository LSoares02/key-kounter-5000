const { contextBridge, ipcRenderer } = require("electron");

let musicAudio;
let fadeInterval;

contextBridge.exposeInMainWorld("electronAPI", {
  // KEYLOGGER
  startListening: () => ipcRenderer.invoke("start-listening"),
  stopListening: () => ipcRenderer.invoke("stop-listening"),
  getCaptureState: () => ipcRenderer.invoke("get-capture-state"),
  getCurrentSessionData: () => ipcRenderer.invoke("get-current-session-data"),
  getSpecificSessionData: (filename) =>
    ipcRenderer.invoke("get-specific-session-data", filename),
  listKeyloggers: () => ipcRenderer.invoke("list-keyloggers"),

  // MUSIC
  getAudioPath: () => ipcRenderer.invoke("get-audio-path"),
  toggleMusic: () => ipcRenderer.send("toggle-music"),
  getMusicStatus: () => ipcRenderer.invoke("get-music-status"),

  // KEYPRESS
  onKeyPressed: (callback) =>
    ipcRenderer.on("key-pressed", (_, key) => callback(key)),
});

contextBridge.exposeInMainWorld("musicAPI", {
  init: initMusic,
  fadeIn: fadeInMusic,
  fadeOut: fadeOutMusic,
  isPlaying: isMusicPlaying,
});

// Music Helpers
function initMusic(audioPath) {
  if (!musicAudio) {
    musicAudio = new Audio(`file://${audioPath}`);
    musicAudio.loop = true;
    musicAudio.volume = 0;
  }
}
function fadeInMusic(duration = 2000) {
  if (!musicAudio) return;
  clearInterval(fadeInterval);
  musicAudio.play();
  const step = 0.05;
  const interval = duration / (1 / step);
  fadeInterval = setInterval(() => {
    if (musicAudio.volume < 1) {
      musicAudio.volume = Math.min(musicAudio.volume + step, 1);
    } else {
      clearInterval(fadeInterval);
    }
  }, interval);
}
function fadeOutMusic(duration = 2000) {
  if (!musicAudio) return;
  clearInterval(fadeInterval);
  const step = 0.05;
  const interval = duration / (1 / step);
  fadeInterval = setInterval(() => {
    if (musicAudio.volume > 0) {
      musicAudio.volume = Math.max(musicAudio.volume - step, 0);
    } else {
      clearInterval(fadeInterval);
      musicAudio.pause();
    }
  }, interval);
}
function isMusicPlaying() {
  return musicAudio && !musicAudio.paused;
}
