---
trigger: always_on
---

# 루미너스의원 코딩 규칙

## 1. 기술 스택

| 구분 | 기술 | 비고 |
| :--- | :--- | :--- |
| Framework | Astro (SSR) | Cloudflare Workers 어댑터 |
| UI Framework | Preact | 아일랜드 아키텍처 인터랙티브 컴포넌트용 (3KB, React API 호환) |
| Language | TypeScript | strict 모드 필수 |
| Styling | Tailwind CSS | 별도 CSS 파일 작성 금지 |
| Database | Cloudflare D1 | `database-info.md` 스키마 준수 |
| Storage | Cloudflare R2 | 이미지 전용 |
| Auth | Clerk | 자체 인증 로직 구현 금지, React SDK를 `preact/compat`으로 사용 |
| Email | Resend | 문의 메일 발송 |
| Animation | Motion One | 스크롤 애니메이션 |
| Image Opt. | browser-image-compression | 클라이언트 사이드 업로드 전 최적화 |

### 1.1 Preact 사용 전략 (하이브리드)

| 영역 | 전략 | 이유 |
| :--- | :--- | :--- |
| **퍼블릭 페이지** | 순수 Astro 우선, 필요 시 Preact 아일랜드 | 번들 최소화, 성능 극대화 |
| **관리자 페이지** | Preact 아일랜드 적극 활용 | 복잡한 폼, 상태 관리, 드래그 정렬 등 인터랙션 다수 |

- Preact 컴포넌트는 `.tsx` 확장자, Astro 컴포넌트에서 `client:load` / `client:visible` 디렉티브로 로드
- Clerk React SDK는 `preact/compat` 호환 레이어를 통해 사용
- 퍼블릭 페이지의 단순 인터랙션(탭 전환, 토글, 스크롤)은 Astro `<script>` 내 Vanilla JS/TS 유지

**금지:** jQuery, 서버 사이드 이미지 리사이징, Clerk 외 자체 인증, React 직접 사용 (Preact로 대체)

---

## 2. 디자인 규칙

- `html_resource/` HTML 파일이 **디자인 정본** → 레이아웃·스타일·애니메이션을 그대로 재현, 임의 변경 금지
- **컬러:** Background `#000000`, Primary(Gold) `#D4A017`, Dark `#B8860B`, Light `#F5D060` / 관리자: 밝은 배경, 사이드바 `#1a1a1a`
- **폰트:** 한글 `Noto Sans KR`(`font-kr`, 300~900), 영문 `Playfair Display`(`font-en`, 400/700+Italic)
- **반응형:** 모바일 퍼스트. 관리자 데스크탑=사이드바(240px)+콘텐츠, 모바일=하단 탭바+풀 너비. 테이블→카드, 사이드 패널→풀스크린 모달

---

## 3. 프로젝트 구조

