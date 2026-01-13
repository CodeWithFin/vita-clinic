<script>
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import { user } from '../../stores/auth.js';
  import Button from '../../components/Button.svelte';
  import Input from '../../components/Input.svelte';
  import Card from '../../components/Card.svelte';
  
  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  
  async function handleLogin() {
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await api.staffLogin(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      user.set(response.user);
      
      // Navigate based on role
      const role = response.user.role;
      navigate(`/${role}/dashboard`);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4">
  <div class="max-w-md mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-text-main mb-4">
        <iconify-icon icon="solar:user-id-bold" width="40" class="text-bg-main"></iconify-icon>
      </div>
      <h1 class="text-4xl font-semibold tracking-tighter-custom mb-2">Staff Portal</h1>
      <p class="text-text-main/60">Secure access for healthcare professionals</p>
    </div>
    
    <Card padding="loose">
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Staff Login</h2>
        
        <Input
          type="email"
          label="Email Address"
          placeholder="staff@vitapharm.com"
          bind:value={email}
          required
          on:keypress={handleKeyPress}
        />
        
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          bind:value={password}
          required
          on:keypress={handleKeyPress}
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
          on:click={handleLogin}
        >
          Login
        </Button>
        
        <div class="text-center text-sm text-text-main/60">
          Patient? <a href="/login" class="text-text-main font-medium hover:underline">Login here</a>
        </div>
      </div>
    </Card>
    
    <!-- Security Note -->
    <div class="mt-8 p-4 bg-white/50 border border-black/10 rounded-lg">
      <div class="flex items-start gap-3">
        <iconify-icon icon="solar:shield-check-bold" width="20" class="text-accent-green mt-0.5"></iconify-icon>
        <div class="text-xs text-text-main/60">
          <p class="font-medium text-text-main mb-1">Secure Access</p>
          <p>All staff logins are encrypted and monitored. Your credentials are never stored in plain text.</p>
        </div>
      </div>
    </div>
  </div>
</div>

