import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewReturns.css";
import Nav from "../Nav/Nav";
import jsPDF from "jspdf";
import HeadBar from "../HeadBar/HeadBar";

function ViewReturns() {
  return (
    <div>
      <HeadBar />
      <Nav />
    </div>
  )
}

export default ViewReturns
