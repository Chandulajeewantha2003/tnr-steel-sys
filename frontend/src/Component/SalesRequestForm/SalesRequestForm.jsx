import React, { useState, useEffect, useRef } from "react";
import SalesNav from "../SalesNav/SalesNav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import "./SalesRequestForm.css";
import { useNavigate } from "react-router-dom";

function SalesRequestForm() {
  const [product_name, setProduct_name] = useState("");
  const [requested_quantity, setRequested_quantity] = useState(1);
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const isMounted = useRef(false);

  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  // Fetch stock manager's inventory data
  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stocks");
      console.log("Stock Manager Inventory API Response:", response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setStocks(response.data.data);
        console.log("Stock manager inventory set to state:", response.data.data);
      } else {
        setError("No stock data available from stock manager");
        setStocks([]);
      }
    } catch (error) {
      console.error("Error fetching stock manager inventory:", error);
      setError("Failed to fetch stock manager inventory. Please try again.");
      setStocks([]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!isMounted.current) {
      fetchStockData();
      isMounted.current = true;
    }

    return () => {
      isMounted.current = false;
    };
  }, [navigate, user]);

  const handleProductChange = (value) => {
    setProduct_name(value);
  };

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value, 10) || 1;
    if (newQuantity >= 1) {
      setRequested_quantity(newQuantity);
    }
  };

  const submitSalesRequest = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");
    
    if (!product_name || product_name.trim() === "") {
      setError("Please select a product.");
      return;
    }

    if (requested_quantity < 1) {
      setError("Please enter a valid quantity (minimum 1).");
      return;
    }

    // Check if user has username
    if (!user.username) {
      setError("User session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const requestData = {
        product_name: product_name,
        requested_quantity: requested_quantity,
        created_by: user.username,
      };
      
      console.log("Submitting request:", requestData);
      
      const response = await axios.post(
        "http://localhost:5000/api/sales-requests",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Request submitted:", response.data);
      
      setSuccess("Sales request submitted successfully!");
      // Reset form
      setProduct_name("");
      setRequested_quantity(1);
      
      setTimeout(() => {
        navigate("/viewsalesrequests");
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting sales request:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      setError(`Failed to submit sales request: ${errorMessage}`);
    }
  };

  return (
    <div className="sales-request-container">
      <SalesNav />
      <HeadBar />
      
      
      <div className="sales-request-content">
        <div className="sales-request-form">
          <div className="sales-request-form-header">
            <h2 className="sales-request-form-title">Request Stock</h2>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle"></i>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="product-select">Select Product</label>
            <select
              id="product-select"
              className="form-select"
              value={product_name}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">Choose a product...</option>
              {stocks.length > 0 ? (
                stocks.map((stock) => (
                  <option key={stock._id} value={stock.product_name}>
                    {stock.product_name} (Available: {stock.product_quantity})
                  </option>
                ))
              ) : (
                <option value="">No products available</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity-input">Requested Quantity</label>
            <input
              id="quantity-input"
              className="form-input"
              type="number"
              value={requested_quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min="1"
              placeholder="Enter quantity"
            />
          </div>

          <div className="form-actions">
            <button 
              className="submit-request-btn" 
              onClick={submitSalesRequest}
            >
              <i className="bi bi-send"></i>
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesRequestForm;