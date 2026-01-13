<script>
  export let variant = 'default'; // default, success, warning, danger, info
  export let size = 'md'; // sm, md, lg
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-accent-green/20 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-accent-lime/20 text-text-main',
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  $: classes = `
    ${variants[variant]} 
    ${sizes[size]} 
    font-medium rounded-full inline-flex items-center gap-1
  `;
</script>

<span class={classes}>
  <slot />
</span>

