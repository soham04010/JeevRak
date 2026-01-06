import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
    product: string; // Product ID
    name: string;
    image: string;
    price: number;
    countInStock: number;
    qty: number;
}

interface CartState {
    cartItems: CartItem[];
    shippingAddress: any;
}

const initialState: CartState = {
    cartItems: [],
    shippingAddress: {},
};

const CartContext = createContext<{
    state: CartState;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    saveShippingAddress: (data: any) => void;
    clearCart: () => void;
} | undefined>(undefined);

const reducer = (state: CartState, action: any) => {
    switch (action.type) {
        case 'CART_ADD_ITEM':
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);
            if (existItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((x) => x.product === existItem.product ? item : x),
                };
            } else {
                return { ...state, cartItems: [...state.cartItems, item] };
            }
        case 'CART_REMOVE_ITEM':
            return {
                ...state,
                cartItems: state.cartItems.filter((x) => x.product !== action.payload),
            };
        case 'CART_SAVE_SHIPPING_ADDRESS':
            return { ...state, shippingAddress: action.payload };
        case 'CART_CLEAR':
            return { ...state, cartItems: [] };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Load cart from storage on init
    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem('cartItems');
                if (savedCart) {
                    JSON.parse(savedCart).forEach((item: CartItem) => dispatch({ type: 'CART_ADD_ITEM', payload: item }));
                }
            } catch (e) { console.error(e); }
        };
        loadCart();
    }, []);

    // Save cart to storage on change
    useEffect(() => {
        AsyncStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }, [state.cartItems]);

    const addToCart = (item: CartItem) => dispatch({ type: 'CART_ADD_ITEM', payload: item });
    const removeFromCart = (id: string) => dispatch({ type: 'CART_REMOVE_ITEM', payload: id });
    const saveShippingAddress = (data: any) => dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: data });
    const clearCart = () => dispatch({ type: 'CART_CLEAR' });

    return (
        <CartContext.Provider value={{ state, addToCart, removeFromCart, saveShippingAddress, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};