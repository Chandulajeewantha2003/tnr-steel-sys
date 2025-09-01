import React, { useState, useEffect } from "react";
import GMNav from "../GMNav/GMNav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllStockRequestsApproval.css";

function AllStockRequestsApproval() {
  return (
    <div>
      <GMNav />
    </div>
  )
}

export default AllStockRequestsApproval
