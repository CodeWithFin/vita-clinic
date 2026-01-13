<script>
  import { Router, Route } from 'svelte-routing';
  import { onMount } from 'svelte';
  
  // Auth
  import Login from './pages/auth/Login.svelte';
  import StaffLogin from './pages/auth/StaffLogin.svelte';
  
  // Patient
  import PatientDashboard from './pages/patient/Dashboard.svelte';
  import BookAppointment from './pages/patient/BookAppointment.svelte';
  import LiveQueue from './pages/patient/LiveQueue.svelte';
  import Prescriptions from './pages/patient/Prescriptions.svelte';
  
  // Receptionist
  import ReceptionistDashboard from './pages/receptionist/Dashboard.svelte';
  import ManageBookings from './pages/receptionist/ManageBookings.svelte';
  import ManageQueue from './pages/receptionist/ManageQueue.svelte';
  import RegisterPatient from './pages/receptionist/RegisterPatient.svelte';
  
  // Doctor
  import DoctorDashboard from './pages/doctor/Dashboard.svelte';
  import PatientRecords from './pages/doctor/PatientRecords.svelte';
  import WritePrescription from './pages/doctor/WritePrescription.svelte';
  
  // Admin
  import AdminDashboard from './pages/admin/Dashboard.svelte';
  import UserManagement from './pages/admin/UserManagement.svelte';
  import SystemConfig from './pages/admin/SystemConfig.svelte';
  
  // Components
  import Navbar from './components/Navbar.svelte';
  
  // Store
  import { user } from './stores/auth.js';
  
  export let url = "";
  
  onMount(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      user.set(JSON.parse(userData));
    }
  });
</script>

<Router {url}>
  <Navbar />
  
  <main class="pt-16">
    <!-- Auth Routes -->
    <Route path="/" component={Login} />
    <Route path="/login" component={Login} />
    <Route path="/staff-login" component={StaffLogin} />
    
    <!-- Patient Routes -->
    <Route path="/patient/dashboard" component={PatientDashboard} />
    <Route path="/patient/book" component={BookAppointment} />
    <Route path="/patient/queue" component={LiveQueue} />
    <Route path="/patient/prescriptions" component={Prescriptions} />
    
    <!-- Receptionist Routes -->
    <Route path="/receptionist/dashboard" component={ReceptionistDashboard} />
    <Route path="/receptionist/bookings" component={ManageBookings} />
    <Route path="/receptionist/queue" component={ManageQueue} />
    <Route path="/receptionist/register" component={RegisterPatient} />
    
    <!-- Doctor Routes -->
    <Route path="/doctor/dashboard" component={DoctorDashboard} />
    <Route path="/doctor/records" component={PatientRecords} />
    <Route path="/doctor/prescriptions" component={WritePrescription} />
    
    <!-- Admin Routes -->
    <Route path="/admin/dashboard" component={AdminDashboard} />
    <Route path="/admin/users" component={UserManagement} />
    <Route path="/admin/config" component={SystemConfig} />
  </main>
</Router>

