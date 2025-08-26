<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import StatusPill from '@/components/StatusPill.vue'
import VotePanel from '@/components/VotePanel.vue'
import CommentsPanel from '@/components/CommentsPanel.vue'
import {
  LinkIcon,
  ShareIcon,
  PrinterIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

// ========== Sub-tabs (เหมือนหน้า Home) ==========
// ผูกกับ route ปัจจุบัน
const subTabs = [
  { key: 'news-vote',     label: 'Vote' },
  { key: 'news-comments', label: 'Comments' },
]

// active index อิงจากชื่อ route
const subActiveIndex = computed(() => {
  const name = String(route.name || '')
  const idx = subTabs.findIndex(t => t.key === name)
  return Math.max(0, idx)
})

const subTrackPaddingPx = 8
// ไล่สีให้เชื่อมกัน โทนเดียวกับ Home (indigo/teal ↔ emerald/mint)
const subGradients = [
  'from-orange-500 via-amber-500 to-yellow-400', // Vote (ส้ม → เหลือง)
  'from-amber-600 via-orange-500 to-amber-400',  // Comments (เหลืองเข้ม → ส้ม)
]

const subActiveGradientClass = computed(
  () => `bg-gradient-to-r ${subGradients[subActiveIndex.value]}`
)

const subHighlightStyle = computed(() => ({
  width: `calc((100% - ${subTrackPaddingPx * 2}px) / ${subTabs.length})`,
  transform: `translateX(${subActiveIndex.value * 100}%)`,
}))

function goSub(tabKey) {
  // นำทางไปยังชื่อ route นั้น ๆ พร้อมพารามิเตอร์ id เดิม
  router.push({ name: tabKey, params: { id: id.value } })
}

/* ---------- data/load ---------- */
const route = useRoute()
const router = useRouter()
const store = useNewsStore()
const { loading } = storeToRefs(store)

/* ===== Smooth scroll to in-page section (no reload) ===== */
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  // เลื่อนนิ่มไปตำแหน่งหัวข้อ
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // อัปเดต hash ใน URL โดยไม่ทำ navigation / reload
  const base = window.location.pathname + window.location.search
  window.history.replaceState(null, '', `${base}#${id}`)
}

onMounted(async () => {
  if (typeof store.load === 'function') await store.load()
  await nextTick()
  // ถ้ามี hash ตอนเปิดหน้า ให้เลื่อนไปทันที (ไม่รีหน้า)
  if (route.hash) {
    const id = route.hash.replace(/^#/, '')
    requestAnimationFrame(() => scrollToId(id))
  }
})

const id = computed(() => String(route.params.id ?? ''))

// ใช้ getter ของสโตร์เดิม
const article = computed(() => store.getById(id.value))

/* ฟิลด์ที่ใช้แสดงผล */
const title = computed(() => article.value?.title || 'Untitled')
const summary = computed(() => article.value?.summary || '')
const imageUrl = computed(() => article.value?.imageUrl || '')
const effectiveStatus = computed(() => store.getEffectiveStatusById(id.value))
const author = computed(() => article.value?.reporter || 'Unknown')
const createdAt = computed(() => article.value?.createdAt || article.value?.publishedAt || null)
const tags = computed(() => Array.isArray(article.value?.tags) ? article.value.tags : [])
const references = computed(() => article.value?.references || article.value?.sources || [])

// เนื้อหา
const bodyParas = computed(() => {
  const a = article.value
  if (!a) return []
  if (Array.isArray(a.content)) return a.content
  if (Array.isArray(a.paragraphs)) return a.paragraphs
  if (typeof a.body === 'string') return a.body.split(/\n{1,2}/).filter(Boolean)
  return []
})

/* meta: เวลาอ่าน */
const readingMinutes = computed(() => {
  const text = [title.value, summary.value, ...(bodyParas.value || [])].join(' ')
  const words = (text.match(/\b\w+\b/g) || []).length
  return Math.max(1, Math.round(words / 220))
})
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('th-TH', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}

/* ---------- copy/share/print ---------- */
const copied = ref(false)
async function copyLink() {
  try { await navigator.clipboard.writeText(window.location.href) }
  catch {
    const ta = document.createElement('textarea')
    ta.value = window.location.href
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
  } finally {
    copied.value = true; setTimeout(() => (copied.value = false), 1200)
  }
}
function shareTo(site) {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(title.value)
  const map = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    tw: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
  }
  window.open(map[site], '_blank', 'noopener,noreferrer')
}
function printPage() { window.print() }

