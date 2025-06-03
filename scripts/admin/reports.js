/**
 * Reports Module for Sistema de Nómina - Parroquia San Francisco de Asís
 * Handles generation and display of financial reports
 */

// Ensure user is authenticated and has admin role
window.Auth.requireAdmin();

// DOM Elements
const userNameElement = document.getElementById('user-name');
const logoutLink = document.getElementById('logout-link');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const loadingOverlay = document.getElementById('loading-overlay');

// Report specific elements
const reportTypeSelect = document.getElementById('report-type');
const employeeSelect = document.getElementById('employee');
const periodSelect = document.getElementById('period');
const departmentSelect = document.getElementById('department');
const dateStartInput = document.getElementById('date-start');
const dateEndInput = document.getElementById('date-end');
const generateReportButton = document.getElementById('generate-report');
const exportExcelButton = document.getElementById('export-excel');
const exportPdfButton = document.getElementById('export-pdf');

// Summary elements
const totalEmployeesElement = document.getElementById('total-employees');
const totalSalariesElement = document.getElementById('total-salaries');
const totalDeductionsElement = document.getElementById('total-deductions');
const totalNetElement = document.getElementById('total-net');

// Table element
const reportTable = document.getElementById('report-table');

// Chart elements
const departmentChart = document.getElementById('department-chart');
const salaryTrendChart = document.getElementById('salary-trend-chart');

// Set current user name
const currentUser = window.Auth.getCurrentUser();
if (currentUser) {
  userNameElement.textContent = currentUser.name;
}

// Format currency function
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

// Format date function
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-CO', options);
}

