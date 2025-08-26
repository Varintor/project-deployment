<template>
  <nav class="mt-4 select-none space-y-2" aria-label="Pagination">
    <!-- แถวหลัก: Prev + Numbers + Next -->
    <div class="flex items-center justify-between gap-3">
      <!-- Prev -->
      <button
        class="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full
               bg-white/20 backdrop-blur-xl ring-1 ring-white/35
               shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_18px_rgba(0,0,0,0.12)]
               text-[#b63f2f] font-semibold transition-all duration-300
               hover:bg-white/30 hover:text-[#b63f2f]/80 active:scale-[.98]
               disabled:opacity-40 disabled:pointer-events-none"
        :disabled="isFirst || isLoading"
        :aria-disabled="isFirst || isLoading"
        @click="prev"
        aria-label="Previous page"
      >
        <svg class="w-4 h-4 transition-colors duration-200 text-[#b63f2f]/80 group-hover:text-[#b63f2f]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Prev
      </button>

      <!-- Numbers -->
      <ul class="flex items-center gap-1">
        <li v-for="it in visible" :key="`p-${it}`">
          <!-- จุดไข่ปลา -->
          <span v-if="it === '...'" class="px-2 text-gray-400" aria-hidden="true">…</span>

          <!-- หมายเลขหน้า -->
          <button
            v-else
            type="button"
            class="group relative px-3 py-1 rounded-full text-sm font-semibold
                   ring-1 ring-white/35 bg-white/20 backdrop-blur-xl
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                   transition-all duration-300 origin-center
                   hover:bg-white/30 hover:scale-[1.09] active:scale-100
                   flex items-center justify-center select-none"
            :class="Number(it) === Number(page) && !isLoading
              ? '!bg-[#ea7139] text-white ring-[#ea7139] shadow-none'
              : 'text-gray-500/90 hover:text-[#b63f2f]/70'"
            :aria-current="Number(it) === Number(page) && !isLoading ? 'page' : null"
            :disabled="isLoading"
            :aria-disabled="isLoading"
            @click="go(it)"
          >
            <!-- reflections -->
            <span class="pointer-events-none absolute inset-0 rounded-full">
              <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
              <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
            </span>

            <span class="relative z-10">{{ it }}</span>
          </button>
        </li>
      </ul>

      <!-- Next -->
      <button
        class="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full
               bg-white/20 backdrop-blur-xl ring-1 ring-white/35
               shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_18px_rgba(0,0,0,0.12)]
               text-[#b63f2f] font-semibold transition-all duration-300
               hover:bg-white/30 hover:text-[#b63f2f]/80 active:scale-[.98]
               disabled:opacity-40 disabled:pointer-events-none"
        :disabled="isLast || isLoading"
        :aria-disabled="isLast || isLoading"
        @click="next"
        aria-label="Next page"
      >
        Next
        <svg class="w-4 h-4 transition-colors duration-200 text-[#b63f2f]/80 group-hover:text-[#b63f2f]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page:      { type: Number, default: 1 },  // หน้าปัจจุบัน
  total:     { type: Number, default: 1 },  // จำนวนหน้าทั้งหมด
  isLoading: { type: Boolean, default: false } // ✅ เพิ่ม prop นี้
})
const emit = defineEmits(['update:page'])

const isFirst = computed(() => (props.page || 1) <= 1)
const isLast  = computed(() => (props.page || 1) >= (props.total || 1))

function go(p) {
  if (props.isLoading) return
  const clamped = Math.min(Math.max(1, Number(p)), props.total || 1)
  if (clamped !== (props.page || 1)) emit('update:page', clamped)
}
function prev() { if (!isFirst.value && !props.isLoading) go((props.page || 1) - 1) }
function next() { if (!isLast.value  && !props.isLoading) go((props.page || 1) + 1) }

/** สร้างเลขหน้าที่จะแสดงพร้อม "…" */
const visible = computed(() => {
  const total = Math.max(1, props.total || 1)
  const current = Math.min(Math.max(1, props.page || 1), total)
  const win = 1

  const keep = new Set([1, total, current])
  for (let i = current - win; i <= current + win; i++) {
    if (i >= 1 && i <= total) keep.add(i)
  }

  const arr = Array.from(keep).sort((a, b) => a - b)
  const out = []
  let last = 0
  for (const p of arr) {
    if (p - last > 1) out.push('...')
    out.push(p)
    last = p
  }
  return out
})
</script>
