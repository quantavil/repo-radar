<script lang="ts">
  let { size = 16, class: className = '', ...restProps } = $props<{ size?: number; class?: string; [key: string]: any }>();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  {...restProps}
>
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>
