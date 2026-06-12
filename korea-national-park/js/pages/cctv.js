/** CCTV 설치 현황 페이지 */
(function () {
  const F = CONFIG.DATASETS.cctv.fields;
  const BASE_DATE = CONFIG.DATASETS.cctv.baseDate;
  const PAGE_SIZE = 20;

  let rows = [];
  let state = { q: '', dept: '', purpose: '', page: 1, chartExpanded: false };

  Components.renderHeader({
    eyebrow: '국립공원공단 공공데이터',
    title: '국립공원 CCTV 설치 현황',
    desc: `전국 국립공원 사무소가 운영하는 CCTV의 설치 위치·대수·목적 정보입니다. (기준일 ${BASE_DATE})`,
    compact: true
  });
  Components.renderFooter();

  async function load() {
    Components.showLoading('국립공원 CCTV 데이터를 불러오는 중입니다…');
    try {
      rows = await ParkAPI.fetchAll('cctv');
      Components.clearStatus();
      document.getElementById('content').style.display = 'block';
      buildUI();
    } catch (err) {
      Components.showError(Components.esc(err.message), load);
    }
  }

  function buildUI() {
    const esc = Components.esc;

    // 통계
    const totalUnits = rows.reduce((s, r) => s + (Number(r[F.count]) || 0), 0);
    const depts = [...new Set(rows.map(r => r[F.dept]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
    document.getElementById('statTotal').innerHTML = totalUnits.toLocaleString() + '<span class="unit">대</span>';
    document.getElementById('statSpots').innerHTML = rows.length.toLocaleString() + '<span class="unit">곳</span>';
    document.getElementById('statDepts').innerHTML = depts.length.toLocaleString() + '<span class="unit">개</span>';
    document.getElementById('cctv-stats').style.display = 'grid';

    // 사무소 셀렉트
    const sel = document.getElementById('deptSelect');
    depts.forEach(d => {
      const o = document.createElement('option');
      o.value = d; o.textContent = d;
      sel.appendChild(o);
    });

    // 목적 칩
    const purposes = [...new Set(rows.map(r => r[F.purpose]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
    const chips = document.getElementById('purposeChips');
    chips.innerHTML = '';
    const allChip = document.createElement('button');
    allChip.className = 'chip on';
    allChip.textContent = '목적 전체';
    allChip.onclick = () => { state.purpose = ''; state.page = 1; render(); };
    chips.appendChild(allChip);
    purposes.forEach(p => {
      const c = document.createElement('button');
      c.className = 'chip';
      c.textContent = p;
      c.onclick = () => { state.purpose = (state.purpose === p ? '' : p); state.page = 1; render(); };
      chips.appendChild(c);
    });

    // 이벤트
    let t;
    document.getElementById('searchInput').addEventListener('input', e => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = e.target.value.trim(); state.page = 1; render(); }, 200);
    });
    sel.addEventListener('change', e => { state.dept = e.target.value; state.page = 1; render(); });
    document.getElementById('clearBtn').onclick = () => {
      state = { ...state, q: '', dept: '', purpose: '', page: 1 };
      document.getElementById('searchInput').value = '';
      sel.value = '';
      render();
    };
    document.getElementById('chartToggle').onclick = () => {
      state.chartExpanded = !state.chartExpanded;
      document.getElementById('chartToggle').textContent = state.chartExpanded ? '접기' : '전체 보기';
      renderChart();
    };

    render();
  }

  function getFiltered() {
    const q = state.q.toLowerCase();
    return rows.filter(r => {
      if (state.dept && r[F.dept] !== state.dept) return false;
      if (state.purpose && r[F.purpose] !== state.purpose) return false;
      if (q) {
        const hay = [r[F.loc], r[F.range], r[F.detail], r[F.dept]].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderChart() {
    const esc = Components.esc;
    const agg = {};
    rows.forEach(r => {
      const d = r[F.dept] || '미상';
      agg[d] = (agg[d] || 0) + (Number(r[F.count]) || 0);
    });
    const sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    const shown = state.chartExpanded ? sorted : sorted.slice(0, 10);
    const max = sorted[0][1];
    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    shown.forEach(([name, cnt]) => {
      const row = document.createElement('div');
      row.className = 'bar-row' + (state.dept === name ? ' active' : '');
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-label', `${name} ${cnt}대`);
      row.innerHTML = `
        <div class="bar-name">${esc(name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:0%"></div></div>
        <div class="bar-count">${cnt.toLocaleString()}대</div>`;
      const act = () => {
        state.dept = (state.dept === name ? '' : name);
        document.getElementById('deptSelect').value = state.dept;
        state.page = 1;
        render();
      };
      row.onclick = act;
      row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } };
      chart.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.bar-fill').style.width = (cnt / max * 100).toFixed(1) + '%';
      });
    });
    document.getElementById('chartToggle').style.display = sorted.length > 10 ? 'inline-block' : 'none';
  }

  function render() {
    const esc = Components.esc;
    renderChart();

    // 칩 상태 동기화
    document.querySelectorAll('#purposeChips .chip').forEach(c => {
      const isAll = c.textContent === '목적 전체';
      c.classList.toggle('on', isAll ? !state.purpose : c.textContent === state.purpose);
    });

    const filtered = getFiltered();
    const units = filtered.reduce((s, r) => s + (Number(r[F.count]) || 0), 0);
    document.getElementById('filteredCount').textContent = filtered.length.toLocaleString();
    document.getElementById('filteredUnits').textContent = ` · 총 ${units.toLocaleString()}대`;
    document.getElementById('clearBtn').style.display = (state.q || state.dept || state.purpose) ? 'inline' : 'none';

    // 페이지
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);

    document.getElementById('tbody').innerHTML = pageRows.map(r => {
      const purpose = r[F.purpose] || '-';
      const detail = r[F.detail] || '-';
      const tagClass = detail.includes('산불') ? 'fire' : (purpose === '범죄예방' ? 'warn' : '');
      return `<tr>
        <td>${esc(r[F.dept] || '-')}</td>
        <td>${esc(r[F.loc] || '-')}</td>
        <td class="num">${(Number(r[F.count]) || 0).toLocaleString()}</td>
        <td><span class="tag ${tagClass}">${esc(purpose)}</span></td>
        <td>${esc(r[F.range] || '-')}</td>
        <td>${esc(detail)}</td>
      </tr>`;
    }).join('');

    document.getElementById('emptyState').style.display = filtered.length ? 'none' : 'block';
    document.getElementById('dataTable').style.display = filtered.length ? 'table' : 'none';

    renderPager(totalPages);
  }

  function renderPager(totalPages) {
    const pager = document.getElementById('pager');
    pager.innerHTML = '';
    if (totalPages <= 1) return;
    const btn = (label, page, opts = {}) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (opts.cur) b.className = 'cur';
      if (opts.disabled) b.disabled = true;
      b.onclick = () => {
        state.page = page;
        render();
        document.getElementById('searchInput').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      pager.appendChild(b);
    };
    btn('‹', state.page - 1, { disabled: state.page === 1 });
    const win = 2;
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - state.page) <= win) pages.push(p);
    }
    let prev = 0;
    pages.forEach(p => {
      if (p - prev > 1) {
        const dots = document.createElement('span');
        dots.className = 'dots';
        dots.textContent = '…';
        pager.appendChild(dots);
      }
      btn(p, p, { cur: p === state.page });
      prev = p;
    });
    btn('›', state.page + 1, { disabled: state.page === totalPages });
  }

  load();
})();
