<script>
  export let type = 'text';
  export let label = '';
  export let placeholder = '';
  export let value = '';
  export let error = '';
  export let required = false;
  export let disabled = false;
  export let id = '';
  
  const inputClass = "w-full px-4 py-2.5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-accent-lime disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200";
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
  
  {#if type === 'textarea'}
    <textarea
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    ></textarea>
  {:else if type === 'text'}
    <input
      type="text"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'email'}
    <input
      type="email"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'password'}
    <input
      type="password"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'number'}
    <input
      type="number"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'tel'}
    <input
      type="tel"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'date'}
    <input
      type="date"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else if type === 'time'}
    <input
      type="time"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {:else}
    <input
      type="text"
      {id}
      {placeholder}
      {required}
      {disabled}
      bind:value
      class={inputClass}
      on:input
      on:blur
    />
  {/if}
  
  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {/if}
</div>

