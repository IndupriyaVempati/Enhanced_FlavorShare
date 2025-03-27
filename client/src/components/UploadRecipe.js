import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const UploadRecipe = () => {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title || !ingredients || !instructions || !image) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.REACT_APP_API_URL}/recipes`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/dashboard/explore");
    } catch (err) {
      console.error("Error uploading recipe:", err);
      setError(err.response?.data?.error || "Failed to upload recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2 className="text-center mb-4">🍳 Upload Your Recipe</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipe Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Recipe Title"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ingredients</label>
          <textarea
            className="form-control"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="List ingredients separated by commas"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Instructions</label>
          <textarea
            className="form-control"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write step-by-step instructions"
            rows="6"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Recipe Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button 
          type="submit" 
          className="upload-btn"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Recipe"}
        </button>
      </form>
    </div>
  );
};

export default UploadRecipe;
