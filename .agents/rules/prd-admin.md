---
trigger: always_on
---

# 루미너스의원 관리자 페이지 기능 명세서 (Admin Panel PRD)

본 문서는 루미너스의원 **관리자 페이지(`/admin/*`)** 전용 기능 명세서입니다.
일반 사용자 대상 인증/마이페이지/문의 등은 `prd-page.md`를 참조하세요.

> **디자인 레퍼런스:** `html_resource/` 폴더에 이미 완성된 사용자 페이지 HTML 디자인이 있습니다. 관리자 페이지에서 관리하는 콘텐츠가 사용자 페이지에 어떻게 표시되는지 파악하려면 해당 HTML 파일을 참조하세요.

---

## 1. 개요

### 1.1 목적
- 루미너스의원 웹사이트의 동적 콘텐츠(히어로 슬라이더, 의료진, 프로모션, 예약)를 비개발자도 쉽게 관리할 수 있는 관리자 인터페이스 제공

### 1.2 기술 스택
| 구분 | 기술 | 비고 |
| :--- | :--- | :--- |
| **Framework** | Astro (SSR 모드) | Cloudflare Workers 어댑터 |
| **UI Framework** | Preact (`.tsx` 아일랜드) | 폼, 드래그 정렬, 이미지 업로더 등 복잡한 인터랙티브 UI |
| **Styling** | Tailwind CSS | 기존 프론트엔드와 동일한 디자인 시스템 활용 |
| **인증** | Clerk | 사용자/관리자 통합 인증 + 세션 관리 (React SDK를 `preact/compat`으로 사용) |
| **이미지 최적화** | `browser-image-compression` | 업로드 전 클라이언트 사이드에서 PC/모바일용 자동 리사이징 및 WebP 변환 |
| **Storage** | Cloudflare R2 | 이미지 파일 저장 |
| **Database** | Cloudflare D1 | 모든 콘텐츠 데이터 저장 |

> **관리자 UI 구현 원칙:** 레이아웃(Sidebar, AdminHeader)은 `.astro` 컴포넌트, CRUD 폼/데이터 테이블/드래그 정렬 등 상태가 복잡한 UI는 Preact `.tsx` 아일랜드로 구현하여 `client:load` 디렉티브로 로드

### 1.3 접근 경로
- 관리자: `/admin` (대시보드) — Clerk 인증 + `role = 'admin'` 검증으로 보호

---

## 2. 관리자 인증

### 2.1 Clerk 기반 관리자 인증
| 항목 | 내용 |
| :--- | :--- |
| **보호 범위** | `/admin/*` 경로 전체 |
| **인증 흐름** | 1) `/admin` 접근 → 2) Clerk 미들웨어에서 로그인 상태 확인 (미로그인 시 `/auth/login` 리다이렉트) → 3) Clerk `userId`로 D1 `users` 테이블에서 `role = 'admin'` 확인 → 4) 관리자 페이지 접근 허용 |
| **권한 없음** | 로그인 상태이나 `role ≠ admin`인 경우 403 또는 홈으로 리다이렉트 |
| **최초 관리자** | `ADMIN_EMAILS` 환경변수에 등록된 이메일로 가입하면 자동으로 `role = 'admin'` 부여. 이후 관리자 추가/해제는 관리자 페이지 내 **회원 관리** 메뉴에서 처리 |

### 2.2 인증 미들웨어 (관리자 경로)
| 경로 | 검증 방식 |
| :--- | :--- |
| `/admin/*` | Clerk 인증 확인 + D1 `users.role = 'admin'` 확인 |
| `/api/admin/*` | Clerk 인증 확인 + D1 `users.role = 'admin'` 확인 |

---

## 3. 대시보드 (`/admin`)

### 3.1 요약 카드 영역
상단에 핵심 지표를 카드 형태로 표시합니다.

| 카드 | 데이터 소스 | 표시 내용 |
| :--- | :--- | :--- |
| **오늘의 예약** | `reservations` WHERE `booking_date` = TODAY | 건수 |
| **신규 예약 (미확인)** | `reservations` WHERE `status` = 'pending' | 건수 (강조 표시) |
| **활성 프로모션** | `promotions` WHERE `is_active` = 1 | 개수 |
| **등록 의료진** | `doctors` WHERE `is_active` = 1 | 명수 |

