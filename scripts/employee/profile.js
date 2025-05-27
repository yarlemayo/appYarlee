/**
 * Employee Profile Module for Sistema de Nómina - Parroquia San Francisco de Asís
 * Handles employee profile display
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

// Load employee profile data
function loadProfileData() {
  // Get current user's employee ID
  const employeeId = currentUser.employeeId;
  if (!employeeId) return;

  // Get employee data
  const employee = window.Storage.getEmployees().find(emp => emp.id === employeeId);
  if (!employee) return;

  // Update personal information
  document.getElementById('full-name').textContent = `${employee.firstName} ${employee.lastName}`;
  document.getElementById('document').textContent = employee.document;
  document.getElementById('email').textContent = employee.email || '-';
  document.getElementById('phone').textContent = employee.phone || '-';

  // Update employment information
  document.getElementById('position').textContent = employee.position;
  document.getElementById('department').textContent = employee.department;
  document.getElementById('join-date').textContent = formatDate(employee.joinDate);
  document.getElementById('base-salary').textContent = formatCurrency(employee.salary);

  // Update bank information
  document.getElementById('bank-name').textContent = employee.bankName || '-';
  document.getElementById('account-type').textContent = employee.accountType || '-';
  document.getElementById('account-number').textContent = employee.bankAccount || '-';
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
  loadProfileData();

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