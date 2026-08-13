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
  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
  <line x1="6" y1="8" x2="6" y2="8" stroke-width="3" />
  <line x1="10" y1="8" x2="10" y2="8" stroke-width="3" />
  <line x1="14" y1="8" x2="14" y2="8" stroke-width="3" />
  <line x1="18" y1="8" x2="18" y2="8" stroke-width="3" />
  <line x1="6" y1="12" x2="6" y2="12" stroke-width="3" />
  <line x1="10" y1="12" x2="10" y2="12" stroke-width="3" />
  <line x1="14" y1="12" x2="14" y2="12" stroke-width="3" />
  <line x1="18" y1="12" x2="18" y2="12" stroke-width="3" />
  <line x1="7" y1="16" x2="17" y2="16" />
</svg>
