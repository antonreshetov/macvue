<script setup lang="ts">
import { MacButton, MacSecureField, MacTextField } from '@macvue/core'
import { ref } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps<{ accent?: string, appearance?: 'light' | 'dark' }>()

const account = ref('')
const password = ref('')
</script>

<template>
  <SceneFrame
    title="Sign In"
    :appearance="appearance"
    :accent="accent"
  >
    <div class="mv-scene-login">
      <p class="mv-scene-login-hint">
        Sign in to the file server "Media" as a registered user.
      </p>
      <MacTextField
        v-model="account"
        aria-label="Name"
        placeholder="Name"
      />
      <MacSecureField
        v-model="password"
        aria-label="Password"
        placeholder="Password"
        autocomplete="current-password"
      />
      <div class="mv-scene-login-actions">
        <MacButton>Cancel</MacButton>
        <MacButton variant="prominent">
          Sign In
        </MacButton>
      </div>
    </div>
  </SceneFrame>
</template>
