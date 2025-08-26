<template>
  <section class="rounded-2xl border bg-white/90 p-4">
    <!-- Header controls -->
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h3 class="font-semibold text-[#b63f2f]">Comments</h3>

      <div class="flex items-center gap-2 text-xs md:text-sm">
        <label>Sort</label>
        <select v-model="sort" class="border rounded px-2 py-1">
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="like">Most liked</option>
        </select>

        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="withImages" />
          <span>With images</span>
        </label>

        <label>Per page</label>
        <select v-model.number="pageSize" class="border rounded px-2 py-1">
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </div>
    </div>

    <!-- ✅ Success alert -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="translate-y-[-6px] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="commentSuccess"
        class="mb-3 p-2.5 rounded-lg text-sm font-semibold
               text-emerald-800 bg-emerald-100/90 ring-1 ring-emerald-300/60
               shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_18px_rgba(0,0,0,0.08)]"
        role="status"
        aria-live="polite"
      >
        {{ commentSuccess }}
      </div>
    </Transition>

    <!-- add form -->
    <div class="mb-3">
      <div class="flex items-start gap-2">
        <svg class="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z"/></svg>
        <div class="flex-1 space-y-2">
          <input v-model="author" type="text" placeholder="Your name (optional)"
                 class="w-full border rounded px-3 py-2 text-sm" />
          <textarea v-model="text" rows="2" placeholder="Write a comment…"
                    class="w-full border rounded px-3 py-2 text-sm"></textarea>
          <input v-model="imageUrl" type="url" placeholder="Image URL (optional)"
                 class="w-full border rounded px-3 py-2 text-sm"/>
          <div class="flex justify-end">
            <button
              class="inline-flex items-center gap-1 rounded-xl border border-[#ea7139] text-[#b63f2f] px-3 py-2 text-sm disabled:opacity-50"
              :disabled="sending || !text.trim()"
              @click="submitComment"
            >Send</button>
          </div>
        </div>
      </div>
    </div>

    <div class="text-xs text-gray-500 mb-2">
      Showing {{ paged.length }} of {{ filtered.length }}
    </div>

    <!-- list -->
    <ul class="space-y-3 max-h-[46vh] overflow-auto pr-1">
      <li v-for="c in paged" :key="c.id" class="bg-white border rounded-lg p-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {{ initials(c.author) }}
          </div>

          <div class="flex-1 min-w-0">
            <!-- header row -->
            <div class="text-sm text-gray-600 flex items-center gap-2">
              <span class="font-medium text-gray-800 truncate">{{ c.author || 'Anon' }}</span>
              <span>•</span>
              <time :datetime="c.createdAt">{{ formatDate(c.createdAt) }}</time>

              <span class="ml-auto inline-flex items-center gap-1 text-xs">
                <button class="px-2 py-0.5 border rounded"
                        @click="like(c.id)">👍 {{ c.likes || 0 }}</button>
              </span>
            </div>

            <!-- editor / content -->
            <div v-if="editingId === c.id" class="mt-2 space-y-2">
              <textarea v-model="editText" rows="3" class="w-full border rounded px-3 py-2 text-sm"></textarea>
              <input v-model="editImage" type="url" placeholder="Image URL (optional)"
                     class="w-full border rounded px-3 py-2 text-sm"/>
              <div class="flex gap-2">
                <button class="px-3 py-1 rounded bg-black text-white text-sm" @click="saveEdit(c)">Save</button>
                <button class="px-3 py-1 rounded border text-sm" @click="cancelEdit">Cancel</button>
              </div>
            </div>
            <div v-else class="mt-1">
              <p class="text-gray-800 whitespace-pre-line">{{ c.text }}</p>
              <img v-if="c.imageUrl" :src="c.imageUrl" alt=""
                   class="mt-2 rounded-lg max-h-40 object-cover" loading="lazy"/>
            </div>

            <!-- actions -->
            <div class="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <button v-if="c.editable && editingId !== c.id" class="underline" @click="startEdit(c)">Edit</button>
              <button v-if="c.editable" class="underline text-red-600" @click="removeComment(c.id)">Delete</button>
            </div>
          </div>
        </div>
      </li>

      <li v-if="!paged.length" class="text-sm text-gray-500">ยังไม่มีคอมเมนต์</li>
    </ul>

    <!-- pagination -->
    <Pagination
      class="mt-4"
      :page="page"
      :total="totalPages"
      :is-loading="sending"
      @update:page="page = $event"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, toRef } from 'vue'
