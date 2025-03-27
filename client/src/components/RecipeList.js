import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fetchRecipes, likeRecipe, unlikeRecipe } from "../api";
import "./RecipeList.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetchRecipes();
      setRecipes(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes");
      setLoading(false);
    }
  };

  const handleLike = async (recipeId) => {
    try {
      await likeRecipe(recipeId);
      setRecipes(prevRecipes =>
        prevRecipes.map(recipe =>
          recipe._id === recipeId
            ? { ...recipe, isLiked: true }
            : recipe
        )
      );
    } catch (err) {
      console.error("Error liking recipe:", err);
      if (err.response?.status === 401) {
        alert("Please login to like recipes");
      }
    }
  };

  const handleUnlike = async (recipeId) => {
    try {
      await unlikeRecipe(recipeId);
      setRecipes(prevRecipes =>
        prevRecipes.map(recipe =>
          recipe._id === recipeId
            ? { ...recipe, isLiked: false }
            : recipe
        )
      );
    } catch (err) {
      console.error("Error unliking recipe:", err);
      if (err.response?.status === 401) {
        alert("Please login to unlike recipes");
      }
    }
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (recipes.length === 0) return <div className="text-center mt-4">No recipes found!</div>;

  return (
    <div className="container mt-4">
      <div className="search-container mb-4">
        <input
          type="text"
          className="form-control search-input"
          placeholder="🔍 Search recipes by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row">
        {filteredRecipes.map((recipe) => (
          <div key={recipe._id} className="col-md-4 mb-4">
            <div className="card h-100">
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{recipe.title}</h5>
                <div className="d-flex justify-content-center gap-2">
                  {recipe.isLiked ? (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleUnlike(recipe._id)}
                    >
                      Unlike
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleLike(recipe._id)}
                    >
                      Like
                    </button>
                  )}
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedRecipe.title}</h3>
            <button
              className="btn btn-danger close-btn"
              onClick={() => setSelectedRecipe(null)}
            >
              ❌ Close
            </button>

            <div className="recipe-details">
              <h5>Ingredients:</h5>
              <div className="ingredients-list">
                {selectedRecipe.ingredients.split(',').map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    {ingredient.trim()}
                  </div>
                ))}
              </div>

              <h5>Instructions:</h5>
              <ol className="instructions-list">
                {selectedRecipe.instructions
                  .split(/\r?\n/)
                  .filter(step => step.trim())
                  .map((step, index) => {
                    // Extract the step content, removing the step number and formatting
                    const stepMatch = step.match(/^\d+\.\s*\*\*(.*?)\*\*\s*–\s*(.*)$/);
                    if (stepMatch) {
                      const [, title, description] = stepMatch;
                      return (
                        <li key={index}>
                          <strong>{title}</strong> – {description}
                        </li>
                      );
                    } else {
                      // Handle simple instructions without formatting
                      const cleanStep = step.trim().replace(/^\d+\.\s*/, '');
                      return cleanStep ? (
                        <li key={index}>{cleanStep}</li>
                      ) : null;
                    }
                  })
                  .filter(Boolean)}
              </ol>

              <div className="recipe-note">
                <p>💡 Like this recipe? Add it to your favorites to enhance your collection!</p>
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecipe(null)}
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
