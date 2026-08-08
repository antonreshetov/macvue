<script setup lang="ts">
import {
  MacButton,
  MacCheckbox,
  MacRadio,
  MacRadioGroup,
  MacSwitch,
} from 'macvue'
import { ref } from 'vue'
import ComponentCard from './ComponentCard.vue'

const checked = ref(true)
const sortBy = ref('name')
const enabled = ref(true)
</script>

<!-- The single source for component showcase cards: used by both the home
     page and /components/. A new component means adding one card here. -->
<template>
  <div class="mv-card-grid">
    <ComponentCard
      title="Button"
      href="/components/button"
    >
      <MacButton>Default</MacButton>
      <MacButton variant="prominent">
        Prominent
      </MacButton>
    </ComponentCard>
    <ComponentCard
      title="Checkbox"
      href="/components/checkbox"
    >
      <MacCheckbox v-model="checked">
        Show all filename extensions
      </MacCheckbox>
    </ComponentCard>
    <ComponentCard
      title="Radio Group"
      href="/components/radio-group"
    >
      <MacRadioGroup
        v-model="sortBy"
        aria-label="Sort by"
      >
        <MacRadio value="name">
          Name
        </MacRadio>
        <MacRadio value="kind">
          Kind
        </MacRadio>
        <MacRadio value="date">
          Date modified
        </MacRadio>
      </MacRadioGroup>
    </ComponentCard>
    <ComponentCard
      title="Switch"
      href="/components/switch"
    >
      <MacSwitch v-model="enabled">
        Wi-Fi
      </MacSwitch>
    </ComponentCard>
  </div>
</template>
