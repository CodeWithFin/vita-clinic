<script>
  export let progress = 0; // 0-100
  export let size = 120;
  export let strokeWidth = 8;
  export let color = '#d4ff33';
  
  $: radius = (size - strokeWidth) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: offset = circumference - (progress / 100) * circumference;
</script>

<div class="relative inline-flex items-center justify-center">
  <svg width={size} height={size} class="transform -rotate-90">
    <!-- Background circle -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke="#e5e7eb"
      stroke-width={strokeWidth}
      fill="transparent"
    />
    
    <!-- Progress circle -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke={color}
      stroke-width={strokeWidth}
      fill="transparent"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      stroke-linecap="round"
      class="transition-all duration-500 ease-out"
    />
  </svg>
  
  <!-- Center content -->
  <div class="absolute inset-0 flex items-center justify-center flex-col">
    <slot>
      <span class="text-2xl font-bold">{Math.round(progress)}%</span>
    </slot>
  </div>
</div>

