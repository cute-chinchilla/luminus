---
trigger: always_on
---

# 프로젝트 요구사항 정의서 (PRD) - LUMINUS 통합 플랫폼

## 1. 프로젝트 개요

- **프로젝트명:** 루미너스(LUMINUS) 차세대 클리닉 웹 플랫폼 구축
- **브랜드 슬로건:** 맑고 깨끗한 아름다움의 시작, 루미너스

### 핵심 목표
- **Astro 이식:** 기존 디자인된 HTML 파일들을 Astro 컴포넌트로 완벽 이식 및 성능 최적화
- **데이터 연동:** Cloudflare D1(DB)과 R2(Storage)를 연동하여 시술 정보 및 공지사항의 동적 관리
- **이미지 최적화:** 클라이언트 사이드 이미지 최적화 (업로드 전 브라우저 단에서 리사이징 및 압축 수행)
- **사용자 경험:** 모바일 및 데스크탑 환경에서 끊김 없는 프리미엄 사용자 경험 제공

---

## 2. 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 비고 |
| :--- | :--- | :--- |
| **Framework** | `Astro` | 고성능 정적 생성(SSG) 및 아일랜드 아키텍처 |
| **UI Framework** | `Preact` | 아일랜드 아키텍처 인터랙티브 컴포넌트용 (3KB, React API 호환) |
| **Language** | `TypeScript` | 코드 안정성 및 유지보수성 확보 |
| **Styling** | `Tailwind CSS` | 기존 HTML 스타일의 신속한 이식 |
| **Database** | `Cloudflare D1` | 프로모션, 예약 정보, 연혁 등 저장 |
| **Storage** | `Cloudflare R2` | 최적화된 이미지(PC용, 모바일용) 보관 |
| **Optimization**| `browser-image-compression` | 관리자 페이지 내 클라이언트 사이드 압축 라이브러리 |
| **Backend** | `Cloudflare Workers`| 단순 파일 서빙 및 API 로직 처리 (무료 플랜 최적화) |
| **Auth** | `Clerk` | 회원가입, 로그인, 세션 관리 등 인증 전반 처리 (React SDK를 `preact/compat`으로 사용) |
| **Email** | `Resend` | 문의 메일 발송 |
| **Animation** | `Motion One` | 기존 디자인의 역동성을 살린 스크롤 애니메이션 |

### Preact 도입 전략
- **퍼블릭 페이지:** 순수 Astro 컴포넌트 우선, 복잡한 인터랙션(바텀시트, 예약 폼 등)만 Preact 아일랜드로 구현
- **관리자 페이지:** CRUD 폼, 드래그 정렬, 이미지 업로더 등 복잡한 상태 관리가 필요한 UI를 Preact `.tsx` 아일랜드로 구현
- **선택 이유:** React 문법 호환(JSX/TSX)이면서 번들 사이즈 약 3KB로 Cloudflare Workers 무료 플랜의 CPU/번들 크기 제약에 최적화

---

## 3. 이미지 최적화 전략 (Client-side Pre-processing)

클라우드플레어 유료 플랜(Images 등) 없이도 최상의 성능을 내기 위해, 이미지를 서빙할 때가 아니라 **업로드할 때(Admin-side)** 미리 처리하는 방식을 채택합니다.

- **업로드 전 처리:** 관리자 페이지에서 `browser-image-compression`을 이용해 'PC용', '모바일용' 사이즈로 자동 변환 및 WebP 압축을 수행합니다.
- **R2 저장:** 최적화된 파일들을 R2에 저장하고, 워커(Workers)는 리사이징 로직 없이 파일 전달만 수행합니다.

---

## 4. SEO 전략 (Search Engine Optimization)

검색 엔진 노출 극대화 및 사용자 공유 경험 향상을 위해 다음의 기술적 SEO 요구사항을 적용합니다.