// Load filter options
function loadFilterOptions() {
  // Load employees
  const employees = window.Storage.getEmployees();
  employees.sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`;
    const nameB = `${b.firstName} ${b.lastName}`;
    return nameA.localeCompare(nameB);
  });

  employeeSelect.innerHTML = '<option value="">Todos los empleados</option>';
  employees.forEach(employee => {
    const option = document.createElement('option');
    option.value = employee.id;
    option.textContent = `${employee.firstName} ${employee.lastName}`;
    employeeSelect.appendChild(option);
  });

  // Load periods
  const payrolls = window.Storage.getPayrolls();
  const periods = [...new Set(payrolls.map(p => p.period))];
  periods.sort((a, b) => {
    const dateA = payrolls.find(p => p.period === a).endDate;
    const dateB = payrolls.find(p => p.period === b).endDate;
    return new Date(dateB) - new Date(dateA);
  });

  periodSelect.innerHTML = '<option value="">Todos los períodos</option>';
  periods.forEach(period => {
    const option = document.createElement('option');
    option.value = period;
    option.textContent = period;
    periodSelect.appendChild(option);
  });

  // Load departments (updated to only show Despacho and Cementerio)
  const departments = ['Despacho', 'Cementerio'];
  departments.sort();

  departmentSelect.innerHTML = '<option value="">Todos los departamentos</option>';
  departments.forEach(department => {
    const option = document.createElement('option');
    option.value = department;
    option.textContent = department;
    departmentSelect.appendChild(option);
  });

  // Set default dates
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  dateStartInput.value = firstDay.toISOString().split('T')[0];
  dateEndInput.value = lastDay.toISOString().split('T')[0];
}

// Generate sample data for demonstration
function generateSampleData() {
  return {
    employees: [
      {
        name: "Juan Pérez",
        department: "Despacho",
        salary: 1200000,
        deductions: 96000,
        net: 1104000
      },
      {
        name: "María Rodríguez",
        department: "Cementerio",
        salary: 1800000,
        deductions: 144000,
        net: 1656000
      },
      {
        name: "Carlos López",
        department: "Despacho",
        salary: 1100000,
        deductions: 88000,
        net: 1012000
      },
      {
        name: "Ana Martínez",
        department: "Cementerio",
        salary: 1050000,
        deductions: 84000,
        net: 966000
      }
    ],
    departments: {
      "Despacho": { count: 2, total: 2116000 },
      "Cementerio": { count: 2, total: 2622000 }
    },
    salaryTrend: {
      "Julio 2023": { gross: 5150000, net: 4738000 },
      "Agosto 2023": { gross: 5150000, net: 4738000 },
      "Septiembre 2023": { gross: 5150000, net: 4738000 }
    }
  };
}

// Generate report
function generateReport() {
  // Show loading
  loadingOverlay.classList.remove('hide');

  setTimeout(() => {
    try {
      const sampleData = generateSampleData();
      
      // Update summary stats
      totalEmployeesElement.textContent = sampleData.employees.length;
      totalSalariesElement.textContent = formatCurrency(sampleData.employees.reduce((sum, emp) => sum + emp.salary, 0));
      totalDeductionsElement.textContent = formatCurrency(sampleData.employees.reduce((sum, emp) => sum + emp.deductions, 0));
      totalNetElement.textContent = formatCurrency(sampleData.employees.reduce((sum, emp) => sum + emp.net, 0));

      // Update table
      const tbody = reportTable.querySelector('tbody');
      tbody.innerHTML = '';

      sampleData.employees.forEach(emp => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = emp.name;
        
        const deptCell = document.createElement('td');
        deptCell.textContent = emp.department;
        
        const periodCell = document.createElement('td');
        periodCell.textContent = 'Septiembre 2023';
        
        const salaryCell = document.createElement('td');
        salaryCell.textContent = formatCurrency(emp.salary);
        
        const extrasCell = document.createElement('td');
        extrasCell.textContent = formatCurrency(0);
        
        const deductionsCell = document.createElement('td');
        deductionsCell.textContent = formatCurrency(emp.deductions);
        
        const netCell = document.createElement('td');
        netCell.textContent = formatCurrency(emp.net);

        row.appendChild(nameCell);
        row.appendChild(deptCell);
        row.appendChild(periodCell);
        row.appendChild(salaryCell);
        row.appendChild(extrasCell);
        row.appendChild(deductionsCell);
        row.appendChild(netCell);

        tbody.appendChild(row);
      });

      // Update charts
      updateCharts(sampleData);

    } catch (error) {
      console.error('Error generating report:', error);
      showToast('Error al generar el reporte');
    } finally {
      loadingOverlay.classList.add('hide');
    }
  }, 1000); // Simulate loading time
}

// Update charts
function updateCharts(data) {
  // Department distribution chart
  const departmentCtx = departmentChart.getContext('2d');
  if (window.departmentChartInstance) {
    window.departmentChartInstance.destroy();
  }

  window.departmentChartInstance = new Chart(departmentCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(data.departments),
      datasets: [{
        data: Object.values(data.departments).map(d => d.total),
        backgroundColor: [
          '#1a3a6c',
          '#2d5699'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        },
        title: {
          display: true,
          text: 'Distribución por Departamento'
        }
      }
    }
  });

  // Salary trend chart
  const salaryCtx = salaryTrendChart.getContext('2d');
  if (window.salaryChartInstance) {
    window.salaryChartInstance.destroy();
  }

  const periods = Object.keys(data.salaryTrend);
  window.salaryChartInstance = new Chart(salaryCtx, {
    type: 'line',
    data: {
      labels: periods,
      datasets: [
        {
          label: 'Salario Bruto',
          data: periods.map(p => data.salaryTrend[p].gross),
          borderColor: '#1a3a6c',
          tension: 0.1
        },
        {
          label: 'Salario Neto',
          data: periods.map(p => data.salaryTrend[p].net),
          borderColor: '#c9a227',
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Tendencia Salarial'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatCurrency(value)
          }
        }
      }
    }
  });
}

// Export to Excel
function exportToExcel() {
  // Create Excel-like CSV content
  const rows = [];
  
  // Add headers
  rows.push([
    'Empleado',
    'Departamento',
    'Período',
    'Salario Base',
    'Extras',
    'Deducciones',
    'Neto'
  ]);

  // Add data rows
  const tbody = reportTable.querySelector('tbody');
  tbody.querySelectorAll('tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    rows.push([...cells].map(cell => cell.textContent));
  });

  // Convert to CSV
  const csv = rows.map(row => row.join(',')).join('\n');

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'reporte_nomina.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to PDF
function exportToPDF() {
  // Create PDF content
  const content = document.createElement('div');
  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1>Reporte de Nómina</h1>
      <p>Parroquia San Francisco de Asís</p>
      <p>Fecha: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2>Resumen</h2>
      <p>Total Empleados: ${totalEmployeesElement.textContent}</p>
      <p>Total Salarios: ${totalSalariesElement.textContent}</p>
      <p>Total Deducciones: ${totalDeductionsElement.textContent}</p>
      <p>Total Neto: ${totalNetElement.textContent}</p>
    </div>
    
    ${reportTable.outerHTML}
  `;

  // Use html2pdf to generate PDF
  const opt = {
    margin: 1,
    filename: 'reporte_nomina.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().from(content).set(opt).save();
}

// Show toast notification
function showToast(message, duration = 3000) {
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Event handlers
document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadFilterOptions();

  // Handle report type change
  reportTypeSelect.addEventListener('change', function() {
    const type = this.value;
    
    // Show/hide relevant filters
    document.getElementById('employee-filter').style.display = 
      type === 'employee' ? 'block' : 'none';
    document.getElementById('period-filter').style.display = 
      type === 'period' ? 'block' : 'none';
    document.getElementById('department-filter').style.display = 
      type === 'department' ? 'block' : 'none';
  });

  // Handle generate report
  generateReportButton.addEventListener('click', generateReport);

  // Handle exports
  exportExcelButton.addEventListener('click', exportToExcel);
  exportPdfButton.addEventListener('click', exportToPDF);

  // Handle logout
  logoutLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.Auth.logout();
  });

  // Handle sidebar toggle
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('show');
  });
});