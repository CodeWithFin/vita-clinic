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
    if (!$user || $user.role !== 'doctor') {
      navigate('/staff-login');
      return;
    }
    
    try {
      dashboardData = await api.getDoctorDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      loading = false;
    }
  });
  
  async function handleCallNext() {
    try {
      await api.callNextPatient();
      // Reload dashboard
      dashboardData = await api.getDoctorDashboard();
    } catch (error) {
      alert('Failed to call next patient');
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Doctor Dashboard
          </h1>
          <p class="text-text-main/60 text-lg">Welcome, Dr. {$user?.name || 'Doctor'}</p>
        </div>
        <Button variant="secondary" on:click={handleCallNext}>
          <iconify-icon icon="solar:bell-bold" width="18" class="mr-2"></iconify-icon>
          Call Next Patient
        </Button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Today's Patients</span>
            <iconify-icon icon="solar:users-group-rounded-bold" width="24" class="text-accent-lime"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.todayPatients || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">In Queue</span>
            <iconify-icon icon="solar:clock-circle-bold" width="24" class="text-accent-pink"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.inQueue || 0}</div>
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
            <span class="text-sm text-text-main/60">Avg. Time</span>
            <iconify-icon icon="solar:hourglass-bold" width="24" class="text-text-main"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.avgTime || 0}m</div>
        </div>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Current Patient">
          {#if dashboardData?.currentPatient}
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-accent-lime/10 rounded-lg">
                <div class="w-16 h-16 rounded-full bg-accent-lime/20 flex items-center justify-center">
                  <iconify-icon icon="solar:user-bold" width="32"></iconify-icon>
                </div>
                <div>
                  <div class="text-xl font-semibold">{dashboardData.currentPatient.name}</div>
                  <div class="text-sm text-text-main/60">Age: {dashboardData.currentPatient.age} • {dashboardData.currentPatient.gender}</div>
                </div>
              </div>
              
              <Button
                variant="primary"
                fullWidth
                on:click={() => navigate(`/doctor/records?id=${dashboardData.currentPatient.id}`)}
              >
                View Full Records
              </Button>
            </div>
          {:else}
            <div class="text-center py-8 text-text-main/60">
              No patient currently being seen
            </div>
          {/if}
        </Card>
        
        <Card title="Today's Schedule">
          {#if dashboardData?.schedule?.length > 0}
            <div class="space-y-2">
              {#each dashboardData.schedule as appointment}
                <div class="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <div class="text-sm font-mono">{appointment.time}</div>
                  <div class="flex-grow">
                    <div class="font-medium">{appointment.patientName}</div>
                  </div>
                  <Badge variant={appointment.completed ? 'success' : 'info'}>
                    {appointment.completed ? 'Done' : 'Pending'}
                  </Badge>
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