### 3.1 디렉토리
```
luminus/
├── html_resource/            # 디자인 레퍼런스 (읽기 전용)
├── public/                   # 정적 파일 (favicon, robots.txt 등)
├── src/
│   ├── components/
│   │   ├── common/           # Header, Footer, BottomBar, MobileNav, Toast, Modal, SEOHead (.astro)
│   │   ├── home/             # HeroSlider 등 (.astro)
│   │   ├── clinic/           # DoctorCard, GalleryGrid, MapSection, BeforeAfter (.astro)
│   │   ├── lifting/          # EquipmentCard, SubNav (.astro)
│   │   ├── promotion/        # PromotionCard(.astro), CategoryTabs(.astro),
│   │   │                     # BottomSheet(.tsx), ReservationForm(.tsx)
│   │   └── admin/            # Preact 아일랜드 (.tsx): DataTable, FormModal, ConfirmModal,
│   │                         # ImageUploader, DragSortList, ToggleSwitch, Pagination
│   │                         # Astro (.astro): Sidebar, AdminHeader, StatsCard, StatusBadge
│   ├── layouts/
│   │   ├── BaseLayout.astro  # 사용자 (Header+Footer+BottomBar)
│   │   ├── AdminLayout.astro # 관리자 (Sidebar+콘텐츠)
│   │   └── AuthLayout.astro  # 인증 (중앙 카드형)
│   ├── pages/
│   │   ├── index.astro                  # /
│   │   ├── mypage.astro                 # /mypage
│   │   ├── clinic/
│   │   │   ├── doctors.astro            # /clinic/doctors
│   │   │   ├── tour.astro               # /clinic/tour
│   │   │   ├── location.astro           # /clinic/location
│   │   │   ├── equipment.astro          # /clinic/equipment
│   │   │   └── results.astro            # /clinic/results
│   │   ├── lifting/
│   │   │   ├── index.astro              # /lifting
│   │   │   ├── ulthera.astro            # /lifting/ulthera
│   │   │   ├── oligio.astro             # /lifting/oligio
│   │   │   └── inmode.astro             # /lifting/inmode
│   │   ├── promotion/index.astro        # /promotion
│   │   ├── notice/
│   │   │   ├── index.astro              # /notice
│   │   │   └── [id].astro               # /notice/:id (Dynamic Route)
│   │   ├── auth/
│   │   │   ├── login.astro              # /auth/login
│   │   │   └── register.astro           # /auth/register
│   │   ├── admin/
│   │   │   ├── index.astro              # /admin (대시보드)
│   │   │   ├── hero-slides.astro
│   │   │   ├── doctors.astro
│   │   │   ├── categories.astro
│   │   │   ├── promotions.astro
│   │   │   ├── reservations.astro
│   │   │   └── members.astro
│   │   └── api/
│   │       ├── contact.ts               # POST /api/contact
│   │       ├── auth/withdraw.ts         # POST /api/auth/withdraw
│   │       ├── webhooks/clerk.ts        # POST /api/webhooks/clerk
│   │       ├── public/                  # 인증 불필요
│   │       │   ├── hero-slides.ts
│   │       │   ├── doctors.ts
│   │       │   ├── categories.ts
│   │       │   └── promotions.ts
│   │       └── admin/                   # Clerk 인증 + admin role 필수
│   │           ├── upload.ts            # POST/DELETE (R2)
│   │           ├── hero-slides/         # index.ts, [id].ts, reorder.ts
│   │           ├── doctors/             # index.ts, [id].ts, reorder.ts
│   │           ├── categories/          # index.ts, [id].ts, reorder.ts
│   │           ├── promotions/          # index.ts, [id].ts, reorder.ts
│   │           ├── reservations/        # index.ts, [id]/index.ts, [id]/status.ts, [id]/memo.ts
│   │           └── members/             # index.ts, [id]/role.ts, [id]/active.ts
│   ├── lib/
│   │   ├── types.ts          # D1 테이블 인터페이스 + API 응답 타입
│   │   ├── db.ts             # D1 헬퍼 (커넥션, 쿼리 빌더)
│   │   ├── r2.ts             # R2 업로드/삭제 유틸
│   │   ├── auth.ts           # Clerk 인증/권한 검증 헬퍼
│   │   ├── email.ts          # Resend 발송 유틸
│   │   ├── format.ts         # 가격·날짜·전화번호 포맷
│   │   └── constants.ts      # 상수 (상태 enum, 기본값)
│   ├── middleware.ts          # Clerk 인증 + 관리자 권한 체크
│   └── styles/global.css      # Tailwind 디렉티브 + 글로벌 CSS 변수
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── wrangler.toml              # D1/R2 바인딩
├── package.json
└── .env                       # git 추적 제외
```

### 3.2 파일 네이밍

| 대상 | 규칙 | 예시 |
| :--- | :--- | :--- |
| Astro 컴포넌트 | `PascalCase.astro` | `HeroSlider.astro` |
| Preact 컴포넌트 | `PascalCase.tsx` | `ImageUploader.tsx`, `DragSortList.tsx` |
| Astro 페이지 | `kebab-case.astro` | `hero-slides.astro` |
| API 엔드포인트 | `kebab-case.ts` | `hero-slides.ts` |
| Dynamic Route | `[param].astro` / `[param].ts` | `[id].astro` |
| TS 유틸리티 | `kebab-case.ts` | `format.ts` |
| 설정 파일 | 프레임워크 관례 | `astro.config.mjs` |

### 3.3 폴더 사용 규칙
- `components/admin/` — 관리자 전용, 사용자 페이지에서 import 금지
- `components/common/` — 양쪽에서 재사용하는 범용 UI
- `components/{home,clinic,lifting,promotion}/` — 각 섹션 전용
- API: 리소스 단위 폴더, `index.ts`=GET+POST, `[id].ts`=PUT+DELETE, `reorder.ts`=PATCH(정렬), 하위 액션=`[id]/action.ts`
- `lib/` 각 파일은 단일 책임 (types, db, r2, auth, email, format, constants)

---

## 4. 코드 작성 규칙

- TypeScript `strict` 모드, `any` 금지, D1 테이블 인터페이스를 `lib/types.ts`에 정의
- 컴포넌트 props에 TypeScript 인터페이스 필수
- 서버 데이터 fetching은 frontmatter(`---` 블록)에서 처리
- Tailwind 유틸리티 클래스 우선, 인라인 style 최소화, arbitrary value `[]` 활용
- `html_resource/` 스타일 → Tailwind 변환 시 시각적 결과물 동일 필수

### 4.1 Astro vs Preact 컴포넌트 구분

