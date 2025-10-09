import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import axios from "axios";
import Buyer from "./GMBuyer";
import "./GMBuyer.css";
import HeadBar from "../HeadBar/HeadBar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const URL = "http://localhost:5000/buyers";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function GMBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState();
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

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = buyers.filter((buyer) =>
      Object.values(buyer).some((field) =>
        field.toString().toLowerCase().includes(query)
      )
    );

    setFilteredBuyers(filtered);
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks
    
    setIsGeneratingPDF(true);
    try {
      console.log("Starting PDF generation...");
      
      // Show the hidden content temporarily for rendering
      const input = document.getElementById("gm-buyers-report-content");
      if (!input) {
        console.error("Could not find gm-buyers-report-content element");
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

      const fileName = `Direct_Buyers_Report_GM_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, pdfHeight);
      
      console.log("Saving PDF...");
      pdf.save(fileName);
      console.log("PDF generated successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
      
      // Make sure to hide the content if there was an error
      const input = document.getElementById("gm-buyers-report-content");
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
      <div className="gm-buy-xyz-container">
        <div className="gm-buy-xyz-header">
          <h2 className="gm-buy-xyz-title">Buyers' List</h2>
        </div>

        <div className="gm-buy-xyz-table-container">
          <div className="gm-buy-xyz-controls">
            <input
              type="search"
              placeholder="Search Here"
              className="gm-buy-xyz-search-input"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <table className="gm-buy-xyz-table">
            <thead>
              <tr>
                <th>Buyer ID</th>
                <th>Buyer Name</th>
                <th>Address</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers && filteredBuyers.length > 0 ? (
                filteredBuyers.map((buyer, i) => (
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

          <div className="gm-buy-xyz-report-btn-container">
            <button 
              onClick={generatePDF} 
              className="gm-buy-xyz-report-btn"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
            </button>
          </div>
        </div>

        {/* Hidden styled content for PDF generation */}
        <div id="gm-buyers-report-content" style={{ display: "none" }}>
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
                Direct Buyers Report - GM
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
                Total Buyers: <strong>{filteredBuyers ? filteredBuyers.length : 0}</strong>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyers && filteredBuyers.map((buyer, index) => (
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

export default GMBuyers;