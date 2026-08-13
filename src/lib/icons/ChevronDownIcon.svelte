<script lang="ts">
  let { size = 14, class: className = '', ...restProps } = $props<{ size?: number; class?: string; [key: string]: any }>();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  {...restProps}
>
  <path d="m6 9 6 6 6-6" />
</svg>
