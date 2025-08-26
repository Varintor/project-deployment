// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import Home from '@/pages/Home.vue'
import NewsDetail from '@/pages/NewsDetail.vue'
import Comments from '@/pages/Comments.vue'
import Vote from '@/pages/Vote.vue'
import About from '@/pages/About.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },

  // ✅ เอา name ออกจาก parent, ใส่ redirect ที่ parent, และตั้งชื่อให้ default child (path: '')
  {
    path: '/news/:id',
    component: NewsDetail,
    props: true,
    redirect: to => ({ name: 'news-vote', params: to.params }), // default ไปแท็บ Vote
    children: [
      { path: '',          name: 'news-vote',     component: Vote,     props: true }, // default child ต้องมี name
      { path: 'comments',  name: 'news-comments', component: Comments, props: true },
      // (ถ้าอยากรองรับ /news/:id/vote ก็ redirect มาที่ default child)
      { path: 'vote', redirect: to => ({ name: 'news-vote', params: to.params }) },
    ],
  },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (isSubTabSwitch(to, from)) return savedPosition || false
    return { top: 0 }
  },
})

/* ---------------- NProgress ---------------- */
NProgress.configure({ showSpinner: false, speed: 400, trickleSpeed: 200, minimum: 0.08 })

/* ---------------- Global overlay ---------------- */
let overlayEl = null
let inFlight = 0
let visibleSince = 0
let hideTimer = null
const MIN_VISIBLE = 200 // ms

function ensureOverlay() {
  if (overlayEl) return overlayEl
  const el = document.createElement('div')
  el.id = 'route-loading'
  el.className =
    'fixed inset-0 z-[9999] hidden flex items-center justify-center bg-white/20 backdrop-blur-md'
  el.innerHTML = `
    <div class="relative">
      <img src="/logo.png" alt="logo" class="w-40 h-40 select-none pointer-events-none" />
      <div class="pointer-events-none absolute inset-[-14px] rounded-full border-4 border-[#ea7139]/100 border-t-transparent animate-spin"></div>
    </div>
  `
  document.body.appendChild(el)
  overlayEl = el
  return el
}
function showOverlay() {
  const el = ensureOverlay()
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  el.classList.remove('hidden')
  document.documentElement.classList.add('overflow-hidden')
}
function hideOverlay() {
  if (!overlayEl) return
  overlayEl.classList.add('hidden')
  document.documentElement.classList.remove('overflow-hidden')
}

/* ---------------- Helper: สลับ sub-tab ภายในข่าวเดียวกัน ---------------- */
const SUBTAB = new Set(['news-vote', 'news-comments'])
function isSubTabSwitch(to, from) {
  return SUBTAB.has(to.name) && SUBTAB.has(from.name) && String(to.params.id) === String(from.params.id)
}

/* ---------------- API กลางให้ component เรียกใช้ ---------------- */
export function beginUiLoad() {
  const started = typeof NProgress.isStarted === 'function'
    ? NProgress.isStarted()
    : (NProgress.status != null)
  if (!started) NProgress.start()
  inFlight++
  if (inFlight === 1) { visibleSince = Date.now(); showOverlay() }
}
export function endUiLoad() {
  if (inFlight > 0) inFlight--
  if (inFlight === 0) {
    NProgress.done()
    const wait = Math.max(0, MIN_VISIBLE - (Date.now() - visibleSince))
    hideTimer = setTimeout(() => { hideTimer = null; hideOverlay() }, wait)
  }
}

/* ---------------- Hooks ---------------- */
router.beforeEach((to, from, next) => { if (!isSubTabSwitch(to, from)) beginUiLoad(); next() })
router.afterEach((to, from) => { if (!isSubTabSwitch(to, from)) endUiLoad() })
router.onError(() => { endUiLoad() })

/* ---------------- กันซ้อน overlay ตอน HMR (dev) ---------------- */
if (import.meta && import.meta.hot) {
  import.meta.hot.dispose(() => {
    try { if (hideTimer) clearTimeout(hideTimer) } catch {}
    hideTimer = null
    if (overlayEl?.parentNode) overlayEl.parentNode.removeChild(overlayEl)
    overlayEl = null
    inFlight = 0
  })
}

export default router
