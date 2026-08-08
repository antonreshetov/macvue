<script setup lang="ts">
import { MacCheckbox, MacRadio, MacRadioGroup } from 'macvue'
import { ref } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps<{ appearance?: 'light' | 'dark' }>()

// Scene content only — this radio does not retheme anything.
const mode = ref('light')
const accentInMenus = ref(true)
</script>

<template>
  <SceneFrame
    title="Appearance"
    :appearance="appearance"
  >
    <div class="mv-scene-settings">
      <div class="mv-scene-settings-group">
        <div class="mv-scene-settings-row">
          <span class="mv-scene-settings-label">Appearance</span>
          <MacRadioGroup
            v-model="mode"
            orientation="horizontal"
            aria-label="Appearance"
          >
            <MacRadio value="light">
              Light
            </MacRadio>
            <MacRadio value="dark">
              Dark
            </MacRadio>
            <MacRadio value="auto">
              Auto
            </MacRadio>
          </MacRadioGroup>
        </div>
        <div class="mv-scene-settings-row">
          <MacCheckbox v-model="accentInMenus">
            Show accent colour in menus
          </MacCheckbox>
        </div>
      </div>
    </div>
  </SceneFrame>
</template>
