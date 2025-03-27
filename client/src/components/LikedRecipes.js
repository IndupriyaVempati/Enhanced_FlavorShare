import React, { useState, useEffect } from "react";
import { fetchLikedRecipes, unlikeRecipe } from "../api";
import RecipePDF from "./RecipePDF";
import "./LikedRecipes.css";

const API_BASE_URL = "http://localhost:5000";

const LikedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const speech = new SpeechSynthesisUtterance();

  useEffect(() => {
    loadLikedRecipes();
  }, []);

  const loadLikedRecipes = async () => {
    try {
      const response = await fetchLikedRecipes();
      setRecipes(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liked recipes:", err);
      setError("Failed to load liked recipes");
      setLoading(false);
    }
  };

  const handleUnlike = async (recipeId) => {
    try {
      await unlikeRecipe(recipeId);
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe._id !== recipeId));
    } catch (err) {
      console.error("Error unliking recipe:", err);
      if (err.response?.status === 401) {
        alert("Please login to unlike recipes");
      }
    }
  };

  const handleViewDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedRecipe) {
      const steps = selectedRecipe.instructions.split(/\r?\n/).filter(step => step.trim());
      if (currentStep < steps.length) {
        const step = steps[currentStep].trim();
        if (step) {
          const cleanStep = step.replace(/\*\*/g, '').replace(/–/g, '');
          speech.text = cleanStep;
          window.speechSynthesis.speak(speech);
          speech.onend = () => {
            setCurrentStep(currentStep + 1);
          };
        }
      }
    }
  };

  const handleRepeatStep = () => {
    if (selectedRecipe && currentStep > 0) {
      const steps = selectedRecipe.instructions.split(/\r?\n/).filter(step => step.trim());
      const step = steps[currentStep - 1].trim();
      if (step) {
        const cleanStep = step.replace(/\*\*/g, '').replace(/–/g, '');
        speech.text = `Repeating: ${cleanStep}`;
        window.speechSynthesis.speak(speech);
      }
    }
  };

  const handlePreviousStep = () => {
    if (selectedRecipe && currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      const steps = selectedRecipe.instructions.split(/\r?\n/).filter(step => step.trim());
      const step = steps[newStep].trim();
      if (step) {
        const cleanStep = step.replace(/\*\*/g, '').replace(/–/g, '');
        speech.text = cleanStep;
        window.speechSynthesis.speak(speech);
      }
    }
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (recipes.length === 0) return <div className="text-center mt-4">No liked recipes yet!</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="col-md-4 mb-4">
            <div className="card h-100">
              {recipe.image && (
                <img
                  src={`${API_BASE_URL}${recipe.image}`}
                  alt={recipe.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{recipe.title}</h5>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleUnlike(recipe._id)}
                  >
                    Unlike
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleViewDetails(recipe)}
                  >
                    View Details
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
              onClick={() => {
                handleStopReading();
                setSelectedRecipe(null);
                setCurrentStep(0);
              }}
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
                {selectedRecipe.instructions.split(/\r?\n/)
                  .filter(step => step.trim())
                  .map((step, index) => (
                    <li 
                      key={index} 
                      className={index === currentStep ? "current-step" : ""}
                    >
                      {step.trim().replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                    </li>
                  ))}
              </ol>

              <div className="control-buttons">
                <button 
                  className="btn btn-info" 
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                >
                  ⬅️ Previous Step
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleNextStep}
                  disabled={currentStep >= selectedRecipe.instructions.split(/\r?\n/).filter(step => step.trim()).length}
                >
                  ▶️ Next Step
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={handleRepeatStep}
                  disabled={currentStep === 0}
                >
                  🔁 Repeat Step
                </button>
                <button className="btn btn-dark" onClick={handleStopReading}>
                  ⏹️ Stop Reading
                </button>
              </div>

              <div className="action-buttons">
                <RecipePDF recipe={selectedRecipe} />
                <button
                  className="btn btn-outline-success"
                  onClick={() => {
                    const recipeText = `
*${selectedRecipe.title}*

*Ingredients:*
${selectedRecipe.ingredients.split(',').map(i => '• ' + i.trim()).join('\n')}

*Instructions:*
${selectedRecipe.instructions.split('\n').map(step => {
  const stepMatch = step.match(/^\d+\.\s*\*\*(.*?)\*\*\s*–\s*(.*)$/);
  if (stepMatch) {
    const [, title, description] = stepMatch;
    return `${title} – ${description}`;
  }
  return step.trim().replace(/^\d+\.\s*/, '');
}).filter(step => step).join('\n')}

Shared via FlavorShare 🍳
`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(recipeText)}`, "_blank");
                  }}
                >
                  Share on WhatsApp 📱
                </button>
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

export default LikedRecipes;
