/** 홈 페이지: 헤더 렌더 + CCTV 데이터 요약 통계 */
(async function () {
  Components.renderHeader({
    eyebrow: '국립공원공단 공공데이터',
    title: '숲과 산의 데이터를<br>한 곳에서',
    desc: '대한민국 국립공원의 공공데이터를 모아 누구나 쉽게 살펴볼 수 있도록 정리한 사이트입니다.'
  });
  Components.renderFooter();

  const F = CONFIG.DATASETS.cctv.fields;

  async function load() {
    Components.showLoading('현황 데이터를 불러오는 중입니다…');
    try {
      const rows = await ParkAPI.fetchAll('cctv');
      Components.clearStatus();

      const totalUnits = rows.reduce((s, r) => s + (Number(r[F.count]) || 0), 0);
      const depts = new Set(rows.map(r => r[F.dept]).filter(Boolean));

      document.getElementById('statTotal').innerHTML = totalUnits.toLocaleString() + '<span class="unit">대</span>';
      document.getElementById('statSpots').innerHTML = rows.length.toLocaleString() + '<span class="unit">곳</span>';
      document.getElementById('statDepts').innerHTML = depts.size.toLocaleString() + '<span class="unit">개</span>';
      document.getElementById('home-stats').style.display = 'grid';
    } catch (err) {
      Components.showError(Components.esc(err.message), load);
    }
  }
  load();
})();
