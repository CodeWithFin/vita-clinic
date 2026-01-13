const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  // Auth
  sendOTP: (email) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  verifyOTP: (email, otp) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  
  staffLogin: (email, password) => request('/auth/staff-login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  // Patient
  getPatientDashboard: () => request('/patient/dashboard'),
  bookAppointment: (data) => request('/patient/book', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getQueue: () => request('/patient/queue'),
  getPrescriptions: () => request('/patient/prescriptions'),
  
  // Receptionist
  getReceptionistDashboard: () => request('/receptionist/dashboard'),
  registerPatient: (data) => request('/receptionist/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  searchPatient: (email) => request(`/receptionist/patients/search?email=${email}`),
  createBooking: (data) => request('/receptionist/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getBookings: () => request('/receptionist/bookings'),
  updateBooking: (id, data) => request(`/receptionist/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteBooking: (id) => request(`/receptionist/bookings/${id}`, {
    method: 'DELETE',
  }),
  getQueueManagement: () => request('/receptionist/queue'),
  addToQueue: (data) => request('/receptionist/queue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateQueueStatus: (id, status) => request(`/receptionist/queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Doctor
  getDoctorDashboard: () => request('/doctor/dashboard'),
  getPatientRecords: (patientId) => request(`/doctor/patients/${patientId}`),
  getSchedule: () => request('/doctor/schedule'),
  updateSchedule: (data) => request('/doctor/schedule', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  createPrescription: (data) => request('/doctor/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  callNextPatient: () => request('/doctor/queue/next', {
    method: 'POST',
  }),
  
  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getUsers: () => request('/admin/users'),
  createUser: (data) => request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id, data) => request(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => request(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  getConfig: () => request('/admin/config'),
  updateConfig: (data) => request('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getReports: () => request('/admin/reports'),
};

