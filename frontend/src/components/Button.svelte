<script>
  export let variant = 'primary'; // primary, secondary, outline, danger
  export let size = 'md'; // sm, md, lg
  export let type = 'button';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  
  const variants = {
    primary: 'bg-text-main text-bg-main hover:bg-text-main/90 shadow-sm',
    secondary: 'bg-accent-lime text-text-main hover:bg-accent-lime/90',
    outline: 'border-2 border-text-main/20 text-text-main hover:border-text-main/40',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  $: classes = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''}
    font-semibold rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;
</script>

<button 
  {type} 
  {disabled}
  class={classes}
  on:click
>
  {#if loading}
    <div class="flex items-center justify-center gap-2">
      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  {:else}
    <slot />
  {/if}
</button>

