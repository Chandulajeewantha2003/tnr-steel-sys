import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Logo.css";

function Logo() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");  // Redirect to login after 10 sec
    }, 10000);

    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
    <div className="logo-screen">
      <img src="/logo.webp" alt="TNR Logo" className="logo-img" />
    </div>
  );
}

export default Logo;