| 상황 | 사용 기술 | 예시 |
| :--- | :--- | :--- |
| 정적 레이아웃, 서버 렌더링 | `.astro` 컴포넌트 | Header, Footer, SEOHead, 페이지 레이아웃 |
| 단순 클라이언트 인터랙션 | `.astro` + `<script>` Vanilla JS | 모바일 메뉴 토글, 스크롤 애니메이션 |
| 복잡한 상태 관리/폼 | Preact `.tsx` 아일랜드 | 관리자 CRUD 폼, 드래그 정렬, 이미지 업로더, 예약 바텀시트 |
| Clerk 인증 UI | Preact `.tsx` (`preact/compat`) | `<SignIn>`, `<SignUp>`, `<UserButton>` |

### 4.2 Preact 아일랜드 디렉티브

| 디렉티브 | 용도 |
| :--- | :--- |
| `client:load` | 페이지 로드 즉시 필요한 컴포넌트 (Clerk 인증 UI, 관리자 폼) |
| `client:visible` | 뷰포트 진입 시 로드 (프로모션 카드, 바텀시트) |
| `client:idle` | 브라우저 유휴 시 로드 (우선순위 낮은 인터랙티브 요소) |

---

## 5. DB 규칙

- **Prepared Statement 필수** — `db.prepare("... WHERE id = ?").bind(id)`, 문자열 보간 금지
- `database-info.md` 스키마 정확히 준수, 변경 시 명세서 먼저 업데이트
- 날짜: ISO 8601 TEXT / 불리언: INTEGER 0/1 / JSON: TEXT + `JSON.stringify()` / 정렬: `sort_order` INTEGER / 가격: 원 단위 INTEGER

---

## 6. API 규칙

- 공개: `/api/public/*` (인증 불필요) / 인증: `/api/auth/*` / 관리자: `/api/admin/*` (Clerk+admin) / Webhook: `/api/webhooks/*`
- 응답: `{ success: true, data: T }` 또는 `{ success: false, error: "메시지" }`
- HTTP 코드: 200, 201, 400, 401, 403, 404, 500 정확히 사용
- 페이지네이션: `?page=1&limit=20`, 응답에 `total`, `page`, `totalPages` 포함

---

## 7. 인증 규칙

- Clerk 컴포넌트 사용 (`<SignIn>`, `<SignUp>`, `<UserButton>`), 미들웨어 `clerkMiddleware()`
- D1 연동: Clerk `userId` → `users.clerk_id`로 앱 데이터 조회

| 경로 | 인증 |
| :--- | :--- |
| `/auth/*`, `/api/public/*` | 불필요 |
| `/mypage`, `/api/auth/*` | Clerk 인증 필수 |
| `/admin/*`, `/api/admin/*` | Clerk 인증 + `role='admin'` (이중 검증) |

검증 실패: 미로그인→`/auth/login` 리다이렉트, 권한 없음→403 또는 홈 리다이렉트

---

## 8. 이미지 처리

1. 파일 선택/드래그&드롭 → `browser-image-compression` 최적화 (PC: 1920px/0.8, 모바일: 768px/0.75, WebP) → `/api/admin/upload` POST → R2 저장 → URL을 DB에 저장
2. 허용: JPG, PNG, WebP, GIF / 최대 10MB / R2 경로: `{테이블명}/{id}/{timestamp}.webp`
3. 이미지 교체·레코드 삭제 시 이전 R2 파일 삭제 필수

---

## 9. UI/UX 패턴

**관리자:**
- 목록=테이블+필터/검색+페이지네이션, 추가/수정=모달/슬라이드 패널, 삭제=확인 모달 필수
- 드래그 정렬(`sort_order`), 토글 스위치(`is_active`)
- 피드백: 성공=초록 토스트(2초), 실패=빨간 토스트+에러 메시지, 로딩=버튼 스피너+비활성화

**사용자:**
- 전후사진 비로그인 시 블러 처리 (의료법), 가격 콤마 포맷 + 할인율 표시
- 프로모션 예약: 체크박스 선택 → 바텀시트 확인 → 예약 폼 제출 (2단계)

---

## 10. SEO

- 모든 페이지: 동적 `<title>`, `<meta description>`, OG 태그(`og:title/description/image`), Canonical URL
- JSON-LD: `LocalBusiness`, `Service`, `Article` 스키마
- 이미지 `alt` 필수 (관리자 입력 제목 자동 할당)

---

## 11. 배포·환경·보안

- Cloudflare Workers 무료 플랜 최적화, D1/R2는 Workers 바인딩 접근
- `.env` git 커밋 금지, 시크릿 하드코딩 금지
- 필수 환경변수: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- 모든 API에 try-catch, 에러 메시지 한국어, 서버 에러 상세는 콘솔만 로깅
- SQL Prepared Statement 필수, Webhook 서명 검증 필수, 파일 업로드 MIME/확장자 검증
- SSG 가능 페이지는 SSG 빌드, WebP 서빙, 클라이언트 JS 최소화, SELECT 시 필요 컬럼만 조회
