<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  
  let loading = true;
  let dashboardData = null;
  
  onMount(async () => {
    if (!$user || $user.role !== 'admin') {
      navigate('/staff-login');
      return;
    }
    
    try {
      dashboardData = await api.getAdminDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Admin Dashboard
          </h1>
          <p class="text-text-main/60 text-lg">System overview and management</p>
        </div>
        <Button variant="secondary" on:click={() => navigate('/admin/users')}>
          <iconify-icon icon="solar:settings-bold" width="18" class="mr-2"></iconify-icon>
          Manage System
        </Button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Total Patients</span>
            <iconify-icon icon="solar:users-group-rounded-bold" width="24" class="text-accent-lime"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.totalPatients || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Active Doctors</span>
            <iconify-icon icon="solar:health-bold" width="24" class="text-accent-pink"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.activeDoctors || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">Today's Visits</span>
            <iconify-icon icon="solar:calendar-bold" width="24" class="text-accent-green"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">{dashboardData?.stats?.todayVisits || 0}</div>
        </div>
        
        <div class="bg-white border border-black/10 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-main/60">System Uptime</span>
            <iconify-icon icon="solar:shield-check-bold" width="24" class="text-text-main"></iconify-icon>
          </div>
          <div class="text-3xl font-bold">99.9%</div>
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
              on:click={() => navigate('/admin/users')}
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:users-group-rounded-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Manage Users</div>
            </button>
            
            <button
              on:click={() => navigate('/admin/config')}
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:settings-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">System Config</div>
            </button>
            
            <button
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:chart-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Reports</div>
            </button>
            
            <button
              class="p-6 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <iconify-icon icon="solar:documents-bold" width="32" class="mb-3"></iconify-icon>
              <div class="font-semibold">Audit Logs</div>
            </button>
          </div>
        </Card>
        
        <Card title="Recent Activity">
          {#if dashboardData?.recentActivity?.length > 0}
            <div class="space-y-3">
              {#each dashboardData.recentActivity as activity}
                <div class="flex items-start gap-3 p-3 border border-black/10 rounded-lg">
                  <div class="w-8 h-8 rounded-full bg-accent-lime/20 flex items-center justify-center shrink-0">
                    <iconify-icon icon="solar:bell-bold" width="16"></iconify-icon>
                  </div>
                  <div class="flex-grow">
                    <div class="text-sm">{activity.message}</div>
                    <div class="text-xs text-text-main/60">{activity.time}</div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-text-main/60">
              No recent activity
            </div>
          {/if}
        </Card>
      </div>
    {/if}
  </div>
</div>

