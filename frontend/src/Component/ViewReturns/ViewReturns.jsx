import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewReturns.css";
import Nav from "../Nav/Nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import HeadBar from "../HeadBar/HeadBar";

function ViewReturns() {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("default");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/returns")
      .then((response) => {
        if (response.data.success) {
          setReturns(response.data.returns);
          setFilteredReturns(response.data.returns);
        }
      })
      .catch((error) => {
        console.error("Error fetching returns:", error);
      });
  }, []);

  const returnsviewDetails = async (returnId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/returns/${returnId}`
      );
      if (response.data.success) {
        setSelectedReturn(response.data.returnRecord);
        setShowModal(true);
      } else {
        console.error("Error fetching return details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching return details:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = returns.filter((retur) =>
      Object.keys(retur).some((key) => {
        let fieldValue = retur[key];

        if (key === "date") {
          fieldValue = new Date(fieldValue).toLocaleString();
        } else if (
          key === "totalAmount" ||
          key === "issueMoney" ||
          key === "issueProduct"
        ) {
          fieldValue = fieldValue.toString();
        } else if (key === "returnMethod") {
          fieldValue = fieldValue.toLowerCase();
        }

        return fieldValue.toLowerCase().includes(query);
      })
    );

    setFilteredReturns(filtered);
  };

  const handleFilter = (e) => {
    const option = e.target.value;
    setFilterOption(option);

    let sortedReturns = [...filteredReturns];

    if (option === "date-newest") {
      sortedReturns.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (option === "date-oldest") {
      sortedReturns.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (option === "price-low-high") {
      sortedReturns.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (option === "price-high-low") {
      sortedReturns.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setFilteredReturns(sortedReturns);
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks
    
    setIsGeneratingPDF(true);
    try {
      console.log("Starting PDF generation...");
      
      // Show the hidden content temporarily for rendering
      const input = document.getElementById("returns-report-content");
      if (!input) {
        console.error("Could not find returns-report-content element");
        alert("Error: Could not find report content. Please refresh the page and try again.");
        return;
      }

      // Temporarily make the content visible for html2canvas
      input.style.display = "block";
      input.style.position = "absolute";
      input.style.left = "-9999px";
      input.style.top = "0";

      console.log("Capturing content with html2canvas...");
      const canvas = await html2canvas(input, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: input.scrollWidth,
        height: input.scrollHeight
      });

      // Hide the content again
      input.style.display = "none";
      input.style.position = "static";
      input.style.left = "auto";
      input.style.top = "auto";

      console.log("Canvas created, generating PDF...");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 200;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const fileName = `Direct_Returns_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, pdfHeight);
      
      console.log("Saving PDF...");
      pdf.save(fileName);
      console.log("PDF generated successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
      
      // Make sure to hide the content if there was an error
      const input = document.getElementById("returns-report-content");
      if (input) {
        input.style.display = "none";
        input.style.position = "static";
        input.style.left = "auto";
        input.style.top = "auto";
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterOption("default");
    setDateRange({ start: "", end: "" });
    setPriceRange({ min: "", max: "" });
    setSortConfig({ key: null, direction: null });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ backgroundColor: "#06013b", minHeight: "100vh" }}>
      <Nav />
      <HeadBar />
      <div className="ret-xyz-container">
        <div className="ret-xyz-header">
          <h2 className="ret-xyz-title" style={{ color: "#fff", textShadow: "0 0 10px rgba(142, 84, 233, 0.5), 0 0 20px rgba(142, 84, 233, 0.3)", animation: "glow 2s ease-in-out infinite;" }}>Returns Records</h2>
        </div>

        <div className="ret-xyz-advanced-filters">
          <div className="ret-xyz-search-container">
            <input
              type="search"
              placeholder="Search any field..."
              className="ret-xyz-search-input"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="ret-xyz-filter-container">
            <div className="ret-xyz-filter-group">
              <label>Date Range:</label>
              <div className="ret-xyz-date-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="ret-xyz-date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="ret-xyz-date-input"
                />
              </div>
            </div>
            <div className="ret-xyz-filter-group">
              <label>Price Range:</label>
              <div className="ret-xyz-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="ret-xyz-price-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="ret-xyz-price-input"
                />
              </div>
            </div>
            <div className="ret-xyz-filter-group">
              <select
                className="ret-xyz-filter-select"
                value={filterOption}
                onChange={handleFilter}
              >
                <option value="default">Quick Sort</option>
                <option value="date-newest">Date: Newest First</option>
                <option value="date-oldest">Date: Oldest First</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
            <button onClick={resetFilters} className="ret-xyz-reset-btn">
              Reset Filters
            </button>
          </div>
        </div>

        <div className="ret-xyz-results-summary">
          <span>
            Showing {currentItems.length} of {filteredReturns.length} returns
          </span>
          <div className="ret-xyz-items-per-page">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        <div
          className="ret-xyz-table-container"
          style={{ width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", marginBottom: "20px" }}
        >
          <table className="ret-xyz-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("returnId")}
                  className="ret-xyz-sortable-header"
                >
                  Return ID{getSortIndicator("returnId")}
                </th>
                <th
                  onClick={() => handleSort("buyerId")}
                  className="ret-xyz-sortable-header"
                >
                  Buyer ID{getSortIndicator("buyerId")}
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="ret-xyz-sortable-header"
                >
                  Date{getSortIndicator("date")}
                </th>
                <th
                  onClick={() => handleSort("totalAmount")}
                  className="ret-xyz-sortable-header"
                >
                  Total Amount{getSortIndicator("totalAmount")}
                </th>
                <th
                  onClick={() => handleSort("returnMethod")}
                  className="ret-xyz-sortable-header"
                >
                  Return Method{getSortIndicator("returnMethod")}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((returnData) => (
                <tr
                  key={returnData.returnId}
                  className={
                    hoveredRow === returnData.returnId
                      ? "ret-xyz-hovered-row"
                      : ""
                  }
                  onMouseEnter={() => setHoveredRow(returnData.returnId)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>{returnData.returnId}</td>
                  <td>{returnData.buyerId}</td>
                  <td>{new Date(returnData.date).toLocaleString()}</td>
                  <td>LKR {returnData.totalAmount.toFixed(2)}</td>
                  <td>{returnData.returnMethod}</td>
                  <td>
                    <button
                      onClick={() => returnsviewDetails(returnData.returnId)}
                      className="ret-xyz-view-btn"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReturns.length === 0 && (
            <div className="ret-xyz-no-results">
              No returns records match your filters. Try adjusting your search
              criteria.
            </div>
          )}
        </div>

        <div className="ret-xyz-pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="ret-xyz-pagination-btn"
          >
            Previous
          </button>
          <div className="ret-xyz-page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageToShow}
                  onClick={() => paginate(pageToShow)}
                  className={`ret-xyz-page-number ${
                    currentPage === pageToShow ? "ret-xyz-active" : ""
                  }`}
                >
                  {pageToShow}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="ret-xyz-ellipsis">...</span>
                <button
                  onClick={() => paginate(totalPages)}
                  className={`ret-xyz-page-number ${
                    currentPage === totalPages ? "ret-xyz-active" : ""
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ret-xyz-pagination-btn"
          >
            Next
          </button>
        </div>

        <div className="ret-xyz-report-controls">
          <div className="ret-xyz-report-btn-container">
            <button 
              onClick={generatePDF} 
              className="ret-xyz-report-btn"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
            </button>
          </div>
        </div>

        {/* Hidden styled content for PDF generation */}
        <div id="returns-report-content" style={{ display: "none" }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            padding: "40px",
            backgroundColor: "#ffffff",
            color: "#2d3748",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            {/* Header */}
            <div style={{
              textAlign: "center",
              marginBottom: "40px",
              borderBottom: "4px solid #17486b",
              paddingBottom: "20px"
            }}>
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#17486b",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
                letterSpacing: "2px"
              }}>
                Direct Returns Report
              </h1>
              <p style={{
                fontSize: "1.1rem",
                color: "#4a5568",
                margin: "0"
              }}>
                Generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Summary */}
            <div style={{
              backgroundColor: "#f7fafc",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "30px",
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#2d3748",
                margin: "0 0 10px 0"
              }}>
                Report Summary
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <p style={{ margin: "0", color: "#4a5568" }}>
                  Total Returns: <strong>{filteredReturns.length}</strong>
                </p>
                <p style={{ margin: "0", color: "#4a5568" }}>
                  Showing: <strong>{currentItems.length}</strong> returns on this page
                </p>
                <p style={{ margin: "0", color: "#4a5568" }}>
                  Total Return Amount: <strong>LKR {filteredReturns.reduce((sum, returnItem) => sum + returnItem.totalAmount, 0).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Returns Table */}
            <div style={{ marginBottom: "30px" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#17486b" }}>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Return ID</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Buyer ID</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Date</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Total Amount</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Return Method</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((returnItem, index) => (
                    <tr key={returnItem.returnId} style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0"
                    }}>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568",
                        fontFamily: "monospace"
                      }}>{returnItem.returnId}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{returnItem.buyerId}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{new Date(returnItem.date).toLocaleDateString()}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.9rem",
                        color: "#2d3748",
                        fontWeight: "600"
                      }}>LKR {returnItem.totalAmount.toFixed(2)}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{returnItem.returnMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: "center",
              padding: "20px",
              borderTop: "2px solid #e2e8f0",
              color: "#718096",
              fontSize: "0.85rem"
            }}>
              <p style={{ margin: "0" }}>
                This report was generated by TNR Steel Systems Management System
              </p>
              <p style={{ margin: "5px 0 0 0" }}>
                For any inquiries, please contact the system administrator
              </p>
            </div>
          </div>
        </div>

        {showModal && selectedReturn && (
          <div className="ret-xyz-modal">
            <div className="ret-xyz-modal-content">
              <div className="ret-xyz-modal-header">
                <h3>Return Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="ret-xyz-close-modal"
                >
                  ×
                </button>
              </div>
              <div className="ret-xyz-invoice-details">
                <div className="ret-xyz-invoice-header">
                  <div className="ret-xyz-invoice-info">
                    <p>
                      <strong>Return ID:</strong> {selectedReturn.returnId}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedReturn.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="ret-xyz-buyer-info">
                    <p>
                      <strong>Buyer ID:</strong> {selectedReturn.buyerId}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> $
                      {selectedReturn.totalAmount.toFixed(2)}
                    </p>
                    <p>
                      <strong>Return Method:</strong>{" "}
                      {selectedReturn.returnMethod}
                    </p>
                  </div>
                </div>
                <h4>Items</h4>
                <table className="ret-xyz-items-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>LKR {item.price.toFixed(2)}</td>
                        <td>LKR {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="ret-xyz-total-label">
                        Total
                      </td>
                      <td className="ret-xyz-total-amount">
                        LKR {selectedReturn.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div className="ret-xyz-modal-actions">
                  <button
                    onClick={() => setShowModal(false)}
                    className="ret-xyz-modal-btn ret-xyz-cancel-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewReturns;