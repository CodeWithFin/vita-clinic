<script>
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  import Select from '../../components/Select.svelte';
  
  let loading = false;
  let error = '';
  let success = false;
  
  let formData = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  };
  
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];
  
  async function handleSubmit() {
    error = '';
    
    if (!formData.name || !formData.email || !formData.phone) {
      error = 'Please fill in all required fields';
      return;
    }
    
    loading = true;
    
    try {
      await api.registerPatient(formData);
      success = true;
      setTimeout(() => {
        navigate('/receptionist/dashboard');
      }, 2000);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/receptionist/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
        Register Patient
      </h1>
      <p class="text-text-main/60 text-lg">Add a new patient to the system</p>
    </div>
    
    {#if success}
      <Card>
        <div class="text-center py-12">
          <div class="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <iconify-icon icon="solar:check-circle-bold" width="40" class="text-accent-green"></iconify-icon>
          </div>
          <h2 class="text-2xl font-semibold mb-2">Patient Registered!</h2>
          <p class="text-text-main/60">OTP sent to patient's email</p>
        </div>
      </Card>
    {:else}
      <Card padding="loose">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              bind:value={formData.name}
              placeholder="John Doe"
              required
            />
            
            <Input
              type="email"
              label="Email Address"
              bind:value={formData.email}
              placeholder="patient@example.com"
              required
            />
            
            <Input
              type="tel"
              label="Phone Number"
              bind:value={formData.phone}
              placeholder="+1234567890"
              required
            />
            
            <Input
              type="date"
              label="Date of Birth"
              bind:value={formData.dateOfBirth}
            />
            
            <Select
              label="Gender"
              bind:value={formData.gender}
              options={genderOptions}
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">
              Address (Optional)
            </label>
            <textarea
              bind:value={formData.address}
              placeholder="Full address..."
              rows="3"
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
              Register Patient
            </Button>
            <Button
              type="button"
              variant="outline"
              on:click={() => navigate('/receptionist/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    {/if}
  </div>
</div>

