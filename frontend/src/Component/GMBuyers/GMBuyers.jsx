import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import axios from "axios";
import Buyer from "./GMBuyer";
import "./GMBuyer.css";
import HeadBar from "../HeadBar/HeadBar";
import jsPDF from "jspdf";

const URL = "http://localhost:5000/buyers";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function GMBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState();

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

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text("Direct Buyers Report", 105, 15, null, null, "center");

    filteredBuyers.forEach((buyer, i) => {
      const yOffset = 25 + i * 40;

      doc.setFontSize(12);
      doc.setTextColor(0, 153, 76);
      doc.text(`Buyer ${i + 1}`, 15, yOffset);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`ID: ${buyer._id}`, 20, yOffset + 7);
      doc.text(`Name: ${buyer.name}`, 20, yOffset + 14);
      doc.text(`Contact: ${buyer.contact}`, 20, yOffset + 21);
    });

    doc.save("Direct_Buyers_Report.pdf");
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
            <button onClick={generatePDF} className="gm-buy-xyz-report-btn">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GMBuyers;