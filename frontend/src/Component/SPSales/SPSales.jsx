import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SPSales.css";
import SalesNav from "../SalesNav/SalesNav";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import HeadBar from "../HeadBar/HeadBar";

function SPSales() {
  return (
    <div>
      <SalesNav />
      <HeadBar />
       <h2 className="indirectsales-sales-title">Indirect Sales Records</h2>
    </div>
  )
}

export default SPSales
