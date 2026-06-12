# 국립공원 정보 사이트

국립공원공단 공공데이터(공공데이터포털 data.go.kr)를 활용해 국립공원 정보를 보여주는 정적 웹사이트입니다.
서버나 빌드 과정 없이 순수 HTML/CSS/JavaScript로 동작하며, GitHub Pages로 바로 배포할 수 있습니다.

## 현재 제공 콘텐츠

| 페이지 | 설명 | 데이터 출처 |
|---|---|---|
| 홈 (`index.html`) | 콘텐츠 메뉴와 전체 현황 요약 | - |
| CCTV 현황 (`cctv.html`) | 설치 위치·대수·목적 검색, 사무소별 통계 차트 | 국립공원공단_국립공원 CCTV 설치 현황 (기준일 2020-12-31) |

## 프로젝트 구조

```
.
├── index.html           # 홈
├── cctv.html            # CCTV 설치 현황
├── css/
│   └── style.css        # 공통 스타일 (디자인 토큰 포함)
└── js/
    ├── config.js        # API 키·데이터셋·메뉴 설정 ★ 확장 시 여기부터
    ├── api.js           # 공공데이터 API 공통 모듈 (페이지 수집 + 캐싱)
    ├── components.js    # 공통 헤더/네비/푸터/로딩/오류 컴포넌트
    └── pages/
        ├── home.js      # 홈 페이지 로직
        └── cctv.js      # CCTV 페이지 로직
```

## 로컬에서 실행

정적 사이트이므로 간단한 HTTP 서버만 있으면 됩니다.

```bash
# Python이 있는 경우
python3 -m http.server 8000

# Node.js가 있는 경우
npx serve .
```

브라우저에서 `http://localhost:8000` 접속.

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다 (예: `korea-national-park`).
2. 이 프로젝트를 푸시합니다.

```bash
git init
git add .
git commit -m "국립공원 정보 사이트 초기 버전"
git branch -M main
git remote add origin https://github.com/<사용자명>/korea-national-park.git
git push -u origin main
```

3. 저장소 **Settings → Pages → Source**에서 `main` 브랜치 / 루트(`/`)를 선택합니다.
4. 잠시 후 `https://<사용자명>.github.io/korea-national-park/`에서 사이트가 열립니다.

## 새 페이지(콘텐츠) 추가하는 방법

확장성을 고려해 페이지 추가가 3단계로 끝나도록 설계되어 있습니다.

1. **데이터셋 등록** — `js/config.js`의 `DATASETS`에 API 정보를 추가합니다.

```js
trails: {
  label: '국립공원 탐방로 현황',
  url: 'https://api.odcloud.kr/api/XXXXXXX/v1/uddi:...',
  perPage: 1000,
  fields: { name: '탐방로명', length: '거리', ... }
}
```

2. **메뉴 등록** — 같은 파일의 `NAV` 배열에 한 줄 추가합니다.

```js
{ href: 'trails.html', label: '탐방로' }
```

3. **페이지 생성** — `cctv.html` + `js/pages/cctv.js`를 복사해 수정합니다.
   데이터 호출은 한 줄이면 됩니다:

```js
const rows = await ParkAPI.fetchAll('trails');
```

공통 헤더/푸터/로딩/오류 처리는 `Components`가 알아서 처리하므로 페이지 로직에만 집중하면 됩니다.

## API 키 관련 안내

- `js/config.js`에 들어있는 키는 공공데이터포털의 **일반 인증키**로, 공공데이터 특성상 클라이언트 노출이 일반적이지만 공개 저장소에 올라간다는 점은 알고 계셔야 합니다.
- 키를 숨기고 싶거나 트래픽 제한이 걱정되면 Cloudflare Workers, Vercel Functions 같은 무료 서버리스 프록시를 중간에 두는 방법이 있습니다.
- 키가 노출되어 문제가 생기면 공공데이터포털 마이페이지에서 키를 재발급(기존 키 폐기)할 수 있습니다.

## 데이터 출처

- [공공데이터포털 — 국립공원공단_국립공원 CCTV 설치 현황](https://www.data.go.kr/data/15080813/fileData.do)

본 사이트는 공공데이터를 활용한 비공식 정보 사이트입니다.