import { useNewsStore } from '@/stores/news'
import Pagination from '@/components/Pagination.vue'

const props = defineProps({
  newsId: { type: [String, Number], required: true }
})
const id = toRef(props, 'newsId')

const store = useNewsStore()
onMounted(() => { if (typeof store.ensureLoaded === 'function') store.ensureLoaded() })

/* load list from store (API ของของเก่า) */
const all = computed(() =>
  typeof store.getCommentsByNews === 'function'
    ? (store.getCommentsByNews(id.value) || [])
    : [])

/* controls */
const sort = ref('new')
const withImages = ref(false)
const page = ref(1)
const pageSize = ref(5)

/* build list */
const filtered = computed(() => {
  let x = all.value.slice()
  if (withImages.value) x = x.filter(c => !!c.imageUrl)
  if (sort.value === 'new') x.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort.value === 'old') x.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  if (sort.value === 'like') x.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  return x
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
watch([sort, withImages, pageSize], () => (page.value = 1))
watch(() => totalPages.value, t => { if (page.value > t) page.value = t })

/* utils */
function initials(name) { return (name || 'A').slice(0, 2).toUpperCase() }
function formatDate(iso) { return new Date(iso).toLocaleString() }

/* like / edit / delete — ใช้ action ของของเก่า */
function like(id) {
  if (typeof store.likeComment === 'function') store.likeComment(id)
}
const editingId = ref('')
const editText = ref('')
const editImage = ref('')
function startEdit(c) { editingId.value = c.id; editText.value = c.text; editImage.value = c.imageUrl || '' }
function cancelEdit() { editingId.value = ''; editText.value = ''; editImage.value = '' }
function saveEdit(c) {
  const url = (editImage.value || '').trim()
  if (url && !/^https?:\/\//.test(url)) { alert('Image URL must start with http(s)://'); return }
  if (typeof store.editComment === 'function') store.editComment(c.id, (editText.value || '').trim(), url)
  cancelEdit()
}
function removeComment(cid) {
  if (confirm('Delete this comment?') && typeof store.deleteComment === 'function') {
    store.deleteComment(cid)
  }
}

/* add comment form */
const author = ref('')
const text = ref('')
const imageUrl = ref('')
const sending = ref(false)

/* ✅ alert state */
const commentSuccess = ref('')

async function submitComment() {
  const url = (imageUrl.value || '').trim()
  if (url && !/^https?:\/\//.test(url)) { alert('Image URL must start with http(s)://'); return }
  const payload = {
    author: (author.value || '').trim(),
    text: (text.value || '').trim(),
    imageUrl: url
  }
  if (!payload.text) return

  sending.value = true
  try {
    if (typeof store.addComment === 'function') {
      await Promise.resolve(store.addComment(id.value, payload))

      // เคลียร์ฟอร์ม
      author.value = ''; text.value = ''; imageUrl.value = ''

      // ✅ แสดงข้อความสำเร็จใน panel นี้
      commentSuccess.value = 'Comment submitted successfully!'
      setTimeout(() => (commentSuccess.value = ''), 2000)

      // ✅ แจ้ง global (ให้ NewsDetail.vue แสดง toast ได้ด้วย)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('comment:submitted', {
          detail: { message: 'Comment submitted successfully!' }
        }))
      }
    }
  } finally {
    sending.value = false
  }
}
</script>
