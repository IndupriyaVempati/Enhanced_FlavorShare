import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    
    // If sending FormData, let axios set the correct Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = undefined;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.setItem("isAuthenticated", "false");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Handle forbidden error
      alert("Please log in to perform this action");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Recipe API functions
export const fetchRecipes = async () => {
  try {
    const response = await api.get("/recipes");
    return {
      data: response.data.map(recipe => ({
        ...recipe,
        isLiked: recipe.likedBy?.includes(localStorage.getItem("userId"))
      }))
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

export const likeRecipe = async (recipeId) => {
  try {
    const response = await api.post(`/api/like-recipe/${recipeId}`);
    return response;
  } catch (error) {
    console.error("Error liking recipe:", error);
    throw error;
  }
};

export const unlikeRecipe = async (recipeId) => {
  try {
    const response = await api.post(`/api/unlike-recipe/${recipeId}`);
    return response;
  } catch (error) {
    console.error("Error unliking recipe:", error);
    throw error;
  }
};

export const fetchLikedRecipes = () => api.get("/api/liked-recipes");
export const uploadRecipe = (formData) => {
  return api.post("/recipes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;
