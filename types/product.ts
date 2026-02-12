export interface Media {
    _id: string;
    secure_url: string;
    alt: string;
    title?: string;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
}

export interface ProductVariant {
    _id: string;
    product: string;
    color: string;
    size: string;
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    sku: string;
    media: Media[];
    deletedAt?: Date | null;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    media: Media[];
    category: Category;
    variants?: ProductVariant[];
    averageRating?: number;
    totalReviews?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface ProductApiResponse {
    success: boolean;
    data: Product[];
    count?: number;
    pagination?: Pagination;
}
