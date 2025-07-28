import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import { safeToast } from "@/lib/utils";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          // Verify token is still valid
          const response = await authAPI.verifyToken();
          if (response.data.valid) {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                user: JSON.parse(user),
                token,
              },
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } catch (error) {
          console.log(error);

          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      safeToast.success("Login successful!");
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message = error.response?.data?.message || "Login failed";
      const emailNotVerified = error.response?.data?.emailNotVerified || false;
      const email = error.response?.data?.email || null;

      // Don't show toast for email verification errors as they're handled in the UI
      if (!emailNotVerified) {
        safeToast.error(message);
      }

      return {
        success: false,
        message,
        emailNotVerified,
        email,
      };
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    safeToast.success("Logged out successfully");
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      dispatch({
        type: "UPDATE_USER",
        payload: updatedUser,
      });

      safeToast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      safeToast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      safeToast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      safeToast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,

    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
