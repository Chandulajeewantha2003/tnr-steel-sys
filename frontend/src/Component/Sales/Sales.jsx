import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Sales.css";
import Nav from "../Nav/Nav";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import HeadBar from "../HeadBar/HeadBar";

function Sales() {
  return (
    <div>
       <HeadBar />
      <Nav />
    </div>
  )
}

export default Sales
