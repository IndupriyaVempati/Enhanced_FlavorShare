import React, { useState, useEffect } from "react";
import { fetchRecipes, likeRecipe, unlikeRecipe, fetchLikedRecipes } from "../api";
import "./RecipeList.css";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchRecipes();
        setRecipes(response.data);
        
        const token = localStorage.getItem("token");
        const likedResponse = await fetchLikedRecipes();
        setLikedRecipes(new Set(likedResponse.data.map(r => r._id)));
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load recipes");
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLike = async (recipeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to like recipes");
      return;
    }
    try {
      await likeRecipe(recipeId);
      setLikedRecipes(prev => new Set(prev).add(recipeId));
    } catch (err) {
      console.error("Error liking recipe:", err);
      if (err.response?.status === 401) {
        alert("Please login to like recipes");
      }
    }
  };

  const handleUnlike = async (recipeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to unlike recipes");
      return;
    }
    try {
      await unlikeRecipe(recipeId);
      setLikedRecipes(prev => {
        const updated = new Set(prev);
        updated.delete(recipeId);
        return updated;
      });
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
                  src={`https://flavoshare.onrender.com${recipe.image}`}
                  alt={recipe.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x200/lightgray/gray?text=No+Image';
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{recipe.title}</h5>
                <div className="d-flex justify-content-center gap-2">
                  {likedRecipes.has(recipe._id) ? (
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
