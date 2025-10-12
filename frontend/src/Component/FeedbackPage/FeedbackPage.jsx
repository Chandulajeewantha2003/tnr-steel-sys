import React, { useState, useEffect } from "react";
import HeadBar from "../HeadBar/HeadBar";
import PMNav from "../PMNav/PMNav";
import "./FeedbackPage.css";

function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedRating, setSelectedRating] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample feedback data
  const sampleFeedbacks = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      product: "Steel Bars (Grade A)",
      rating: 5,
      comment: "Excellent quality steel bars! The delivery was prompt and the material exceeded our expectations. Will definitely order again.",
      date: "2024-01-15",
      status: "resolved",
      category: "product_quality"
    },
    {
      id: 2,
      customerName: "Michael Chen",
      customerEmail: "m.chen@construction.com",
      product: "Roofing Sheets",
      rating: 4,
      comment: "Good quality roofing sheets. The installation was smooth, though the delivery took a bit longer than expected.",
      date: "2024-01-14",
      status: "pending",
      category: "delivery"
    },
    {
      id: 3,
      customerName: "Emily Rodriguez",
      customerEmail: "emily.r@builders.com",
      product: "GI Pipes",
      rating: 5,
      comment: "Outstanding service! The team was professional and the pipes were exactly what we needed for our project.",
      date: "2024-01-13",
      status: "resolved",
      category: "service"
    },
    {
      id: 4,
      customerName: "David Thompson",
      customerEmail: "d.thompson@steelworks.com",
      product: "Metal Sheets",
      rating: 3,
      comment: "The product quality was decent, but there were some minor scratches on a few sheets. Customer service was helpful in resolving this.",
      date: "2024-01-12",
      status: "resolved",
      category: "product_quality"
    },
    {
      id: 5,
      customerName: "Lisa Wang",
      customerEmail: "lisa.w@architects.com",
      product: "Steel Beams",
      rating: 4,
      comment: "Great structural steel beams. The specifications were accurate and the material was delivered on time.",
      date: "2024-01-11",
      status: "pending",
      category: "product_quality"
    },
    {
      id: 6,
      customerName: "James Anderson",
      customerEmail: "j.anderson@contractors.com",
      product: "Rebar",
      rating: 2,
      comment: "Had some issues with the order accuracy. Some items were different from what was ordered. Customer service is working to resolve this.",
      date: "2024-01-10",
      status: "in_progress",
      category: "order_accuracy"
    },
    {
      id: 7,
      customerName: "Maria Garcia",
      customerEmail: "maria.g@engineering.com",
      product: "Steel Plates",
      rating: 5,
      comment: "Perfect steel plates for our construction project. High quality material and excellent customer support throughout the process.",
      date: "2024-01-09",
      status: "resolved",
      category: "service"
    },
    {
      id: 8,
      customerName: "Robert Kim",
      customerEmail: "robert.k@steel.com",
      product: "Wire Mesh",
      rating: 4,
      comment: "Good quality wire mesh. The pricing was competitive and the delivery was efficient. Would recommend to others.",
      date: "2024-01-08",
      status: "resolved",
      category: "pricing"
    },
    {
      id: 9,
      customerName: "Jennifer Brown",
      customerEmail: "j.brown@construction.com",
      product: "Steel Channels",
      rating: 3,
      comment: "The steel channels were good quality, but the packaging could be improved. Some items had minor dents from shipping.",
      date: "2024-01-07",
      status: "pending",
      category: "packaging"
    },
    {
      id: 10,
      customerName: "Christopher Lee",
      customerEmail: "c.lee@builders.com",
      product: "Steel Angles",
      rating: 5,
      comment: "Excellent steel angles! Precise dimensions and high-quality finish. The team was very knowledgeable and helpful.",
      date: "2024-01-06",
      status: "resolved",
      category: "product_quality"
    }
  ];

  useEffect(() => {
    setFeedbacks(sampleFeedbacks);
    setFilteredFeedbacks(sampleFeedbacks);
  }, []);

  useEffect(() => {
    let filtered = feedbacks;

    // Filter by rating
    if (selectedRating !== "all") {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(selectedRating));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFeedbacks(filtered);
  }, [selectedRating, searchTerm, feedbacks]);

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      resolved: { class: 'status-resolved', text: 'Resolved' },
      pending: { class: 'status-pending', text: 'Pending' },
      in_progress: { class: 'status-progress', text: 'In Progress' }
    };
    
    const config = statusConfig[status] || { class: 'status-default', text: status };
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      product_quality: '⭐',
      delivery: '🚚',
      service: '🤝',
      order_accuracy: '📋',
      pricing: '💰',
      packaging: '📦'
    };
    return icons[category] || '📝';
  };

  const getCategoryName = (category) => {
    const names = {
      product_quality: 'Product Quality',
      delivery: 'Delivery',
      service: 'Service',
      order_accuracy: 'Order Accuracy',
      pricing: 'Pricing',
      packaging: 'Packaging'
    };
    return names[category] || 'General';
  };

  const stats = {
    total: feedbacks.length,
    average: (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1),
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    pending: feedbacks.filter(f => f.status === 'pending').length
  };

  return (
    <div className="feedback-page-container">
      <HeadBar />
      <PMNav />
      
      <div className="feedback-content">
        <div className="feedback-header">
          <h1 className="feedback-title">
            <span className="feedback-icon">💬</span>
            Customer Feedback
          </h1>
          <p className="feedback-subtitle">Manage and review customer feedback and ratings</p>
        </div>

        {/* Statistics Cards */}
        <div className="feedback-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Feedback</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{stats.average}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="feedback-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search feedback..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="rating-filter">
            <label>Filter by Rating:</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="rating-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="feedback-list">
          {filteredFeedbacks.length === 0 ? (
            <div className="no-feedback">
              <div className="no-feedback-icon">😔</div>
              <h3>No feedback found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {feedback.customerName.charAt(0)}
                    </div>
                    <div className="customer-details">
                      <h3 className="customer-name">{feedback.customerName}</h3>
                      <p className="customer-email">{feedback.customerEmail}</p>
                    </div>
                  </div>
                  <div className="feedback-meta">
                    {getStatusBadge(feedback.status)}
                    <span className="feedback-date">{feedback.date}</span>
                  </div>
                </div>

                <div className="feedback-card-body">
                  <div className="product-info">
                    <span className="product-label">Product:</span>
                    <span className="product-name">{feedback.product}</span>
                  </div>

                  <div className="rating-section">
                    <span className="rating-label">Rating:</span>
                    <div className="rating-stars">
                      {getRatingStars(feedback.rating)}
                    </div>
                    <span className="rating-number">({feedback.rating}/5)</span>
                  </div>

                  <div className="category-section">
                    <span className="category-icon">{getCategoryIcon(feedback.category)}</span>
                    <span className="category-name">{getCategoryName(feedback.category)}</span>
                  </div>

                  <div className="comment-section">
                    <p className="feedback-comment">"{feedback.comment}"</p>
                  </div>
                </div>

                <div className="feedback-card-actions">
                  <button className="action-btn reply-btn">
                    <span className="btn-icon">💬</span>
                    Reply
                  </button>
                  <button className="action-btn mark-btn">
                    <span className="btn-icon">✅</span>
                    Mark Resolved
                  </button>
                  <button className="action-btn view-btn">
                    <span className="btn-icon">👁️</span>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
