<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Card from '../../components/Card.svelte';
  import Badge from '../../components/Badge.svelte';
  
  let loading = true;
  let prescriptions = [];
  let selectedPrescription = null;
  
  onMount(async () => {
    if (!$user || $user.role !== 'patient') {
      navigate('/login');
      return;
    }
    
    try {
      const data = await api.getPrescriptions();
      prescriptions = data.prescriptions || [];
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      loading = false;
    }
  });
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  function selectPrescription(prescription) {
    selectedPrescription = prescription;
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <button
        on:click={() => navigate('/patient/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
        Prescriptions
      </h1>
      <p class="text-text-main/60 text-lg">Your medical prescriptions and history</p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Prescriptions List -->
        <div class="lg:col-span-1 space-y-4">
          <Card title="All Prescriptions" subtitle={`${prescriptions.length} total`}>
            {#if prescriptions.length > 0}
              <div class="space-y-2">
                {#each prescriptions as prescription}
                  <button
                    on:click={() => selectPrescription(prescription)}
                    class="w-full text-left p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition-colors
                           {selectedPrescription?.id === prescription.id ? 'bg-accent-lime/10 border-accent-lime/30' : 'bg-white'}"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div class="font-medium">{formatDate(prescription.date)}</div>
                      <Badge variant="info" size="sm">
                        {prescription.medications?.length || 0} meds
                      </Badge>
                    </div>
                    <div class="text-sm text-text-main/60">
                      {#if prescription.doctor}
                        Dr. {prescription.doctor.name}
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-text-main/60">
                No prescriptions yet
              </div>
            {/if}
          </Card>
        </div>
        
        <!-- Prescription Details -->
        <div class="lg:col-span-2">
          {#if selectedPrescription}
            <Card>
              <div class="space-y-6">
                <!-- Header -->
                <div class="flex items-start justify-between pb-6 border-b border-black/10">
                  <div>
                    <h2 class="text-2xl font-semibold mb-2">
                      Prescription Details
                    </h2>
                    <p class="text-text-main/60">
                      Issued on {formatDate(selectedPrescription.date)}
                    </p>
                  </div>
                  <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <iconify-icon icon="solar:printer-bold" width="24"></iconify-icon>
                  </button>
                </div>
                
                <!-- Doctor Info -->
                {#if selectedPrescription.doctor}
                  <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div class="w-12 h-12 rounded-full bg-accent-lime/20 flex items-center justify-center">
                      <iconify-icon icon="solar:user-bold" width="24"></iconify-icon>
                    </div>
                    <div>
                      <div class="font-semibold">Dr. {selectedPrescription.doctor.name}</div>
                      <div class="text-sm text-text-main/60">{selectedPrescription.doctor.specialization || 'General Physician'}</div>
                    </div>
                  </div>
                {/if}
                
                <!-- Medications -->
                <div>
                  <h3 class="font-semibold text-lg mb-4">Medications</h3>
                  <div class="space-y-3">
                    {#each selectedPrescription.medications || [] as medication, index}
                      <div class="p-4 border border-black/10 rounded-lg">
                        <div class="flex items-start justify-between mb-2">
                          <div>
                            <div class="font-semibold text-lg">{medication.name}</div>
                            <div class="text-sm text-text-main/60">{medication.dosage}</div>
                          </div>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <div class="mt-3 pt-3 border-t border-black/10 space-y-2 text-sm">
                          <div class="flex items-center gap-2">
                            <iconify-icon icon="solar:clock-circle-bold" width="16" class="text-text-main/60"></iconify-icon>
                            <span><strong>Frequency:</strong> {medication.frequency}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <iconify-icon icon="solar:calendar-bold" width="16" class="text-text-main/60"></iconify-icon>
                            <span><strong>Duration:</strong> {medication.duration}</span>
                          </div>
                          {#if medication.instructions}
                            <div class="flex items-start gap-2">
                              <iconify-icon icon="solar:info-circle-bold" width="16" class="text-text-main/60 mt-0.5"></iconify-icon>
                              <span><strong>Instructions:</strong> {medication.instructions}</span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
                
                <!-- Doctor's Notes -->
                {#if selectedPrescription.notes}
                  <div class="p-4 bg-accent-lime/10 rounded-lg">
                    <div class="flex items-start gap-3">
                      <iconify-icon icon="solar:document-text-bold" width="20" class="text-text-main mt-0.5"></iconify-icon>
                      <div>
                        <h4 class="font-semibold mb-1">Doctor's Notes</h4>
                        <p class="text-sm text-text-main/80">{selectedPrescription.notes}</p>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </Card>
          {:else}
            <Card>
              <div class="text-center py-20">
                <div class="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
                  <iconify-icon icon="solar:document-medicine-bold" width="40"></iconify-icon>
                </div>
                <h3 class="text-xl font-semibold mb-2">Select a Prescription</h3>
                <p class="text-text-main/60">Choose from your prescription history to view details</p>
              </div>
            </Card>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

