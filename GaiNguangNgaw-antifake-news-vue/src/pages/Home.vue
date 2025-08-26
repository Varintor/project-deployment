<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import Pagination from '@/components/Pagination.vue'
import StatusPill from '@/components/StatusPill.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'
import { beginUiLoad, endUiLoad } from '@/router'

// ---------- Store ----------
const store = useNewsStore()
const { loading, page, totalPages, currentItems, filter, pageSize, keyword } = storeToRefs(store)
const { load, setPage, setFilter, setPageSize, setKeyword } = store

// ---------- ฟิลเตอร์ (แท็บ glass กลาง) ----------
const tabs = [
  { key: 'all',      label: 'All' },
  { key: 'not_fake', label: 'Fact' },
  { key: 'unclear',  label: 'Unclear' }, 
  { key: 'fake',     label: 'Fake' },
  // ✅ เพิ่มใหม่
]
const activeIndex = computed(() => Math.max(0, tabs.findIndex(t => t.key === filter.value)))
const trackPaddingPx = 8
const gradients = [
  // All → น้ำเงิน–ฟ้า
  'from-violet-600 via-indigo-500 to-teal-400',

  // Fact → เขียว–มินต์
  'from-green-600 via-emerald-500 to-teal-400',

  // Unclear → เหลือง–ส้ม
  'from-orange-500 via-amber-400 to-yellow-400',

  // Fake → แดง–ชมพู
  'from-red-600 via-rose-500 to-pink-500',
]
const activeGradientClass = computed(() => `bg-gradient-to-r ${gradients[activeIndex.value]}`)
const highlightStyle = computed(() => ({
  width: `calc((100% - ${trackPaddingPx * 2}px) / ${tabs.length})`, // ✅ ใช้จำนวนแท็บจริง
  transform: `translateX(${activeIndex.value * 100}%)`,              // (คงเดิม ใช้ 100% ของความกว้างตัวเอง)
}))

// ---------- เลย์เอาต์แบบข่าว ----------
const featured = computed(() => currentItems.value?.[0] || null)
const sidebar  = computed(() => currentItems.value?.slice(1, 6) || [])
const rest     = computed(() => currentItems.value?.slice(6) || [])
const placeholderHero  = 'https://via.placeholder.com/1200x675?text=News'
const placeholderSmall = 'https://via.placeholder.com/320x200?text=News'

// ---------- URL <-> Store ----------
const route = useRoute()
const router = useRouter()

function toPosInt(v, fallback) { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : fallback }
function syncFromQuery(q) {
  const wantSize = toPosInt(q.size, pageSize.value || 10)
  const wantPage = toPosInt(q.page, page.value || 1)
  const wantFilter = typeof q.filter === 'string' ? q.filter : (filter.value || 'all')
  if (pageSize.value !== wantSize) setPageSize(wantSize)
  if (page.value !== wantPage) setPage(wantPage)
  if (filter.value !== wantFilter) setFilter(wantFilter)
}
function syncToQuery(mode = 'replace') {
    const query = {
    ...route.query,
    page: String(page.value),
    size: String(pageSize.value),
    filter: filter.value || 'all',
  }
  if (route.query.page === query.page && route.query.size === query.size && route.query.filter === query.filter) return
  const loc = { name: route.name || 'home', query }
  return mode === 'push' ? router.push(loc) : router.replace(loc)
}

// ---------- Boot / Loading (Home คุม overlay เอง) ----------
const booted  = ref(false)
const booting = ref(true)
const isLoading = computed(() => loading.value || booting.value)

// เปิด/ปิด overlay ด้วย watch ตัวเดียว
watch(isLoading, v => { try { v ? beginUiLoad() : endUiLoad() } catch {} }, { immediate: true })

onMounted(async () => {
  try {
    syncFromQuery(route.query)
    await store.load()              // หรือ await store.ensureLoaded()
    if (totalPages.value && page.value > totalPages.value) setPage(totalPages.value)
    syncToQuery('replace')
  } finally {
    booted.value  = true
    booting.value = false
  }
})

// ถ้า URL เปลี่ยนเอง
watch(() => route.query, q => { syncFromQuery(q) })

// State เปลี่ยน -> เขียนกลับ URL (หลังบูตเท่านั้น)
watch([page, pageSize, filter], () => {
  if (!booted.value) return
  if (totalPages.value && page.value > totalPages.value) setPage(totalPages.value)
  syncToQuery('replace')
})
watch(totalPages, (tp) => {
  if (!booted.value) return
  if (tp && page.value > tp) setPage(tp)
})

