---
trigger: always_on
---

# 루미너스의원 데이터베이스 명세서 (database-info.md)

본 문서는 루미너스의원 통합 플랫폼에서 사용하는 **Cloudflare D1 (SQLite 기반)** 데이터베이스의 테이블 구조 및 인덱스 명세서입니다.
인증(회원가입, 로그인, 비밀번호 관리)은 **Clerk**에서 처리하며, D1에는 앱 고유 데이터만 저장합니다.

---

## 1. 테이블 목록

| 테이블명 | 설명 | 비고 |
| :--- | :--- | :--- |
| **`users`** | 회원 앱 데이터 (역할, 약관 동의 등) | Clerk 연동 (`clerk_id`) |
| **`hero_slides`** | 메인 페이지 히어로 슬라이더 이미지 및 텍스트 관리 | `index.html` 연동 |
| **`doctors`** | 의료진 프로필 및 약력 관리 | `doctors.html` 연동 |
| **`promotion_categories`** | 프로모션 시술 카테고리 (탭) 관리 | `promotion.html` 연동 |
| **`promotions`** | 각 카테고리에 속한 개별 프로모션/시술 항목 관리 | `promotion.html` 연동 |
| **`reservations`** | 고객 예약 상담 신청 데이터 관리 | 관리자 페이지 연동 |

---

## 2. 테이블 상세 명세

### 2.1 회원 (`users`)
Clerk에서 인증을 처리하고, 앱 고유 데이터(역할, 약관 동의 상태 등)만 D1에 저장합니다.
이름, 이메일, 비밀번호 등 인증 정보는 Clerk에서 관리합니다.
관리자 역할(`role`)은 관리자 페이지 내 **회원 관리** 메뉴에서 기존 관리자가 부여/해제합니다.
최초 관리자는 `ADMIN_EMAILS` 환경변수로 부트스트랩합니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 고유 ID |
| `clerk_id` | TEXT | O | - | Clerk 사용자 ID (UNIQUE) |
| `role` | TEXT | O | `'user'` | 회원 유형: `user` (일반) / `admin` (관리자) |
| `agreed_terms` | INTEGER | O | `0` | 이용약관 동의 여부 (0: 미동의, 1: 동의) |
| `agreed_privacy` | INTEGER | O | `0` | 개인정보처리방침 동의 여부 (0: 미동의, 1: 동의) |
| `is_active` | INTEGER | O | `1` | 계정 활성 여부 (0: 비활성/정지, 1: 활성) |
| `created_at` | TEXT | O | `now` | 가입 일시 |
| `updated_at` | TEXT | O | `now` | 정보 수정 일시 |

### 2.2 메인 히어로 슬라이더 (`hero_slides`)
메인 페이지 최상단 슬라이더의 백그라운드 이미지와 타이틀을 동적으로 관리합니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 고유 ID |
| `image_url` | TEXT | O | - | R2/CDN에 저장된 이미지 경로 |
| `subtitle` | TEXT | O | `''` | 서브 타이틀 (예: 피부 본연의 아름다움...) |
| `title` | TEXT | O | `''` | 메인 타이틀 (예: PREMIUM\nSKIN CLINIC) |
| `description` | TEXT | O | `''` | 하단 상세 설명 문구 |
| `sort_order` | INTEGER | O | `0` | 슬라이더 노출 순서 |
| `is_active` | INTEGER | O | `1` | 활성 여부 (0: 비활성, 1: 활성) |
| `created_at` | TEXT | O | `now` | 생성 일시 |
| `updated_at` | TEXT | O | `now` | 수정 일시 |

### 2.3 의료진 (`doctors`)
의료진 소개 페이지의 원장님 프로필 이미지, 전문 분야 및 세부 약력을 관리합니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 고유 ID |
| `name` | TEXT | O | - | 의료진 이름 (예: 김루미 원장) |
| `title` | TEXT | O | `'원장'` | 직함 (대표원장 / 원장 등) |
| `image_url` | TEXT | O | `''` | 프로필 사진 경로 (R2) |
| `specialty` | TEXT | O | `''` | hover 시 보이는 전문 분야 |
| `credentials` | TEXT | O | `'[]'` | JSON 배열 형태의 약력 데이터 |
| `sort_order` | INTEGER | O | `0` | 노출 순서 |
| `is_active` | INTEGER | O | `1` | 활성 여부 (0: 비활성, 1: 활성) |
| `created_at` | TEXT | O | `now` | 생성 일시 |
| `updated_at` | TEXT | O | `now` | 수정 일시 |

