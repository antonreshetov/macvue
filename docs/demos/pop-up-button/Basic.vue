<script setup lang="ts">
import {
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from 'macvue'
import { ref } from 'vue'

const color = ref('red')
</script>

<template>
  <div class="pop-up-basic">
    <div class="pop-up-basic__row">
      <span>pop up</span>
      <MacPopUpButton
        v-model="color"
        aria-label="Color"
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
    <div class="pop-up-basic__row">
      <span>pull down</span>
      <MacPullDownButton
        aria-label="Actions"
        label="Actions"
        :teleport-to="false"
      >
        <MacPullDownButtonItem>New</MacPullDownButtonItem>
        <MacPullDownButtonItem>Open…</MacPullDownButtonItem>
        <MacPullDownButtonItem>Save</MacPullDownButtonItem>
      </MacPullDownButton>
    </div>
  </div>
</template>

<style scoped>
.pop-up-basic {
  display: grid;
  gap: 8px;
}

.pop-up-basic__row {
  display: grid;
  grid-template-columns: 72px 84px;
  align-items: center;
  gap: 8px;
}

.pop-up-basic__row > span {
  color: var(--macvue-label-secondary);
  font: 500 12px/1 var(--macvue-font-family);
  text-align: right;
}
</style>