/* ---------- reading progress ---------- */
const progress = ref(0)
const articleEl = ref(null)
function updateProgress() {
  const el = articleEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const viewport = window.innerHeight || document.documentElement.clientHeight
  const total = rect.height - viewport
  if (total <= 0) { progress.value = 0; return }
  const scrolled = Math.min(Math.max(-rect.top, 0), total)
  progress.value = Math.round((scrolled / total) * 100)
}
onMounted(async () => {
  await nextTick()
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})

watch(() => route.params.id, async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  updateProgress()
})

/* ---------- Right rail: Vote & Comments ---------- */
const userVote = computed({
  get: () => (store.votes ? (store.votes[id.value] ?? 0) : 0),
  set: (v) => {
    if (typeof store.setVote === 'function') store.setVote(id.value, v)
    else {
      if (!store.votes) store.votes = {}
      store.votes[id.value] = v
    }
  }
})
function setVote(v) { userVote.value = userVote.value === v ? 0 : v }

const commentsForThis = computed(() => {
  const all = store.comments || []
  return all.filter(c => String(c.newsId) === id.value)
})
const newComment = ref('')
const sending = ref(false)

/* ====== ✅ Toast success alert (ลอยมุมขวาบน) ====== */
const toastShow = ref(false)
const toastMsg  = ref('')
let toastTimer = null
function showToast(msg = 'Comment submitted successfully!') {
  toastMsg.value = msg
  toastShow.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastShow.value = false), 2000)
}

// รองรับอีเวนต์ภายนอก เช่นคอมโพเนนต์ลูกยิงขึ้นมา
function onExternalCommentSubmitted(e) {
  const m = e?.detail?.message || 'Comment submitted successfully!'
  showToast(m)
}
onMounted(() => {
  window.addEventListener('comment:submitted', onExternalCommentSubmitted)
})
onBeforeUnmount(() => {
  window.removeEventListener('comment:submitted', onExternalCommentSubmitted)
})

async function submitComment() {
  const text = newComment.value.trim()
  if (!text) return
  const payload = {
    id: Date.now(),
    newsId: Number(id.value),
    author: 'You',
    text,
    createdAt: new Date().toISOString()
  }
  sending.value = true
  try {
    if (typeof store.addComment === 'function') {
      await Promise.resolve(store.addComment(payload))
    } else {
      if (!Array.isArray(store.comments)) store.comments = []
      store.comments.unshift(payload)
    }
    newComment.value = ''
    // ✅ แสดง toast สำเร็จ
    showToast()
  } finally {
    sending.value = false
  }
}

/* ---------- related + prev/next ---------- */
const allItems = computed(() => store.items || [])
const related = computed(() => {
  const all = allItems.value
  const self = article.value
  if (!self) return []
  if (Array.isArray(self.tags) && self.tags.length) {
    return all
      .filter(n => String(n.id) !== String(self.id))
      .filter(n => Array.isArray(n.tags) && n.tags.some(t => self.tags.includes(t)))
      .slice(0, 4)
  }
  return all
    .filter(n => String(n.id) !== String(self.id))
    .filter(n => n.status === self.status || n.reporter === self.reporter)
    .slice(0, 4)
})
const ordered = computed(() => {
  const arr = [...allItems.value]
  arr.sort((a, b) => {
    const da = a.createdAt ? +new Date(a.createdAt) : 0
    const db = b.createdAt ? +new Date(b.createdAt) : 0
    if (db !== da) return db - da
    return String(a.id).localeCompare(String(b.id))
  })
  return arr
})
const indexInOrdered = computed(() => ordered.value.findIndex(n => String(n.id) === id.value))
const prevArticle = computed(() => indexInOrdered.value > 0 ? ordered.value[indexInOrdered.value - 1] : null)
const nextArticle = computed(() => indexInOrdered.value >= 0 && indexInOrdered.value < ordered.value.length - 1 ? ordered.value[indexInOrdered.value + 1] : null)

function goHome() { router.push({ name: 'home' }) }
</script>

