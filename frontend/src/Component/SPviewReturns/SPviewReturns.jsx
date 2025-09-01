import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SPviewReturns.css";
import SPNav from "../SalesNav/SalesNav";
import jsPDF from "jspdf";
import HeadBar from "../HeadBar/HeadBar";

function SPviewReturns() {
  return (
    <div>
      <SPNav />
      <HeadBar />
       <h2 className="spviewreturns-sales-title">Returns Records</h2>
    </div>
  )
}

export default SPviewReturns
