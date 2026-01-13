<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Badge from '../../components/Badge.svelte';
  
  let loading = true;
  let dashboardData = null;
  
  onMount(async () => {
    if (!$user || $user.role !== 'receptionist') {
      navigate('/staff-login');
      return;
    }
    
    try {
      dashboardData = await api.getReceptionistDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      loading = false;
    }
  });
  
  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Receptionist Dashboard
          </h1>
          <p class="text-text-main/60 text-lg">Manage appointments and patient flow</p>
        </div>
        <Button variant="secondary" on:click={() => navigate('/receptionist/register')}>
          <iconify-icon icon="solar:user-plus-bold" width="18" class="mr-2"></iconify-icon>
          Register Patient
        </Button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Today's Queue</span>
            <iconify-icon icon="solar:users-group-rounded-bold" width="24" class="text-accent-lime"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.queueCount || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Appointments</span>
            <iconify-icon icon="solar:calendar-bold" width="24" class="text-accent-pink"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.appointmentsToday || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Completed</span>
            <iconify-icon icon="solar:check-circle-bold" width="24" class="text-accent-green"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.completed || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">No-Shows</span>
            <iconify-icon icon="solar:close-circle-bold" width="24" class="text-red-400"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.noShows || 0}</div>
        </div>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Quick Actions">
          <div class="grid grid-cols-2 gap-3">
            <button
              on:click={() => navigate('/receptionist/register')}
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:user-plus-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Register Patient</div>
            </button>
            
            <button
              on:click={() => navigate('/receptionist/bookings')}
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:calendar-add-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">New Booking</div>
            </button>
            
            <button
              on:click={() => navigate('/receptionist/queue')}
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:list-check-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Manage Queue</div>
            </button>
            
            <button
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:magnifer-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Search Patient</div>
            </button>
          </div>
        </Card>
        
        <Card title="Today's Appointments">
          {#if dashboardData?.upcomingAppointments?.length > 0}
            <div class="space-y-2">
              {#each dashboardData.upcomingAppointments.slice(0, 5) as appointment}
                <div class="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <div class="w-10 h-10 rounded-full bg-accent-lime/20 flex items-center justify-center text-sm font-bold">
                    {formatTime(appointment.time)}
                  </div>
                  <div class="flex-grow">
                    <div class="font-medium">{appointment.patientName}</div>
                    <div class="text-sm text-text-main/60">
                      {appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'No doctor assigned'}
                    </div>
                  </div>
                  <Badge variant="info">Scheduled</Badge>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-text-main/60">
              No appointments scheduled
            </div>
          {/if}
        </Card>
      </div>
    {/if}
  </div>
</div>

