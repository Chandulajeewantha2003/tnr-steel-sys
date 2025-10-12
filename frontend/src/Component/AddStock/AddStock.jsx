import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeadBar from "../HeadBar/HeadBar";
import "./AddStock.css";
import { motion } from "framer-motion";

function AddStock() {
  const [selection, setSelection] = useState("addProducts");
  const [rows, setRows] = useState([
    { selectedItem: "", currentStock: 0, price: 0, quantity: 1, total: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/products");
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError("Failed to fetch product data.");
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Error fetching product data.");
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stocks");
      if (response.data.success) {
        setStocks(response.data.data);
      } else {
        setError("Failed to fetch stock data.");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Error fetching stock data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/suppliers");
      if (response.data.success) {
        setSuppliers(response.data.data);
      } else {
        setError("Failed to fetch supplier data.");
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      setError("Error fetching supplier data.");
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchStockData();
    fetchSuppliers();
  }, []);

  const handleSelectionChange = (event) => {
    setSelection(event.target.value);
    setRows([
      selection === "addProducts"
        ? { selectedItem: "", currentStock: 0, price: 0, quantity: 1, total: 0 }
        : {
            supplier: "",
            invoiceId: "",
            ingredientName: "",
            quantity: "",
            lotPrice: "",
          },
    ]);
    setSearchTerm("");
    showToast(`Switched to ${event.target.value === "addProducts" ? "Add Products" : "Add Materials"}`, "success");
  };

  const handleItemChange = (index, value) => {
    const product = products.find((item) => item.product_name === value);
    const stock = stocks.find((item) => item.product_name === value);
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedItem: value,
      currentStock: stock ? stock.product_quantity : 0,
      price: product ? product.product_price : 0,
      quantity: 1,
      total: product ? product.product_price * 1 : 0,
    };
    setRows(updatedRows);
    showToast(`Selected ${value}`, "success");
  };

  const handleQuantityChange = (index, value) => {
    const updatedRows = [...rows];
    const newQuantity = parseInt(value, 10) || 1;
    if (newQuantity >= 1) {
      updatedRows[index].quantity = newQuantity;
      updatedRows[index].total = newQuantity * updatedRows[index].price;
    }
    setRows(updatedRows);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
    if (field === "supplier" && value) {
      showToast(`Selected supplier: ${value}`, "success");
    }
  };

  const addNewRow = () => {
    setRows([
      ...rows,
      selection === "addProducts"
        ? { selectedItem: "", currentStock: 0, price: 0, quantity: 1, total: 0 }
        : {
            supplier: "",
            invoiceId: "",
            ingredientName: "",
            quantity: "",
            lotPrice: "",
          },
    ]);
    showToast("New row added!", "success");
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const rowToRemove = rows[index];
      const confirmMessage =
        selection === "addProducts"
          ? `Remove ${rowToRemove.selectedItem || "this item"}?`
          : `Remove ${rowToRemove.ingredientName || "this ingredient"}?`;
      if (window.confirm(confirmMessage)) {
        setRows(rows.filter((_, rowIndex) => rowIndex !== index));
        showToast("Row removed", "success");
      }
    } else {
      showToast("Cannot remove the last row", "error");
    }
  };

  const validateForm = () => {
    if (selection === "addProducts") {
      return rows.some((row) => row.selectedItem && row.quantity > 0);
    } else {
      return rows.some((row) => row.supplier && row.ingredientName && row.quantity);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showToast(
        selection === "addProducts"
          ? "Please select at least one product with a valid quantity."
          : "Please add at least one ingredient with supplier and quantity.",
        "error"
      );
      const tableElement = document.querySelector(".table-container");
      if (tableElement) {
        tableElement.classList.add("shake");
        setTimeout(() => {
          tableElement.classList.remove("shake");
        }, 500);
      }
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    try {
      if (selection === "addProducts") {
        const filteredRows = rows.filter((row) => row.selectedItem);
        for (const row of filteredRows) {
          await axios.post("http://localhost:5000/api/stocks", {
            product_name: row.selectedItem,
            product_quantity: row.quantity,
            product_price: row.price || 0,
          });
        }
        showToast("Stock updated successfully!", "success");
      } else {
        const filteredRows = rows.filter((row) => row.ingredientName);
        for (const row of filteredRows) {
          await axios.post("http://localhost:5000/api/ingredients", {
            supplier_name: row.supplier,
            invoice_id: row.invoiceId,
            material_name: row.ingredientName,
            material_quantity: row.quantity,
            lot_price: row.lotPrice,
          });
        }
        showToast("Material added successfully!", "success");
      }
      setTimeout(() => navigate("/viewstock"), 2000);
    } catch (error) {
      console.error("Error:", error);
      showToast(`Failed: ${error.response ? error.response.data.message : error.message}`, "error");
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const filteredProducts = searchTerm
    ? products.filter((p) => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : products;

  const filteredSuppliers = searchTerm
    ? suppliers.filter((s) => s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : suppliers;

  const totalValue = selection === "addProducts" ? rows.reduce((sum, row) => sum + row.total, 0) : 0;

  return (
    <div className="add-stock-container">
      <HeadBar />
      <Nav />
      <div className="add-stock-content">
        <div className="add-stock-header">
          <motion.h2
            className="title-stock"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {selection === "addProducts" ? (
              <>
                <i className="fas fa-box-open header-icon"></i> Add Products Stock
              </>
            ) : (
              <>
                <i className="fas fa-leaf header-icon"></i> Add Materials
              </>
            )}
          </motion.h2>
          <div className="selection-container">
            <label htmlFor="stockType">Select Stock Type <span className="required-star">*</span></label>
            <select
              id="stockType"
              className="select-type"
              value={selection}
              onChange={handleSelectionChange}
            >
              <option value="addProducts">Add Products</option>
              <option value="addIngredients">Add Materials</option>
            </select>
          </div>
        </div>

        {loading ? (
          <motion.div
            className="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-spinner spin-icon"></i> Loading stock data...
          </motion.div>
        ) : error ? (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        ) : (
          <>
            <div className="search-container">
              <div className="input-container-sup">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    selection === "addProducts"
                      ? "Search products..."
                      : "Search suppliers or materials..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="items-count">
                {selection === "addProducts"
                  ? `${filteredProducts.length} products available`
                  : `${filteredSuppliers.length} suppliers available`}
              </div>
            </div>

            <motion.div
              className="table-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <table className="issue-items-table">
                <thead>
                  <tr>
                    {selection === "addProducts" ? (
                      <>
                        <th>Item</th>
                        <th>Current Stock</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </>
                    ) : (
                      <>
                        <th>Supplier</th>
                        <th>Invoice ID</th>
                        <th>Materials Name</th>
                        <th>Quantity</th>
                        <th>Lot Price</th>
                        <th>Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <motion.tr
                      key={index}
                      className={`data-row ${row.selectedItem || row.ingredientName ? "selected-row" : ""}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {selection === "addProducts" ? (
                        <>
                          <td>
                            <div className="input-container-sup">
                              <i className="fas fa-box input-icon"></i>
                              <select
                                className="select-item"
                                value={row.selectedItem}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                              >
                                <option value="">Select Item</option>
                                {filteredProducts.map((item, i) => (
                                  <option key={i} value={item.product_name}>
                                    {item.product_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="stock-value">
                            {row.currentStock > 0 ? row.currentStock : "-"}
                          </td>
                          <td className="price-value">
                            ${row.price > 0 ? row.price.toFixed(2) : "0.00"}
                          </td>
                          <td>
                            <div className="quantity-control">
                              <button
                                className="quantity-btn decrease"
                                onClick={() =>
                                  handleQuantityChange(index, Math.max(1, row.quantity - 1))
                                }
                                disabled={row.quantity <= 1}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <input
                                className="quantity-input"
                                type="number"
                                value={row.quantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                min="1"
                              />
                              <button
                                className="quantity-btn increase"
                                onClick={() => handleQuantityChange(index, row.quantity + 1)}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="total-value">
                            ${row.total > 0 ? row.total.toFixed(2) : "0.00"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <div className="input-container-sup">
                              <i className="fas fa-user input-icon"></i>
                              <select
                                className="select-item"
                                value={row.supplier}
                                onChange={(e) =>
                                  handleIngredientChange(index, "supplier", e.target.value)
                                }
                              >
                                <option value="">Select Supplier</option>
                                {filteredSuppliers.map((sup, i) => (
                                  <option key={i} value={sup.supplier_name}>
                                    {sup.supplier_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="input-container-sup">
                              <i className="fas fa-file-invoice input-icon"></i>
                              <input
                                className="text-input"
                                type="text"
                                value={row.invoiceId}
                                placeholder="Invoice #"
                                onChange={(e) =>
                                  handleIngredientChange(index, "invoiceId", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className="input-container-sup">
                              <i className="fas fa-leaf input-icon"></i>
                              <input
                                className="text-input"
                                type="text"
                                placeholder="Materials name"
                                value={row.ingredientName}
                                onChange={(e) =>
                                  handleIngredientChange(index, "ingredientName", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className="quantity-control">
                              <button
                                className="quantity-btn decrease"
                                onClick={() => {
                                  const currentValue = parseInt(row.quantity) || 0;
                                  handleIngredientChange(
                                    index,
                                    "quantity",
                                    Math.max(1, currentValue - 1).toString()
                                  );
                                }}
                                disabled={!row.quantity || parseInt(row.quantity) <= 1}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <input
                                className="quantity-input"
                                type="number"
                                placeholder="Qty"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleIngredientChange(index, "quantity", e.target.value)
                                }
                              />
                              <button
                                className="quantity-btn increase"
                                onClick={() => {
                                  const currentValue = parseInt(row.quantity) || 0;
                                  handleIngredientChange(index, "quantity", (currentValue + 1).toString());
                                }
                                }>
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="input-container-sup">
                              <i className="fas fa-dollar-sign input-icon"></i>
                              <input
                                className="text-input"
                                type="number"
                                placeholder="Price"
                                value={row.lotPrice}
                                onChange={(e) =>
                                  handleIngredientChange(index, "lotPrice", e.target.value)
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}
                      <td>
                        <button
                          className="remove-row-btn"
                          onClick={() => removeRow(index)}
                          title="Remove row"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                {selection === "addProducts" && totalValue > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="total-label">
                        Total Value:
                      </td>
                      <td className="grand-total">${totalValue.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </motion.div>

            <motion.div
              className="button-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="btn-primary add-row-btn-stock"
                onClick={addNewRow}
                title="Add new row"
              >
                <i className="fas fa-plus"></i> Add Row
              </button>
              <button
                className={`btn-submit ${validateForm() ? "" : "disabled"}`}
                onClick={handleSubmit}
                disabled={!validateForm() || submitting}
              >
                {submitting ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    {selection === "addProducts" ? "Add Stock" : "Add Materials"} <i className="fas fa-check"></i>
                  </>
                )}
              </button>
            </motion.div>

            {rows.some((row) => row.selectedItem || row.ingredientName) && (
              <motion.div
                className="summary-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>Summary</h3>
                <div className="summary-content">
                  {selection === "addProducts" ? (
                    <>
                      <p>
                        <strong>Products to add:</strong> {rows.filter((r) => r.selectedItem).length}
                      </p>
                      <p>
                        <strong>Total items:</strong>{" "}
                        {rows.reduce((sum, row) => sum + (row.selectedItem ? row.quantity : 0), 0)}
                      </p>
                      <p>
                        <strong>Total value:</strong> ${totalValue.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Materials to add:</strong>{" "}
                        {rows.filter((r) => r.ingredientName).length}
                      </p>
                      <p>
                        <strong>Suppliers:</strong>{" "}
                        {new Set(rows.filter((r) => r.supplier).map((r) => r.supplier)).size}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {showConfirmation && (
          <motion.div
            className="confirmation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="confirmation-dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3>
                Confirm {selection === "addProducts" ? "Stock Addition" : "Material Addition"}
              </h3>
              <p>Are you sure you want to proceed?</p>
              <div className="confirmation-summary">
                {selection === "addProducts" ? (
                  <>
                    <p>Adding {rows.filter((r) => r.selectedItem).length} products</p>
                    <p>
                      Total items:{" "}
                      {rows.reduce((sum, row) => sum + (row.selectedItem ? row.quantity : 0), 0)}
                    </p>
                    <p>Total value: ${totalValue.toFixed(2)}</p>
                  </>
                ) : (
                  <>
                    <p>Adding {rows.filter((r) => r.ingredientName).length} materials</p>
                    <p>
                      From {new Set(rows.filter((r) => r.supplier).map((r) => r.supplier)).size} suppliers
                    </p>
                  </>
                )}
              </div>
              <div className="confirmation-actions">
                <button
                  className="btn-submit"
                  onClick={confirmSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="loader"></div>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Confirm
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  onClick={cancelSubmit}
                  disabled={submitting}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AddStock;