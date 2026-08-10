<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    variant?: 'note' | 'warning'
  }>(),
  { variant: 'note' },
)
</script>

<template>
  <aside
    class="mv-callout"
    :class="`mv-callout--${variant}`"
    role="note"
  >
    <div class="mv-callout__title">
      {{ title }}
    </div>
    <div class="mv-callout__body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.mv-callout {
  --_mv-callout-accent: var(--macvue-accent);

  margin: 20px 0;
  padding: 14px 16px;
  border: 1px solid
    color-mix(in srgb, var(--_mv-callout-accent) 24%, transparent);
  border-inline-start-width: 3px;
  border-radius: var(--docs-radius-snippet);
  background: color-mix(
    in srgb,
    var(--_mv-callout-accent) 8%,
    var(--docs-surface)
  );
}

.mv-callout--warning {
  --_mv-callout-accent: var(--macvue-ref-orange);
}

.mv-callout__title {
  margin-bottom: 4px;
  color: var(--macvue-label);
  font-size: var(--macvue-text-callout-size);
  font-weight: 600;
  line-height: 1.4;
}

.mv-callout__body {
  color: var(--macvue-label-secondary);
  font-size: var(--macvue-text-subheadline-size);
  line-height: 1.5;
}

.mv-callout__body :deep(p) {
  margin: 0;
  color: inherit;
}
</style>
