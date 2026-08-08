<script setup lang="ts">
import { MacSwitch } from 'macvue'
import { reactive } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps<{ appearance?: 'light' | 'dark' }>()

const apps = reactive([
  { name: 'Mail', color: 'var(--macvue-ref-blue)', enabled: true },
  { name: 'Messages', color: 'var(--macvue-ref-green)', enabled: true },
  { name: 'Calendar', color: 'var(--macvue-ref-red)', enabled: false },
  { name: 'Reminders', color: 'var(--macvue-ref-orange)', enabled: true },
])
</script>

<template>
  <SceneFrame
    title="Notifications"
    :appearance="appearance"
  >
    <div class="mv-scene-settings">
      <div class="mv-scene-settings-group">
        <div
          v-for="app in apps"
          :key="app.name"
          class="mv-scene-settings-row"
        >
          <span class="mv-scene-app">
            <i
              class="mv-scene-app-dot"
              :style="{ background: app.color }"
            />
            <span class="mv-scene-app-text">
              <span class="mv-scene-row-title">{{ app.name }}</span>
              <span class="mv-scene-row-sub">Banners</span>
            </span>
          </span>
          <MacSwitch
            v-model="app.enabled"
            :aria-label="`Allow notifications from ${app.name}`"
          />
        </div>
      </div>
    </div>
  </SceneFrame>
</template>
