import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (userData) => api.post("/auth/send-otp", userData),
  verifyOTP: (otpData) => api.post("/auth/verify-otp", otpData),
  resendOTP: (emailData) => api.post("/auth/resend-otp", emailData),
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  verifyToken: () => api.get("/auth/verify"),
  getAllUsers: () => api.get("/auth/users"),
  updateUserRole: (id, roleData) => api.put(`/auth/users/${id}/role`, roleData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get("/products/featured/list"),
  addReview: (productId, reviewData) =>
    api.post(`/products/${productId}/reviews`, reviewData),
  createProduct: (productData) => api.post("/products", productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  deleteAllProducts: () => api.delete("/products"),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) =>
    api.post("/cart/add", { productId, quantity }),
  updateCartItem: (productId, quantity) =>
    api.put("/cart/update", { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete("/cart/clear"),
  getCartCount: () => api.get("/cart/count"),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post("/orders", orderData),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getAllOrders: (params) => api.get("/orders", { params }),
  updateOrderStatus: (id, statusData) =>
    api.put(`/orders/${id}/status`, statusData),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (orderId) =>
    api.post("/payment/create-intent", { orderId }),
  confirmPayment: (paymentData) => api.post("/payment/confirm", paymentData),
  getConfig: () => api.get("/payment/config"),
  getPaymentHistory: () => api.get("/payment/history"),
  createRefund: (refundData) => api.post("/payment/refund", refundData),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId, notes = "") =>
    api.post(`/wishlist/${productId}`, { notes }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  updateWishlist: (data) => api.put("/wishlist", data),
  generateShareToken: () => api.post("/wishlist/share"),
  getSharedWishlist: (shareToken) => api.get(`/wishlist/shared/${shareToken}`),
  checkWishlistStatus: (productId) => api.get(`/wishlist/check/${productId}`),
  clearWishlist: () => api.delete("/wishlist"),
  moveToCart: (productId, quantity = 1) =>
    api.post(`/wishlist/${productId}/move-to-cart`, { quantity }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  markMultipleAsRead: (notificationIds) =>
    api.patch("/notifications/read", { notificationIds }),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
  deleteMultipleNotifications: (notificationIds) =>
    api.delete("/notifications", { data: { notificationIds } }),
  // Admin endpoints
  createNotification: (notificationData) =>
    api.post("/notifications/admin/create", notificationData),
  getNotificationStats: () => api.get("/notifications/admin/stats"),
  cleanupOldNotifications: (daysOld = 30) =>
    api.delete(`/notifications/admin/cleanup?daysOld=${daysOld}`),
};

export default api;
