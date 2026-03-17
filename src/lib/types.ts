export interface User {
    id: number;
    clerk_id: string;
    role: 'user' | 'admin';
    agreed_terms: number;
    agreed_privacy: number;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface HeroSlide {
    id: number;
    image_url: string;
    subtitle: string;
    title: string;
    description: string;
    sort_order: number;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface Doctor {
    id: number;
    name: string;
    title: string;
    image_url: string;
    specialty: string;
    credentials: string; // JSON string
    sort_order: number;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface PromotionCategory {
    id: number;
    name: string;
    sort_order: number;
    is_active: number;
    created_at: string;
}

export interface Promotion {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    original_price: number;
    discount_percent: number;
    badge_text: string;
    extra_note: string;
    sort_order: number;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface Reservation {
    id: number;
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    booking_time: string;
    booking_content: string;
    items_json: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    memo: string;
    created_at: string;
    updated_at: string;
}

export interface Notice {
    id: number;
    title: string;
    content: string;
    thumbnail_url: string;
    category: 'notice' | 'event';
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface BeforeAfter {
    id: number;
    title: string;
    treatment_name: string;
    before_image_url: string;
    after_image_url: string;
    is_active: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
