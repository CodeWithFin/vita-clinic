<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  import Select from '../../components/Select.svelte';
  
  let loading = false;
  let doctors = [];
  let selectedDoctor = '';
  let selectedDate = '';
  let selectedTime = '';
  let notes = '';
  let error = '';
  let success = false;
  
  onMount(async () => {
    if (!$user || $user.role !== 'patient') {
      navigate('/login');
      return;
    }
    
    // Doctor selection disabled for now - will be assigned by receptionist
    doctors = [];
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    selectedDate = tomorrow.toISOString().split('T')[0];
    
    // Set default time to 9:00 AM
    selectedTime = '09:00';
  });
  
  async function handleSubmit() {
    error = '';
    
    if (!selectedDate) {
      error = 'Please select a date';
      return;
    }
    
    if (!selectedTime) {
      error = 'Please select a time';
      return;
    }
    
    loading = true;
    
    try {
      // Combine date and time into ISO format
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00.000Z`;
      
      await api.bookAppointment({
        doctorId: null, // Doctor will be assigned by receptionist
        date: appointmentDateTime,
        notes: notes,
      });
      
      success = true;
      setTimeout(() => {
        navigate('/patient/dashboard');
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
        Book Appointment
      </h1>
      <p class="text-text-main/60 text-lg">Schedule your next clinic visit</p>
    </div>
    
    {#if success}
      <Card>
        <div class="text-center py-12">
          <div class="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <iconify-icon icon="solar:check-circle-bold" width="40" class="text-accent-green"></iconify-icon>
          </div>
          <h2 class="text-2xl font-semibold mb-2">Appointment Booked!</h2>
          <p class="text-text-main/60">Redirecting to your dashboard...</p>
        </div>
      </Card>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form -->
        <div class="lg:col-span-2">
          <Card padding="loose">
            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
              <div>
                <h3 class="text-xl font-semibold mb-4">Appointment Details</h3>
                
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Preferred Date"
                      bind:value={selectedDate}
                      required
                    />
                    
                    <Input
                      type="time"
                      label="Preferred Time"
                      bind:value={selectedTime}
                      required
                    />
                  </div>
                  
                  <div class="p-4 bg-accent-lime/10 border border-accent-lime/30 rounded-lg">
                    <p class="text-sm text-text-main/80">
                      <iconify-icon icon="solar:info-circle-bold" width="16" class="mr-1"></iconify-icon>
                      A doctor will be assigned to your appointment by our reception team. Clinic hours: 9 AM - 6 PM.
                    </p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-text-main mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      bind:value={notes}
                      placeholder="Any specific concerns or symptoms..."
                      rows="4"
                      class="w-full px-4 py-2.5 border border-black/10 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-accent-lime
                             transition-all duration-200"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {#if error}
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              {/if}
              
              <div class="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  {loading}
                >
                  Book Appointment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  on:click={() => navigate('/patient/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        <!-- Info Sidebar -->
        <div class="space-y-6">
          <Card title="Clinic Hours">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-text-main/60">Mon - Fri</span>
                <span class="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-main/60">Saturday</span>
                <span class="font-medium">9:00 AM - 2:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-main/60">Sunday</span>
                <span class="font-medium">Closed</span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-black/10">
              <p class="text-xs text-text-main/60">
                💡 Tip: Morning appointments (9-11 AM) typically have shorter wait times
              </p>
            </div>
          </Card>
          
          <div class="bg-accent-lime/10 border border-accent-lime/30 rounded-xl p-6">
            <div class="flex items-start gap-3">
              <iconify-icon icon="solar:info-circle-bold" width="24" class="text-text-main"></iconify-icon>
              <div>
                <h3 class="font-semibold mb-2">Important</h3>
                <ul class="text-sm text-text-main/80 space-y-2">
                  <li>• Arrive 10 minutes early</li>
                  <li>• Bring your ID and insurance</li>
                  <li>• Check queue status before visit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

