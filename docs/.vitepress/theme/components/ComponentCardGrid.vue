<script setup lang="ts">
import {
  MacBadge,
  MacBox,
  MacButton,
  MacCheckbox,
  MacHelpButton,
  MacLabel,
  MacProgress,
  MacRadio,
  MacRadioGroup,
  MacSearchField,
  MacSecureField,
  MacSegment,
  MacSegmentedControl,
  MacSeparator,
  MacSlider,
  MacSpinner,
  MacStepper,
  MacSwitch,
  MacTextField,
} from 'macvue'
import { ref } from 'vue'
import ComponentCard from './ComponentCard.vue'

const checked = ref(true)
const sortBy = ref('name')
const enabled = ref(true)
const query = ref('')
const volume = ref(50)
const view = ref('list')
const copies = ref(1)
const serverName = ref('')
const passphrase = ref('')
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
    <ComponentCard
      title="Segmented Control"
      href="/components/segmented-control"
    >
      <MacSegmentedControl
        v-model="view"
        size="small"
        aria-label="View"
      >
        <MacSegment value="list">
          List
        </MacSegment>
        <MacSegment value="icons">
          Icons
        </MacSegment>
      </MacSegmentedControl>
    </ComponentCard>
    <ComponentCard
      title="Progress"
      href="/components/progress"
    >
      <MacProgress
        :value="65"
        aria-label="Progress"
        style="width: 160px"
      />
    </ComponentCard>
    <ComponentCard
      title="Spinner"
      href="/components/spinner"
    >
      <MacSpinner />
    </ComponentCard>
    <ComponentCard
      title="Slider"
      href="/components/slider"
    >
      <MacSlider
        v-model="volume"
        aria-label="Volume"
        style="width: 180px"
      />
    </ComponentCard>
    <ComponentCard
      title="Stepper"
      href="/components/stepper"
    >
      <MacStepper
        v-model="copies"
        :min="1"
        :max="99"
        aria-label="Copies"
      />
    </ComponentCard>
    <ComponentCard
      title="Label"
      href="/components/label"
    >
      <div style="display: flex; flex-direction: column; gap: 2px">
        <MacLabel
          variant="title-3"
          as="h4"
        >
          Storage
        </MacLabel>
        <MacLabel
          secondary
          variant="footnote"
        >
          Manage space on this Mac.
        </MacLabel>
      </div>
    </ComponentCard>
    <ComponentCard
      title="Badge"
      href="/components/badge"
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 140px;
        "
      >
        <MacLabel>Inbox</MacLabel>
        <MacBadge>128</MacBadge>
      </div>
    </ComponentCard>
    <ComponentCard
      title="Box"
      href="/components/box"
    >
      <MacBox
        title="Network"
        style="width: 160px"
      >
        <MacLabel variant="footnote">
          Wi-Fi and Bluetooth
        </MacLabel>
      </MacBox>
    </ComponentCard>
    <ComponentCard
      title="Separator"
      href="/components/separator"
    >
      <div
        style="display: flex; flex-direction: column; gap: 8px; width: 140px"
      >
        <MacLabel>Displays</MacLabel>
        <MacSeparator />
        <MacLabel>Wallpaper</MacLabel>
      </div>
    </ComponentCard>
    <ComponentCard
      title="Help Button"
      href="/components/help-button"
    >
      <MacHelpButton />
    </ComponentCard>
    <ComponentCard
      title="Text Field"
      href="/components/text-field"
    >
      <MacTextField
        v-model="serverName"
        aria-label="Server name"
        placeholder="Server name"
        style="width: 180px"
      />
    </ComponentCard>
    <ComponentCard
      title="Secure Field"
      href="/components/secure-field"
    >
      <MacSecureField
        v-model="passphrase"
        aria-label="Passphrase"
        placeholder="Passphrase"
        style="width: 180px"
      />
    </ComponentCard>
    <ComponentCard
      title="Search Field"
      href="/components/search-field"
    >
      <MacSearchField
        v-model="query"
        aria-label="Search"
        style="width: 180px"
      />
    </ComponentCard>
  </div>
</template>
