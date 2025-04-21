/**
 * Retorna o número total de cliques (eventos) na sessão.
 * @param {Array<{timestamp: string}>} data - Lista de eventos.
 * @returns {number} - Total de cliques.
 */
export function getTotalClicks(data) {
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Calcula o tempo médio (em ms) entre teclas pressionadas.
 * @param {Array<{timestamp: string}>} data - Lista de eventos com timestamp.
 * @returns {number} - Tempo médio em milissegundos.
 */
export function getAverageKeyInterval(data) {
  if (!Array.isArray(data) || data.length < 2) return 0;
  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  let totalInterval = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalInterval +=
      new Date(sorted[i].timestamp).getTime() -
      new Date(sorted[i - 1].timestamp).getTime();
  }
  return Math.floor(totalInterval / (sorted.length - 1));
}

/**
 * Calcula o KPM por minuto a partir dos dados de teclas pressionadas.
 * @param {Array<{key: string, timestamp: string}>} data - Lista de eventos com key e timestamp.
 * @returns {Array<{minute: string, kpm: number}>} - KPM agrupado por minuto.
 */
export function calculateLiveKPM(data) {
  const kpmMap = new Map();

  data.forEach(({ timestamp }) => {
    const minute = new Date(timestamp).toISOString().slice(0, 16); // yyyy-mm-ddTHH:MM
    kpmMap.set(minute, (kpmMap.get(minute) || 0) + 1);
  });

  return Array.from(kpmMap.entries()).map(([minute, count]) => ({
    minute,
    kpm: count,
  }));
}

/**
 * Calcula as teclas mais pressionadas.
 * @param {Array<{key: string, timestamp: string}>} data - Lista de eventos com key e timestamp.
 * @param {number} topN - Quantidade de teclas mais pressionadas (default: 10).
 * @returns {Array<{key: string, count: number}>} - Lista ordenada das teclas mais pressionadas.
 */
export function calculateTopKeys(data, topN = 5) {
  const keyCounts = {};
  data.forEach(({ key }) => {
    keyCounts[key] = (keyCounts[key] || 0) + 1;
  });
  return Object.entries(keyCounts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Agrupa a atividade por faixa de horário: manhã, tarde e noite.
 * @param {Array<{timestamp: string}>} data - Lista de eventos com timestamp.
 * @param {string} timezone - Timezone do cliente.
 * @returns {{early_bird: number, worker_ant: number, night_owl: number}} - Contagem de eventos por período.
 */
export function getActivityByPeriod(data, timezone) {
  const periods = { early_bird: 0, worker_ant: 0, night_owl: 0 };
  if (!Array.isArray(data)) return periods;
  data.forEach(({ timestamp }) => {
    // Converte timestamp UTC para local usando timezone
    const date = new Date(timestamp);
    const localHour = Number(
      date.toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        hour12: false
      })
    );
    if (localHour >= 6 && localHour < 12) {
      periods.early_bird++;
    } else if (localHour >= 12 && localHour < 18) {
      periods.worker_ant++;
    } else {
      periods.night_owl++;
    }
  });
  return periods;
}

/**
 * Calcula o tempo total de sessão, tempo ocioso e tempo ativo.
 * @param {Array<{timestamp: string}>} data - Lista de eventos com timestamp (ordenados ou não).
 * @returns {{full: number, idleTime: number, activeTime: number}} - Todos em milissegundos.
 */
export function calculateSessionTimes(data) {
  if (!data || data.length < 2) {
    return { full: 0, idleTime: 0, activeTime: 0 };
  }

  // Ordena por timestamp caso não esteja ordenado
  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const first = new Date(sorted[0].timestamp).getTime();
  const last = new Date(sorted[sorted.length - 1].timestamp).getTime();
  const fullSession = last - first;

  // Soma dos intervalos entre cliques
  let idleTime = 0;
  for (let i = 1; i < sorted.length; i++) {
    idleTime +=
      new Date(sorted[i].timestamp).getTime() -
      new Date(sorted[i - 1].timestamp).getTime();
  }

  // Considera 1 segundo de atividade por clique
  const ACTIVE_PER_EVENT = 200; // .2 segundo em ms
  const activeTime = Math.min(sorted.length * ACTIVE_PER_EVENT, fullSession);
  const idleTimeFinal = fullSession - activeTime;

  return {
    fullSession,
    idleTime: idleTimeFinal,
    activeTime,
  };
}
