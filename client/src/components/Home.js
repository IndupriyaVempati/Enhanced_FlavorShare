import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useNavigate, Navigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { Carousel, Card, Button, Row, Col } from "react-bootstrap";
import RecipeList from "./RecipeList";
import UploadRecipe from "./UploadRecipe";
import Register from "./Register";
import Login from "./Login";
import LikedRecipes from "./LikedRecipes";
import Sfood from "../images/northindianfood.webp";
import Nfood from "../images/southindianfood.jpg";
import Jfood from "../images/junkfood.jpg";
import Dashboard from "./Dashboard";
import "./Home.css";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();

  // Card data
  const cardData = {
    curry: {
      title: "How to Perfect Your Curry",
      description: "Learn the secrets to creating a perfectly balanced curry every time. Pro tips for flavor layering.",
      tips: "Always roast your spices in low flame to extract maximum aroma.",
      ingredients: ["2 Onions (chopped)", "3 Tomatoes (chopped)", "2 tbsp Oil", "Spices (as per taste)"]
    },
    knife: {
      title: "Quick Knife Skills",
      description: "Save time in the kitchen with essential knife skills. Chop like a pro!",
      tips: "Always use a sharp knife for fast chopping.",
      tools: ["Sharp Knife", "Cutting Board", "Fresh Vegetables"]
    },
    rice: {
      title: "Perfect Rice Every Time",
      description: "Struggling with sticky rice? Learn the best method.",
      tips: "Always rinse rice before cooking for fluffy grains.",
      ingredients: ["1 cup Basmati Rice", "2 cups Water", "Salt (optional)"]
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("isAuthenticated", "false");
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleCardClick = (cardId) => {
    setSelectedCard(cardId);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  // Modal component
  const CardModal = ({ cardId }) => {
    const card = cardData[cardId];
    if (!card) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>&times;</button>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <p><b>Pro Tip:</b> {card.tips}</p>
          <p><b>{card.ingredients ? 'Ingredients:' : 'Tools Needed:'}</b></p>
          <ul>
            {(card.ingredients || card.tools).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* ====================== NAVBAR ====================== */}
      <nav className="custom-navbar">
        <div className="container-fluid">
          {/* Brand Logo */}
          <Link
            className="brand-logo"
            to="/"
            onClick={closeMenu}
          >
            <FaUtensils className="me-2" size={25} />
            <span className="brand-text">FlavorShare</span>
          </Link>

          {/* Navbar Links */}
          <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav">
              {/* Home Link */}
              <li className="nav-item">
                <Link
                  className={`nav-link ${window.location.pathname === "/" ? "active" : ""}`}
                  to="/"
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>

              {/* If NOT Authenticated */}
              {!isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${window.location.pathname === "/register" ? "active" : ""}`}
                      to="/register"
                      onClick={closeMenu}
                    >
                      Register
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${window.location.pathname === "/login" ? "active" : ""}`}
                      to="/login"
                      onClick={closeMenu}
                    >
                      Login
                    </Link>
                  </li>
                </>
              )}

              {/* If Authenticated */}
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${window.location.pathname === "/dashboard" ? "active" : ""}`}
                      to="/dashboard"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Carousel */}
                <div className="carousel-container">
                  <Carousel interval={3000} fade>
                    {/* North Indian Food */}
                    <Carousel.Item>
                      <img
                        className="d-block w-100 food-image"
                        src={Sfood}
                        alt="North Indian Food"
                      />
                      <Carousel.Caption>
                        <h3>🍲 Delicious North Indian Food</h3>
                        <p>
                          Explore the rich and authentic flavors of North India.
                        </p>
                      </Carousel.Caption>
                    </Carousel.Item>

                    {/* South Indian Food */}
                    <Carousel.Item>
                      <img
                        className="d-block w-100 food-image"
                        src={Nfood}
                        alt="South Indian Food"
                      />
                      <Carousel.Caption>
                        <h3>🍛 Yummy South Indian Delights</h3>
                        <p>Spicy, savory, and flavorful dishes to savor!</p>
                      </Carousel.Caption>
                    </Carousel.Item>

                    {/* Junk Food */}
                    <Carousel.Item>
                      <img
                        className="d-block w-100 food-image"
                        src={Jfood}
                        alt="Junk Food"
                      />
                      <Carousel.Caption>
                        <h3>🍔 Scrumptious Junk Food</h3>
                        <p>Your guilty pleasure, comfort food at its finest.</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                  </Carousel>
                </div>

                {/* Welcome Section */}
                <div className="text-center my-5 text-white">
                  <h1 className="gradient-text animate-fade-in text-white">
                    🍲 Welcome to FlavorShare 🍲
                  </h1>
                  <p className="description animate-fade-in-delay text-white">
                    Discover mouth-watering recipes, explore new flavors, and enjoy the art of cooking like never before!
                  </p>
                </div>

                <h2 className="text-center mt-5 mb-4 text-white">Top Cooking Tips</h2>

                <Row xs={1} md={2} lg={3} className="g-4">
                  {Object.entries(cardData).map(([cardId, card]) => (
                    <Col key={cardId}>
                      <Card className="h-100 shadow-lg dashy">
                        <Card.Body>
                          <Card.Title>{card.title}</Card.Title>
                          <Card.Text>{card.description}</Card.Text>
                          <Button
                            variant="primary"
                            onClick={() => handleCardClick(cardId)}
                          >
                            Read More
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {selectedCard && <CardModal cardId={selectedCard} />}

                {/* Food Facts Section */}
                <h2 className="text-center mt-5 mb-4 text-white">
                  Interesting Food Facts
                </h2>
                <Row xs={1} md={2} lg={3} className="g-4">
                  <Col>
                    <Card className="h-100 shadow-lg dashy">
                      <Card.Body>
                        <Card.Title>Did You Know?</Card.Title>
                        <Card.Text>
                          Honey never spoils. Archaeologists have found pots of
                          honey in ancient tombs that are over 3,000 years old
                          and still safe to eat!
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="h-100 shadow-lg dashy">
                      <Card.Body>
                        <Card.Title>Did You Know?</Card.Title>
                        <Card.Text>
                          The world's most expensive coffee comes from beans
                          that have been eaten and excreted by civet cats!
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="h-100 shadow-lg dashy">
                      <Card.Body>
                        <Card.Title>Did You Know?</Card.Title>
                        <Card.Text>
                          Carrots were originally purple before the orange
                          variety was cultivated in the 17th century.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          >
            <Route path="explore" element={<RecipeList />} />
            <Route path="upload" element={<UploadRecipe />} />
            <Route path="likedrecipes" element={<LikedRecipes />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <footer className="custom-footer">
        <div className="footer-container">
          {/* Logo Section */}
          <div className="footer-logo">
            <Link to="/" className="brand-logo">
              <FaUtensils className="me-2" size={25} />
              <span>FlavorShare</span>
            </Link>
            <p>Delicious Recipes Just a Click Away!</p>
          </div>

          {/* Copyright */}
          <div className="footer-copyright">
            <p>&copy; 2025 FlavorShare. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
