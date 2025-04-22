import { GlobalKeyboardListener } from "node-global-key-listener";
import { fileURLToPath } from 'url';
import path from "path";
import fs from "fs";

let gkl;
let currentLogFilePath;
let keyPressListener; // <-- Aqui guardamos o callback


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startKeyLogger(mainWindow) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(__dirname, "..", "keyLogger");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  currentLogFilePath = path.join(dir, `keystrokes-${timestamp}.json`);
  fs.writeFileSync(currentLogFilePath, "[]");

  gkl = new GlobalKeyboardListener();

  keyPressListener = (e) => {
    if (e.state === "DOWN" && currentLogFilePath) {
      const entry = {
        key: e.name,
        timestamp: new Date().toISOString(),
      };

      try {
        const currentLog = JSON.parse(fs.readFileSync(currentLogFilePath));
        currentLog.push(entry);
        fs.writeFileSync(
          currentLogFilePath,
          JSON.stringify(currentLog, null, 2)
        );

        // Envia para o renderer
        mainWindow.webContents.send("key-pressed", e.name);
      } catch (err) {
        console.error("Erro ao salvar a tecla:", err);
      }
    }
  };

  gkl.addListener(keyPressListener);
}
function stopKeyLogger() {
  if (gkl && keyPressListener) {
    gkl.removeListener(keyPressListener); // Remove só o listener específico
    gkl = null;
    keyPressListener = null;
    currentLogFilePath = null;
  }
}
function getCurrentLogFilePath() {
  return currentLogFilePath;
}

export { startKeyLogger, stopKeyLogger, getCurrentLogFilePath };
