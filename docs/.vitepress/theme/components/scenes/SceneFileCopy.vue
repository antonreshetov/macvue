<script setup lang="ts">
import { MacButton, MacProgress, MacSpinner } from '@macvue/core'
import SceneFrame from './SceneFrame.vue'

defineProps<{ accent?: string, appearance?: 'light' | 'dark' }>()
</script>

<template>
  <SceneFrame
    title="Copying"
    :appearance="appearance"
    :accent="accent"
  >
    <div class="mv-scene-copy">
      <p class="mv-scene-copy-title">
        Copying 24 items to “Backup”
      </p>
      <MacProgress
        :value="62"
        size="small"
        aria-label="Copy progress"
      />
      <p class="mv-scene-copy-sub">
        4.2 GB of 6.8 GB — About 30 seconds remaining
      </p>
      <div class="mv-scene-copy-footer">
        <span class="mv-scene-copy-preparing">
          <MacSpinner
            size="small"
            label="Preparing"
          />
          Preparing to move 112 items…
        </span>
        <MacButton size="small">
          Stop
        </MacButton>
      </div>
    </div>
  </SceneFrame>
</template>
