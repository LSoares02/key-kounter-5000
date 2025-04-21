import {
  calculateLiveKPM,
  calculateTopKeys,
  calculateSessionTimes,
  getTotalClicks,
  getAverageKeyInterval,
  getActivityByPeriod,
} from "./helpers/dashboardCalcs.js";

let kpmChart = null;
let topKeysChart = null;
let sessionTimesChart = null;
let activityByPeriodChart = null;

export async function updateDashboards(filename) {
  let rawData;

  if (!filename) {
    rawData = await electronAPI.getCurrentSessionData();
  } else {
    rawData = await electronAPI.getSpecificSessionData(filename);
  }
  const kpm = calculateLiveKPM(rawData);
  const ctx = document.getElementById("kpmCanvas").getContext("2d");

  // TOTAL CLICKS
  const totalClicks = getTotalClicks(rawData);
  document.getElementById("totalClicks").textContent = totalClicks;

  // AVERAGE KEY INTERVAL
  const averageKeyInterval = getAverageKeyInterval(rawData);
  document.getElementById("averageKeyInterval").textContent =
    averageKeyInterval + " ms";

  // KPM
  if (kpmChart) {
    kpmChart.destroy();
  }
  kpmChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: kpm.map((item) => {
        const date = new Date(item.minute);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: [
        {
          label: " kpm",
          data: kpm.map((item) => item.kpm),
          borderColor: "#ff6600",
          borderWidth: 2,
          backgroundColor: "rgba(255, 102, 0, 0.2)",
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: {
              weight: "bold",
              size: 15,
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "time" } },
        y: { title: { display: true, text: "kpm" }, beginAtZero: true },
      },
    },
  });

  // TOP KEYS
  if (topKeysChart) {
    topKeysChart.destroy();
  }
  const topKeys = calculateTopKeys(rawData);
  const topKeysCtx = document.getElementById("topKeysCanvas").getContext("2d");
  topKeysChart = new Chart(topKeysCtx, {
    type: "bar",
    data: {
      labels: topKeys.map((item) => item.key),
      datasets: [
        {
          label: " top 5",
          data: topKeys.map((item) => item.count),
          backgroundColor: [createHorizontalStripesPattern(topKeysCtx)],
          borderColor: "#ff6600",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: {
              weight: "bold",
              size: 15,
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "KEYS" } },
        y: { title: { display: true, text: "COUNT" }, beginAtZero: true },
      },
    },
  });

  // ACTIVITY BY PERIOD
  if (activityByPeriodChart) {
    activityByPeriodChart.destroy();
  }
  const activityByPeriod = getActivityByPeriod(rawData);
  const activityByPeriodCtx = document
    .getElementById("activityByPeriodCanvas")
    .getContext("2d");

  activityByPeriodChart = new Chart(activityByPeriodCtx, {
    type: "bar",
    data: {
      labels: ["early_bird", "worker_ant", "night_owl"],
      datasets: [
        {
          label: " clicks",
          data: [
            activityByPeriod.early_bird,
            activityByPeriod.worker_ant,
            activityByPeriod.night_owl,
          ],
          backgroundColor: [
            createHorizontalStripesPattern(activityByPeriodCtx),
          ],
          borderColor: ["#ff6600", "#666666", "#666666"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: {
              weight: "bold",
              size: 15,
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "archetype" } },
        y: { title: { display: true, text: "count" }, beginAtZero: true },
      },
    },
  });

  // SESSION TIMES
  if (sessionTimesChart) {
    sessionTimesChart.destroy();
  }
  const sessionTimes = calculateSessionTimes(rawData);
  const sessionTimesCtx = document
    .getElementById("sessionTimesCanvas")
    .getContext("2d");
  sessionTimesChart = new Chart(sessionTimesCtx, {
    type: "pie",
    data: {
      labels: ["active", "idle"],
      datasets: [
        {
          data: [sessionTimes.activeTime, sessionTimes.idleTime],
          backgroundColor: ["rgba(255, 102, 0, 0.2)", "#333"],
          borderColor: ["#ff6600", "#666666"],
          borderWidth: [2, 2],
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: {
              weight: "bold",
              size: 15,
            },
          },
        },
      },
    },
  });
}

function createHorizontalStripesPattern(
  ctx,
  color = "rgba(255, 102, 0, 0.2)",
  bgColor = "transparent",
  stripeHeight = 15,
  gap = 10
) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 16;
  patternCanvas.height = stripeHeight + gap;
  const pctx = patternCanvas.getContext("2d");

  // Fundo
  pctx.fillStyle = bgColor;
  pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  // Stripe
  pctx.fillStyle = color;
  pctx.fillRect(0, 0, patternCanvas.width, stripeHeight);

  return ctx.createPattern(patternCanvas, "repeat");
}
