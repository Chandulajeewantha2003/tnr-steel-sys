import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewSalesRequests.css";
import SalesNav from "../SalesNav/SalesNav";
import HeadBar from "../HeadBar/HeadBar";
import { jsPDF } from "jspdf";
function ViewSalesRequests() {
  return (
    <div>
      <SalesNav />
      <HeadBar />
      <h2 className="view-sales-requests-title">Sales Requests</h2>
    </div>
  )
}

export default ViewSalesRequests
