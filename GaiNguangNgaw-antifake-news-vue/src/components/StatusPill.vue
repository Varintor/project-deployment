<template>
  <span :class="classes">
    <!-- glossy overlay -->
    <span class="pointer-events-none absolute inset-0 rounded-full">
      <span class="absolute inset-x-1 top-0 h-1/2 rounded-full bg-white/25 blur-sm"></span>
      <span class="absolute inset-x-1 bottom-0 h-1/2 rounded-full bg-black/5 blur-[1px]"></span>
    </span>
    <span class="relative z-10">{{ label }}</span>
  </span>
</template>
<script setup>
import { computed } from 'vue'
import { useNewsStore } from '@/stores/news'
/**
 * ใช้หนึ่งในสองอย่าง
 * - <StatusPill :id="newsId" />          // แนะนำ: อัปเดตตามโหวตแบบเรียลไทม์
 * - <StatusPill status="fake|not_fake|unclear" />  // กรณีต้องการแสดงค่าคงที่
 */
const props = defineProps({
  id: { type: [Number, String], required: false },
  status: { type: String, required: false } // 'fake' | 'not_fake' | 'unclear'
})

const store = useNewsStore()

// สถานะที่ใช้จริง: ให้ priority กับ props.status ถ้ามี ไม่งั้นดึงจาก store ด้วย id
const effective = computed(() => {
  if (props.status) return props.status
  if (props.id != null) return store.getEffectiveStatusById(props.id)
  return 'unclear'
})

const label = computed(() =>
  effective.value === 'fake'
    ? 'FAKE'
    : (effective.value === 'not_fake' || effective.value === 'fact')
      ? 'FACT'
      : 'UNCLEAR'
)

const classes = computed(() => {
  const base =
    'inline-block font-semibold text-xs px-2 py-0.5 rounded-full ' +
    'ring-1 ring-white/35 backdrop-blur-xl relative overflow-hidden ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_6px_rgba(0,0,0,0.12)]'
  switch (effective.value) {
    case 'fake':
      return `${base} text-red-600 bg-red-100/90`
    case 'not_fake':
    case 'fact':
      return `${base} text-emerald-700 bg-emerald-100/90`
    default:
      return `${base} text-yellow-700 bg-yellow-100/90`
  }
})
</script>
