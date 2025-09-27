import React, { useState } from "react";
import "./AddSupplier.css";
import GMNav from "../GMNav/GMNav";
import HeadBar from "../HeadBar/HeadBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const AddSupplier = () => {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const [inputs, setInputs] = useState({
    supplier_name: "",
    supplier_address: "",
    supplier_phone: "",
    supplier_email: "",
  });

  const [touched, setTouched] = useState({
    supplier_name: false,
    supplier_address: false,
    supplier_phone: false,
    supplier_email: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    });
    validateField(e.target.name, e.target.value);
  };

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    switch (field) {
      case "supplier_name":
        if (!value.trim()) {
          newErrors.supplier_name = "Supplier name is required.";
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          newErrors.supplier_name =
            "Supplier name can only contain alphabets and spaces.";
        } else {
          delete newErrors.supplier_name;
        }
        break;
      case "supplier_phone":
        if (!value) {
          newErrors.supplier_phone = "Contact number is required.";
        } else if (!/^\d{10}$/.test(value)) {
          newErrors.supplier_phone =
            "Contact number must be exactly 10 digits.";
        } else {
          delete newErrors.supplier_phone;
        }
        break;
      case "supplier_address":
        if (!value.trim()) {
          newErrors.supplier_address = "Address is required.";
        } else {
          delete newErrors.supplier_address;
        }
        break;
      case "supplier_email":
        if (!value.trim()) {
          newErrors.supplier_email = "Email is required.";
        } else if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(value)) {
          newErrors.supplier_email = "Invalid email address.";
        } else {
          delete newErrors.supplier_email;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    setTouched({
      supplier_name: true,
      supplier_address: true,
      supplier_phone: true,
      supplier_email: true,
    });
    let formErrors = {};
    let isValid = true;

    if (!inputs.supplier_name.trim()) {
      formErrors.supplier_name = "Supplier name is required.";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(inputs.supplier_name)) {
      formErrors.supplier_name =
        "Supplier name can only contain alphabets and spaces.";
      isValid = false;
    }

    if (!inputs.supplier_phone) {
      formErrors.supplier_phone = "Contact number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(inputs.supplier_phone)) {
      formErrors.supplier_phone = "Contact number must be exactly 10 digits.";
      isValid = false;
    }

    if (!inputs.supplier_address.trim()) {
      formErrors.supplier_address = "Address is required.";
      isValid = false;
    }

    if (!inputs.supplier_email.trim()) {
      formErrors.supplier_email = "Email is required.";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(inputs.supplier_email)
    ) {
      formErrors.supplier_email = "Invalid email address.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const validateStep = (step) => {
    let isValid = true;
    if (step === 1) {
      if (!inputs.supplier_name.trim()) {
        setErrors((prev) => ({
          ...prev,
          supplier_name: "Supplier name is required.",
        }));
        setTouched((prev) => ({ ...prev, supplier_name: true }));
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(inputs.supplier_name)) {
        setErrors((prev) => ({
          ...prev,
          supplier_name: "Supplier name can only contain alphabets and spaces.",
        }));
        setTouched((prev) => ({ ...prev, supplier_name: true }));
        isValid = false;
      }
      if (!inputs.supplier_phone) {
        setErrors((prev) => ({
          ...prev,
          supplier_phone: "Contact number is required.",
        }));
        setTouched((prev) => ({ ...prev, supplier_phone: true }));
        isValid = false;
      } else if (!/^\d{10}$/.test(inputs.supplier_phone)) {
        setErrors((prev) => ({
          ...prev,
          supplier_phone: "Contact number must be exactly 10 digits.",
        }));
        setTouched((prev) => ({ ...prev, supplier_phone: true }));
        isValid = false;
      }
    }
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const formElement = document.querySelector('.add-suppliers-form-step-content');
      if (formElement) {
        formElement.classList.add('add-suppliers-shake');
        setTimeout(() => {
          formElement.classList.remove('add-suppliers-shake');
        }, 500);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const formElement = document.querySelector('.add-suppliers-form-step-content');
      if (formElement) {
        formElement.classList.add('add-suppliers-shake');
        setTimeout(() => {
          formElement.classList.remove('add-suppliers-shake');
        }, 500);
      }
      return;
    }
    setLoading(true);
    try {
      await sendRequest();
      setSuccess(true);
      setTimeout(() => {
        history("/viewsuppliers");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      showToast("Failed to add supplier. Please try again.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `add-suppliers-toast ${type}`;
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

  const sendRequest = async () => {
    await axios
      .post("http://localhost:5000/api/suppliers", {
        supplier_name: String(inputs.supplier_name),
        supplier_address: String(inputs.supplier_address),
        supplier_phone: String(inputs.supplier_phone),
        supplier_email: String(inputs.supplier_email),
      })
      .then((res) => res.data);
  };

  const handleReset = () => {
    setInputs({
      supplier_name: "",
      supplier_address: "",
      supplier_phone: "",
      supplier_email: "",
    });
    setErrors({});
    setTouched({
      supplier_name: false,
      supplier_address: false,
      supplier_phone: false,
      supplier_email: false,
    });
    setCurrentStep(1);
  };

  const getFieldClass = (fieldName) => {
    if (!touched[fieldName]) return "";
    return errors[fieldName] ? "add-suppliers-input-error" : "add-suppliers-input-valid";
  };

  return (
    <div className="add-suppliers-container">
      <HeadBar />
      <GMNav />
      <div className="add-suppliers-content-wrapper">
        <motion.div
          className="add-suppliers-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="add-suppliers-form-header">
            <h2 className="add-suppliers-form-title">Add New Supplier</h2>
            <div className="add-suppliers-progress-bar-container">
              <div className="add-suppliers-progress-steps">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`add-suppliers-step ${i + 1 <= currentStep ? "active" : ""} ${
                      i + 1 < currentStep ? "completed" : ""
                    }`}
                  >
                    {i + 1 < currentStep ? (
                      <span className="add-suppliers-step-check">✓</span>
                    ) : (
                      <span className="add-suppliers-step-number">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="add-suppliers-progress-line">
                <div
                  className="add-suppliers-progress-line-inner"
                  style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          {success ? (
            <motion.div
              className="add-suppliers-success-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="add-suppliers-success-icon">
                <svg className="add-suppliers-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="add-suppliers-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="add-suppliers-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h3>Supplier Added Successfully!</h3>
              <p>Redirecting to suppliers list...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={loading ? "loading" : ""}>
              <div className="add-suppliers-form-step-wrapper">
                <motion.div
                  className="add-suppliers-form-step-content"
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <>
                      <div className="add-suppliers-step-title">
                        <h3>Basic Information</h3>
                        <p>Enter the supplier's name and contact information</p>
                      </div>
                      <div className="add-suppliers-form-group">
                        <label htmlFor="supplier_name">
                          Supplier Name
                          <span className="add-suppliers-required-star">*</span>
                        </label>
                        <div className="add-suppliers-input-container">
                          <input
                            id="supplier_name"
                            type="text"
                            name="supplier_name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={inputs.supplier_name}
                            placeholder="Enter Supplier Name"
                            className={getFieldClass("supplier_name")}
                            disabled={loading}
                          />
                          <div className="add-suppliers-input-icon">
                            <i className="fas fa-user"></i>
                          </div>
                          {touched.supplier_name && errors.supplier_name && (
                            <motion.div
                              className="add-suppliers-error-message"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {errors.supplier_name}
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <div className="add-suppliers-form-group">
                        <label htmlFor="supplier_phone">
                          Contact Number
                          <span className="add-suppliers-required-star">*</span>
                        </label>
                        <div className="add-suppliers-input-container">
                          <input
                            id="supplier_phone"
                            type="tel"
                            name="supplier_phone"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={inputs.supplier_phone}
                            placeholder="Enter 10-digit number"
                            className={getFieldClass("supplier_phone")}
                            disabled={loading}
                            maxLength={10}
                          />
                          <div className="add-suppliers-input-icon">
                            <i className="fas fa-phone"></i>
                          </div>
                          {touched.supplier_phone && errors.supplier_phone && (
                            <motion.div
                              className="add-suppliers-error-message"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {errors.supplier_phone}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <div className="add-suppliers-step-title">
                        <h3>Additional Details</h3>
                        <p>Enter the supplier's address and email</p>
                      </div>
                      <div className="add-suppliers-form-group">
                        <label htmlFor="supplier_address">
                          Address
                          <span className="add-suppliers-required-star">*</span>
                        </label>
                        <div className="add-suppliers-input-container">
                          <textarea
                            id="supplier_address"
                            name="supplier_address"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={inputs.supplier_address}
                            placeholder="Enter Supplier Address"
                            className={`textarea ${getFieldClass("supplier_address")}`}
                            disabled={loading}
                            rows={3}
                          />
                          <div className="add-suppliers-input-icon add-suppliers-textarea-icon">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          {touched.supplier_address && errors.supplier_address && (
                            <motion.div
                              className="add-suppliers-error-message"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {errors.supplier_address}
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <div className="add-suppliers-form-group">
                        <label htmlFor="supplier_email">
                          Email Address
                          <span className="add-suppliers-required-star">*</span>
                        </label>
                        <div className="add-suppliers-input-container">
                          <input
                            id="supplier_email"
                            type="email"
                            name="supplier_email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={inputs.supplier_email}
                            placeholder="Enter Email Address"
                            className={getFieldClass("supplier_email")}
                            disabled={loading}
                          />
                          <div className="add-suppliers-input-icon">
                            <i className="fas fa-envelope"></i>
                          </div>
                          {touched.supplier_email && errors.supplier_email && (
                            <motion.div
                              className="add-suppliers-error-message"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {errors.supplier_email}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
              <div className="add-suppliers-form-actions">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="add-suppliers-btn-secondary"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    className="add-suppliers-btn-primary"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <div className="add-suppliers-final-buttons">
                    <button
                      type="button"
                      className="add-suppliers-btn-outlined"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="add-suppliers-btn-submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="add-suppliers-loader"></div>
                      ) : (
                        <>Submit <i className="fas fa-check"></i></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddSupplier;