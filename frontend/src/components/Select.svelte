<script>
  export let label = '';
  export let value = '';
  export let options = []; // [{value, label}]
  export let error = '';
  export let required = false;
  export let disabled = false;
  export let id = '';
  export let placeholder = 'Select an option';
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-text-main mb-2">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <select
    {id}
    {required}
    {disabled}
    bind:value
    class="w-full px-4 py-2.5 border border-black/10 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-accent-lime
           disabled:bg-gray-50 disabled:cursor-not-allowed
           transition-all duration-200"
    on:change
  >
    <option value="" disabled selected>{placeholder}</option>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  
  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {/if}
</div>

