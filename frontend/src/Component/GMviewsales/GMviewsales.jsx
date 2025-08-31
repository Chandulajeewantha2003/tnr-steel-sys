import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GMviewsales.css";
import GMNav from "../GMNav/GMNav";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import HeadBar from "../HeadBar/HeadBar";

function GMviewsales() {
  return (
    <div>
       <GMNav />
    </div>
  )
}

export default GMviewsales
