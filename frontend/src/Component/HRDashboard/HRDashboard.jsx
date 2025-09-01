import React, { useState, useEffect } from "react";
import HRNav from "../HRNav/HRNav";
import "./HRDashboard.css";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";

function HRDashboard() {
  return (
    <div>
        <HeadBar />
      <HRNav />
      <header className="hrdashboard-header">
              <h1 className="hrdashboard-title">HR Dashboard</h1>
              <p className="hrdashboard-date">
                📅{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </header>
    </div>
  )
}

export default HRDashboard
