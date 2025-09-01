import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyStockChangeRequest.css";

function MyStockChangeRequests() {
  return (
    <div>
       <HeadBar />
      <Nav />
    </div>
  )
}

export default MyStockChangeRequests