### 3.2 최근 예약 목록
- `reservations` 테이블에서 최근 5건을 테이블 형태로 표시
- 표시 컬럼: 예약일, 시간, 예약자명, 연락처, 상태 뱃지
- "전체보기" 링크 → `/admin/reservations`로 이동

### 3.3 사이드바 네비게이션
관리자 페이지 전역에 좌측 사이드바(모바일: 상단 탭바)를 제공합니다.

| 메뉴 | 경로 | 아이콘 |
| :--- | :--- | :--- |
| 대시보드 | `/admin` | `fa-tachometer-alt` |
| 히어로 슬라이더 | `/admin/hero-slides` | `fa-images` |
| 의료진 관리 | `/admin/doctors` | `fa-user-md` |
| 프로모션 카테고리 | `/admin/categories` | `fa-tags` |
| 프로모션 관리 | `/admin/promotions` | `fa-gift` |
| 예약 관리 | `/admin/reservations` | `fa-calendar-check` |
| 회원 관리 | `/admin/members` | `fa-users` |

---

## 4. 히어로 슬라이더 관리 (`/admin/hero-slides`)

> 대응 테이블: `hero_slides`
> 연동 페이지: `index.html` 메인 히어로 섹션

### 4.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 순서(sort_order), 썸네일(image_url), 서브타이틀, 메인타이틀, 활성 상태 토글, 액션 버튼 |
| **정렬** | `sort_order` ASC |
| **드래그 정렬** | 드래그&드롭으로 `sort_order` 일괄 변경 가능 |
| **인라인 토글** | `is_active` 스위치로 즉시 활성/비활성 전환 |

### 4.2 추가/수정 폼
| 필드 | 입력 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| **배경 이미지** | 이미지 업로드 (드래그&드롭 / 파일선택) | O | 업로드 시 PC용(1920px), 모바일용(768px) 자동 리사이징 + WebP 변환 → R2 저장 |
| **서브타이틀** | text input | O | 예: "피부 본연의 아름다움을 되살리는 루미너스의원" |
| **메인타이틀** | textarea | O | 줄바꿈은 `\n`으로 저장. 예: "PREMIUM\nSKIN CLINIC" |
| **설명 문구** | text input | O | 예: "만족도 높은 고품격 프리미엄 서비스를 제공합니다." |
| **활성 여부** | 토글 스위치 | O | 기본값: 활성 |

### 4.3 삭제
- 삭제 버튼 클릭 → 확인 모달("정말 삭제하시겠습니까?") → 확인 시 DB 삭제 + R2 이미지 파일 삭제

---

## 5. 의료진 관리 (`/admin/doctors`)

> 대응 테이블: `doctors`
> 연동 페이지: `doctors.html`

### 5.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 순서, 프로필 사진 썸네일, 이름, 직함, 활성 상태 토글, 액션 버튼 |
| **정렬** | `sort_order` ASC |
| **드래그 정렬** | 지원 |

### 5.2 추가/수정 폼
| 필드 | 입력 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| **이름** | text input | O | 예: "김루미 원장" |
| **직함** | select (대표원장 / 원장) | O | 기본값: "원장" |
| **프로필 사진** | 이미지 업로드 | O | PC용/모바일용 자동 최적화 → R2 저장 |
| **전문 분야** | textarea | O | hover 시 표시. 줄바꿈 `\n` 지원 |
| **약력** | 동적 리스트 (추가/삭제 가능) | O | JSON 배열로 저장. 각 항목은 text input |
| **활성 여부** | 토글 스위치 | O | 기본값: 활성 |

### 5.3 약력 입력 UI
- "약력 추가" 버튼 클릭 → 새 text input 행 추가
- 각 행에 삭제(X) 버튼
- 드래그로 순서 변경 가능
- 저장 시 `["약력1", "약력2", ...]` JSON 배열로 `credentials` 컬럼에 저장

---

## 6. 프로모션 카테고리 관리 (`/admin/categories`)

> 대응 테이블: `promotion_categories`
> 연동 페이지: `promotion.html` 상단 카테고리 탭

### 6.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 순서, 카테고리명, 소속 프로모션 수, 활성 상태 토글, 액션 버튼 |
| **정렬** | `sort_order` ASC |
| **드래그 정렬** | 지원 |
| **소속 프로모션 수** | `promotions` 테이블에서 해당 `category_id` 카운트 |