### 2.4 프로모션 카테고리 (`promotion_categories`)
프로모션 페이지 상단의 필터링 탭을 구성하는 카테고리 정보입니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 고유 ID |
| `name` | TEXT | O | - | 카테고리명 (예: 소프웨이브 런칭) |
| `sort_order` | INTEGER | O | `0` | 탭 노출 순서 |
| `is_active` | INTEGER | O | `1` | 노출 여부 (0: 비활성, 1: 활성) |
| `created_at` | TEXT | O | `now` | 생성 일시 |

### 2.5 프로모션 항목 (`promotions`)
실제 예약 가능한 개별 프로모션 상품 카드 정보입니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 고유 ID |
| `category_id` | INTEGER | O | - | 외래키 (참조: `promotion_categories(id)`) |
| `name` | TEXT | O | - | 프로모션/시술명 (예:[소프웨이브 런칭] 50펄스) |
| `description` | TEXT | O | `''` | 시술 부위 및 간단 설명 (예: 입가 / 눈가 / 목) |
| `price` | INTEGER | O | - | 할인가/판매가 (원 단위) |
| `original_price` | INTEGER | O | `0` | 정가 |
| `discount_percent`| INTEGER | O | `0` | 할인율 (%) |
| `badge_text` | TEXT | O | `''` | 카드 상단 뱃지 내용 (예: BEST 패키지) |
| `extra_note` | TEXT | O | `''` | 추가 안내 (예: ※ 엘라비에 리투오 추가 시...) |
| `sort_order` | INTEGER | O | `0` | 노출 순서 (인기순 정렬 기준) |
| `is_active` | INTEGER | O | `1` | 노출 여부 (0: 비활성, 1: 활성) |
| `created_at` | TEXT | O | `now` | 생성 일시 |
| `updated_at` | TEXT | O | `now` | 수정 일시 |

### 2.6 예약 상담 신청 (`reservations`)
프로모션 페이지 및 바텀시트를 통해 고객이 신청한 예약 데이터를 저장합니다.

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INTEGER | O | PK, Auto | 예약 고유 ID |
| `customer_name` | TEXT | O | - | 예약자 이름 |
| `customer_phone` | TEXT | O | - | 예약자 연락처 |
| `booking_date` | TEXT | O | - | 희망 예약 일자 (YYYY-MM-DD) |
| `booking_time` | TEXT | O | `''` | 희망 예약 시간 (HH:MM) |
| `booking_content` | TEXT | O | `''` | 고객 남긴 요청 사항 (자유 입력) |
| `items_json` | TEXT | O | `'[]'` | 선택한 상품 배열 정보 `[{name, price}, ...]` |
| `total_price` | INTEGER | O | `0` | 총 결제 예상 금액 |
| `status` | TEXT | O | `'pending'`| 처리 상태: `pending` / `confirmed` / `cancelled` / `completed` |
| `memo` | TEXT | O | `''` | 관리자용 메모 |
| `created_at` | TEXT | O | `now` | 예약 신청 일시 |
| `updated_at` | TEXT | O | `now` | 정보 업데이트 일시 |

---

## 3. 인덱스 (Indexes)

데이터 조회 성능 최적화를 위해 생성된 인덱스 목록입니다.

| 인덱스명 | 대상 테이블 | 대상 컬럼 | 목적 |
| :--- | :--- | :--- | :--- |
| `idx_users_clerk_id` | `users` | `clerk_id` | Clerk ID 기반 사용자 조회 |
| `idx_users_role` | `users` | `role`, `is_active` | 역할별 활성 회원 필터링 |
| `idx_hero_slides_active_order` | `hero_slides` | `is_active`, `sort_order` | 활성화된 슬라이더를 순서대로 빠르게 조회 |
| `idx_doctors_active_order` | `doctors` | `is_active`, `sort_order` | 활성화된 의료진 목록 순서대로 조회 |
| `idx_promo_cat_active_order` | `promotion_categories` | `is_active`, `sort_order` | 카테고리 탭 빠른 로딩 및 정렬 |
| `idx_promotions_cat_active` | `promotions` | `category_id`, `is_active`, `sort_order`| 카테고리별 활성화된 프로모션 목록 필터링 및 정렬 |
| `idx_reservations_status` | `reservations` | `status`, `created_at` | 예약 상태별 목록 필터링 및 최신순 정렬 |
| `idx_reservations_date` | `reservations` | `booking_date` | 특정 일자별 예약 일정 조회 |
