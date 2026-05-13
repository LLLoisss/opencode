<template>
  <div v-if="variant === 'default' ? total > 0 : true"
       data-component="diff-changes"
       :data-variant="variant"
       :class="props.class">
    <!-- bars 模式 -->
    <template v-if="variant === 'bars'">
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 18 12"
           fill="none">
        <g>
          <rect v-for="(color, i) in visibleBlocks"
                :key="i"
                :x="i * 4"
                width="2"
                height="12"
                rx="1"
                :fill="color" />
        </g>
      </svg>
    </template>

    <!-- default 模式 -->
    <template v-else-if="variant === 'default'">
      <span data-slot="diff-changes-additions">+{{ additions }}</span>
      <span data-slot="diff-changes-deletions">-{{ deletions }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface DiffChange {
  additions: number
  deletions: number
}

const props = withDefaults(
  defineProps<{
    class?: string
    changes: DiffChange | DiffChange[]
    variant?: "default" | "bars"
  }>(),
  {
    variant: "default",
  }
)

const additions = computed(() =>
  Array.isArray(props.changes)
    ? props.changes.reduce((acc, diff) => acc + (diff.additions ?? 0), 0)
    : props.changes.additions
)

const deletions = computed(() =>
  Array.isArray(props.changes)
    ? props.changes.reduce((acc, diff) => acc + (diff.deletions ?? 0), 0)
    : props.changes.deletions
)

const total = computed(() => (additions.value ?? 0) + (deletions.value ?? 0))

const blockCounts = computed(() => {
  const TOTAL_BLOCKS = 5

  const adds = additions.value ?? 0
  const dels = deletions.value ?? 0

  if (adds === 0 && dels === 0) {
    return { added: 0, deleted: 0, neutral: TOTAL_BLOCKS }
  }

  const t = adds + dels

  if (t < 5) {
    const added = adds > 0 ? 1 : 0
    const deleted = dels > 0 ? 1 : 0
    const neutral = TOTAL_BLOCKS - added - deleted
    return { added, deleted, neutral }
  }

  const ratio = adds > dels ? adds / dels : dels / adds
  let BLOCKS_FOR_COLORS = TOTAL_BLOCKS

  if (t < 20) {
    BLOCKS_FOR_COLORS = TOTAL_BLOCKS - 1
  } else if (ratio < 4) {
    BLOCKS_FOR_COLORS = TOTAL_BLOCKS - 1
  }

  const percentAdded = adds / t
  const percentDeleted = dels / t

  const added_raw = percentAdded * BLOCKS_FOR_COLORS
  const deleted_raw = percentDeleted * BLOCKS_FOR_COLORS

  let added = adds > 0 ? Math.max(1, Math.round(added_raw)) : 0
  let deleted = dels > 0 ? Math.max(1, Math.round(deleted_raw)) : 0

  // 根据实际变更量限制条形数
  if (adds > 0 && adds <= 5) added = Math.min(added, 1)
  if (adds > 5 && adds <= 10) added = Math.min(added, 2)
  if (dels > 0 && dels <= 5) deleted = Math.min(deleted, 1)
  if (dels > 5 && dels <= 10) deleted = Math.min(deleted, 2)

  let total_allocated = added + deleted
  if (total_allocated > BLOCKS_FOR_COLORS) {
    if (added_raw > deleted_raw) {
      added = BLOCKS_FOR_COLORS - deleted
    } else {
      deleted = BLOCKS_FOR_COLORS - added
    }
    total_allocated = added + deleted
  }

  const neutral = Math.max(0, TOTAL_BLOCKS - total_allocated)

  return { added, deleted, neutral }
})

const ADD_COLOR = "var(--icon-diff-add-base)"
const DELETE_COLOR = "var(--icon-diff-delete-base)"
const NEUTRAL_COLOR = "var(--icon-weak-base)"

const visibleBlocks = computed(() => {
  const counts = blockCounts.value
  const blocks = [
    ...Array(counts.added).fill(ADD_COLOR),
    ...Array(counts.deleted).fill(DELETE_COLOR),
    ...Array(counts.neutral).fill(NEUTRAL_COLOR),
  ]
  return blocks.slice(0, 5)
})
</script>