### 6.2 추가/수정 폼
| 필드 | 입력 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| **카테고리명** | text input | O | 예: "소프웨이브 런칭", "3월 이벤트" |
| **활성 여부** | 토글 스위치 | O | 기본값: 활성 |

### 6.3 삭제
- 해당 카테고리에 소속된 프로모션이 있으면 삭제 불가 (안내 메시지 표시)
- 또는 확인 모달에서 "소속 프로모션 N개도 함께 삭제됩니다" 경고 후 CASCADE 삭제

---

## 7. 프로모션 관리 (`/admin/promotions`)

> 대응 테이블: `promotions`
> 연동 페이지: `promotion.html` 시술 카드 목록

### 7.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 순서, 뱃지, 시술명, 카테고리, 판매가, 정가, 할인율, 활성 상태 토글, 액션 버튼 |
| **필터** | 카테고리별 필터 드롭다운 |
| **정렬** | `sort_order` ASC (카테고리 내) |
| **드래그 정렬** | 동일 카테고리 내 지원 |

### 7.2 추가/수정 폼
| 필드 | 입력 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| **카테고리** | select (promotion_categories에서 동적 로드) | O | 소속 카테고리 선택 |
| **시술명** | text input | O | 예: "[소프웨이브 런칭] 50펄스" |
| **설명** | text input | O | 예: "입가 / 눈가 / 목" |
| **판매가** | number input | O | 원 단위 (예: 490000) |
| **정가** | number input | O | 원 단위 (예: 750000) |
| **할인율** | number input (자동 계산 가능) | O | %. 판매가/정가 입력 시 자동 계산 옵션 제공 |
| **뱃지 텍스트** | text input | X | 카드 상단 뱃지. 예: "BEST 패키지" |
| **추가 안내** | textarea | X | 예: "※ 엘라비에 리투오 추가 시..." |
| **활성 여부** | 토글 스위치 | O | 기본값: 활성 |

### 7.3 할인율 자동 계산
- 판매가와 정가를 입력하면 `할인율 = Math.round((1 - 판매가/정가) * 100)` 자동 계산
- 수동 입력도 가능 (자동 계산 vs 수동 입력 토글)

### 7.4 가격 표시 포맷
- 입력 시: 숫자만 입력 (콤마 자동 포맷팅)
- 저장 시: 정수 (원 단위)

---

## 8. 예약 관리 (`/admin/reservations`)

> 대응 테이블: `reservations`
> 데이터 소스: `promotion.html` 예약 폼에서 고객이 제출

### 8.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 예약ID, 예약자명, 연락처, 희망일자, 희망시간, 선택 시술(요약), 합계 금액, 상태 뱃지, 신청일시 |
| **필터** | 상태별 탭 (전체 / 대기중 / 확정 / 취소 / 완료) |
| **날짜 필터** | 예약일자(booking_date) 기준 날짜 범위 검색 |
| **검색** | 예약자명 또는 연락처 키워드 검색 |
| **정렬** | `created_at` DESC (기본: 최신순) |
| **페이지네이션** | 한 페이지 20건, 이전/다음 버튼 |

### 8.2 상태 뱃지 컬러
| 상태 | 값 | 뱃지 색상 | 한글 표시 |
| :--- | :--- | :--- | :--- |
| 대기중 | `pending` | 노란색 (warning) | 대기중 |
| 확정 | `confirmed` | 파란색 (info) | 확정 |
| 취소 | `cancelled` | 빨간색 (danger) | 취소 |
| 완료 | `completed` | 초록색 (success) | 완료 |

### 8.3 상세/수정 화면
예약 목록에서 행 클릭 또는 "상세" 버튼 클릭 시 상세 패널(사이드 슬라이드 또는 모달)을 표시합니다.

| 영역 | 내용 |
| :--- | :--- |
| **고객 정보** | 예약자명, 연락처 (전화 바로걸기 링크) |
| **예약 정보** | 희망일자, 희망시간, 예약 내용(고객 메시지) |
| **선택 시술** | `items_json` 파싱하여 시술명 + 가격 리스트 표시 |
| **합계 금액** | `total_price` 포맷팅하여 표시 |
| **상태 변경** | 드롭다운으로 상태 즉시 변경 (pending → confirmed / cancelled / completed) |
| **관리자 메모** | textarea로 `memo` 필드 편집 및 저장 |
| **타임라인** | 신청일시(`created_at`), 최근 수정일시(`updated_at`) 표시 |

