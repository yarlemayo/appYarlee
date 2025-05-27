/**
 * Employee Receipt Module for Sistema de Nómina - Parroquia San Francisco de Asís
 * Handles receipt viewing and downloading functionality
 */

// Ensure user is authenticated and has employee role
window.Auth.requireEmployee();

// DOM Elements
const userNameElement = document.getElementById('user-name');
const logoutLink = document.getElementById('logout-link');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Receipt elements
const downloadReceiptButton = document.getElementById('download-receipt');
const printReceiptButton = document.getElementById('print-receipt');

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

// Load receipt data
function loadReceiptData() {
  // Get current user's employee ID
  const employeeId = currentUser.employeeId;
  if (!employeeId) return;

  // Get employee data
  const employee = window.Storage.getEmployees().find(emp => emp.id === employeeId);
  if (!employee) return;

  // Get latest payroll item for this employee
  const payrollItems = window.Storage.getPayrollItemsByEmployeeId(employeeId);
  if (!payrollItems.length) return;

  // Sort by date (most recent first) and get the latest
  payrollItems.sort((a, b) => {
    const payrollA = window.Storage.getPayrollById(a.payrollId);
    const payrollB = window.Storage.getPayrollById(b.payrollId);
    return new Date(payrollB.endDate) - new Date(payrollA.endDate);
  });

  const latestPayrollItem = payrollItems[0];
  const payroll = window.Storage.getPayrollById(latestPayrollItem.payrollId);

  // Update receipt with data
  document.getElementById('receipt-period').textContent = `Período: ${payroll.period}`;
  document.getElementById('employee-name').textContent = `${employee.firstName} ${employee.lastName}`;
  document.getElementById('employee-document').textContent = employee.document;
  document.getElementById('employee-position').textContent = employee.position;
  document.getElementById('employee-department').textContent = employee.department;

  document.getElementById('base-salary').textContent = formatCurrency(employee.salary);
  document.getElementById('worked-days').textContent = latestPayrollItem.daysWorked;
  document.getElementById('overtime').textContent = formatCurrency(latestPayrollItem.overtime || 0);
  document.getElementById('total-earned').textContent = formatCurrency(latestPayrollItem.grossSalary);

  document.getElementById('health-deduction').textContent = formatCurrency(latestPayrollItem.healthDeduction);
  document.getElementById('pension-deduction').textContent = formatCurrency(latestPayrollItem.pensionDeduction);
  document.getElementById('other-deductions').textContent = formatCurrency(latestPayrollItem.otherDeductions || 0);

  const totalDeductions = latestPayrollItem.healthDeduction + 
    latestPayrollItem.pensionDeduction + 
    (latestPayrollItem.otherDeductions || 0);

  document.getElementById('total-deductions').textContent = formatCurrency(totalDeductions);
  document.getElementById('total-payment').textContent = formatCurrency(latestPayrollItem.netSalary);
  document.getElementById('issue-date').textContent = formatDate(new Date().toISOString());
}

// Download receipt as PDF
function downloadReceipt() {
  const element = document.getElementById('receipt-preview');
  const employeeName = document.getElementById('employee-name').textContent;
  const period = document.getElementById('receipt-period').textContent.replace('Período: ', '');

  const opt = {
    margin: 1,
    filename: `comprobante_${employeeName.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'legal', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// Print receipt
function printReceipt() {
  window.print();
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
  loadReceiptData();

  // Handle download
  downloadReceiptButton.addEventListener('click', downloadReceipt);

  // Handle print
  printReceiptButton.addEventListener('click', printReceipt);

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