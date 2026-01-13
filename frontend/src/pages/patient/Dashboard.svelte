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
    if (!$user || $user.role !== 'patient') {
      navigate('/login');
      return;
    }
    
    try {
      dashboardData = await api.getPatientDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      loading = false;
    }
  });
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <!-- Hero Section -->
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Welcome back, {$user?.name || 'Patient'}
          </h1>
          <p class="text-text-main/60 text-lg">Your health journey at a glance</p>
        </div>
        <Button variant="secondary" on:click={() => navigate('/patient/book')}>
          <iconify-icon icon="solar:calendar-add-bold" width="18" class="mr-2"></iconify-icon>
          Book Appointment
        </Button>
      </div>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Total Visits</span>
            <iconify-icon icon="solar:heart-pulse-bold" width="24" class="text-accent-pink"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.totalVisits || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Upcoming</span>
            <iconify-icon icon="solar:calendar-bold" width="24" class="text-accent-lime"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.upcomingVisits || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Prescriptions</span>
            <iconify-icon icon="solar:document-medicine-bold" width="24" class="text-accent-green"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.prescriptions || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Queue Position</span>
            <iconify-icon icon="solar:users-group-rounded-bold" width="24" class="text-text-main"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">
            {#if dashboardData?.queuePosition}
              #{dashboardData.queuePosition}
            {:else}
              <span class="text-xl text-text-main/40">N/A</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Upcoming Visit -->
          {#if dashboardData?.upcomingVisit}
            <Card title="Next Appointment" subtitle="Your upcoming visit details">
              <div class="space-y-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-full bg-accent-lime/20 flex items-center justify-center">
                      <iconify-icon icon="solar:calendar-mark-bold" width="24"></iconify-icon>
                    </div>
                    <div>
                      <div class="font-semibold text-lg">{formatDate(dashboardData.upcomingVisit.date)}</div>
                      <div class="text-text-main/60 text-sm">{formatTime(dashboardData.upcomingVisit.date)}</div>
                      {#if dashboardData.upcomingVisit.doctor}
                        <div class="text-sm mt-1">
                          Dr. {dashboardData.upcomingVisit.doctor.name}
                        </div>
                      {/if}
                    </div>
                  </div>
                  <Badge variant="info">Scheduled</Badge>
                </div>
                
                <div class="pt-4 border-t border-black/10">
                  <Button variant="primary" on:click={() => navigate('/patient/queue')}>
                    View Live Queue
                  </Button>
                </div>
              </div>
            </Card>
          {:else}
            <Card>
              <div class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-accent-lime/20 flex items-center justify-center mx-auto mb-4">
                  <iconify-icon icon="solar:calendar-minimalistic-bold" width="32"></iconify-icon>
                </div>
                <h3 class="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                <p class="text-text-main/60 mb-4">Book your next visit to stay on track</p>
                <Button variant="secondary" on:click={() => navigate('/patient/book')}>
                  Book Now
                </Button>
              </div>
            </Card>
          {/if}
          
          <!-- Recent Visits -->
          <Card title="Visit History" subtitle="Your recent medical visits">
            {#if dashboardData?.recentVisits?.length > 0}
              <div class="space-y-3">
                {#each dashboardData.recentVisits as visit, i}
                  <div class="flex items-center gap-4 p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
                      <iconify-icon icon="solar:check-circle-bold" width="20" class="text-accent-green"></iconify-icon>
                    </div>
                    <div class="flex-grow">
                      <div class="font-medium">{formatDate(visit.date)}</div>
                      <div class="text-sm text-text-main/60">
                        {#if visit.doctor}
                          Dr. {visit.doctor.name}
                        {/if}
                      </div>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-text-main/60">
                No visit history yet
              </div>
            {/if}
          </Card>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <Card title="Quick Actions">
            <div class="space-y-3">
              <button
                on:click={() => navigate('/patient/queue')}
                class="w-full flex items-center gap-3 p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div class="w-10 h-10 rounded-full bg-accent-lime/20 flex items-center justify-center">
                  <iconify-icon icon="solar:users-group-two-rounded-bold" width="20"></iconify-icon>
                </div>
                <div>
                  <div class="font-medium">Live Queue</div>
                  <div class="text-xs text-text-main/60">Check your position</div>
                </div>
              </button>
              
              <button
                on:click={() => navigate('/patient/prescriptions')}
                class="w-full flex items-center gap-3 p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div class="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <iconify-icon icon="solar:document-text-bold" width="20"></iconify-icon>
                </div>
                <div>
                  <div class="font-medium">Prescriptions</div>
                  <div class="text-xs text-text-main/60">View your medications</div>
                </div>
              </button>
            </div>
          </Card>
          
          <!-- Health Tip -->
          <div class="bg-gradient-to-br from-accent-lime/20 to-accent-green/20 border border-black/10 rounded-xl p-6">
            <div class="flex items-start gap-3">
              <iconify-icon icon="solar:lightbulb-bolt-bold" width="24" class="text-text-main mt-1"></iconify-icon>
              <div>
                <h3 class="font-semibold mb-2">Health Tip</h3>
                <p class="text-sm text-text-main/80">
                  Stay hydrated! Drinking 8 glasses of water daily helps maintain optimal body function.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

