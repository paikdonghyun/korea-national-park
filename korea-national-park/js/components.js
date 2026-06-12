/**
 * 공통 레이아웃 컴포넌트
 * 각 페이지의 <header id="site-header">, <footer id="site-footer">를 채웁니다.
 * 메뉴는 config.js의 CONFIG.NAV에서 자동 생성됩니다.
 */
const Components = (() => {

  function renderHeader({ eyebrow, title, desc, compact = false } = {}) {
    const el = document.getElementById('site-header');
    if (!el) return;
    const current = location.pathname.split('/').pop() || 'index.html';
    const navHTML = CONFIG.NAV.map(item => {
      const active = item.href === current ? ' class="active"' : '';
      return `<a href="${item.href}"${active}>${item.label}</a>`;
    }).join('');

    el.className = compact ? 'compact' : '';
    el.innerHTML = `
      <nav class="topnav">
        <a class="brand" href="index.html">
          <svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2,22 L10,6 L15,14 L20,3 L30,22 Z" fill="currentColor"/></svg>
          ${CONFIG.SITE_NAME}
        </a>
        <button class="nav-toggle" aria-label="메뉴 열기" aria-expanded="false">☰</button>
        <div class="nav-links">${navHTML}</div>
      </nav>
      <div class="header-inner">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        ${title ? `<h1>${title}</h1>` : ''}
        ${desc ? `<p class="header-desc">${desc}</p>` : ''}
      </div>
      <div class="ridge" aria-hidden="true">
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none">
          <path d="M0,110 L0,70 L120,38 L230,72 L340,20 L470,68 L590,30 L720,75 L850,25 L980,62 L1100,15 L1230,58 L1340,35 L1440,65 L1440,110 Z" fill="#2E5944" opacity="0.45"/>
          <path d="M0,110 L0,88 L150,55 L290,85 L430,42 L580,80 L730,48 L880,86 L1030,40 L1180,78 L1320,52 L1440,82 L1440,110 Z" fill="#F2F5F0"/>
        </svg>
      </div>`;

    const toggle = el.querySelector('.nav-toggle');
    const links = el.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function renderFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = `
      자료 출처 : <span class="src">국립공원공단 공공데이터 (공공데이터포털 data.go.kr)</span>
      <br>본 사이트는 공공데이터를 활용한 비공식 정보 사이트입니다.`;
  }

  /** 로딩/오류 상태 표시 */
  function showLoading(msg = '데이터를 불러오는 중입니다…') {
    const el = document.getElementById('status-area');
    if (el) el.innerHTML = `<div class="loading"><div class="spinner" role="status" aria-label="불러오는 중"></div><p>${msg}</p></div>`;
  }
  function showError(message, retryFn) {
    const el = document.getElementById('status-area');
    if (!el) return;
    el.innerHTML = `
      <div class="error-box">
        <h3>데이터를 불러오지 못했습니다</h3>
        <p>${message} — 네트워크 상태를 확인한 뒤 다시 시도해 주세요.</p>
        <button id="retry-btn">다시 시도</button>
      </div>`;
    document.getElementById('retry-btn').onclick = retryFn;
  }
  function clearStatus() {
    const el = document.getElementById('status-area');
    if (el) el.innerHTML = '';
  }

  /** HTML 이스케이프 */
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  return { renderHeader, renderFooter, showLoading, showError, clearStatus, esc };
})();
