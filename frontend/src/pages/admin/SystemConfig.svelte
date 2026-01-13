<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  
  let loading = true;
  let config = {
    clinicName: 'Vitapharm Clinic',
    appointmentDuration: 30,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    maxQueueSize: 50,
  };
  
  onMount(async () => {
    try {
      const data = await api.getConfig();
      config = { ...config, ...data };
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      loading = false;
    }
  });
  
  async function handleSave() {
    try {
      await api.updateConfig(config);
      alert('Configuration saved successfully');
    } catch (error) {
      alert('Failed to save configuration');
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/admin/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
        System Configuration
      </h1>
      <p class="text-text-main/60 text-lg">Manage clinic settings and preferences</p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="space-y-6">
        <Card title="General Settings" padding="loose">
          <div class="space-y-4">
            <Input
              label="Clinic Name"
              bind:value={config.clinicName}
            />
            
            <Input
              type="number"
              label="Default Appointment Duration (minutes)"
              bind:value={config.appointmentDuration}
            />
            
            <Input
              type="number"
              label="Maximum Queue Size"
              bind:value={config.maxQueueSize}
            />
          </div>
        </Card>
        
        <Card title="Working Hours" padding="loose">
          <div class="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Start Time"
              bind:value={config.workingHoursStart}
            />
            
            <Input
              type="time"
              label="End Time"
              bind:value={config.workingHoursEnd}
            />
          </div>
        </Card>
        
        <div class="flex gap-3">
          <Button variant="primary" fullWidth on:click={handleSave}>
            Save Configuration
          </Button>
          <Button variant="outline" on:click={() => navigate('/admin/dashboard')}>
            Cancel
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>

