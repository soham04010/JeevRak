import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
    product: string; 
    name: string;
    image: string;
    price: number;
    countInStock: number;
    qty: number;
}

interface CartState {
    cartItems: CartItem[];
}

const initialCartState: CartState = {
    cartItems: [],
};

const CartContext = createContext<{
    state: CartState;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: any) => {
    switch (action.type) {
        case 'CART_ADD_ITEM':
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);
            if (existItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((x) => x.product === existItem.product ? item : x),
                };
            }
            return { ...state, cartItems: [...state.cartItems, item] };
        case 'CART_REMOVE_ITEM':
            return {
                ...state,
                cartItems: state.cartItems.filter((x) => x.product !== action.payload),
            };
        case 'CART_CLEAR':
            return { ...state, cartItems: [] };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialCartState);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const saved = await AsyncStorage.getItem('cartItems');
                if (saved) {
                    const items = JSON.parse(saved);
                    items.forEach((i: CartItem) => dispatch({ type: 'CART_ADD_ITEM', payload: i }));
                }
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }, [state.cartItems]);

    const addToCart = (item: CartItem) => dispatch({ type: 'CART_ADD_ITEM', payload: item });
    const removeFromCart = (id: string) => dispatch({ type: 'CART_REMOVE_ITEM', payload: id });
    const clearCart = () => dispatch({ type: 'CART_CLEAR' });

    return (
        <CartContext.Provider value={{ state, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};