### 8.4 예약 상태 변경 로직
- 상태 변경 시 `status` 업데이트 + `updated_at` 갱신
- 상태 변경 이력은 별도 관리하지 않음 (향후 확장 가능)

---

## 9. 회원 관리 (`/admin/members`)

> 대응 테이블: `users`
> 관리자가 회원 목록을 조회하고, 다른 회원에게 관리자 권한을 부여/해제할 수 있습니다.

### 9.1 목록 화면
| 항목 | 내용 |
| :--- | :--- |
| **표시 컬럼** | 이름, 이메일 (Clerk에서 조회), 역할 뱃지 (`admin`/`user`), 가입일, 활성 상태, 액션 버튼 |
| **필터** | 역할별 탭 (전체 / 관리자 / 일반 회원) |
| **검색** | 이름 또는 이메일 키워드 검색 |
| **정렬** | `created_at` DESC (기본: 최신 가입순) |
| **페이지네이션** | 한 페이지 20건, 이전/다음 버튼 |

### 9.2 역할 변경
| 항목 | 내용 |
| :--- | :--- |
| **관리자 부여** | 일반 회원의 "관리자 지정" 버튼 클릭 → 확인 모달 → `users.role = 'admin'` 업데이트 |
| **관리자 해제** | 관리자의 "관리자 해제" 버튼 클릭 → 확인 모달 → `users.role = 'user'` 업데이트 |
| **자기 자신** | 자기 자신의 관리자 권한은 해제 불가 (실수 방지) |

### 9.3 회원 비활성화
| 항목 | 내용 |
| :--- | :--- |
| **비활성화** | `is_active = 0` 설정 → 해당 회원의 사이트 접근 차단 |
| **활성화** | `is_active = 1`로 복원 |

---

## 10. 이미지 업로드 공통 사양

### 10.1 업로드 플로우
```
[파일 선택 / 드래그&드롭]
  ↓
[클라이언트 사이드 최적화 (browser-image-compression)]
  ├─ PC용: maxWidth 1920px, quality 0.8, WebP
  └─ 모바일용: maxWidth 768px, quality 0.75, WebP
  ↓
[R2 업로드 (FormData POST → /api/admin/upload)]
  ↓
[업로드 완료 → R2 URL 반환 → DB에 URL 저장]
```

### 10.2 파일 제한
| 항목 | 제한 |
| :--- | :--- |
| **허용 포맷** | JPG, PNG, WebP, GIF |
| **최대 용량** | 원본 기준 10MB (최적화 후 대폭 감소) |
| **파일명 규칙** | `{테이블명}/{id}/{timestamp}.webp` |

### 10.3 이미지 미리보기
- 업로드 전: 선택한 파일의 로컬 미리보기
- 업로드 후: R2에서 불러온 실제 이미지 표시
- 기존 이미지 교체 시: 이전 파일 R2에서 삭제

---

## 11. API 엔드포인트 (관리자)

### 11.1 히어로 슬라이더
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/hero-slides` | 전체 목록 조회 |
| POST | `/api/admin/hero-slides` | 신규 추가 |
| PUT | `/api/admin/hero-slides/:id` | 수정 |
| DELETE | `/api/admin/hero-slides/:id` | 삭제 |
| PATCH | `/api/admin/hero-slides/reorder` | 순서 일괄 변경 |

### 11.2 의료진
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/doctors` | 전체 목록 조회 |
| POST | `/api/admin/doctors` | 신규 추가 |
| PUT | `/api/admin/doctors/:id` | 수정 |
| DELETE | `/api/admin/doctors/:id` | 삭제 |
| PATCH | `/api/admin/doctors/reorder` | 순서 일괄 변경 |

### 11.3 프로모션 카테고리
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/categories` | 전체 목록 조회 (프로모션 수 포함) |
| POST | `/api/admin/categories` | 신규 추가 |
| PUT | `/api/admin/categories/:id` | 수정 |
| DELETE | `/api/admin/categories/:id` | 삭제 (CASCADE 옵션) |
| PATCH | `/api/admin/categories/reorder` | 순서 일괄 변경 |

### 11.4 프로모션
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/promotions` | 전체 목록 조회 (카테고리 필터 쿼리 지원: `?category_id=1`) |
| POST | `/api/admin/promotions` | 신규 추가 |
| PUT | `/api/admin/promotions/:id` | 수정 |
| DELETE | `/api/admin/promotions/:id` | 삭제 |
| PATCH | `/api/admin/promotions/reorder` | 순서 일괄 변경 |

