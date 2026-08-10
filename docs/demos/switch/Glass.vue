<script setup lang="ts">
import { MacCheckbox, MacSwitch } from 'macvue'
import { ref } from 'vue'

const forceActive = ref(true)
</script>

<template>
  <div
    class="mv-glass-demo switch-glass-demo"
    data-macvue-glass="on"
    :data-macvue-glass-force-active="forceActive ? '' : undefined"
  >
    <div class="switch-glass-demo__sample">
      <span class="switch-glass-demo__size">regular</span>
      <MacSwitch
        default-value
        aria-label="regular on"
      />
    </div>

    <div class="switch-glass-demo__sample">
      <span class="switch-glass-demo__size">extraLarge</span>
      <MacSwitch
        size="extra-large"
        default-value
        aria-label="extraLarge on"
      />
    </div>

    <MacCheckbox
      v-model="forceActive"
      class="switch-glass-demo__pin"
    >
      Force active
    </MacCheckbox>
  </div>
</template>

<style scoped>
.switch-glass-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  align-items: center;
}

.switch-glass-demo__sample {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.switch-glass-demo__size {
  font: 500 12px/1 var(--macvue-font-family);
  color: var(--macvue-secondary-label);
}

.switch-glass-demo__pin {
  grid-column: 1 / -1;
  justify-self: center;
  margin-bottom: 24px;
}
</style>
