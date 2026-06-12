/**
 * 공공데이터포털(odcloud) API 공통 모듈
 * - fetchAll(datasetId): 등록된 데이터셋의 전체 레코드를 페이지네이션으로 수집
 * - sessionStorage 캐시로 페이지 이동 시 재호출 방지
 */
const ParkAPI = (() => {
  const CACHE_PREFIX = 'parkapi:';
  const CACHE_TTL = 1000 * 60 * 30; // 30분

  function getDataset(id) {
    const ds = CONFIG.DATASETS[id];
    if (!ds) throw new Error(`등록되지 않은 데이터셋입니다: ${id}`);
    return ds;
  }

  function readCache(id) {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + id);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) return null;
      return data;
    } catch { return null; }
  }

  function writeCache(id, data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* 저장 공간 부족 시 캐시 생략 */ }
  }

  async function fetchPage(ds, page) {
    const url = `${ds.url}?page=${page}&perPage=${ds.perPage}&serviceKey=${CONFIG.SERVICE_KEY}`;
    const res = await fetch(url);
    if (res.status === 401) throw new Error('인증키가 유효하지 않습니다 (HTTP 401)');
    if (!res.ok) throw new Error(`API 응답 오류 (HTTP ${res.status})`);
    return res.json();
  }

  /** 전체 레코드 수집 (페이지 자동 순회) */
  async function fetchAll(id, { useCache = true } = {}) {
    const ds = getDataset(id);
    if (useCache) {
      const cached = readCache(id);
      if (cached) return cached;
    }
    const first = await fetchPage(ds, 1);
    let rows = first.data || [];
    const total = first.totalCount || rows.length;
    let page = 2;
    while (rows.length < total) {
      const next = await fetchPage(ds, page++);
      if (!next.data || next.data.length === 0) break;
      rows = rows.concat(next.data);
      if (page > 50) break; // 안전장치
    }
    writeCache(id, rows);
    return rows;
  }

  return { fetchAll, getDataset };
})();