// ---------- Search / Per-page ----------
function formatDate(iso) { return new Date(iso).toLocaleString() }
function applySearch() { setPage(1) }

const open = ref(false)
const perPageRoot = ref(null)
function onClickOutside(e) { if (perPageRoot.value && !perPageRoot.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
function choosePageSize(n) {
  if (pageSize.value === n) { open.value = false; return }
  setPageSize(n); setPage(1); open.value = false
}

// ---------- Fallback รูปภาพ (เพิ่ม) ----------
const failedImg = ref(new Set())
const hasImg = (item) =>
  !!(item?.imageUrl && String(item.imageUrl).trim()) && !failedImg.value.has(item.id)
function markImgFail(id) {
  const next = new Set(failedImg.value); next.add(id); failedImg.value = next
}
</script>

<template>
  <section>
    <!-- แถวบน: ฟิลเตอร์แบบ Liquid Glass (กลาง) + Search/Per-page (ขวา) -->
    <div class="grid items-center gap-4 mb-4 grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
      <div class="hidden sm:block"></div>

      <!-- ฟิลเตอร์กลาง -->
      <div class="justify-self-center">
        <div class="relative inline-block">
          <!-- ambient glow -->
          <div class="pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-br from-orange-200/30 via-white/20 to-cyan-200/30 blur-2xl"></div>

          <!-- glass track -->
          <div class="relative rounded-full overflow-hidden inline-flex bg-white/18 backdrop-blur-2xl p-2 ring-1 ring-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_30px_rgba(0,0,0,0.12)]">
            <!-- highlight -->
            <span
              class="absolute top-2 bottom-2 left-2 rounded-full transition-[transform,background] duration-300 ease-out shadow-[0_10px_24px_rgba(0,0,0,0.18)] ring-1 ring-white/40"
              :class="activeGradientClass"
              :style="highlightStyle"
            ></span>

            <!-- reflections -->
            <span class="pointer-events-none absolute inset-0">
              <span class="absolute inset-x-3 top-0 h-1/2 rounded-full bg-white/25 blur-xl"></span>
              <span class="absolute inset-x-4 bottom-0 h-1/2 rounded-full bg-black/5 blur-lg"></span>
            </span>

            <!-- buttons -->
            <div class="relative z-10 grid"
                :style="{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }">
              <button
                v-for="(t,i) in tabs"
                :key="t.key"
                class="px-5 py-2 text-sm font-semibold rounded-full text-center select-none transition-colors duration-200"
                :class="i===activeIndex
                  ? 'text-white'
                  : t.key==='fake'     ? 'text-gray-500/90 hover:text-pink-700/90'
                  : t.key==='all'      ? 'text-gray-500/90 hover:text-indigo-700/90'
                  : t.key==='not_fake' ? 'text-gray-500/90 hover:text-emerald-700/90'
                  : t.key==='unclear'  ? 'text-gray-500/90 hover:text-amber-700/90'
                  : ''"
                @click="setFilter(t.key)"
              >
                {{ t.label }}
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- ค้นหา + per page -->
      <div class="justify-self-center sm:justify-self-end flex items-center gap-4 text-sm">
        <!-- Search -->
        <div
          class="relative group inline-flex items-center rounded-full pl-3 pr-3 py-1.5
                 bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                 transition-all duration-300
                 hover:bg-white/30 group-focus-within:bg-white/35 group-focus-within:ring-[#ea7139]"
        >
          <span class="pointer-events-none absolute inset-0 rounded-full">
            <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
            <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
          </span>

          <MagnifyingGlassIcon
            class="w-5 h-5 relative z-10 transition-colors duration-200
                   text-gray-500/90 group-hover:text-[#b63f2f]/80 group-focus-within:text-[#b63f2f]/80"
          />

          <input
  type="text"
  placeholder="Search..."
  :value="keyword"
  @input="setKeyword($event.target.value)"
  @keydown.enter.prevent="applySearch"
  class="relative z-10 ml-2 bg-transparent font-semibold outline-none text-sm
         text-[#b63f2f] placeholder-[#b63f2f]/70 caret-[#ea7139]
         w-0 opacity-0 transition-all duration-300
         group-hover:w-32 group-hover:opacity-100
         focus:w-40 focus:opacity-100"
  :class="(keyword && keyword.length) ? 'w-40 opacity-100' : ''"
/>

        </div>

        <!-- Per page -->
        <div class="flex items-center gap-3 relative" ref="perPageRoot">
          <button
            type="button"
            @click="open = !open"
            @keydown.escape="open=false"
            class="peer order-2 group relative font-semibold rounded-full px-3 pr-8 py-1.5
                   bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                   flex items-center gap-2 select-none outline-none
                   transition-all duration-300
                   hover:bg-white/30 focus:bg-white/30
                   hover:text-[#b63f2f]/70
                   origin-center hover:scale-[1.09] active:scale-100"
            :class="open ? 'bg-white/30 text-[#b63f2f]/70' : ''"
            aria-haspopup="listbox"
            :aria-expanded="open"
          >
            <span class="pointer-events-none absolute inset-0 rounded-full">
              <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
              <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
            </span>

            <span class="relative z-10 transition-colors duration-200" :class="open ? 'text-[#b63f2f]' : 'text-gray-500/90 group-hover:text-[#b63f2f]/70'">
              {{ pageSize }}
            </span>

            <svg
              class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
              :class="open ? 'text-[#b63f2f] rotate-180' : 'text-gray-500/90 group-hover:text-[#b63f2f]/70 rotate-0'"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <label class="order-1 font-semibold transition-colors duration-200" :class="open ? 'text-[#b63f2f]' : 'text-gray-500/90 peer-hover:text-[#b63f2f]/70'">
            Per page
          </label>

          <!-- Dropdown -->
          <div
            v-show="open"
            class="absolute left-0 top-full mt-1 w-32 rounded-xl
                   bg-white/90 backdrop-blur-xl ring-1 ring-white/35
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                   transition-all duration-300 z-50"
            role="listbox"
          >
            <span class="pointer-events-none absolute inset-0 rounded-xl">
              <span class="absolute inset-x-2 top-0 h-1/2 rounded-xl bg-white/25 blur-lg"></span>
              <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-xl bg-black/5 blur-md"></span>
            </span>

            <ul class="py-1 max-h-56 overflow-y-auto relative z-10">
              <li
                v-for="size in [10, 20, 30]"
                :key="size"
                @click="choosePageSize(size)"
                class="font-semibold px-3 py-2 cursor-pointer flex items-center justify-between gap-2
                       text-[#b63f2f]/80 hover:bg-white/30 transition rounded-lg"
                :aria-selected="pageSize === size"
                role="option"
              >
                <span class="inline-flex items-center gap-2">
                  <span class="inline-block h-2.5 w-2.5 rounded-full" :class="pageSize === size ? 'bg-[#ea7139]' : 'bg-[#b63f2f]/30'"></span>
                  {{ size }}
                </span>
                <svg v-if="pageSize === size" class="w-4 h-4 text-[#ea7139]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- =================== รายการข่าว + Loading =================== -->

    <!-- Skeleton -->
    <ul v-if="isLoading" class="grid gap-4 md:grid-cols-2">
      <li
        v-for="i in pageSize"
        :key="'skeleton-'+i"
        class="relative overflow-hidden rounded-2xl p-4
               bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
               shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_24px_rgba(0,0,0,0.12)]"
      >
        <div class="flex items-start gap-3">
          <div class="w-24 h-24 rounded-xl bg-white/30 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-2/3 rounded bg-white/30 animate-pulse"></div>
            <div class="h-3 w-full rounded bg-white/25 animate-pulse"></div>
            <div class="h-3 w-5/6 rounded bg-white/25 animate-pulse"></div>
            <div class="h-3 w-1/2 rounded bg-white/20 animate-pulse mt-3"></div>
          </div>
        </div>
      </li>
    </ul>

    <!-- ว่าง -->
    <div v-else-if="!currentItems || currentItems.length === 0" class="py-20 text-center text-gray-400">
      ไม่พบรายการข่าวในหน้านี้
    </div>

    <!-- รายการจริง: เลย์เอาต์ BBC + liquid-glass + No Image fallback -->
    <template v-else>
      <!-- แถวบน -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- ข่าวเด่น -->
        <article
          v-if="featured"
          class="lg:col-span-2 group relative overflow-hidden rounded-2xl
                 bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_44px_rgba(0,0,0,0.14)]
                 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
        >
          <!-- reflections -->
          <span class="pointer-events-none absolute inset-0">
            <span class="absolute inset-x-5 -top-10 h-28 rounded-full bg-white/30 blur-2xl"></span>
            <span class="absolute inset-x-6 -bottom-12 h-28 rounded-full bg-black/10 blur-2xl"></span>
          </span>

          <router-link :to="`/news/${featured.id}`" class="relative z-10 block">
            <div class="relative aspect-[16/9] overflow-hidden rounded-b-none rounded-t-2xl">
              <template v-if="hasImg(featured)">
                <img
                  :src="featured.imageUrl"
                  alt=""
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  @error="markImgFail(featured.id)"
                />
              </template>
              <template v-else>
                <div
                  class="w-full h-full flex items-center justify-center text-sm
                         bg-white/20 backdrop-blur-md ring-1 ring-white/30 text-gray-600"
                >
                  No Image
                </div>
              </template>

              <div class="absolute left-3 bottom-3">
                <StatusPill :id="featured.id" />
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-2xl font-extrabold leading-snug group-hover:underline">
                {{ featured.title }}
              </h2>
              <p class="mt-1 text-gray-700/90 line-clamp-2">{{ featured.summary }}</p>
              <div class="mt-2 text-xs text-gray-600 flex items-center gap-2">
                <span>{{ featured.reporter }}</span>
                <span>•</span>
                <time :datetime="featured.createdAt">{{ formatDate(featured.createdAt) }}</time>
              </div>
            </div>
          </router-link>
        </article>

        <!-- ขวา: รายการย่อย -->
        <aside class="lg:col-span-1">
          <h3 class="font-bold text-lg mb-3 text-gray-900/90">Latest</h3>
          <ul class="space-y-4">
            <li
              v-for="s in sidebar"
              :key="s.id"
              class="group relative overflow-hidden rounded-2xl
                     bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_34px_rgba(0,0,0,0.14)]
                     transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
            >
              <!-- reflections -->
              <span class="pointer-events-none absolute inset-0">
                <span class="absolute inset-x-4 -top-10 h-24 rounded-full bg-white/25 blur-2xl"></span>
                <span class="absolute inset-x-5 -bottom-10 h-24 rounded-full bg-black/10 blur-2xl"></span>
              </span>

              <router-link :to="`/news/${s.id}`" class="relative z-10 flex gap-3 p-3 items-start">
                <!-- กรอบรูปย่อ: แสดง No Image ในกรอบเดียวกัน -->
                <div class="w-28 h-20 rounded ring-1 ring-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                  <template v-if="hasImg(s)">
                    <img :src="s.imageUrl" alt="" class="w-full h-full object-cover" loading="lazy" @error="markImgFail(s.id)" />
                  </template>
                  <template v-else>
                    <span class="text-[10px] text-gray-600">No Image</span>
                  </template>
                </div>

                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold leading-snug group-hover:underline line-clamp-2">
                    {{ s.title }}
                  </h4>
                  <div class="mt-1 text-xs text-gray-600 flex items-center gap-2">
                    <StatusPill :id="s.id" />
                    <span>•</span>
                    <time :datetime="s.createdAt">{{ formatDate(s.createdAt) }}</time>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </aside>
      </div>

      <!-- แถวล่าง: ที่เหลือ -->
      <div v-if="rest.length" class="mt-8 grid gap-6 md:grid-cols-2">
        <article
          v-for="n in rest"
          :key="n.id"
          class="group relative overflow-hidden rounded-2xl
                 bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_38px_rgba(0,0,0,0.14)]
                 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
        >
          <!-- reflections -->
          <span class="pointer-events-none absolute inset-0">
            <span class="absolute inset-x-5 -top-10 h-24 rounded-full bg-white/25 blur-2xl"></span>
            <span class="absolute inset-x-6 -bottom-10 h-24 rounded-full bg-black/10 blur-2xl"></span>
          </span>

          <router-link :to="`/news/${n.id}`" class="relative z-10 block p-4">
            <div class="flex gap-3 items-start">
              <!-- กรอบรูปย่อ: แสดง No Image ในกรอบเดียวกัน -->
              <div class="w-28 h-20 rounded ring-1 ring-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                <template v-if="hasImg(n)">
                  <img :src="n.imageUrl" alt="" class="w-full h-full object-cover" loading="lazy" @error="markImgFail(n.id)" />
                </template>
                <template v-else>
                  <span class="text-[10px] text-gray-600">No Image</span>
                </template>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold leading-snug group-hover:underline">
                  {{ n.title }}
                </h3>
                <p class="text-sm text-gray-700/90 line-clamp-2 mt-1">{{ n.summary }}</p>
                <div class="mt-2 text-xs text-gray-600 flex items-center gap-2">
                  <StatusPill :id="n.id" />
                  <span>•</span>
                  <time :datetime="n.createdAt">{{ formatDate(n.createdAt) }}</time>
                </div>
              </div>
            </div>
          </router-link>
        </article>
      </div>
    </template>

    <!-- เพจจิเนชัน -->
    <Pagination class="mt-6" :page="page" :total="totalPages" @update:page="setPage" />
  </section>
</template>

