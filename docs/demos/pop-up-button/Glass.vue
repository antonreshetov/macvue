<script setup lang="ts">
import {
  MacCheckbox,
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from 'macvue'
import { ref } from 'vue'

const color = ref('red')
const useDetailedBackground = ref(false)
</script>

<template>
  <div
    class="mv-glass-demo pop-up-glass-demo"
    :class="{ 'pop-up-glass-demo--detailed': useDetailedBackground }"
    data-macvue-appearance="dark"
    data-macvue-glass="on"
  >
    <div class="pop-up-glass-demo__row">
      <span>pop up</span>
      <MacPopUpButton
        v-model="color"
        aria-label="Glass pop up"
        :teleport-to="false"
      >
        <MacPopUpButtonItem value="red">
          Red
        </MacPopUpButtonItem>
        <MacPopUpButtonItem value="green">
          Green
        </MacPopUpButtonItem>
        <MacPopUpButtonItem value="blue">
          Blue
        </MacPopUpButtonItem>
      </MacPopUpButton>
    </div>
    <div class="pop-up-glass-demo__row">
      <span>pull down</span>
      <MacPullDownButton
        aria-label="Glass pull down"
        label="Actions"
        :teleport-to="false"
      >
        <MacPullDownButtonItem>New</MacPullDownButtonItem>
        <MacPullDownButtonItem>Open…</MacPullDownButtonItem>
        <MacPullDownButtonItem>Save</MacPullDownButtonItem>
      </MacPullDownButton>
    </div>
    <MacCheckbox
      v-model="useDetailedBackground"
      class="pop-up-glass-demo__background-toggle"
    >
      Detailed backdrop
    </MacCheckbox>
  </div>
</template>

<style scoped>
.pop-up-glass-demo {
  position: relative;
  display: grid;
  grid-template-columns: max-content;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  background-position: calc(50% - 12px) calc(50% - 12px);
}

.pop-up-glass-demo--detailed {
  background-color: #080713;
  background-image:
    repeating-linear-gradient(
      90deg,
      rgb(7 7 22 / 0.56) 0,
      rgb(7 7 22 / 0.16) 16px,
      rgb(166 99 255 / 0.3) 17px,
      rgb(15 11 37 / 0.72) 19px
    ),
    radial-gradient(
      ellipse 34% 72% at 12% 52%,
      rgb(255 244 255 / 0.98) 0%,
      rgb(214 119 255 / 0.92) 18%,
      rgb(123 57 255 / 0.62) 42%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 44% 58% at 48% 106%,
      rgb(255 243 255 / 0.96) 0%,
      rgb(190 67 255 / 0.82) 20%,
      rgb(73 53 231 / 0.48) 48%,
      transparent 74%
    ),
    radial-gradient(
      ellipse 48% 52% at 72% 56%,
      rgb(87 60 229 / 0.7) 0%,
      rgb(42 31 129 / 0.42) 48%,
      transparent 78%
    ),
    linear-gradient(118deg, #12103a 0%, #100b29 46%, #03040b 100%);
  background-position: center;
  background-size: 100% 100%;
}

.pop-up-glass-demo--detailed::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
  content: "";
  opacity: 0.14;
  pointer-events: none;
}

.pop-up-glass-demo__row {
  position: relative;
  display: grid;
  grid-template-columns: 72px 84px;
  align-items: center;
  gap: 8px;
}

.pop-up-glass-demo__background-toggle {
  position: absolute;
  z-index: 1;
  inset-block-end: 24px;
  inset-inline-start: 50%;
  color: white;
  transform: translateX(-50%);
  white-space: nowrap;
}

.pop-up-glass-demo__row > span {
  color: var(--macvue-label-secondary);
  font: 500 12px/1 var(--macvue-font-family);
  text-align: right;
}
</style>
