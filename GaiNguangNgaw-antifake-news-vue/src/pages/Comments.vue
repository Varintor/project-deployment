<template>
  <section>
    <!-- แถวควบคุมด้านบน -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
      <h2 class="font-semibold">Comments</h2>

      <!-- ✅ ทั้งหมดอยู่บรรทัดเดียว + ฟอนต์เล็ก -->
      <div class="flex items-center gap-3 text-xs flex-nowrap">
        <!-- Sort (label + ปุ่ม Newest อยู่แถวเดียวกัน) -->
        <div class="group flex items-center gap-1.5 relative" ref="sortRoot"> 
        <!-- Label -->
        <label
          class="font-medium text-[12px] whitespace-nowrap transition-colors duration-200"
          :class="sortOpen ? 'text-[#b63f2f]' : 'text-gray-500/90 group-hover:text-[#b63f2f]/70'"
        >
          Sort
        </label>

        <!-- ปุ่ม -->
        <button
          type="button"
          @click="sortOpen = !sortOpen"
          @keydown.escape="sortOpen=false"
          class="group/btn relative font-semibold text-[11px] rounded-full px-2.5 pr-7 py-1
                bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                flex items-center gap-2 select-none outline-none
                transition-all duration-300
                text-gray-500/90
                hover:bg-white/30 hover:text-[#b63f2f]/70"
          :class="sortOpen ? 'bg-white/30 text-[#b63f2f]/70' : ''"
          aria-haspopup="listbox"
          :aria-expanded="sortOpen"
        >
          {{ sortLabel }}
          <svg
            class="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200"
            :class="sortOpen ? 'rotate-180 text-[#b63f2f]' : 'rotate-0 text-gray-500/90 group-hover/btn:text-[#b63f2f]/70'"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- เมนู Sort -->
        <div
          v-show="sortOpen"
          class="absolute left-0 top-full mt-1 w-40 rounded-xl
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
              v-for="opt in sortOptions"
              :key="opt.value"
              @click="chooseSort(opt.value)"
              class="font-semibold px-3 py-2 cursor-pointer flex items-center justify-between gap-2
                    text-[#b63f2f]/80 hover:bg-white/30 transition rounded-lg"
              :aria-selected="sort === opt.value"
              role="option"
            >
              <span class="inline-flex items-center gap-2">
                <span class="inline-block h-2.5 w-2.5 rounded-full"
                      :class="sort === opt.value ? 'bg-[#ea7139]' : 'bg-[#b63f2f]/30'"></span>
                {{ opt.label }}
              </span>
              <svg v-if="sort===opt.value" class="w-4 h-4 text-[#ea7139]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </li>
          </ul>
        </div>
      </div>

        <!-- With images -->
<label
  class="group inline-flex items-center gap-1.5 font-medium cursor-pointer
         bg-white/20 backdrop-blur-xl ring-1 ring-white/35 rounded-full px-2.5 py-1
         hover:bg-white/30 transition"
>
  <input
    type="checkbox"
    v-model="withImages"
    class="appearance-none w-3.5 h-3.5 rounded border 
           border-gray-400 bg-white
           checked:bg-[#ea7139] checked:border-[#ea7139]
           group-hover:border-[#b63f2f]/70
           transition-colors duration-200"
  />
  <span
    class="text-gray-500/90 transition-colors duration-200 group-hover:text-[#b63f2f]/70"
  >
    With images
  </span>
</label>


        <!-- Per page -->
        <div class="group flex items-center gap-1.5 relative flex-nowrap" ref="perPageRoot">
          <!-- Label (ใช้ group-hover แทน peer-hover) -->
          <label
            class="font-semibold text-[11px] whitespace-nowrap transition-colors duration-200"
            :class="perOpen ? 'text-[#b63f2f]' : 'text-gray-500/90 group-hover:text-[#b63f2f]/70'"
          >
            Per page
          </label>

          <!-- ปุ่ม -->
          <button
            type="button"
            @click="perOpen = !perOpen"
            @keydown.escape="perOpen=false"
            class="peer group/btn relative font-semibold rounded-full px-3 pr-8 py-1.5
                  bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_20px_rgba(0,0,0,0.12)]
                  flex items-center gap-2 select-none outline-none
                  transition-all duration-300
                  hover:bg-white/30 focus:bg-white/30
                  hover:text-[#b63f2f]/70 text-[11px]"
            :class="perOpen ? 'bg-white/30 text-[#b63f2f]/70' : ''"
            aria-haspopup="listbox"
            :aria-expanded="perOpen"
          >
            <span class="pointer-events-none absolute inset-0 rounded-full">
              <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
              <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
            </span>

            <span class="relative z-10 transition-colors duration-200"
                  :class="perOpen ? 'text-[#b63f2f]' : 'text-gray-500/90 group-hover/btn:text-[#b63f2f]/70'">
              {{ pageSize }}
            </span>

            <svg
              class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
              :class="perOpen ? 'text-[#b63f2f] rotate-180' : 'text-gray-500/90 group-hover/btn:text-[#b63f2f]/70 rotate-0'"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown -->
          <div
            v-show="perOpen"
            class="absolute left-0 top-full mt-0.5 w-32 rounded-xl
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
                v-for="n in [3,5,8]"
                :key="n"
                @click="choosePageSize(n)"
                class="font-semibold px-3 py-2 cursor-pointer flex items-center justify-between gap-2
                      text-[#b63f2f]/80 hover:bg-white/30 transition rounded-lg"
                :aria-selected="pageSize === n"
                role="option"
              >
                <span class="inline-flex items-center gap-2">
                  <span class="inline-block h-2.5 w-2.5 rounded-full"
                        :class="pageSize === n ? 'bg-[#ea7139]' : 'bg-[#b63f2f]/30'"></span>
                  {{ n }}
                </span>
                <svg v-if="pageSize === n" class="w-4 h-4 text-[#ea7139]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="text-xs text-gray-500 mb-2">Showing {{ paged.length }} of {{ filtered.length }}</div>

    <ul class="space-y-3">
  <li
    v-for="c in paged"
    :key="c.id"
    class="group relative overflow-hidden rounded-2xl p-3
           bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
           shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_24px_rgba(0,0,0,0.12)]
           transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
  >
    <!-- reflections -->
    <span class="pointer-events-none absolute inset-0">
      <span class="absolute inset-x-4 -top-10 h-24 rounded-full bg-white/25 blur-2xl"></span>
      <span class="absolute inset-x-5 -bottom-10 h-24 rounded-full bg-black/10 blur-2xl"></span>
    </span>

    <div class="relative z-10 flex items-start gap-3">
      <!-- avatar แบบ glass -->
      <div class="w-9 h-9 rounded-full bg-white/30 ring-1 ring-white/40 flex items-center justify-center text-[10px] font-semibold text-gray-700">
        {{ initials(c.author) }}
      </div>

      <div class="flex-1 min-w-0">
        <!-- header -->
        <div class="text-sm text-gray-600 flex items-center gap-2">
          <span class="font-medium text-gray-900/90">{{ c.author }}</span>
          <span>•</span>
          <time :datetime="c.createdAt">{{ formatDate(c.createdAt) }}</time>

          <span class="ml-auto inline-flex items-center gap-1 text-xs">
            <button
              class="px-2 py-0.5 rounded-full font-semibold
                     bg-white/30 hover:bg-white/40 ring-1 ring-white/40
                     transition-colors"
              @click="like(c.id)"
            >
              👍 {{ c.likes }}
            </button>
          </span>
        </div>

        <!-- body -->
        <div v-if="editingId === c.id" class="mt-2 space-y-2">
          <textarea
            v-model="editText"
            rows="3"
            class="w-full rounded-xl px-3 py-2
                   bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                   outline-none focus:ring-[#ea7139]/40 focus:bg-white/25 transition"
          ></textarea>

          <input
            v-model="editImage"
            type="url"
            placeholder="Image URL (optional)"
            class="w-full rounded-xl px-3 py-2
                   bg-white/20 backdrop-blur-xl ring-1 ring-white/35
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                   outline-none focus:ring-[#ea7139]/40 focus:bg-white/25 transition"
          />

          <div class="flex gap-2">
            <button
              class="px-3 py-1 rounded-full text-sm font-semibold
                     bg-[#111] text-white hover:bg-black/90 transition"
              @click="saveEdit(c)"
            >Save</button>

            <button
              class="px-3 py-1 rounded-full text-sm font-semibold
                     bg-white/30 hover:bg-white/40 ring-1 ring-white/40 transition"
              @click="cancelEdit"
            >Cancel</button>
          </div>
        </div>
        <div v-else class="mt-1">
          <p class="text-gray-800 whitespace-pre-line">{{ c.text }}</p>
          <img
            v-if="c.imageUrl"
            :src="c.imageUrl"
            alt=""
            class="mt-2 rounded-xl max-h-40 object-cover
                   ring-1 ring-white/40 bg-white/20"
            loading="lazy"
          />
        </div>

        <!-- actions -->
        <div class="mt-2 text-xs text-gray-600 flex items-center gap-2">
          <button
            v-if="c.editable && editingId !== c.id"
            class="underline hover:text-[#b63f2f]/80"
            @click="startEdit(c)"
          >Edit</button>

          <button
            v-if="c.editable"
            class="underline text-red-600/90 hover:text-red-700"
            @click="remove(c.id)"
          >Delete</button>
        </div>
      </div>
    </div>
  </li>
</ul>


    <Pagination class="mt-4" :page="page" :total="totalPages" @update:page="page = $event" />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '../stores/news'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const store = useNewsStore()
const all = computed(() => store.getCommentsByNews(route.params.id))

onMounted(() => store.ensureLoaded())

// Controls
const sort = ref('new')
const withImages = ref(false)
const page = ref(1)
// ใน <script setup>
const perPage = ref(Number(localStorage.getItem('cmts_per_page')) || 10)
function persistPerPage() {
  try { localStorage.setItem('cmts_per_page', String(perPage.value)) } catch {}
}

const pageSize = ref(5)

// ====== glass dropdown state ======
const sortOptions = [
  { value: 'new',  label: 'Newest' },
  { value: 'old',  label: 'Oldest' },
  { value: 'like', label: 'Most liked' },
]
const sortOpen = ref(false)
const perOpen = ref(false)
const sortRoot = ref(null)
const perPageRoot = ref(null)

function chooseSort(v) { sort.value = v; sortOpen.value = false }
function choosePageSize(n) { pageSize.value = n; page.value = 1; perOpen.value = false }
const sortLabel = computed(() => sortOptions.find(o=>o.value===sort.value)?.label || 'Sort')

function onClickOutside(e) {
  const t = e.target
  if (sortRoot.value && !sortRoot.value.contains(t)) sortOpen.value = false
  if (perPageRoot.value && !perPageRoot.value.contains(t)) perOpen.value = false
}
onMounted(()=> document.addEventListener('click', onClickOutside))
onBeforeUnmount(()=> document.removeEventListener('click', onClickOutside))

// ====== data ======
const filtered = computed(()=> {
  let x = all.value.slice()
  if (withImages.value) x = x.filter(c => !!c.imageUrl)
  if (sort.value === 'new') x.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort.value === 'old') x.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  if (sort.value === 'like') x.sort((a, b) => b.likes - a.likes)
  return x
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch([sort, withImages, pageSize], () => page.value = 1)
watch(() => totalPages.value, (t) => { if (page.value > t) page.value = t })

function initials(name) { return (name || 'A').slice(0, 2).toUpperCase() }
function formatDate(iso) { return new Date(iso).toLocaleString() }

// Like / Edit / Delete
function like(id) { store.likeComment(id) }
const editingId = ref('')
const editText = ref('')
const editImage = ref('')
function startEdit(c) { editingId.value = c.id; editText.value = c.text; editImage.value = c.imageUrl || '' }
function cancelEdit() { editingId.value = ''; editText.value = ''; editImage.value = '' }
function saveEdit(c) {
  const url = editImage.value.trim()
  if (url && !/^https?:\/\//.test(url)) { alert('Image URL must start with http(s)://'); return }
  store.editComment(c.id, editText.value.trim(), url)
  cancelEdit()
}
function remove(id) { if (confirm('Delete this comment?')) store.deleteComment(id) }
const sorted = computed(() => {
  const arr = [...comments.value]
  if (sort.value === 'most') {
    arr.sort((a,b) => b.likes - a.likes || new Date(b.createdAt)-new Date(a.createdAt))
  } else if (sort.value === 'new') {
    arr.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
  } else {
    arr.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt))
  }
  return arr
})

function isImageUrl(u) {
  try { const x = new URL(u); return /\.(png|jpe?g|webp|gif|svg)$/i.test(x.pathname) } catch { return false }
}
const visible = computed(() =>
  sorted.value.filter(c => !onlyWithImage.value || isImageUrl(c.imageUrl))
)


</script>
