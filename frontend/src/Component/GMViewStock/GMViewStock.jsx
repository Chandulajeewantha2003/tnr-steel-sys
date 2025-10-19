import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import axios from "axios";
import "./GMViewStock.css";
import HeadBar from "../HeadBar/HeadBar";

function GMViewStock() {
  const [selection, setSelection] = useState("materials");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        selection === "materials"
          ? "http://localhost:5000/api/materials"
          : "http://localhost:5000/api/stocks";

      const response = await axios.get(endpoint);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selection]);

  return (
    <div>
      <GMNav />
      <HeadBar />
      <div className="gm-stock-xyz-container">
        <div className="gm-stock-xyz-header">
          <h2 className="gm-stock-xyz-title">View Stock</h2>
        </div>

        <div className="gm-stock-xyz-advanced-filters">
          <select
            className="gm-stock-xyz-filter-input"
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
          >
            <option value="materials">Materials</option>
            <option value="products">Products</option>
          </select>
        </div>

        {loading && <div className="gm-stock-xyz-loading">Loading data...</div>}
        {error && <div className="gm-stock-xyz-error">{error}</div>}

        <div className="gm-stock-xyz-table-container">
          <table className="gm-stock-xyz-table">
            <thead>
              <tr>
                {selection === "materials" ? (
                  <>
                    <th>Supplier</th>
                    <th>Invoice ID</th>
                    <th>Materials Name</th>
                    <th>Quantity</th>
                    <th>Lot Price</th>
                  </>
                ) : (
                  <>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={selection === "materials" ? 6 : 4}
                    style={{ textAlign: "center" }}
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    {selection === "materials" ? (
                      <>
                        <td>{item.supplier_name}</td>
                        <td>{item.invoice_id}</td>
                        <td>{item.material_name}</td>
                        <td>{item.material_quantity}</td>
                        <td>{item.lot_price}</td>
                      </>
                    ) : (
                      <>
                        <td>{item.product_name}</td>
                        <td>{item.product_quantity}</td>
                        <td>{item.product_price}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GMViewStock;