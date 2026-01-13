<script>
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { user } from '../../stores/auth.js';
  import { queueData, myPosition, estimatedWait } from '../../stores/queue.js';
  import { connectWebSocket, disconnectWebSocket, subscribeToQueue, unsubscribeFromQueue } from '../../lib/websocket.js';
  import Card from '../../components/Card.svelte';
  import Badge from '../../components/Badge.svelte';
  import ProgressRing from '../../components/ProgressRing.svelte';
  
  let socket = null;
  
  onMount(() => {
    if (!$user || $user.role !== 'patient') {
      navigate('/login');
      return;
    }
    
    socket = connectWebSocket();
    subscribeToQueue();
  });
  
  onDestroy(() => {
    unsubscribeFromQueue();
    disconnectWebSocket();
  });
  
  $: progress = $myPosition && $queueData.length ? 
    ((($queueData.length - $myPosition + 1) / $queueData.length) * 100) : 0;
  
  $: beforeMe = $myPosition ? $myPosition - 1 : 0;
  $: afterMe = $queueData.length - $myPosition;
  
  function getStatusVariant(status) {
    const variants = {
      'waiting': 'info',
      'in-progress': 'warning',
      'completed': 'success',
      'no-show': 'danger',
    };
    return variants[status] || 'default';
  }
  
  function getStatusLabel(status) {
    const labels = {
      'waiting': 'Waiting',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'no-show': 'No Show',
    };
    return labels[status] || status;
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
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            Live Queue
          </h1>
          <p class="text-text-main/60 text-lg">Real-time updates on your wait</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-accent-green/20 rounded-full">
          <div class="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
          <span class="text-sm font-medium">Live</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Queue Display -->
      <div class="lg:col-span-2 space-y-6">
        {#if $myPosition}
          <!-- My Position Card -->
          <Card>
            <div class="text-center py-8">
              <ProgressRing progress={progress} size={160} color="#d4ff33">
                <div class="flex flex-col items-center">
                  <span class="text-5xl font-bold">#{$myPosition}</span>
                  <span class="text-sm text-text-main/60 mt-1">Your Position</span>
                </div>
              </ProgressRing>
              
              <div class="mt-8 grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-text-main">{beforeMe}</div>
                  <div class="text-sm text-text-main/60">Before You</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-accent-lime">{$estimatedWait}</div>
                  <div class="text-sm text-text-main/60">Min Wait</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-text-main">{afterMe}</div>
                  <div class="text-sm text-text-main/60">After You</div>
                </div>
              </div>
              
              <div class="mt-6 p-4 bg-accent-lime/10 rounded-lg">
                <p class="text-sm text-text-main/80">
                  <iconify-icon icon="solar:bell-bold" width="16" class="mr-1"></iconify-icon>
                  You'll be notified when it's your turn
                </p>
              </div>
            </div>
          </Card>
        {:else}
          <Card>
            <div class="text-center py-12">
              <div class="w-20 h-20 rounded-full bg-accent-lime/20 flex items-center justify-center mx-auto mb-4">
                <iconify-icon icon="solar:calendar-minimalistic-bold" width="40"></iconify-icon>
              </div>
              <h3 class="text-xl font-semibold mb-2">Not in Queue</h3>
              <p class="text-text-main/60">You don't have an active appointment today</p>
            </div>
          </Card>
        {/if}
        
        <!-- Current Queue -->
        <Card title="Current Queue" subtitle="Live patient queue">
          {#if $queueData.length > 0}
            <div class="space-y-2">
              {#each $queueData as patient, index}
                <div 
                  class="flex items-center gap-4 p-4 border border-black/10 rounded-lg
                         {patient.isMe ? 'bg-accent-lime/10 border-accent-lime/30' : 'bg-white'}"
                >
                  <div class="w-10 h-10 rounded-full bg-text-main/10 flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                  <div class="flex-grow">
                    <div class="font-medium">
                      {patient.isMe ? 'You' : `Patient ${patient.id.slice(0, 8)}`}
                    </div>
                    <div class="text-sm text-text-main/60">
                      {#if patient.doctor}
                        Dr. {patient.doctor.name}
                      {:else}
                        Waiting for assignment
                      {/if}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(patient.status)}>
                    {getStatusLabel(patient.status)}
                  </Badge>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-text-main/60">
              No patients in queue
            </div>
          {/if}
        </Card>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Tips -->
        <Card title="While You Wait">
          <div class="space-y-4 text-sm">
            <div class="flex items-start gap-3">
              <iconify-icon icon="solar:check-circle-bold" width="20" class="text-accent-green mt-0.5"></iconify-icon>
              <div>
                <div class="font-medium mb-1">Stay Nearby</div>
                <div class="text-text-main/60">Make sure you're within the clinic area</div>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <iconify-icon icon="solar:bell-bold" width="20" class="text-accent-lime mt-0.5"></iconify-icon>
              <div>
                <div class="font-medium mb-1">Enable Notifications</div>
                <div class="text-text-main/60">Get alerts when your turn approaches</div>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <iconify-icon icon="solar:document-text-bold" width="20" class="text-accent-pink mt-0.5"></iconify-icon>
              <div>
                <div class="font-medium mb-1">Prepare Documents</div>
                <div class="text-text-main/60">Have your ID and records ready</div>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- Achievement -->
        <div class="bg-gradient-to-br from-accent-green/20 to-accent-lime/20 border border-black/10 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-3">
            <iconify-icon icon="solar:star-bold" width="24" class="text-accent-green"></iconify-icon>
            <h3 class="font-semibold">Patient Badge</h3>
          </div>
          <div class="text-sm text-text-main/80">
            You're on your 3rd visit this year! Keep prioritizing your health. 🌟
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

