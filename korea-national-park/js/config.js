/**
 * 사이트 전역 설정
 * 새 공공데이터 API를 추가하려면 DATASETS에 항목을 등록하세요.
 */
const CONFIG = {
  SITE_NAME: '국립공원 정보',

  // 공공데이터포털 일반 인증키 (Decoding)
  SERVICE_KEY: 'c0f61c8beabf823840c7b03833cecef9a2d6666e7993796f078a97ca5d5f869c',

  // odcloud(공공데이터포털 표준) API 데이터셋 레지스트리
  DATASETS: {
    cctv: {
      label: '국립공원 CCTV 설치 현황',
      url: 'https://api.odcloud.kr/api/15080813/v1/uddi:96cc1b97-90e3-4ad3-a503-bf58fa1954ed',
      perPage: 1000,
      baseDate: '2020-12-31',
      // 응답 필드명이 길어서 별칭으로 매핑
      fields: {
        dept: '담당부서',
        count: '대수',
        loc: '위치',
        range: '촬영범위',
        purpose: '설치목적(공개장소일 경우에만 작성)',
        detail: '세부목적(청사보안, 무인계도, 산불감시 등 자세하게 작성)'
      }
    }
    // 예시) 새 데이터셋 추가:
    // trails: {
    //   label: '국립공원 탐방로 현황',
    //   url: 'https://api.odcloud.kr/api/XXXXXXX/v1/uddi:...',
    //   perPage: 1000,
    //   fields: { ... }
    // }
  },

  // 상단 메뉴 — 페이지를 추가하면 여기에 한 줄만 등록
  NAV: [
    { href: 'index.html', label: '홈' },
    { href: 'cctv.html', label: 'CCTV 현황' }
    // { href: 'trails.html', label: '탐방로' },
    // { href: 'weather.html', label: '날씨' },
  ]
};
