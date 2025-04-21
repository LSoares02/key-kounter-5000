import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import {
  getCurrentLogFilePath,
  startKeyLogger,
  stopKeyLogger,
} from "./src/helpers/keyLogger.js";
import fs from "fs";

// electron-reload não suporta import direto em ES Modules, use import dinâmico:
const __dirname = path.dirname(new URL(import.meta.url).pathname);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 900,
    icon: path.join(__dirname, "src", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "src", "preload.js"),
      nodeIntegration: false,
      autoplayPolicy: "no-user-gesture-required", // <- permite autoplay
    },
  });

  win.loadFile("src/pages/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// states
let isCapturing = false;
let musicEnabled = true;

// KEYLOGGER
ipcMain.handle("start-listening", (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);

  console.log("Iniciando monitoramento...");
  startKeyLogger(mainWindow);
  isCapturing = true;
});
ipcMain.handle("stop-listening", () => {
  console.log("Parando monitoramento...");
  stopKeyLogger();
  isCapturing = false;
});
ipcMain.handle("get-capture-state", () => {
  return isCapturing;
});
ipcMain.handle("get-current-session-data", async () => {
  const fs = await import("fs/promises");
  const filePath = getCurrentLogFilePath();
  if (!filePath) return [];
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Erro ao ler o arquivo de log:", err);
    return [];
  }
});
ipcMain.handle("get-specific-session-data", async (event, filename) => {
  const fs = await import("fs/promises");
  const filePath = path.join(__dirname, "src", "keyLogger", filename);
  if (!filePath) return [];
  try {
    const content = await fs.readFile(filePath, "utf-8");

    return JSON.parse(content);
  } catch (err) {
    console.error("Erro ao ler o arquivo de log:", err);
    return [];
  }
});
ipcMain.handle("list-keyloggers", async () => {
  const keyLoggerDir = path.join(__dirname, "src", "keyLogger");
  try {
    const files = await fs.promises.readdir(keyLoggerDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => {
        // Extrai a data do nome: keystrokes-YYYY-MM-DDTHH-MM-SS-sssZ.json
        const getDate = (fname) => {
          const match = fname.match(
            /keystrokes-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z\.json$/
          );
          if (!match) return 0;
          // Monta string ISO: YYYY-MM-DDTHH:MM:SS.sssZ
          const iso = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${match[7]}Z`;
          return new Date(iso);
        };
        return getDate(b) - getDate(a);
      });
  } catch (err) {
    return [];
  }
});

// MUSIC
ipcMain.handle("get-audio-path", () => {
  return path.join(__dirname, "assets", "Release.mp3");
});
ipcMain.on("toggle-music", () => {
  musicEnabled = !musicEnabled;
});
ipcMain.handle("get-music-status", () => musicEnabled);

// EXITING
app.on("window-all-closed", () => {
  app.quit();
});
