import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";
import Buyer from "../Buyer/Buyer";
import "../Buyers/Buyers.css";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import HeadBar from "../HeadBar/HeadBar";

const URL = "http://localhost:5000/buyers";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchHandler().then((data) => {
      setBuyers(data.buyers);
      setFilteredBuyers(data.buyers);
    });
  }, []);

  const handleDelete = (id) => {
    setBuyers((prevBuyers) => prevBuyers.filter((buyer) => buyer._id !== id));
    setFilteredBuyers((prevBuyers) =>
      prevBuyers.filter((buyer) => buyer._id !== id)
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSort(query, nameFilter);
  };

  const handleNameFilter = (e) => {
    const filter = e.target.value.toLowerCase();
    setNameFilter(filter);
    applyFiltersAndSort(searchQuery, filter);
  };

  const applyFiltersAndSort = (search, name) => {
    let result = [...buyers];

    if (search) {
      result = result.filter((buyer) =>
        Object.values(buyer).some((field) =>
          field.toString().toLowerCase().includes(search)
        )
      );
    }

    if (name) {
      result = result.filter((buyer) =>
        buyer.name.toLowerCase().includes(name)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredBuyers(result);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    applyFiltersAndSort(searchQuery, nameFilter);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBuyers = filteredBuyers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks
    
    setIsGeneratingPDF(true);
    try {
      console.log("Starting PDF generation...");
      
      // Show the hidden content temporarily for rendering
      const input = document.getElementById("buyers-report-content");
      if (!input) {
        console.error("Could not find buyers-report-content element");
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

      const fileName = `Direct_Buyers_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, pdfHeight);
      
      console.log("Saving PDF...");
      pdf.save(fileName);
      console.log("PDF generated successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
      
      // Make sure to hide the content if there was an error
      const input = document.getElementById("buyers-report-content");
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

  return (
    <div style={{ backgroundColor: "#06013b", minHeight: "100vh" }}>
      <Nav />
      <HeadBar />
      <div className="buy-xyz-container">
        <div className="buy-xyz-header">
          <h2 className="buy-xyz-title">Buyers' List</h2>
          <Link to="/addbuyers">
            <button className="buy-xyz-new-btn">+ New Buyer</button>
          </Link>
        </div>

        <div className="buy-xyz-advanced-filters">
          <input
            type="search"
            placeholder="Search Here"
            className="buy-xyz-search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="buy-xyz-results-summary">
          <span>
            Showing {currentBuyers.length} of {filteredBuyers.length} buyers
          </span>
          <div className="buy-xyz-items-per-page">
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

        <div className="buy-xyz-table-container">
          <table className="buy-xyz-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("_id")}>
                  Buyer ID {getSortIndicator("_id")}
                </th>
                <th onClick={() => handleSort("name")}>
                  Buyer Name {getSortIndicator("name")}
                </th>
                <th onClick={() => handleSort("address")}>
                  Address {getSortIndicator("address")}
                </th>
                <th onClick={() => handleSort("contact")}>
                  Contact {getSortIndicator("contact")}
                </th>
                <th onClick={() => handleSort("email")}>
                  Email {getSortIndicator("email")}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBuyers.length > 0 ? (
                currentBuyers.map((buyer, i) => (
                  <Buyer key={i} buyer={buyer} onDelete={handleDelete} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="buy-xyz-pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="buy-xyz-pagedetails" style={{ color: "#f4f3f7ff" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div className="buy-xyz-report-btn-container">
          <button 
            onClick={generatePDF} 
            className="buy-xyz-report-btn"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
          </button>
        </div>

        {/* Hidden styled content for PDF generation */}
        <div id="buyers-report-content" style={{ display: "none" }}>
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
                Direct Buyers Report
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
              <p style={{
                margin: "0",
                color: "#4a5568"
              }}>
                Total Buyers: <strong>{filteredBuyers.length}</strong> | 
                Showing: <strong>{currentBuyers.length}</strong> buyers on this page
              </p>
            </div>

            {/* Buyers Table */}
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
                    }}>Buyer ID</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Name</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Address</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Contact</th>
                    <th style={{
                      padding: "15px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBuyers.map((buyer, index) => (
                    <tr key={buyer._id} style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0"
                    }}>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568",
                        fontFamily: "monospace"
                      }}>{buyer._id}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.9rem",
                        color: "#2d3748",
                        fontWeight: "500"
                      }}>{buyer.name}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{buyer.address}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{buyer.contact || "N/A"}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{buyer.email || "N/A"}</td>
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
      </div>
    </div>
  );
}

export default Buyers;