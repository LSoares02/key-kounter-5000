import { updateDashboards } from "./dashboard.js";

let musicEnabled = false;
let dataOrigin = null;

let idleTimeout;
let keysSinceFadeIn = 0;
let isCapturing = false;

document.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("toggleBtn");
  const viewStatsBtn = document.getElementById("viewStatsBtn");
  const backBtn = document.getElementById("backBtn");
  const toTopBtn = document.getElementById("toTopBtn");
  const disqueteBtn = document.getElementById("disquete");

  const audioPath = await electronAPI.getAudioPath();
  musicAPI.init(audioPath);

  electronAPI.getMusicStatus().then((status) => {
    musicEnabled = status;
    if (disqueteBtn) {
      disqueteBtn.textContent = musicEnabled ? "music (y)" : "music (n)";
    }
  });

  if (disqueteBtn) {
    disqueteBtn.addEventListener("click", () => {
      musicEnabled = !musicEnabled;
      electronAPI.toggleMusic();

      disqueteBtn.classList.toggle("active", musicEnabled);
      disqueteBtn.textContent = musicEnabled ? "music (y)" : "music (n)";

      if (!musicEnabled) {
        musicAPI.fadeOut();
      } else {
        // force quicker fade in when user enables music
        keysSinceFadeIn = 15;
      }
    });
  }

  if (toggleBtn) {
    electronAPI.getCaptureState().then((state) => {
      isCapturing = state;
      toggleBtn.textContent = isCapturing ? "stop capture" : "start capture";
      toggleBtn.classList.toggle("capturing", isCapturing);
    });

    toggleBtn.addEventListener("click", () => {
      if (isCapturing) {
        electronAPI.stopListening();
        // force quicker fade out when user finishes typing
        musicAPI.fadeOut();
        toggleBtn.textContent = "start capture";
        toggleBtn.classList.remove("capturing");
      } else {
        electronAPI.startListening();
        // force quicker fade in when user starts from scratch
        keysSinceFadeIn = 15;
        toggleBtn.textContent = "stop capture";
        toggleBtn.classList.add("capturing");
      }
      isCapturing = !isCapturing;
    });
  }

  if (viewStatsBtn) {
    viewStatsBtn.addEventListener("click", () => {
      handleKeyLogs();

      function handleKeyLogs() {
        electronAPI.listKeyloggers().then((keyloggers) => {
          console.log(keyloggers);
          const list = document.getElementById("playerSelector-list");
          list.innerHTML =
            keyloggers.length === 0
              ? "<li>NO DATA</li>"
              : keyloggers
                  .map((f) => {
                    const match = f.match(/^keystrokes-(.+)\.json$/);
                    let dateStr = match ? match[1] : f;

                    let isoStr = dateStr.replace(
                      /(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/,
                      "$1T$2:$3:$4.$5Z"
                    );
                    let localStr;
                    try {
                      const dateObj = new Date(isoStr);
                      localStr = dateObj.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",

                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      });
                    } catch (e) {
                      localStr = dateStr;
                    }
                    // Adiciona data-filename ao li para identificação
                    return `<li data-filename="${f}">${localStr}</li>`;
                  })
                  .join("");

          // Função para marcar o item central como 'active'
          function setActiveOnCenter() {
            const items = Array.from(list.querySelectorAll("li"));
            const listRect = list.getBoundingClientRect();
            const listCenter = listRect.top + listRect.height / 2;
            let closest = null;
            let closestDist = Infinity;
            items.forEach((li) => {
              const rect = li.getBoundingClientRect();
              const itemCenter = rect.top + rect.height / 2;
              const dist = Math.abs(itemCenter - listCenter);
              if (dist < closestDist) {
                closestDist = dist;
                closest = li;
              }
            });
            items.forEach((li) => li.classList.remove("active"));
            if (closest) {
              closest.classList.add("active");
              // Atualiza dashboards conforme o item ativo
              const filename = closest.getAttribute("data-filename");
              if (filename) {
                dataOrigin = filename;
                updateDashboards(
                  filename,
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                );
              }
            }
          }
          list.addEventListener("scroll", () => {
            window.requestAnimationFrame(setActiveOnCenter);
          });
          // Inicializa ao montar
          setTimeout(setActiveOnCenter, 50);
        });
      }

      showScreen("dashboard");
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showScreen("home");
    });
  }

  if (toTopBtn) {
    // Ao clicar, faz scroll suave do playerSelector-list para o topo
    toTopBtn.addEventListener("click", () => {
      const list = document.getElementById("playerSelector-list");
      if (list) {
        list.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });

    // Mostra/esconde o botão conforme scroll
    const list = document.getElementById("playerSelector-list");
    if (list) {
      list.addEventListener("scroll", () => {
        if (list.scrollTop > 0) {
          toTopBtn.classList.remove("hidden");
        } else {
          toTopBtn.classList.add("hidden");
        }
      });
      // Estado inicial
      if (list.scrollTop > 0) {
        toTopBtn.classList.remove("hidden");
      } else {
        toTopBtn.classList.add("hidden");
      }
    }
  }

  // Setas de scroll do playerSelector
  const arrowUp = document.getElementById("playerSelector-arrow-up");
  const arrowDown = document.getElementById("playerSelector-arrow-down");
  const playerList = document.getElementById("playerSelector-list");

  function scrollToSnap(direction) {
    if (!playerList) return;
    const items = Array.from(playerList.querySelectorAll("li"));
    if (items.length === 0) return;
    const listRect = playerList.getBoundingClientRect();
    const listCenter = listRect.top + listRect.height / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    items.forEach((li, idx) => {
      const rect = li.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(itemCenter - listCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    let targetIdx =
      direction === "down"
        ? Math.min(items.length - 1, closestIdx + 1)
        : Math.max(0, closestIdx - 1);
    const target = items[targetIdx];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (arrowUp) {
    arrowUp.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSnap("up");
    });
  }
  if (arrowDown) {
    arrowDown.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSnap("down");
    });
  }

  // Ao pressionar tecla (via IPC)
  electronAPI.onKeyPressed((key) => {
    // 🎵 Controla música com base na digitação
    if (musicEnabled) {
      keysSinceFadeIn++;
      if (keysSinceFadeIn >= 20) {
        musicAPI.fadeIn(5000);
        keysSinceFadeIn = 0;
      }
      clearTimeout(idleTimeout);

      idleTimeout = setTimeout(() => {
        musicAPI.fadeOut(5000);
      }, 2000);
    }

    if (dataOrigin) {
      updateDashboards(
        dataOrigin,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    }

    // 💡 Animação estilo terminal
    const div = document.createElement("div");
    div.textContent = key.toLowerCase();
    div.classList.add("key-flash");

    div.style.top = `${Math.random() * 90}%`;
    div.style.left = `${Math.random() * 90}%`;

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 1200);
  });
});

function showScreen(screen) {
  document.getElementById("screen-home").style.display =
    screen === "home" ? "flex" : "none";
  document.getElementById("screen-dashboard").style.display =
    screen === "dashboard" ? "flex" : "none";
}
