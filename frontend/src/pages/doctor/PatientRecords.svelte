<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Badge from '../../components/Badge.svelte';
  import Input from '../../components/Input.svelte';
  
  let loading = true;
  let patientId = '';
  let patientData = null;
  let searchEmail = '';
  
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    patientId = urlParams.get('id');
    if (patientId) {
      loadPatientData(patientId);
    }
  });
  
  async function loadPatientData(id) {
    loading = true;
    try {
      patientData = await api.getPatientRecords(id);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      loading = false;
    }
  }
  
  async function handleSearch() {
    if (!searchEmail) return;
    try {
      const result = await api.searchPatient(searchEmail);
      if (result.patient) {
        loadPatientData(result.patient.id);
      }
    } catch (error) {
      alert('Patient not found');
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/doctor/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <h1 class="text-5xl font-semibold tracking-tighter-custom mb-6">
        Patient Records
      </h1>
      
      <Card padding="tight">
        <div class="flex gap-3">
          <Input
            type="email"
            placeholder="Search patient by email..."
            bind:value={searchEmail}
          />
          <button
            on:click={handleSearch}
            class="px-6 py-2.5 bg-text-main text-bg-main rounded-lg font-semibold hover:bg-text-main/90"
          >
            Search
          </button>
        </div>
      </Card>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else if patientData}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-6">
          <Card title="Patient Info">
            <div class="space-y-4">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 rounded-full bg-accent-lime/20 flex items-center justify-center">
                  <iconify-icon icon="solar:user-bold" width="32"></iconify-icon>
                </div>
                <div>
                  <div class="text-xl font-semibold">{patientData.name}</div>
                  <div class="text-sm text-text-main/60">{patientData.email}</div>
                </div>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-text-main/60">Age</span>
                  <span class="font-medium">{patientData.age || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-main/60">Gender</span>
                  <span class="font-medium">{patientData.gender || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-main/60">Phone</span>
                  <span class="font-medium">{patientData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div class="lg:col-span-2 space-y-6">
          <Card title="Visit History">
            {#if patientData.visits?.length > 0}
              <div class="space-y-4">
                {#each patientData.visits as visit}
                  <div class="p-4 border border-black/10 rounded-lg">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <div class="font-semibold">
                          {new Date(visit.date).toLocaleDateString()}
                        </div>
                        <div class="text-sm text-text-main/60">
                          Dr. {visit.doctor?.name || 'Unknown'}
                        </div>
                      </div>
                      <Badge variant="success">Completed</Badge>
                    </div>
                    {#if visit.notes}
                      <div class="text-sm text-text-main/80 bg-gray-50 p-3 rounded">
                        {visit.notes}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-text-main/60">
                No visit history
              </div>
            {/if}
          </Card>
          
          <Card title="Prescriptions">
            {#if patientData.prescriptions?.length > 0}
              <div class="space-y-3">
                {#each patientData.prescriptions as prescription}
                  <div class="p-4 border border-black/10 rounded-lg">
                    <div class="font-semibold mb-2">
                      {new Date(prescription.date).toLocaleDateString()}
                    </div>
                    <div class="space-y-2 text-sm">
                      {#each prescription.medications as med}
                        <div class="flex items-center gap-2">
                          <iconify-icon icon="solar:pill-bold" width="16" class="text-accent-green"></iconify-icon>
                          <span>{med.name} - {med.dosage}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-text-main/60">
                No prescriptions
              </div>
            {/if}
          </Card>
        </div>
      </div>
    {:else}
      <Card>
        <div class="text-center py-20">
          <iconify-icon icon="solar:user-circle-bold" width="64" class="text-text-main/20 mb-4"></iconify-icon>
          <p class="text-text-main/60">Search for a patient to view records</p>
        </div>
      </Card>
    {/if}
  </div>
</div>

