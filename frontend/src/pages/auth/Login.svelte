<script>
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  import Card from '../../components/Card.svelte';
  
  let email = '';
  let otp = '';
  let step = 'email'; // email, otp
  let loading = false;
  let error = '';
  
  async function handleSendOTP() {
    if (!email) {
      error = 'Please enter your email';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      await api.sendOTP(email);
      step = 'otp';
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  async function handleVerifyOTP() {
    if (!otp) {
      error = 'Please enter the OTP';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await api.verifyOTP(email, otp);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      user.set(response.user);
      navigate('/patient/dashboard');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4">
  <div class="max-w-md mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-lime/20 mb-4">
        <iconify-icon icon="solar:health-bold" width="40" class="text-text-main"></iconify-icon>
      </div>
      <h1 class="text-4xl font-semibold tracking-tighter-custom mb-2">Welcome Back</h1>
      <p class="text-text-main/60">Access your health records securely</p>
    </div>
    
    <Card padding="loose">
      {#if step === 'email'}
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Patient Login</h2>
          <p class="text-sm text-text-main/60">Enter your email to receive a one-time password</p>
          
          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            bind:value={email}
            required
          />
          
          {#if error}
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          {/if}
          
          <Button
            variant="primary"
            fullWidth
            {loading}
            on:click={handleSendOTP}
          >
            Send OTP
          </Button>
          
          <div class="text-center text-sm text-text-main/60">
            Staff member? <a href="/staff-login" class="text-text-main font-medium hover:underline">Login here</a>
          </div>
        </div>
      {:else}
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Verify OTP</h2>
          <p class="text-sm text-text-main/60">
            We've sent a code to <strong>{email}</strong>
          </p>
          
          <Input
            type="text"
            label="One-Time Password"
            placeholder="Enter 6-digit code"
            bind:value={otp}
            required
          />
          
          {#if error}
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          {/if}
          
          <Button
            variant="primary"
            fullWidth
            {loading}
            on:click={handleVerifyOTP}
          >
            Verify & Login
          </Button>
          
          <button
            on:click={() => step = 'email'}
            class="text-sm text-text-main/60 hover:text-text-main w-full text-center"
          >
            ← Back to email
          </button>
        </div>
      {/if}
    </Card>
    
    <!-- Features -->
    <div class="mt-12 grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-2">
          <iconify-icon icon="solar:shield-check-bold" width="24" class="text-accent-green"></iconify-icon>
        </div>
        <p class="text-xs text-text-main/60">Secure</p>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 rounded-full bg-accent-lime/20 flex items-center justify-center mx-auto mb-2">
          <iconify-icon icon="solar:clock-circle-bold" width="24" class="text-text-main"></iconify-icon>
        </div>
        <p class="text-xs text-text-main/60">Real-time</p>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 rounded-full bg-accent-pink/20 flex items-center justify-center mx-auto mb-2">
          <iconify-icon icon="solar:heart-bold" width="24" class="text-accent-pink"></iconify-icon>
        </div>
        <p class="text-xs text-text-main/60">Care</p>
      </div>
    </div>
  </div>
</div>

