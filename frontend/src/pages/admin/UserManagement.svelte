<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { api } from '../../lib/api.js';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import Badge from '../../components/Badge.svelte';
  import Input from '../../components/Input.svelte';
  import Select from '../../components/Select.svelte';
  
  let loading = true;
  let users = [];
  let showAddModal = false;
  
  let newUser = {
    name: '',
    email: '',
    password: '',
    role: '',
  };
  
  const roleOptions = [
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'admin', label: 'Admin' },
  ];
  
  onMount(async () => {
    try {
      const data = await api.getUsers();
      users = data.users || [];
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      loading = false;
    }
  });
  
  async function handleAddUser() {
    try {
      await api.createUser(newUser);
      const data = await api.getUsers();
      users = data.users || [];
      showAddModal = false;
      newUser = { name: '', email: '', password: '', role: '' };
    } catch (error) {
      alert('Failed to add user');
    }
  }
  
  async function handleDeleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        users = users.filter(u => u.id !== id);
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  }
  
  function getRoleBadge(role) {
    const variants = {
      'admin': 'danger',
      'doctor': 'success',
      'receptionist': 'info',
    };
    return variants[role] || 'default';
  }
</script>

<div class="min-h-screen bg-bg-main pt-20 px-4 pb-12">
  <div class="max-w-screen-xl mx-auto">
    <div class="mb-8">
      <button
        on:click={() => navigate('/admin/dashboard')}
        class="flex items-center gap-2 text-text-main/60 hover:text-text-main mb-4"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
        Back to Dashboard
      </button>
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-5xl font-semibold tracking-tighter-custom mb-2">
            User Management
          </h1>
          <p class="text-text-main/60 text-lg">Manage staff accounts and permissions</p>
        </div>
        <Button variant="secondary" on:click={() => showAddModal = true}>
          <iconify-icon icon="solar:user-plus-bold" width="18" class="mr-2"></iconify-icon>
          Add User
        </Button>
      </div>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <Card>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-black/10">
              <tr class="text-left">
                <th class="pb-3 font-semibold">Name</th>
                <th class="pb-3 font-semibold">Email</th>
                <th class="pb-3 font-semibold">Role</th>
                <th class="pb-3 font-semibold">Status</th>
                <th class="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each users as user}
                <tr class="border-b border-black/10">
                  <td class="py-4 font-medium">{user.name}</td>
                  <td class="py-4">{user.email}</td>
                  <td class="py-4">
                    <Badge variant={getRoleBadge(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td class="py-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td class="py-4">
                    <div class="flex gap-2">
                      <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <iconify-icon icon="solar:pen-bold" width="18"></iconify-icon>
                      </button>
                      <button
                        on:click={() => handleDeleteUser(user.id)}
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
      </Card>
    {/if}
  </div>
  
  <!-- Add User Modal -->
  {#if showAddModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h2 class="text-2xl font-semibold mb-4">Add New User</h2>
        
        <div class="space-y-4">
          <Input
            label="Name"
            bind:value={newUser.name}
            required
          />
          <Input
            type="email"
            label="Email"
            bind:value={newUser.email}
            required
          />
          <Input
            type="password"
            label="Password"
            bind:value={newUser.password}
            required
          />
          <Select
            label="Role"
            bind:value={newUser.role}
            options={roleOptions}
            required
          />
        </div>
        
        <div class="flex gap-3 mt-6">
          <Button variant="primary" fullWidth on:click={handleAddUser}>
            Add User
          </Button>
          <Button variant="outline" on:click={() => showAddModal = false}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

