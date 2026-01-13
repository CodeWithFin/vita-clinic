<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Badge from '../../components/Badge.svelte';
  
  let loading = true;
  let bookings = [];
  
  onMount(async () => {
    try {
      const data = await api.getBookings();
      bookings = data.bookings || [];
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      loading = false;
    }
  });
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  async function handleCancelBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.deleteBooking(id);
        bookings = bookings.filter(b => b.id !== id);
      } catch (error) {
        alert('Failed to cancel booking');
      }
    }
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
            Manage Bookings
          </h1>
          <p class="text-text-main/60 text-lg">View and manage patient appointments</p>
        </div>
        <Button variant="secondary">
          <iconify-icon icon="solar:calendar-add-bold" width="18" class="mr-2"></iconify-icon>
          New Booking
        </Button>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <Card>
        {#if bookings.length > 0}
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b border-black/10">
                <tr class="text-left">
                  <th class="pb-3 font-semibold">Patient</th>
                  <th class="pb-3 font-semibold">Date</th>
                  <th class="pb-3 font-semibold">Doctor</th>
                  <th class="pb-3 font-semibold">Status</th>
                  <th class="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each bookings as booking}
                  <tr class="border-b border-black/10">
                    <td class="py-4">
                      <div class="font-medium">{booking.patientName}</div>
                      <div class="text-sm text-text-main/60">{booking.patientEmail}</div>
                    </td>
                    <td class="py-4">{formatDate(booking.date)}</td>
                    <td class="py-4">
                      {booking.doctor ? `Dr. ${booking.doctor.name}` : 'Not assigned'}
                    </td>
                    <td class="py-4">
                      <Badge variant="info">Scheduled</Badge>
                    </td>
                    <td class="py-4">
                      <div class="flex gap-2">
                        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <iconify-icon icon="solar:pen-bold" width="18"></iconify-icon>
                        </button>
                        <button
                          on:click={() => handleCancelBooking(booking.id)}
                          class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <iconify-icon icon="solar:trash-bin-trash-bold" width="18"></iconify-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="text-center py-12">
            <iconify-icon icon="solar:calendar-minimalistic-bold" width="48" class="text-text-main/20 mb-4"></iconify-icon>
            <p class="text-text-main/60">No bookings found</p>
          </div>
        {/if}
      </Card>
    {/if}
  </div>
</div>

