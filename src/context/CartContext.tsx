import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext'; // Ensure this matches your file name in src/context/

/**
 * Cart Item structure representing a product in the user's shopping basket.
 */
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

const initialState: CartState = {
    cartItems: [],
};

/**
 * Context to provide cart state and dispatch functions.
 * Now isolated by user ID.
 */
const CartContext = createContext<{
    state: CartState;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
} | undefined>(undefined);

const reducer = (state: CartState, action: any) => {
    switch (action.type) {
        case 'SET_CART':
            return { ...state, cartItems: action.payload };
        case 'CART_ADD_ITEM':
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);
            if (existItem) {
                // Update quantity if item exists
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

/**
 * CartProvider component.
 * Uses the logged-in user's ID to store and retrieve a personal cart collection.
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { user } = useAuth();
    
    // Using a ref to prevent saving the initial empty state over existing data
    const isLoaded = useRef(false);

    // 1. Load User-Specific Cart whenever the user changes (login/logout/switch)
    useEffect(() => {
        const loadUserCart = async () => {
            if (user?._id) {
                isLoaded.current = false; // Reset loaded flag for new user
                const storageKey = `cartItems_${user._id}`;
                try {
                    const saved = await AsyncStorage.getItem(storageKey);
                    if (saved) {
                        dispatch({ type: 'SET_CART', payload: JSON.parse(saved) });
                    } else {
                        dispatch({ type: 'CART_CLEAR' });
                    }
                } catch (e) {
                    console.error("Error loading user-specific cart:", e);
                } finally {
                    isLoaded.current = true; // Loading finished
                }
            } else {
                // If no user is logged in, clear memory and stop persistence
                dispatch({ type: 'CART_CLEAR' });
                isLoaded.current = false;
            }
        };
        loadUserCart();
    }, [user?._id]);

    // 2. Save to User-Specific Key whenever items change, but only after initial load
    useEffect(() => {
        const saveUserCart = async () => {
            if (isLoaded.current && user?._id) {
                try {
                    const storageKey = `cartItems_${user._id}`;
                    await AsyncStorage.setItem(storageKey, JSON.stringify(state.cartItems));
                } catch (e) {
                    console.error("Error saving user-specific cart:", e);
                }
            }
        };
        saveUserCart();
    }, [state.cartItems, user?._id]);

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
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};