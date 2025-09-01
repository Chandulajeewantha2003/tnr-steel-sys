import React, { useState, useEffect } from "react";
import HRNav from "../HRNav/HRNav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddAttendance.css";

function AddAttendance() {
  return (
    <div>
      <HeadBar/>
      <HRNav />
      <header className="hrdashboard-header">
              <h1 className="hrdashboard-title">Add Attendance</h1>
      </header>
    </div>
  )
}

export default AddAttendance
