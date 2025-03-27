import "./Dashboard.css";
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FaSearch, FaUpload, FaHeart } from "react-icons/fa";

const Dashboard = () => {
  const location = useLocation();
  const isMainDashboard = location.pathname === "/dashboard";

  const dashboardCards = [
    {
      icon: <FaSearch className="card-icon" />,
      title: "Explore Recipes",
      description: "Discover delicious recipes shared by others.",
      link: "/dashboard/explore"
    },
    {
      icon: <FaUpload className="card-icon" />,
      title: "Upload a Recipe",
      description: "Share your own special recipes with the world.",
      link: "/dashboard/upload"
    },
    {
      icon: <FaHeart className="card-icon" />,
      title: "View Liked Recipes",
      description: "See the recipes you loved the most.",
      link: "/dashboard/likedrecipes"
    }
  ];

  return (
    <div className="dashboard-container">
      {isMainDashboard ? (
        <>
          <div className="welcome-section">
            <h1>👋 Your Personal Recipe Hub</h1>
            <p>Share, Upload and Save your favorite recipes!</p>
          </div>
          
          <div className="dashboard-cards">
            {dashboardCards.map((card, index) => (
              <Link 
                to={card.link} 
                className="dashboard-card" 
                key={index}
                style={{ textDecoration: 'none' }}
              >
                {card.icon}
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Dashboard;
