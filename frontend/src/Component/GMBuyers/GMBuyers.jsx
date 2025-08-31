import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import axios from "axios";
import Buyer from "./GMBuyer";
import "./GMBuyer.css";
import HeadBar from "../HeadBar/HeadBar";

import jsPDF from "jspdf"; // Import jsPDF

const URL = "http://localhost:5000/buyers";

function GMBuyers() {
  return (
    <div>
      Testing Page GMBuyers
    </div>
  )
}

export default GMBuyers
