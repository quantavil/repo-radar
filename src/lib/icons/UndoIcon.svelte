<script lang="ts">
  let { size = 16, class: className = '', 'aria-hidden': ariaHidden = true } = $props<{
    size?: number;
    class?: string;
    'aria-hidden'?: boolean | string;
  }>();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  aria-hidden={ariaHidden}
>
  <path d="M3 7v6h6" />
  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
</svg>
