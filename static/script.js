let data = {};
let chart; // Global variable to hold the chart instance

fetch("data.json")
  .then(response => response.json())
  .then(json => {
    data = json;
  });

function showDetails(level) {
  if (!data[level]) return;

  const box = document.getElementById("details-box");
  const info = data[level];

  box.innerHTML = `
  <div class="arrow-line">Work experience: ${info.experience_range}</div>
  <div class="arrow-line">Average salary before MBA: $${info.average_salary_before}</div>
  <div class="arrow-line">Expected salary after MBA: $${info.average_salary_after}</div>
`;

  // Update chart
  const ctx = document.getElementById("salaryChart").getContext("2d");
  const chartData = {
    labels: ["Before MBA", "After MBA"],
    datasets: [{
      label: `${level} Salary`,
      data: [info.average_salary_before, info.average_salary_after],
      backgroundColor: ["#d2833d", "#8e5d2a"]
    }]
  };

  // Destroy previous chart if exists
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  const chartContainer = document.getElementById("chart-container");
  chartContainer.classList.remove("show"); // Reset hiệu ứng
  chartContainer.offsetHeight; // Force reflow (để hiệu ứng chạy lại)
  
  setTimeout(() => {
    chartContainer.classList.add("show"); // Kích hoạt hiệu ứng
  }, 1300);  
}
