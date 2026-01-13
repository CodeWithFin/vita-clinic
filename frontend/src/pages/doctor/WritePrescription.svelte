<script>
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  
  let loading = false;
  let patientEmail = '';
  let medications = [
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ];
  let notes = '';
  let error = '';
  let success = false;
  
  function addMedication() {
    medications = [...medications, {
      name: '', dosage: '', frequency: '', duration: '', instructions: ''
    }];
  }
  
  function removeMedication(index) {
    medications = medications.filter((_, i) => i !== index);
  }
  
  async function handleSubmit() {
    error = '';
    
    if (!patientEmail) {
      error = 'Patient email is required';
      return;
    }
    
    if (!medications.some(m => m.name && m.dosage)) {
      error = 'At least one medication is required';
      return;
    }
    
    loading = true;
    
    try {
      await api.createPrescription({
        patientEmail,
        medications: medications.filter(m => m.name && m.dosage),
        notes,
      });
      
      success = true;
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 2000);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/doctor/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
        Write Prescription
      </h1>
      <p class="text-text-main/60 text-lg">Create a new prescription for a patient</p>
    </div>
    
    {#if success}
      <Card>
        <div class="text-center py-12">
          <div class="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <iconify-icon icon="solar:check-circle-bold" width="40" class="text-accent-green"></iconify-icon>
          </div>
          <h2 class="text-2xl font-semibold mb-2">Prescription Created!</h2>
          <p class="text-text-main/60">Patient will be notified</p>
        </div>
      </Card>
    {:else}
      <Card padding="loose">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <Input
            type="email"
            label="Patient Email"
            bind:value={patientEmail}
            placeholder="patient@example.com"
            required
          />
          
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Medications</h3>
              <button
                type="button"
                on:click={addMedication}
                class="text-sm text-accent-green hover:underline flex items-center gap-1"
              >
                <iconify-icon icon="solar:add-circle-bold" width="18"></iconify-icon>
                Add Medication
              </button>
            </div>
            
            <div class="space-y-4">
              {#each medications as medication, index}
                <div class="p-4 border border-black/10 rounded-lg space-y-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">Medication #{index + 1}</span>
                    {#if medications.length > 1}
                      <button
                        type="button"
                        on:click={() => removeMedication(index)}
                        class="text-red-500 hover:text-red-700"
                      >
                        <iconify-icon icon="solar:trash-bin-trash-bold" width="18"></iconify-icon>
                      </button>
                    {/if}
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <Input
                      label="Medicine Name"
                      bind:value={medication.name}
                      placeholder="e.g., Paracetamol"
                      required
                    />
                    <Input
                      label="Dosage"
                      bind:value={medication.dosage}
                      placeholder="e.g., 500mg"
                      required
                    />
                    <Input
                      label="Frequency"
                      bind:value={medication.frequency}
                      placeholder="e.g., Twice daily"
                    />
                    <Input
                      label="Duration"
                      bind:value={medication.duration}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                  
                  <Input
                    label="Special Instructions"
                    bind:value={medication.instructions}
                    placeholder="e.g., Take after meals"
                  />
                </div>
              {/each}
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">
              Additional Notes
            </label>
            <textarea
              bind:value={notes}
              placeholder="Any additional instructions or notes..."
              rows="4"
              class="w-full px-4 py-2.5 border border-black/10 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-accent-lime"
            ></textarea>
          </div>
          
          {#if error}
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          {/if}
          
          <div class="flex gap-3">
            <Button type="submit" variant="primary" fullWidth {loading}>
              Create Prescription
            </Button>
            <Button
              type="button"
              variant="outline"
              on:click={() => navigate('/doctor/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    {/if}
  </div>
</div>

