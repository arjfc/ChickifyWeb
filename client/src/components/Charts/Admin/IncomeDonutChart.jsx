// src/components/Charts/Admin/IncomeDonutChart.jsx
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

export default function IncomeDonutChart({ data }) {
  const { labels = [], series = [] } = data || {};

  const total = useMemo(
    () => (series || []).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [series]
  );

  if (!series || !series.length || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-sm text-gray-400">
        No income data for this period.
      </div>
    );
  }

  const options = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels,
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      labels: { colors: "#4b5563" },
      markers: {
        width: 10,
        height: 10,
        radius: 999,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    stroke: {
      width: 1,
      colors: ["#ffffff"],
    },
    colors: [
      "#FACC15", // yellow
      "#4ADE80", // green
      "#38BDF8", // blue
      "#FB7185", // red
      "#A855F7", // purple
      "#F97316", // orange
    ],
    tooltip: {
      y: {
        formatter: (val) =>
          "₱" + Number(val || 0).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              offsetY: 8,
              color: "#6b7280",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val) =>
                "₱" +
                Number(val || 0).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }),
            },
            total: {
              show: true,
              label: "Total",
              color: "#6b7280",
              fontSize: "13px",
              formatter: () =>
                "₱" +
                total.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }),
            },
          },
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={260}
      />
    </div>
  );
}
