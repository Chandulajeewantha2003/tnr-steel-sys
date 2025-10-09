import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import Supplier from "../Supplier/Supplier.jsx";
import "./Suppliers.css";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const URL = "http://localhost:5000/api/suppliers";

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, data: [] };
  }
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchHandler().then((data) => {
      if (data && data.success && Array.isArray(data.data)) {
        setSuppliers(data.data);
        setFilteredSuppliers(data.data);
      } else {
        console.error("Unexpected API response format:", data);
        setSuppliers([]);
        setFilteredSuppliers([]);
      }
    });
  }, []);

  const handleDelete = (id) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier._id !== id)
    );
    setFilteredSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier._id !== id)
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = suppliers.filter((supplier) =>
      Object.values(supplier).some((field) =>
        field?.toString().toLowerCase().includes(query)
      )
    );
    setFilteredSuppliers(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

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
      const input = document.getElementById("suppliers-report-content");
      if (!input) {
        console.error("Could not find suppliers-report-content element");
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

      const fileName = `Suppliers_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, pdfHeight);
      
      console.log("Saving PDF...");
      pdf.save(fileName);
      console.log("PDF generated successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
      
      // Make sure to hide the content if there was an error
      const input = document.getElementById("suppliers-report-content");
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
    <div>
      <GMNav />
      <HeadBar />
      <div className="sup-xyz-buyers-container">
        <div className="sup-xyz-header">
          <h2 className="sup-xyz-buyer-title">Suppliers List</h2>
          <Link to="/addsuppliers">
            <button className="sup-xyz-new-buyer-btn">+ New Supplier</button>
          </Link>
        </div>

        <div className="sup-xyz-advanced-filters">
          <input
            type="search"
            placeholder="Search Here"
            className="sup-xyz-search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="sup-xyz-results-summary">
          <span>
            Showing {currentSuppliers.length} of {filteredSuppliers.length}{" "}
            suppliers
          </span>
          <div className="sup-xyz-items-per-page">
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

        <div className="sup-xyz-table-container">
          <table className="sup-xyz-buyers-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Supplier Name</th>
                <th>Supplier Address</th>
                <th>Supplier Phone</th>
                <th>Supplier Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSuppliers && currentSuppliers.length > 0 ? (
                currentSuppliers.map((supplier, i) => (
                  <Supplier
                    key={i}
                    supplier={supplier}
                    onDelete={handleDelete}
                  />
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

        <div className="sup-xyz-pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="sup-xyz-pagedetails">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div className="sup-xyz-report-btn-container">
          <button 
            onClick={generatePDF} 
            className="sup-xyz-report-btn"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
          </button>
        </div>

        {/* Hidden styled content for PDF generation */}
        <div id="suppliers-report-content" style={{ display: "none" }}>
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
                Suppliers Report
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
              <p style={{ margin: "0", color: "#4a5568" }}>
                Total Suppliers: <strong>{filteredSuppliers.length}</strong>
              </p>
            </div>

            {/* Suppliers Table */}
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
                    }}>Supplier ID</th>
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
                    }}>Phone</th>
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
                  {currentSuppliers && currentSuppliers.map((supplier, index) => (
                    <tr key={supplier._id} style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0"
                    }}>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568",
                        fontFamily: "monospace"
                      }}>{supplier._id}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.9rem",
                        color: "#2d3748",
                        fontWeight: "500"
                      }}>{supplier.supplier_name}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{supplier.supplier_address}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{supplier.supplier_phone || "N/A"}</td>
                      <td style={{
                        padding: "12px 15px",
                        fontSize: "0.85rem",
                        color: "#4a5568"
                      }}>{supplier.supplier_email || "N/A"}</td>
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

export default Suppliers;