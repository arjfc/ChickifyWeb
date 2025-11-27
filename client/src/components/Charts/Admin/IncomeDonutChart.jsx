// src/components/Charts/Admin/IncomeDonutChart.jsx
import React from "react";
import Chart from "react-apexcharts";

export default function IncomeDonutChart({ data, height = 260 }) {
  // fallback if backend sends nothing
  const labels = data?.labels?.length ? data.labels : ["No data"];
  const series =
    data?.series?.length && data.series.some((n) => n > 0)
      ? data.series
      : [1]; // show a gray donut instead of empty

  const options = {
    chart: {
      type: "donut",
    },
    labels,
    legend: {
      position: "bottom",
      fontFamily: "Poppins, system-ui, sans-serif",
      markers: { width: 10, height: 10, radius: 8 },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "11px",
        fontFamily: "Poppins, system-ui, sans-serif",
      },
    },
    stroke: {
      width: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `₱${Number(val || 0).toLocaleString()}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontFamily: "Poppins, system-ui, sans-serif",
              formatter: () => {
                const sum = series.reduce((a, b) => a + (b || 0), 0);
                return `₱${sum.toLocaleString()}`;
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className="w-full flex justify-center">
      <Chart
        options={options}
        series={series}
        type="donut"
        height={height}
        width="100%"
      />
    </div>
  );
}
