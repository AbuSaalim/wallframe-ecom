import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveCartToLocalStorage, loadCartFromLocalStorage, clearLocalCart, generateCartItemId, CartItem } from '@/lib/cart/localStorage';

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isDrawerOpen: boolean;
    isSyncing: boolean;
}

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isDrawerOpen: false,
    isSyncing: false
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Initialize cart from localStorage
        initializeCart: (state) => {
            const items = loadCartFromLocalStorage();
            state.items = items;
            state.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },

        // Add item to cart
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
            const newItem = action.payload;
            const itemId = generateCartItemId(newItem.productId, newItem.variantId);

            const existingItemIndex = state.items.findIndex(item => item.id === itemId);

            if (existingItemIndex > -1) {
                // Update quantity
                state.items[existingItemIndex].quantity += newItem.quantity;
            } else {
                // Add new item
                state.items.push({ ...newItem, id: itemId });
            }

            // Recalculate totals
            state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Save to localStorage
            saveCartToLocalStorage(state.items);

            // Open drawer
            state.isDrawerOpen = true;
        },

        // Remove item from cart
        removeFromCart: (state, action: PayloadAction<string>) => {
            const itemId = action.payload;
            state.items = state.items.filter(item => item.id !== itemId);

            // Recalculate totals
            state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Save to localStorage
            saveCartToLocalStorage(state.items);
        },

        // Update item quantity
        updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
            const { itemId, quantity } = action.payload;
            const itemIndex = state.items.findIndex(item => item.id === itemId);

            if (itemIndex > -1) {
                if (quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    state.items.splice(itemIndex, 1);
                } else {
                    state.items[itemIndex].quantity = quantity;
                }

                // Recalculate totals
                state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
                state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                // Save to localStorage
                saveCartToLocalStorage(state.items);
            }
        },

        // Clear cart
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalPrice = 0;
            clearLocalCart();
        },

        // Sync cart from server
        syncCartFromServer: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            state.totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
            state.totalPrice = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            saveCartToLocalStorage(action.payload);
            state.isSyncing = false;
        },

        // Toggle drawer
        toggleDrawer: (state, action: PayloadAction<boolean | undefined>) => {
            state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
        },

        // Set syncing state
        setSyncing: (state, action: PayloadAction<boolean>) => {
            state.isSyncing = action.payload;
        }
    }
});

export const {
    initializeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartFromServer,
    toggleDrawer,
    setSyncing
} = cartSlice.actions;

export default cartSlice.reducer;
