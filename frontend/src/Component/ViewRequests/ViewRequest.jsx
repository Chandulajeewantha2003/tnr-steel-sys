import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import HeadBar from "../HeadBar/HeadBar";
import "./ViewRequest.css";

function ViewRequest() {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesRequests, setSalesRequests] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all requests
  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch sales and material requests in parallel
      const [salesRes, materialRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stock-requests"),
        axios.get("http://localhost:5000/api/material-requests")
      ]);

      // Filter for pending requests only
      setSalesRequests(
        salesRes.data.success ? salesRes.data.data.filter(req => req.status === "Pending") : []
      );
      setMaterialRequests(
        materialRes.data.success ? materialRes.data.data.filter(req => req.status === "pending") : []
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Failed to fetch requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId, requestType) => {
    try {
      let endpoint = "";
      let updateData = {};
      let method = "put";

      switch (requestType) {
        case "sales":
          endpoint = `http://localhost:5000/api/stock-requests/${requestId}/status`;
          updateData = { status: "Approved" };
          method = "put";
          break;
        case "materials":
          endpoint = `http://localhost:5000/api/material-requests/${requestId}`;
          updateData = { status: "approved" };
          method = "patch";
          break;
        default:
          throw new Error("Invalid request type");
      }

      const response = await axios[method](endpoint, updateData);
      
      if (response.data.success) {
        setSuccessMessage(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request approved successfully!`);
        
        // Refresh the requests
        fetchAllRequests();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setError(`Failed to approve ${requestType} request. Please try again.`);
    }
  };

  const handleRejectRequest = async (requestId, requestType) => {
    try {
      let endpoint = "";
      let updateData = {};
      let method = "put";

      switch (requestType) {
        case "sales":
          endpoint = `http://localhost:5000/api/stock-requests/${requestId}/status`;
          updateData = { status: "Rejected" };
          method = "put";
          break;
        case "materials":
          endpoint = `http://localhost:5000/api/material-requests/${requestId}`;
          updateData = { status: "rejected" };
          method = "patch";
          break;
        default:
          throw new Error("Invalid request type");
      }

      const response = await axios[method](endpoint, updateData);
      
      if (response.data.success) {
        setSuccessMessage(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request rejected.`);
        fetchAllRequests();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setError(`Failed to reject ${requestType} request. Please try again.`);
    }
  };

  const getTotalPendingRequests = () => {
    return salesRequests.length + materialRequests.length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSalesRequests = () => (
    <div className="requests-section">
      <h3>Sales Requests ({salesRequests.length})</h3>
      {salesRequests.length === 0 ? (
        <div className="no-requests">
          <i className="bi bi-check-circle"></i>
          <p>No pending sales requests</p>
        </div>
      ) : (
        <div className="requests-grid">
          {salesRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h4>{request.product_name}</h4>
                <span className="request-type">Sales Request</span>
              </div>
              <div className="request-details">
                <p><strong>Quantity:</strong> {request.requested_quantity}</p>
                <p><strong>Requested by:</strong> {request.created_by}</p>
                <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                <p><strong>Status:</strong> <span className="status pending">{request.status}</span></p>
              </div>
              <div className="request-actions">
                <button 
                  className="btn-approve"
                  onClick={() => handleApproveRequest(request._id, "sales")}
                >
                  <i className="bi bi-check-circle"></i> Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleRejectRequest(request._id, "sales")}
                >
                  <i className="bi bi-x-circle"></i> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMaterialRequests = () => (
    <div className="requests-section">
      <h3>Materials Requests ({materialRequests.length})</h3>
      {materialRequests.length === 0 ? (
        <div className="no-requests">
          <i className="bi bi-check-circle"></i>
          <p>No pending materials requests</p>
        </div>
      ) : (
        <div className="requests-grid">
          {materialRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h4>{request.material_id?.material_name || "Unknown Material"}</h4>
                <span className="request-type">Materials Request</span>
              </div>
              <div className="request-details">
                <p><strong>Quantity:</strong> {request.request_quantity}</p>
                <p><strong>Supplier:</strong> {request.material_id?.supplier_name || "Unknown"}</p>
                <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                <p><strong>Status:</strong> <span className="status pending">{request.status}</span></p>
              </div>
              <div className="request-actions">
                <button 
                  className="btn-approve"
                  onClick={() => handleApproveRequest(request._id, "materials")}
                >
                  <i className="bi bi-check-circle"></i> Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleRejectRequest(request._id, "materials")}
                >
                  <i className="bi bi-x-circle"></i> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="view-requests-container">
      <HeadBar />
      <Nav />
      <div className="main-content">
        <div className="page-header">
          <h1>Manage Pending Requests</h1>
          <div className="header-actions">
            <button className="btn-refresh" onClick={fetchAllRequests}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle"></i>
            {successMessage}
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="summary-card">
          <div className="summary-item">
            <i className="bi bi-bell-fill"></i>
            <div>
              <h3>{getTotalPendingRequests()}</h3>
              <p>Total Pending Requests</p>
            </div>
          </div>
          <div className="summary-item">
            <i className="bi bi-cart-check"></i>
            <div>
              <h3>{salesRequests.length}</h3>
              <p>Sales Requests</p>
            </div>
          </div>
          <div className="summary-item">
            <i className="bi bi-box-seam"></i>
            <div>
              <h3>{materialRequests.length}</h3>
              <p>Materials Requests</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === "sales" ? "active" : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            <i className="bi bi-cart-check"></i>
            Sales Requests ({salesRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
            onClick={() => setActiveTab("materials")}
          >
            <i className="bi bi-box-seam"></i>
            Materials Requests ({materialRequests.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div className="tab-content">
            {activeTab === "sales" && renderSalesRequests()}
            {activeTab === "materials" && renderMaterialRequests()}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewRequest;
