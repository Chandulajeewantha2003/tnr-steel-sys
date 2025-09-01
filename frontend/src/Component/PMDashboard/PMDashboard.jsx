import React, { useState, useEffect } from "react";
import PMNav from "../PMNav/PMNav";
import "./PMDashboard.css";
import { Link } from "react-router-dom";
import HeadBar from "../HeadBar/HeadBar";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";

function PMDashboard() {
  return (
    <div className="pm-dashboard-container">
      <HeadBar />
      <PMNav />

      <div className="pm-dashboard-content">
        <div className="pm-dashboard-header">
          <h2 className="pm-dashboard-title">Production Manager Dashboard</h2>
          <div className="pm-dashboard-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PMDashboard;