<template>
  <main class="mx-auto max-w-6xl p-4 md:p-6 print:max-w-none print:p-0">
    <!-- progress bar: tailwind only -->
    <div class="sticky top-0 z-40 h-1 bg-white/40 backdrop-blur rounded-full overflow-hidden print:hidden">
      <div class="h-full bg-[#ea7139] transition-[width] duration-200" :style="{ width: progress + '%' }" />
    </div>

    <!-- ✅ Toast alert -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="translate-y-[-6px] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastShow"
        class="fixed top-3 right-3 z-50 min-w-[220px] max-w-[70vw]
               px-3.5 py-2.5 rounded-xl text-sm font-semibold
               text-emerald-800 bg-emerald-100/90 backdrop-blur
               ring-1 ring-emerald-300/60
               shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_28px_rgba(0,0,0,0.12)]"
        role="status"
        aria-live="polite"
      >
        {{ toastMsg }}
      </div>
    </Transition>

    <!-- breadcrumb -->
    <nav class="mt-2 mb-3 text-sm text-gray-500 flex items-center gap-2 print:hidden">
      <button
        @click="goHome"
        aria-label="Back"
        class="group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 select-none
              bg-white/20 backdrop-blur-xl ring-1 ring-white/35
              shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_18px_rgba(0,0,0,0.12)]
              text-gray-500 font-semibold
              transition-all duration-200 hover:bg-white/30 hover:-translate-y-0.5
              hover:text-[#ea7139]
              active:translate-y-0 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-[#ea7139]/60"
      >
        <!-- ambient reflections -->
        <span class="pointer-events-none absolute inset-0 rounded-full">
          <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
          <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
        </span>

        <!-- left dot -->
        <span
          class="relative inline-block h-2.5 w-2.5 rounded-full bg-gray-400 shadow-none
                 transition-all duration-300
                 group-hover:bg-gradient-to-br group-hover:from-rose-400 group-hover:via-orange-300 group-hover:to-amber-300
                 group-hover:shadow-[0_0_12px_rgba(234,113,57,0.7)]">
        </span>

        <ArrowLeftIcon class="w-4 h-4 relative z-10 transition-colors duration-200" />
        <span class="relative z-10">Back</span>
      </button>
    </nav>

    <!-- loading / not found -->
    <div v-if="loading" class="mt-10 text-center text-gray-500">loading...</div>
    <div v-else-if="!article" class="mt-10 text-center text-gray-500">Not Found</div>

    <div v-else class="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Article -->
      <article
        ref="articleEl"
        class="lg:col-span-8 relative rounded-2xl overflow-hidden
               bg-white/18 backdrop-blur-2xl ring-1 ring-white/35
               shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_44px_rgba(0,0,0,0.14)]
               hover:bg-white/25 transition"
      >
        <!-- reflections -->
        <span class="pointer-events-none absolute inset-0">
          <span class="absolute inset-x-5 -top-3 h-14 rounded-full bg-white/30 blur-2xl"></span>
          <span class="absolute inset-x-6 -bottom-3 h-14 rounded-full bg-black/10 blur-2xl"></span>
        </span>

        <!-- Hero -->
        <div v-if="imageUrl" class="relative rounded-2xl overflow-hidden ring-1 ring-white/40">
          <img :src="imageUrl" alt="" class="w-full max-h-[60vh] object-cover">
          <div class="absolute left-4 bottom-4">
            <StatusPill :id="id" />
          </div>
        </div>

        <!-- Head -->
        <header class="p-4 md:p-6 relative z-10">
          <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">{{ title }}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div class="inline-flex items-center gap-2">
              <ClockIcon class="w-4 h-4" />
              <span>{{ readingMinutes }} min read</span>
            </div>
            <span>•</span><span>{{ author }}</span>
            <span v-if="createdAt">•</span>
            <time v-if="createdAt" :datetime="createdAt">{{ formatDate(createdAt) }}</time>
          </div>

          <!-- Tags -->
          <div v-if="tags.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="t in tags" :key="t"
              class="px-2 py-0.5 rounded-full text-xs border border-[#ea7139] text-[#b63f2f] bg-white/60"
            >#{{ t }}</span>
          </div>
        </header>

        <!-- Body -->
        <section class="px-4 md:px-6 pb-6 relative z-10">
          <!-- mini TOC -->
          <div class="mb-4 text-sm text-gray-500 flex gap-3 flex-wrap print:hidden">
            <a href="#sec-details" @click.prevent="scrollToId('sec-details')" class="hover:underline text-[#ea7139]">Details</a>
            <a href="#sec-summary" @click.prevent="scrollToId('sec-summary')" class="hover:underline text-[#ea7139]">Summary</a>
            <a href="#sec-refs"    @click.prevent="scrollToId('sec-refs')"    class="hover:underline text-[#ea7139]">References</a>
          </div>

          <h2 id="sec-details" class="mt-6 font-semibold text-lg scroll-mt-24">Details</h2>
          <div class="prose prose-zinc max-w-none mt-2">
            <template v-if="bodyParas.length">
              <p v-for="(p, i) in bodyParas" :key="i">{{ p }}</p>
            </template>
            <template v-else>
              <p><strong>Paragraph 1:</strong> what happened, where, when.</p>
              <p><strong>Paragraph 2:</strong> context/background and why it matters.</p>
              <p><strong>Paragraph 3:</strong> what is verified or disputed.</p>
            </template>
          </div>
          <br>
          <h2 id="sec-summary" class="font-semibold text-lg scroll-mt-24">Summary</h2>
          <p class="mt-2 text-gray-800 leading-8">{{ summary || '—' }}</p>

          <h2 id="sec-refs" class="mt-8 font-semibold text-lg scroll-mt-24">References</h2>
          <ul class="mt-2 list-disc list-inside text-sm">
            <li v-for="(r, i) in references" :key="i">
              <a
                :href="typeof r === 'string' ? r : (r.url || r.href)"
                target="_blank"
                class="text-[#ea7139] underline hover:opacity-80"
              >
                {{ typeof r === 'string' ? r : (r.label || r.url || r.href) }}
              </a>
            </li>
          </ul>
        </section>
      </article>

      <!-- Right rail -->
      <aside class="lg:col-span-4">
        <div class="sticky top-16 space-y-4">
          <!-- Tabs: liquid-glass (size กะทัดรัด) -->
          <nav class="print:hidden">
            <div class="relative inline-block">
              <!-- ambient glow -->
              <div class="pointer-events-none absolute -inset-2.5 rounded-full bg-gradient-to-br from-orange-200/30 via-white/20 to-cyan-200/30 blur-xl"></div>

              <!-- glass track -->
              <div class="relative rounded-full overflow-hidden inline-flex bg-white/18 backdrop-blur-2xl px-2 py-1.5 ring-1 ring-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_22px_rgba(0,0,0,0.12)]">
                <!-- highlight -->
                <span
                  class="absolute top-1.5 bottom-1.5 left-2 rounded-full transition-[transform,background] duration-300 ease-out shadow-[0_8px_18px_rgba(0,0,0,0.16)] ring-1 ring-white/40"
                  :class="subActiveGradientClass"
                  :style="subHighlightStyle"
                ></span>

                <!-- reflections -->
                <span class="pointer-events-none absolute inset-0">
                  <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/25 blur-lg"></span>
                  <span class="absolute inset-x-2 bottom-0 h-1/2 rounded-full bg-black/5 blur-md"></span>
                </span>

                <!-- buttons -->
                <div
                  class="relative z-10 grid"
                  :style="{ gridTemplateColumns: `repeat(${subTabs.length}, 1fr)` }"
                >
                  <button
                    v-for="(t,i) in subTabs"
                    :key="t.key"
                    class="px-4 py-1.5 text-sm font-semibold rounded-full text-center select-none transition-colors duration-200"
                    :class="i===subActiveIndex
                      ? 'text-white'
                      : t.key==='news-vote'     ? 'text-gray-500/90 hover:text-amber-700/90'
                      : t.key==='news-comments' ? 'text-gray-500/90 hover:text-amber-700/90'
                      : ''"
                    @click="goSub(t.key)"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <!-- Child routes -->
          <div class="mt-2 min-h-[360px]">
            <RouterView v-slot="{ Component }">
              <Transition
                mode="out-in"
                enter-active-class="transition-opacity duration-150"
                enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-150"
                leave-to-class="opacity-0"
              >
                <component :is="Component" :key="$route.fullPath" />
              </Transition>
            </RouterView>
          </div>


          <!-- Quick facts -->
          <section
            class="relative rounded-2xl p-4
                   bg-white/18 backdrop-blur-2xl ring-1 ring-white/35
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_44px_rgba(0,0,0,0.14)]
                   hover:bg-white/25 transition"
          >
            <span class="pointer-events-none absolute inset-0">
              <span class="absolute inset-x-5 -top-3 h-14 rounded-full bg-white/30 blur-2xl"></span>
              <span class="absolute inset-x-6 -bottom-3 h-14 rounded-full bg-black/10 blur-2xl"></span>
            </span>

            <h3 class="font-semibold text-[#b63f2f]">Quick facts</h3>
            <ul class="mt-2 space-y-1 text-sm text-gray-700">
              <li class="flex items-center gap-2">
                <span class="text-gray-500">Status:</span>
                <StatusPill :id="id" />
              </li>
              <li v-if="author"><span class="text-gray-500">Reporter:</span> {{ author }}</li>
              <li v-if="createdAt"><span class="text-gray-500">Date:</span> {{ formatDate(createdAt) }}</li>
              <li><span class="text-gray-500">Reading:</span> ~{{ readingMinutes }} min</li>
            </ul>

            <div v-if="imageUrl" class="mt-3">
              <img :src="imageUrl" alt="" class="w-full rounded-lg object-cover max-h-40">
              <div class="mt-1 text-xs text-gray-500">
                Image link: <a :href="imageUrl" target="_blank" class="underline">Open</a>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <!-- Related -->
    <section v-if="related.length" class="mt-10">
      <h3 class="font-semibold text-lg mb-3">Related</h3>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="n in related" :key="n.id" :to="`/news/${n.id}`"
          class="group relative rounded-2xl overflow-hidden
                 bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_34px_rgba(0,0,0,0.14)]
                 transition hover:bg-white/25 hover:-translate-y-0.5"
        >
          <span class="pointer-events-none absolute inset-0">
            <span class="absolute inset-x-5 -top-3 h-14 rounded-full bg-white/30 blur-2xl"></span>
            <span class="absolute inset-x-6 -bottom-3 h-14 rounded-full bg-black/10 blur-2xl"></span>
          </span>

          <div class="aspect-[4/3] overflow-hidden">
            <img :src="n.imageUrl || 'https://via.placeholder.com/480x360?text=News'" alt=""
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy" />
          </div>
          <div class="p-3">
            <div class="text-sm font-semibold line-clamp-2 group-hover:underline">{{ n.title }}</div>
            <div class="mt-1 text-xs text-gray-500 flex items-center gap-2">
              <StatusPill :id="n.id" />
              <span>•</span>
              <time :datetime="n.createdAt">{{ formatDate(n.createdAt) }}</time>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Prev / Next -->
    <nav class="mt-10 grid grid-cols-2 gap-3 print:hidden items-stretch">
      <!-- Prev (ซ้ายเสมอ) -->
      <div class="h-full">
        <RouterLink
          v-if="prevArticle"
          :to="`/news/${prevArticle.id}`"
          class="flex h-full items-center gap-2 p-3 rounded-2xl overflow-hidden
                bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_34px_rgba(0,0,0,0.14)]
                transition hover:bg-white/25 hover:-translate-y-0.5"
        >
          <ArrowLeftIcon class="w-5 h-5 text-[#ea7139]" />
          <div class="text-sm min-w-0">
            <div class="text-gray-500">Prev</div>
            <div class="font-semibold line-clamp-1">{{ prevArticle.title }}</div>
          </div>
        </RouterLink>

        <!-- placeholder: ไม่มีบทความก่อนหน้า -->
        <div
          v-else
          class="flex h-full items-center gap-2 p-3 rounded-2xl overflow-hidden
                bg-white/10 backdrop-blur-2xl ring-1 ring-white/20
                text-gray-400 select-none pointer-events-none"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          <div class="text-sm">
            <div>No Prev</div>
          </div>
        </div>
      </div>

      <!-- Next (ขวาเสมอ) -->
      <div class="h-full">
        <RouterLink
          v-if="nextArticle"
          :to="`/news/${nextArticle.id}`"
          class="flex h-full items-center justify-end gap-2 p-3 rounded-2xl overflow-hidden text-right
                bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_34px_rgba(0,0,0,0.14)]
                transition hover:bg-white/25 hover:-translate-y-0.5"
        >
          <div class="text-sm min-w-0">
            <div class="text-gray-500">Next</div>
            <div class="font-semibold line-clamp-1">{{ nextArticle.title }}</div>
          </div>
          <ArrowRightIcon class="w-5 h-5 text-[#ea7139]" />
        </RouterLink>

        <!-- placeholder: ไม่มีบทความถัดไป -->
        <div
          v-else
          class="flex h-full items-center justify-end gap-2 p-3 rounded-2xl overflow-hidden text-right
                bg-white/10 backdrop-blur-2xl ring-1 ring-white/20
                text-gray-400 select-none pointer-events-none"
        >
          <div class="text-sm">
            <div>No Next</div>
          </div>
          <ArrowRightIcon class="w-5 h-5" />
        </div>
      </div>
    </nav>
  </main>
</template>