- **동적 메타 데이터 생성:**
  - 각 시술 및 공지 상세 페이지 진입 시, D1 DB에서 제목과 요약 정보를 불러와 `<title>`, `<meta name="description">`을 실시간으로 생성합니다.
  - 카카오톡, 페이스북 공유 시 최적의 미리보기를 제공하도록 Open Graph 태그(`og:title`, `og:description`, `og:image`)를 동적으로 구성합니다.
- **JSON-LD 구조화 데이터:**
  - 병원 정보(`LocalBusiness`), 시술 서비스(`Service/Product`), 게시글(`Article`)에 대한 스키마 마크업을 적용하여 구글 검색 결과에서 리치 결과(Rich Results) 노출을 유도합니다.
- **Canonical URL 관리:**
  - 검색 엔진이 중복 페이지로 오인하지 않도록 각 페이지에 대표 URL(Canonical Tag)을 명시합니다.
- **이미지 Alt 태그 자동화:**
  - 관리자가 이미지 업로드 시 입력한 제목을 HTML `alt` 속성에 자동으로 할당하여 시각 장애인 접근성 개선 및 이미지 검색 노출을 강화합니다.

---

## 5. 디자인 레퍼런스 (`html_resource/`)

`html_resource/` 폴더에 이미 디자인이 완성된 HTML 파일들이 있습니다.
Astro 이식 시 이 파일들의 **레이아웃, 컴포넌트 구조, 스타일, 애니메이션을 그대로 재현**해야 합니다.

| 파일 | 대응 페이지 | 설명 |
| :--- | :--- | :--- |
| `index.html` | 메인 (홈) | 히어로 슬라이더, 섹션 구성, 전체 레이아웃 |
| `doctors.html` | 의료진 소개 | 의료진 카드, hover 효과, 약력 표시 |
| `promotion.html` | 프로모션/예약 | 카테고리 탭, 시술 카드, 바텀시트, 예약 폼 |
| `equipment.html` | 리프팅 센터 목록 | 장비 카드 그리드 (2×4) |
| `ulthera.html` | 울쎄라 상세 | 시술 상세 레이아웃, 서브 네비게이션 |
| `oligio.html` | 올리지오 상세 | 시술 상세 레이아웃, 서브 네비게이션 |
| `inmode.html` | 인모드 상세 | 시술 상세 레이아웃, 서브 네비게이션 |
| `tour.html` | 둘러보기 | 병원 인테리어 갤러리 |
| `location.html` | 오시는 길 | 지도, 교통편 정보 |
| `results.html` | 전후사진 | 시술 전/후 비교 갤러리, 블러 처리 |
| `common.css` | 공통 스타일 | 전체 CSS 변수, 컴포넌트 스타일 |
| `common.js` | 공통 JS | 네비게이션, 스크롤, 공통 인터랙션 |

> **중요:** 새 페이지를 만들 때는 반드시 해당 HTML 파일을 먼저 읽고, 동일한 디자인/구조를 Astro + Tailwind CSS로 구현하세요.

---

## 6. 디자인 시스템 (기존 디자인 준수)

- **디자인 원칙:** `html_resource/` 폴더의 HTML 파일에 구현된 UI/UX 및 레이아웃을 최우선으로 계승합니다.
- **컬러 시스템:**
  - **Background:** `#000000` (Main Black)
  - **Point Color (Primary):** `DEFAULT`: `#D4A017` (Gold), `dark`: `#B8860B`, `light`: `#F5D060`
- **Typography (Google Fonts 로드):**
  - **1. Noto Sans KR (한글 본문용)**
    - 사용 굵기: 300(Light), 400(Regular), 500(Medium), 700(Bold), 900(Black)
    - Tailwind 클래스: `font-kr`
  - **2. Playfair Display (영문 타이틀용 / 세리프체)**
    - 사용 굵기: 400(Regular), 700(Bold) + Italic
    - Tailwind 클래스: `font-en`