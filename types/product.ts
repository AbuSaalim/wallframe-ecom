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
    createdAt: string;
    updatedAt: string;
}

export interface ProductApiResponse {
    success: boolean;
    data: Product[];
    count: number;
}
