# Badge

The sidebar count capsule (`NSTableCellView` badge in AppKit terms): a translucent neutral capsule with secondary text. One size only — AppKit badges carry no `ControlSize`. The kits ship no badge masters, so the metrics are modeled on the live macOS sidebar.

<ComponentPreview name="badge/Basic">

<<< @/demos/badge/Basic.vue

</ComponentPreview>

## API

### Slots

| Slot | Description |
| --- | --- |
| `default` | Badge content, typically a count. |
