// src/components/Charts/Admin/Sales30Chart.jsx
import React from "react";
import LineChart from "./LineChart";

/**
 * Sales30Chart
 *
 * Wrapper around the existing Admin LineChart.
 * Used to show a 30-day sales trend.
 * Pass `data` in the same format LineChart currently expects.
 */
export default function Sales30Chart({ data = [] }) {
  // We don't highlight bestProduct here, so only pass `data`.
  return <LineChart data={data} />;
}
