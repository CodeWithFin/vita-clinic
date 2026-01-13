<script>
  import { user, logout } from '../stores/auth.js';
  import { link } from 'svelte-routing';
  
  let showMenu = false;
  
  function handleLogout() {
    logout();
  }
  
  $: dashboardLink = $user ? 
    `/${$user.role}/dashboard` : '/';
</script>

<nav class="fixed top-0 w-full z-50 border-b border-black/10 bg-bg-main/90 backdrop-blur-md">
  <div class="max-w-screen-2xl mx-auto flex justify-between items-center h-16 px-4 md:px-8">
    <div class="flex items-center gap-2">
      <a href="/" use:link class="flex items-center gap-2">
        <iconify-icon icon="solar:health-bold" width="24" class="text-text-main"></iconify-icon>
        <span class="text-lg font-semibold tracking-tight text-text-main">Vitapharm Clinic</span>
      </a>
    </div>
    
    {#if $user}
      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-6">
          <a href={dashboardLink} use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
            Dashboard
          </a>
          
          {#if $user.role === 'patient'}
            <a href="/patient/book" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Book Appointment
            </a>
            <a href="/patient/queue" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Live Queue
            </a>
            <a href="/patient/prescriptions" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Prescriptions
            </a>
          {:else if $user.role === 'receptionist'}
            <a href="/receptionist/register" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Register Patient
            </a>
            <a href="/receptionist/bookings" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Bookings
            </a>
            <a href="/receptionist/queue" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Queue
            </a>
          {:else if $user.role === 'doctor'}
            <a href="/doctor/records" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Patient Records
            </a>
            <a href="/doctor/prescriptions" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Prescriptions
            </a>
          {:else if $user.role === 'admin'}
            <a href="/admin/users" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Users
            </a>
            <a href="/admin/config" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
              Settings
            </a>
          {/if}
        </div>
        
        <div class="flex items-center gap-3">
          <div class="text-sm text-text-main/70">
            <span class="font-medium">{$user.name || $user.email}</span>
            <span class="text-xs ml-1 px-2 py-0.5 rounded-full bg-accent-lime/20">
              {$user.role}
            </span>
          </div>
          <button 
            on:click={handleLogout}
            class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity"
          >
            Logout
          </button>
        </div>
      </div>
    {:else}
      <div class="flex items-center gap-4">
        <a href="/login" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
          Patient Login
        </a>
        <a href="/staff-login" use:link class="text-sm font-medium text-text-main hover:opacity-70 transition-opacity">
          Staff Login
        </a>
      </div>
    {/if}
  </div>
</nav>

