<template>
  <section class="rounded-2xl border bg-white/90 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-[#b63f2f]">Cast your vote</h3>
      <span class="text-xs text-gray-500">อัปเดตทันที</span>
    </div>

    <!-- ปุ่มโหวต: ส่งสตริงแทน true/false -->
    <div class="flex gap-2">
      <button
        class="px-3 py-1.5 rounded-xl text-sm transition focus:outline-none bg-red-600 text-white hover:brightness-110"
        @click="vote('fake')">FAKE</button>

      <button
        class="px-3 py-1.5 rounded-xl text-sm transition focus:outline-none bg-emerald-600 text-white hover:brightness-110"
        @click="vote('not_fake')">NOT FAKE</button>
      <span v-if="flash" class="ml-auto text-xs text-emerald-700">{{ flash }}</span>
    </div>

    <div class="mt-5">
      <!-- ตัวเลขรวม -->
      <div class="flex items-end gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600 leading-none">{{ votes.fake }}</div>
          <div class="text-[11px] text-gray-500">Fake</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-700 leading-none">{{ votes.not_fake }}</div>
          <div class="text-[11px] text-gray-500">Not Fake</div>
        </div>
        <div class="text-center">
        </div>
      </div>

      <!-- แถบเปอร์เซ็นต์ “2 ทาง” -->
      <div class="mt-3">
        <div class="h-2.5 bg-gray-200 rounded overflow-hidden flex">
          <div class="h-full bg-red-500" :style="{ width: twoPct.fake + '%' }"></div>
          <div class="h-full bg-emerald-600" :style="{ width: twoPct.not_fake + '%' }"></div>
        </div>
        <div class="flex justify-between text-[11px] text-gray-600 mt-1">
          <span>Fake: {{ twoPct.fake.toFixed(0) }}%</span>
          <span>Not Fake: {{ twoPct.not_fake.toFixed(0) }}%</span>
        </div>
      </div>


      <!-- สถานะคำนวณจริง (เสมอ = unclear) -->
      <p class="text-[11px] text-gray-500 mt-2">
        Status: <b class="uppercase">{{ statusLabel }}</b>
      </p>

      <p class="text-[11px] text-gray-400 mt-1">
        ใช้สโตร์ Pinia (getVotesByNews / addVote / getEffectiveStatusById); รีเฟรชจะเริ่มใหม่
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, toRef } from 'vue'
import { useNewsStore } from '@/stores/news'

const props = defineProps({
  newsId: { type: [String, Number], required: true }
})
const id = toRef(props, 'newsId')
const idNum = computed(() => Number(id.value))

const store = useNewsStore()
onMounted(() => { if (typeof store.ensureLoaded === 'function') store.ensureLoaded() })

// ดึงคะแนนแบบ reactive (สำคัญ: เรียกผ่าน computed และแปลง id เป็น Number)
const votes = computed(() => store.getVotesByNews(idNum.value))

const twoPct = computed(() => {
  const F = Number(votes.value.fake || 0)
  const N = Number(votes.value.not_fake || 0)
  const T = F + N
  if (!T) return { fake: 50, not_fake: 50 }
  const fake = (F * 100) / T
  return { fake, not_fake: 100 - fake }
})


// สถานะคำนวณจริงจาก store (เสมอ = 'unclear', ถ้าไม่มีโหวตใช้สถานะตั้งต้น)
const status = computed(() => store.getEffectiveStatusById(idNum.value))
// map to display label (treat not_fake as FACT)
const statusLabel = computed(() => {
  switch (status.value) {
    case 'fake': return 'FAKE'
    case 'not_fake':
    case 'fact': return 'FACT'
    default: return 'UNCLEAR'
  }
})

const flash = ref('')
function vote(kind) {
  // ต้องส่ง 'fake' | 'not_fake' | 'unclear'
  const ok = store.addVote(idNum.value, kind)
  if (ok) {
    flash.value = `Counted as ${kind.replace('_', ' ').toUpperCase()}.`
    setTimeout(() => (flash.value = ''), 1100)
  } else {
    // ถ้ากดซ้ำค่าเดิม จะไม่เปลี่ยนแปลง (ตามเงื่อนไขใน addVote)
    flash.value = 'No change (same choice).'
    setTimeout(() => (flash.value = ''), 900)
  }
}
</script>
