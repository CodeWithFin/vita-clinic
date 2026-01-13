<script>
  export let title = '';
  export let subtitle = '';
  export let padding = 'normal'; // tight, normal, loose
  
  const paddings = {
    tight: 'p-4',
    normal: 'p-6',
    loose: 'p-8',
  };
</script>

<div class="bg-white border border-black/10 rounded-xl shadow-sm {paddings[padding]} transition-all hover:shadow-md">
  {#if title}
    <div class="mb-4">
      <h3 class="text-xl font-semibold tracking-tight text-text-main">{title}</h3>
      {#if subtitle}
        <p class="text-sm text-text-main/60 mt-1">{subtitle}</p>
      {/if}
    </div>
  {/if}
  
  <slot />
</div>

