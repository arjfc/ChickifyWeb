export const SYSTEM_ALERTS = [
  {
    id: 1,
    type: "security",
    title: "Fraud Detection",
    message: "Unusual login attempt detected from a new device in Manila, PH.",
    severity: "high",
    timestamp: "2025-08-19T09:24:00Z",
    status: "unread",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Failure",
    message: "Transaction of ₱5,200 failed for Order #89234.",
    severity: "medium",
    timestamp: "2025-08-19T08:45:00Z",
    status: "unread",
  },
  {
    id: 3,
    type: "account",
    title: "Account Suspension",
    message: "User 'john.doe' has been temporarily suspended due to policy violations.",
    severity: "critical",
    timestamp: "2025-08-18T16:12:00Z",
    status: "resolved",
  },
  {
    id: 4,
    type: "verification",
    title: "Verification Needed",
    message: "KYC verification is pending for 12 new users.",
    severity: "low",
    timestamp: "2025-08-18T12:30:00Z",
    status: "in-progress",
  },
  {
    id: 5,
    type: "system",
    title: "System Health",
    message: "API latency has increased above threshold (350ms).",
    severity: "medium",
    timestamp: "2025-08-19T07:15:00Z",
    status: "unread",
  },
  {
    id: 6,
    type: "security",
    title: "Password Breach Alert",
    message: "3 users need to reset passwords due to suspected breach.",
    severity: "high",
    timestamp: "2025-08-17T22:40:00Z",
    status: "resolved",
  },
  {
    id: 7,
    type: "security",
    title: "Password Breach Alert",
    message: "3 users need to reset passwords due to suspected breach.",
    severity: "high",
    timestamp: "2025-08-17T22:40:00Z",
    status: "resolved",
  },
  {
    id: 8,
    type: "security",
    title: "Password Breach Alert",
    message: "3 users need to reset passwords due to suspected breach.",
    severity: "high",
    timestamp: "2025-08-17T22:40:00Z",
    status: "resolved",
  },
];
export const insights = [
  {
    id: 1,
    type: "security",
    title: "View Complaints this Week",
    message: "Unusual login attempt detected from a new device in Manila, PH.",
    severity: "high",
    timestamp: "2025-08-19T09:24:00Z",
    status: "unread",
  },
  {
    id: 2,
    type: "payment",
    title: "View Payout Requests",
    message: "Transaction of ₱5,200 failed for Order #89234.",
    severity: "medium",
    timestamp: "2025-08-19T08:45:00Z",
    status: "unread",
  },
  {
    id: 3,
    type: "account",
    title: "View Pickup Report",
    message: "User 'john.doe' has been temporarily suspended due to policy violations.",
    severity: "critical",
    timestamp: "2025-08-18T16:12:00Z",
    status: "resolved",
  },
];


// for sales trend bar chart in superadmin
export const salesTrendData = {
  monthly: {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Actual Sales",
        data: [12000, 15000, 18000, 13000, 20000, 22000, 25000, 24000, 21000, 23000, 26000, 30000],
        backgroundColor: "rgba(255, 206, 86, 0.7)", // Yellow
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Target Sales",
        data: [14000, 16000, 17000, 15000, 21000, 23000, 24000, 25000, 22000, 24000, 27000, 31000],
        backgroundColor: "rgba(75, 192, 75, 0.7)", // Green
        borderColor: "rgba(75, 192, 75, 1)",
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  },

  weekly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Actual Sales",
        data: [3500, 4200, 3900, 4600],
        backgroundColor: "rgba(255, 206, 86, 0.7)", 
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Target Sales",
        data: [4000, 4300, 4100, 4800],
        backgroundColor: "rgba(75, 192, 75, 0.7)", 
        borderColor: "rgba(75, 192, 75, 1)",
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  }
};

// Chart Options (reusable)
export const analysisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 50,
      },
    },
  },

};
export const salesTrendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1500,
      },
    },
  },
};

// Customer Growth Analysis Data
export const customerGrowthData = {
  weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Customers",
        data: [30, 45, 25, 60, 40, 55, 70],
        backgroundColor: "#C3C2BE", 
      },
      {
        label: "Returning Customers",
        data: [20, 35, 30, 40, 25, 30, 50],
        backgroundColor: "#FEC619", 
      },
    ],
  },

  monthly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Customers",
        data: [120, 150, 100, 180],
        backgroundColor: "#C3C2BE",
      },
      {
        label: "Returning Customers",
        data: [80, 100, 90, 110],
        backgroundColor: "#FEC619",
      },
    ],
  },
};

// line chart sales trend admin
export const weeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // weekly labels
  datasets: [
    {
      label: "Dataset 1",
      data: [200, 500, 300, 700, 600, 400, 650],
      borderColor: "#C2185B",
      backgroundColor: "#C2185B",
      tension: 0,
      fill: false,
    },
    {
      label: "Dataset 2",
      data: [400, 300, 450, 200, 750, 800, 500],
      borderColor: "#FBC02D",
      backgroundColor: "#FBC02D",
      tension: 0,
      fill: false,
    },
  ],
};

export const monthlyData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // monthly labels
  datasets: [
    {
      label: "Dataset 1",
      data: [800, 950, 400, 600],
      borderColor: "#C2185B",
      backgroundColor: "#C2185B",
      tension: 0,
      fill: false,
    },
    {
      label: "Dataset 2",
      data: [500, 700, 850, 950],
      borderColor: "#FBC02D",
      backgroundColor: "#FBC02D",
      tension: 0,
      fill: false,
    },
  ],
};

export  const lineChartOptions = {
    responsive: true,
     maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: false, 
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 250,
        },
        min: 0,
        max: 1000,
      },
    },
  };


// Doughnut Chart Mock Data
export const orderStatusData = {
  labels: ["Pending", "Preparing", "Delivered"],
  datasets: [
    {
      label: "Order Status",
      data: [20, 35, 45],
      backgroundColor: ["#FFF099", "#FEC619", "#E6AE02"], 
      borderWidth: 2,
    },
  ],
};

export const doughnutOptions = {
  responsive: true,
  cutout: "60%", 
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 15,
      },
    },
  },
};

export const getDoughnutOptions = () => ({
  responsive: true,
  cutout: "60%", 
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
});




