import React, { useState, useEffect } from "react";
import HRNav from "../HRNav/HRNav";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import "./ViewAttendance.css";

function ViewAttendace() {
  return (
    <div>
      <HeadBar/>
      <HRNav />
      <header className="hrdashboard-header">
              <h1 className="hrdashboard-title">View Attendance</h1>
      </header>
    </div>
  )
}

export default ViewAttendace
