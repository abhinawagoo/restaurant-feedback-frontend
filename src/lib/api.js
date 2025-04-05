// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle authentication errors
    if (response && response.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Register restaurant and admin
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  // Login admin
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    localStorage.removeItem("token");
    return await api.get("/auth/logout");
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get("/auth/me");
  },

  // Customer phone authentication
  authenticateCustomer: async (data) => {
    return await api.post("/auth/customer/phone", data);
  },
};

// Restaurant services
export const restaurantService = {
  // Get restaurant by ID
  getRestaurant: async (id) => {
    return await api.get(`/restaurants/${id}`);
  },

  // Update restaurant
  updateRestaurant: async (id, data) => {
    return await api.put(`/restaurants/${id}`, data);
  },

  // Get public restaurant info
  getRestaurantPublic: async (id) => {
    return await api.get(`/restaurants/${id}/public`);
  },

  // Get current restaurant for logged-in user
  getCurrentRestaurant: async () => {
    return await api.get("/restaurants/current");
  },

  // Update general information
  updateGeneralInfo: async (id, data) => {
    return await api.put(`/restaurants/${id}/general`, data);
  },

  // Update appearance settings
  updateAppearance: async (id, data) => {
    return await api.put(`/restaurants/${id}/appearance`, data);
  },

  // Upload restaurant logo
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post(`/restaurants/${id}/upload-logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Feedback services
export const feedbackService = {
  // Get all feedback forms for a restaurant
  getFeedbackForms: async (restaurantId) => {
    return await api.get(`/feedback/restaurants/${restaurantId}/forms`);
  },

  // Get a feedback form with questions
  getFeedbackForm: async (formId) => {
    return await api.get(`/feedback/forms/${formId}`);
  },

  // Create a new feedback form
  createFeedbackForm: async (restaurantId, data) => {
    return await api.post(`/feedback/restaurants/${restaurantId}/forms`, data);
  },

  // Add a question to a form
  addQuestion: async (formId, data) => {
    return await api.post(`/feedback/forms/${formId}/questions`, data);
  },

  // update a question in a form 
  updateQuestion: async (formId, questionId, questionData) => {
    return await api.put(`feedback/forms/${formId}/questions/${questionId}`, questionData);
  },

  // Submit feedback
  submitFeedback: async (formId, data) => {
    return await api.post(`/feedback/forms/${formId}/submit`, data);
  },

  // Get feedback responses
  getFeedbackResponses: async (restaurantId, params) => {
    return await api.get(`/feedback/restaurants/${restaurantId}/responses`, {
      params,
    });
  },




  //get feedback analytics

  getFormAnalytics: async (formId) => {
    return await api.get(`/analytics/forms/${formId}/analytics`);
  },
  // Get all responses for a form
  getFormResponses: async (formId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append(&apos;page&apos;, params.page);
    if (params.limit) queryParams.append(&apos;limit&apos;, params.limit);
    if (params.sortBy) queryParams.append(&apos;sortBy&apos;, params.sortBy);
    if (params.sortOrder) queryParams.append(&apos;sortOrder&apos;, params.sortOrder);
    
    const queryString = queryParams.toString();
    return await api.get(`/analytics/forms/${formId}/responses${queryString ? `?${queryString}` : &apos;&apos;}`);
  },
  
  // Get a single question
  getQuestion: async (questionId) => {
    return await api.get(`/analytics/questions/${questionId}`);
  },
  
  // Get analytics for a specific question
  getQuestionAnalytics: async (questionId) => {
    return await api.get(`/analytics/questions/${questionId}/analytics`);
  },
  // Get responses for a specific question
  getQuestionResponses: async (questionId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append(&apos;page&apos;, params.page);
    if (params.limit) queryParams.append(&apos;limit&apos;, params.limit);
    if (params.sortBy) queryParams.append(&apos;sortBy&apos;, params.sortBy);
    if (params.sortOrder) queryParams.append(&apos;sortOrder&apos;, params.sortOrder);
    
    const queryString = queryParams.toString();
    return await api.get(`/analytics/questions/${questionId}/responses${queryString ? `?${queryString}` : &apos;&apos;}`);
  },
  
  // Get a single feedback response
  getFeedbackResponse: async (responseId) => {
    return await api.get(`/analytics/responses/${responseId}`);
  },
  
  // Update a question
  updateQuestion: async (formId, questionId, data) => {
    return await api.put(`/analytics/forms/${formId}/questions/${questionId}`, data);
  },
  
  // Delete a question
  deleteQuestion: async (formId, questionId) => {
    return await api.delete(`/analytics/forms/${formId}/questions/${questionId}`);
  },
  
  // Export form data (all responses)
  exportFormData: async (formId, format = &apos;csv&apos;) => {
    return await api.get(`/analytics/forms/${formId}/export?format=${format}`, {
      responseType: &apos;blob&apos;
    });
  },

  // Export question data
  exportQuestionData: async (questionId, format = &apos;csv&apos;) => {
    return await api.get(`/analytics/questions/${questionId}/export?format=${format}`, {
      responseType: &apos;blob&apos;
    });
  },

};

// Create the API services for menu management
// src/services/menuService.js
// import api from &apos;@/lib/api&apos;;

export const menuService = {
  // Get menu items for a restaurant public
  getPublicMenuItems: async (restaurantId) => {
    return await api.get(`/menu/restaurants/${restaurantId}/items/public`);
  },

  // Get menu categories for a restaurant public
  getPublicMenuCategories: async (restaurantId) => {
    return await api.get(`/menu/restaurants/${restaurantId}/categories/public`);
  },

  // Get menu items for a restaurant
  getMenuItems: async (restaurantId) => {
    return await api.get(`/menu/restaurants/${restaurantId}/items`);
  },

  // Get menu categories for a restaurant
  getMenuCategories: async (restaurantId) => {
    return await api.get(`/menu/restaurants/${restaurantId}/categories`);
  },

  // Add a new menu item
  addMenuItem: async (restaurantId, data) => {
    return await api.post(`/menu/restaurants/${restaurantId}/items`, data);
  },

  // Update a menu item
  updateMenuItem: async (itemId, data) => {
    return await api.put(`/menu/items/${itemId}`, data);
  },

  // Toggle menu item availability
  toggleItemAvailability: async (itemId, isActive) => {
    return await api.patch(`/menu/items/${itemId}/availability`, {
      active: isActive,
    });
  },

  // Delete a menu item
  deleteMenuItem: async (itemId) => {
    return await api.delete(`/menu/items/${itemId}`);
  },

  // Add a new category
  addCategory: async (restaurantId, data) => {
    return await api.post(`/menu/restaurants/${restaurantId}/categories`, data);
  },

  // Update a category
  updateCategory: async (categoryId, data) => {
    return await api.put(`/menu/categories/${categoryId}`, data);
  },

  // Toggle category visibility
  toggleCategoryVisibility: async (categoryId, isActive) => {
    return await api.patch(`/menu/categories/${categoryId}/visibility`, {
      active: isActive,
    });
  },

  // Delete a category
  deleteCategory: async (categoryId) => {
    return await api.delete(`/menu/categories/${categoryId}`);
  },
};

export const tableService = {
  // Create a new table
  createTable: async (data) => {
    return await api.post("/tables", data);
  },

  // Get all tables for a restaurant
  getTables: async (restaurantId) => {
    return await api.get(`/tables/restaurant/${restaurantId}`);
  },

  // Delete a table
  deleteTable: async (restaurantId, tableId) => {
    return await api.delete(`/tables/${tableId}?restaurantId=${restaurantId}`);
  },
};

export const subscriptionService = {
  // Get current subscription details
  getSubscription: async () => {
    const response = await api.get("/subscription/current");
    return response.data;
  },

  // Get available subscription plans
  getPlans: async () => {
    const response = await api.get("/subscription/plans");
    return response.data;
  },

  // Create a checkout session for subscription
  createCheckout: async (data) => {
    const response = await api.post("/subscription/checkout", data);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post("/subscription/cancel");
    return response.data;
  },

  // Get billing history/invoices
  getInvoices: async () => {
    const response = await api.get("/subscription/invoices");
    return response.data;
  },
};

export default api;