### 11.5 예약
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/reservations` | 목록 조회 (쿼리: `?status=pending&date_from=2026-03-01&date_to=2026-03-31&search=홍길동&page=1`) |
| GET | `/api/admin/reservations/:id` | 상세 조회 |
| PATCH | `/api/admin/reservations/:id/status` | 상태 변경 (`{ "status": "confirmed" }`) |
| PATCH | `/api/admin/reservations/:id/memo` | 메모 업데이트 (`{ "memo": "..." }`) |

### 11.6 회원 관리
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| GET | `/api/admin/members` | 회원 목록 조회 (쿼리: `?role=admin&search=홍길동&page=1`) |
| PATCH | `/api/admin/members/:id/role` | 역할 변경 (`{ "role": "admin" }` 또는 `{ "role": "user" }`) |
| PATCH | `/api/admin/members/:id/active` | 활성/비활성 변경 (`{ "is_active": 0 }`) |

### 11.7 이미지 업로드
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| POST | `/api/admin/upload` | 이미지 R2 업로드 (multipart/form-data) |
| DELETE | `/api/admin/upload` | R2 이미지 삭제 (`{ "key": "hero_slides/1/..." }`) |

---

## 12. UI/UX 가이드라인

### 12.1 레이아웃
- **데스크탑:** 좌측 고정 사이드바(240px) + 우측 메인 콘텐츠 영역
- **모바일:** 하단 탭바 네비게이션 + 풀 너비 콘텐츠

### 12.2 디자인 톤
- 기존 프론트엔드의 프리미엄 골드/블랙 톤을 계승하되, 관리자 페이지는 **밝은 배경(white/surface)** 위주로 가독성 우선
- Primary: `#D4A017` (골드) — 포인트 및 액션 버튼에 활용
- Dark: `#1a1a1a` — 사이드바 배경, 헤더에 활용

### 12.3 반응형
- 테이블 → 모바일에서는 카드 리스트로 변환
- 사이드 패널 → 모바일에서는 풀 스크린 모달로 변환

### 12.4 알림/피드백
| 상황 | UI |
| :--- | :--- |
| 저장 성공 | 우상단 토스트 (초록색, 2초 후 자동 사라짐) |
| 저장 실패 | 우상단 토스트 (빨간색) + 폼 하단 에러 메시지 |
| 삭제 확인 | 중앙 확인 모달 ("삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.") |
| 로딩 | 버튼 내 스피너 + 비활성화 |

---

## 13. 관리자 페이지 경로 정리

| 경로 | 페이지 | 설명 |
| :--- | :--- | :--- |
| `/admin` | 대시보드 | 요약 지표 + 최근 예약 |
| `/admin/hero-slides` | 히어로 슬라이더 관리 | 목록 + 추가/수정 모달 |
| `/admin/doctors` | 의료진 관리 | 목록 + 추가/수정 모달 |
| `/admin/categories` | 프로모션 카테고리 관리 | 목록 + 추가/수정 모달 |
| `/admin/promotions` | 프로모션 관리 | 목록 + 추가/수정 모달 |
| `/admin/reservations` | 예약 관리 | 목록 + 상세 슬라이드 패널 |
| `/admin/members` | 회원 관리 | 회원 목록 + 역할 변경 + 활성/비활성 |

---

## 14. 환경변수 목록

| 변수명 | 용도 | 예시 |
| :--- | :--- | :--- |
| `CLERK_PUBLISHABLE_KEY` | Clerk 퍼블릭 키 (프론트엔드) | `pk_live_xxxxxxxxxx` |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 (서버) | `sk_live_xxxxxxxxxx` |
| `CLERK_WEBHOOK_SECRET` | Clerk Webhook 검증 시크릿 | `whsec_xxxxxxxxxx` |
| `ADMIN_EMAILS` | 최초 관리자 이메일 (쉼표 구분, 부트스트랩용) | `director@luminus.com` |
| `RESEND_API_KEY` | Resend API 키 (문의 메일 발송용) | `re_xxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Resend 발신 이메일 | `noreply@luminus-clinic.com` |
| `ADMIN_EMAIL` | 문의 메일 수신 관리자 이메일 | `admin@luminus-clinic.com` |
