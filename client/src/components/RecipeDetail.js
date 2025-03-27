import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/recipes/${id}`);
        setRecipe(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error">{error}</div>
      <Link to="/" className="back-link">Back to Recipes</Link>
    </div>
  );
  if (!recipe) return (
    <div className="error-container">
      <div className="error">Recipe not found</div>
      <Link to="/" className="back-link">Back to Recipes</Link>
    </div>
  );

  return (
    <div className="recipe-detail-container">
      <div className="recipe-detail-card">
        <Link to="/" className="back-button">← Back to Recipes</Link>
        {recipe.image && (
          <img
            src={`http://localhost:5000${recipe.image}`}
            alt={recipe.title}
            className="recipe-detail-image"
          />
        )}
        
        <div className="recipe-detail-content">
          <h1 className="recipe-title">{recipe.title}</h1>
          
          <div className="recipe-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.split(',').map((ingredient, index) => (
                <li key={index}>{ingredient.trim()}</li>
              ))}
            </ul>
          </div>
          
          <div className="recipe-section">
            <h2>Instructions</h2>
            <ol className="instructions-list">
              {recipe.instructions.split('.').filter(step => step.trim()).map((step, index) => (
                <li key={index}>{step.trim()}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 