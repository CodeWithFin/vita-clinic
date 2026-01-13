<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Badge from '../../components/Badge.svelte';
  import Select from '../../components/Select.svelte';
  
  let loading = true;
  let queue = [];
  
  const statusOptions = [
    { value: 'waiting', label: 'Waiting' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'no-show', label: 'No Show' },
  ];
  
  onMount(async () => {
    try {
      const data = await api.getQueueManagement();
      queue = data.queue || [];
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      loading = false;
    }
  });
  
  async function handleStatusChange(id, newStatus) {
    try {
      await api.updateQueueStatus(id, newStatus);
      queue = queue.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      );
    } catch (error) {
      alert('Failed to update status');
    }
  }
  
  function getStatusVariant(status) {
    const variants = {
      'waiting': 'info',
      'in-progress': 'warning',
      'completed': 'success',
      'no-show': 'danger',
    };
    return variants[status] || 'default';
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/receptionist/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Manage Queue
          </h1>
          <p class="text-text-main/60 text-lg">Real-time patient queue management</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-accent-green/20 rounded-full">
          <div class="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
          <span class="text-sm font-medium">{queue.length} in queue</span>
        </div>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <Card>
        {#if queue.length > 0}
          <div class="space-y-3">
            {#each queue as patient, index}
              <div class="flex items-center gap-4 p-4 border border-black/10 rounded-lg bg-white">
                <div class="w-12 h-12 rounded-full bg-accent-lime/20 flex items-center justify-center font-bold">
                  #{index + 1}
                </div>
                
                <div class="flex-grow">
                  <div class="font-semibold">{patient.patientName}</div>
                  <div class="text-sm text-text-main/60">
                    {patient.doctor ? `Dr. ${patient.doctor.name}` : 'No doctor assigned'}
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <select
                    value={patient.status}
                    on:change={(e) => handleStatusChange(patient.id, e.target.value)}
                    class="px-3 py-2 border border-black/10 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent-lime/50"
                  >
                    {#each statusOptions as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                  
                  <Badge variant={getStatusVariant(patient.status)}>
                    {patient.status}
                  </Badge>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12">
            <iconify-icon icon="solar:users-group-rounded-bold" width="48" class="text-text-main/20 mb-4"></iconify-icon>
            <p class="text-text-main/60">No patients in queue</p>
          </div>
        {/if}
      </Card>
    {/if}
  </div>
</div>

