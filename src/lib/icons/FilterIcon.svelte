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
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
</svg>
