// Cart localStorage utilities

const CART_STORAGE_KEY = 'rafey_cart';

export interface CartItem {
    id: string                    // productId_variantId
    productId: string
    productSlug: string
    variantId: string | null
    name: string
    image: string
    color?: string
    size?: string
    price: number
    quantity: number
    stock: number
}

/**
 * Save cart to localStorage
 */
export function saveCartToLocalStorage(items: CartItem[]): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

/**
 * Load cart from localStorage
 */
export function loadCartFromLocalStorage(): CartItem[] {
    try {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
}

/**
 * Clear cart from localStorage
 */
export function clearLocalCart(): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
    }
}

/**
 * Generate unique cart item ID
 */
export function generateCartItemId(productId: string, variantId: string | null): string {
    return variantId ? `${productId}_${variantId}` : productId;
}
