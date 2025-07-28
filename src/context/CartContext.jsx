import React, { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import { safeToast } from "@/lib/utils";

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  updatingItemId: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_UPDATING_ITEM":
      return { ...state, updatingItemId: action.payload };

    case "SET_CART":
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        isLoading: false,
        updatingItemId: null,
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        updatingItemId: null,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [isAuthenticated, user]);

  const fetchCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await cartAPI.getCart();
      dispatch({ type: "SET_CART", payload: response.data });
    } catch (error) {
      console.error("Error fetching cart:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      safeToast.error("Please login to add items to cart");
      return { success: false };
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "SET_CART", payload: response.data.cart });
      safeToast.success("Item added to cart!");
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message =
        error.response?.data?.message || "Failed to add item to cart";
      safeToast.error(message);
      return { success: false, message };
    }
  };

  // const updateCartItem = async (productId, quantity) => {
  //   try {
  //     dispatch({ type: "SET_UPDATING_ITEM", payload: productId });
  //     const response = await cartAPI.updateCartItem(productId, quantity);
  //     dispatch({ type: "SET_CART", payload: response.data.cart });
  //     return { success: true };
  //   } catch (error) {
  //     const message =
  //       error.response?.data?.message || "Failed to update cart item";
  //     safeToast.error(message);
  //     return { success: false, message };
  //   } finally {
  //     dispatch({ type: "SET_UPDATING_ITEM", payload: null });
  //   }
  // };

  const updateCartItem = async (productId, quantity) => {
    // Optimistically update local state first
    dispatch({
      type: "SET_CART",
      payload: {
        ...state,
        items: state.items.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        ),
        totalItems: state.totalItems, // you might want to recalc here
        totalPrice: state.totalPrice,
      },
    });

    try {
      dispatch({ type: "SET_UPDATING_ITEM", payload: productId });
      const response = await cartAPI.updateCartItem(productId, quantity);
      // Sync with server response (optional, but recommended)
      dispatch({ type: "SET_CART", payload: response.data.cart });
      return { success: true };
    } catch (error) {
      // On error, revert to previous state by re-fetching or saving previous
      safeToast.error(
        error.response?.data?.message || "Failed to update cart item"
      );
      await fetchCart(); // refetch cart to revert
      return { success: false };
    } finally {
      dispatch({ type: "SET_UPDATING_ITEM", payload: null });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await cartAPI.removeFromCart(productId);
      dispatch({ type: "SET_CART", payload: response.data.cart });
      safeToast.success("Item removed from cart");
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message =
        error.response?.data?.message || "Failed to remove item from cart";
      safeToast.error(message);
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await cartAPI.clearCart();
      dispatch({ type: "CLEAR_CART" });
      safeToast.success("Cart cleared");
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message = error.response?.data?.message || "Failed to clear cart";
      safeToast.error(message);
      return { success: false, message };
    }
  };

  const getCartCount = async () => {
    try {
      const response = await cartAPI.getCartCount();
      return response.data.count;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
