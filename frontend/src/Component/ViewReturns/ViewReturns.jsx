import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewReturns.css";
import Nav from "../Nav/Nav";
import jsPDF from "jspdf";
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

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(17, 48, 81);
    doc.text("Direct Returns Report", 105, 15, null, null, "center");

    let yOffset = 25;

    filteredReturns.forEach((sale, i) => {
      if (yOffset > 260) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(17, 48, 81);
      doc.text(`Return ${i + 1}`, 15, yOffset);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Sales ID: ${sale._id}`, 20, yOffset + 7);
      doc.text(`ReturnInvoice ID: ${sale.returnId}`, 20, yOffset + 14);
      doc.text(`Buyer ID: ${sale.buyerId}`, 20, yOffset + 21);
      doc.text(`Date: ${sale.date}`, 20, yOffset + 28);
      doc.text(`Total Amount: ${sale.totalAmount}`, 20, yOffset + 35);
      doc.text(`Return Method: ${sale.returnMethod}`, 20, yOffset + 42);

      yOffset += 50;
    });

    doc.save("Direct_Returns_Report.pdf");
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
            <button onClick={generatePDF} className="ret-xyz-report-btn">
              Download PDF Report
            </button>
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