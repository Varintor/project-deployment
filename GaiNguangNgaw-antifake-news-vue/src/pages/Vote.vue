<template>
  <section
    class="rounded-2xl p-6 md:p-7 relative overflow-hidden
           bg-white/18 backdrop-blur-2xl ring-1 ring-white/35
           shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_38px_rgba(0,0,0,0.14)]"
  >
    <!-- subtle reflections -->
    <span aria-hidden="true" class="pointer-events-none absolute inset-0">
      <span class="absolute inset-x-6 -top-6 h-16 rounded-full bg-white/30 blur-2xl"></span>
      <span class="absolute inset-x-7 -bottom-8 h-20 rounded-full bg-black/10 blur-2xl"></span>
    </span>

    <!-- ===== LIVE RESULTS ===== -->
    <div class="space-y-3 relative z-10">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Live results</h2>
        <span class="text-xs text-gray-600/90">Total: {{ totalVotes }}</span>
      </div>

      <!-- totals -->
      <div class="flex items-center gap-8">
        <div class="text-center">
          <div class="text-3xl font-extrabold text-red-600">{{ votes.fake }}</div>
          <div class="text-[11px] text-gray-600/90">Fake</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-extrabold text-emerald-700">{{ votes.not_fake }}</div>
          <div class="text-[11px] text-gray-600/90">FACT</div>
        </div>

        <div class="ml-auto">
          <span class="inline-flex items-center gap-2">
            <span class="text-xs text-gray-600/90">Status:</span>
            <span
              class="relative inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                     ring-1 ring-white/35 backdrop-blur-xl overflow-hidden
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_6px_rgba(0,0,0,0.12)]"
              :class="statusTintClass"
              title="Status derived from votes (tie = UNCLEAR)"
            >
              <span class="pointer-events-none absolute inset-0 rounded-full">
                <span class="absolute inset-x-1 top-0 h-1/2 rounded-full bg-white/25 blur-sm"></span>
                <span class="absolute inset-x-1 bottom-0 h-1/2 rounded-full bg-black/5 blur-[1px]"></span>
              </span>
              <span class="relative z-10">{{ statusLabel }}</span>
            </span>
          </span>
        </div>
      </div>

      <!-- percentage bar -->
      <div class="space-y-1.5">
        <div class="h-3 rounded-xl overflow-hidden flex items-stretch bg-white/25 backdrop-blur ring-1 ring-white/30">
          <div class="h-full rounded-r-none bg-gradient-to-r from-red-600 via-rose-500 to-pink-500"
               :style="{ width: twoPct.fake + '%' }"></div>
          <div class="h-full rounded-l-none bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400"
               :style="{ width: twoPct.not_fake + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-700/90">
          <span>Fake: <b>{{ twoPct.fake.toFixed(0) }}%</b></span>
          <span>FACT: <b>{{ twoPct.not_fake.toFixed(0) }}%</b></span>
        </div>
      </div>
    </div>

    <!-- divider -->
    <div class="my-6 h-px bg-white/40"></div>

    <!-- ===== VOTE ===== -->
    <div class="space-y-3 relative z-10">
      <h3 class="font-semibold">Cast your vote</h3>
      <div class="flex gap-3">
        <button
          class="flex-1 h-11 md:h-12 rounded-xl font-semibold text-white
                 bg-gradient-to-r from-red-600 via-rose-500 to-pink-500"
          @click="vote('fake')">
          FAKE
        </button>
        <button
          class="flex-1 h-11 md:h-12 rounded-xl font-semibold text-white
                 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400"
          @click="vote('not_fake')">
          FACT
        </button>
      </div>
      <p v-if="flash" class="text-sm text-emerald-700">{{ flash }}</p>
      <p v-if="myVote" class="text-xs text-gray-600/90">Your previous vote: <b>{{ myVoteLabel }}</b></p>
    </div>

    <!-- ✅ Popup Success Comment -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95">
        <div v-if="commentSuccess" class="fixed inset-0 z-[9999] grid place-items-center">
          <div class="absolute inset-0 bg-white/60 backdrop-blur-md"></div>
          <div class="relative flex flex-col items-center text-center gap-3 select-none">
            <img src="/completelogo.png" alt="success" class="w-72 h-72 drop-shadow-lg" />
            <p class="font-bold text-lg text-[#b63f2f]">{{ commentSuccess }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ✅ Popup Success Vote -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95">
        <div v-if="voteSuccess" class="fixed inset-0 z-[9999] grid place-items-center">
          <div class="absolute inset-0 bg-white/60 backdrop-blur-md"></div>
          <div class="relative flex flex-col items-center text-center gap-3 select-none">
            <img src="/completelogo.png" alt="success" class="w-72 h-72 drop-shadow-lg" />
            <p class="font-bold text-lg text-[#b63f2f]">{{ voteSuccess }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- divider -->
    <div class="my-6 h-px bg-white/40"></div>

    <!-- ===== COMMENT ===== -->
    <div class="space-y-3 relative z-10">
      <h4 class="font-medium">Add a comment <span class="text-gray-500 font-normal">(optional)</span></h4>
      <form @submit.prevent="submitComment" class="space-y-2">
        <input v-model.trim="author" type="text" placeholder="Your name"
               class="w-full rounded-lg px-2.5 py-1.5 bg-white/60 ring-1 ring-white/40"/>
        <textarea v-model.trim="text" rows="3" placeholder="Write a comment…" maxlength="800"
                  class="w-full rounded-lg px-2.5 py-1.5 bg-white/60 ring-1 ring-white/40"></textarea>
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <input v-model.trim="imageUrl" type="url" inputmode="url" placeholder="Image URL (https://...)"
                 class="w-full rounded-lg px-2.5 py-1.5 bg-white/60 ring-1 ring-white/40"/>
          <button class="h-9 px-4 rounded-lg font-semibold text-white bg-black/80 hover:bg-black disabled:opacity-50"
                  :disabled="!text">Submit</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/news'

const route = useRoute()
const store = useNewsStore()
const idNum = computed(() => Number(route.params.id))

onMounted(() => { if (store.ensureLoaded) store.ensureLoaded() })

/* votes */
const votes = computed(() => store.getVotesByNews(idNum.value))
const totalVotes = computed(() => (votes.value.fake || 0) + (votes.value.not_fake || 0))
const twoPct = computed(() => {
  const F = Number(votes.value.fake || 0)
  const N = Number(votes.value.not_fake || 0)
  const T = F + N
  if (!T) return { fake: 50, not_fake: 50 }
  const fake = (F * 100) / T
  return { fake, not_fake: 100 - fake }
})
const eff = computed(() => store.getEffectiveStatusById(idNum.value))
const statusLabel = computed(() => {
  if (eff.value === 'fake') return 'FAKE'
  if (eff.value === 'not_fake' || eff.value === 'fact') return 'FACT'
  return 'UNCLEAR'
})
const statusTintClass = computed(() => {
  switch (eff.value) {
    case 'fake': return 'text-red-700 bg-red-100/90'
    case 'not_fake':
    case 'fact': return 'text-emerald-700 bg-emerald-100/90'
    default: return 'text-amber-700 bg-amber-100/90'
  }
})

/* vote actions */
const flash = ref('')
const voteSuccess = ref('')
const myVote = computed(() => (store.getMyVote ? store.getMyVote(idNum.value) : ''))
const myVoteLabel = computed(() =>
  myVote.value ? (myVote.value === 'not_fake' ? 'FACT' : myVote.value.toUpperCase()) : ''
)
function vote(kind) {
  const ok = store.addVote(idNum.value, kind)
  flash.value = ok ? `Counted as ${kind === 'not_fake' ? 'FACT' : kind.toUpperCase()}.` : 'No change (same choice).'
  setTimeout(() => (flash.value = ''), 1000)
  if (ok) {
    voteSuccess.value = `You voted ${kind === 'not_fake' ? 'FACT' : kind.toUpperCase()}!`
    setTimeout(() => (voteSuccess.value = ''), 1000)
  }
}

/* comments */
const author = ref('')
const text = ref('')
const imageUrl = ref('')
const commentSuccess = ref('')
function submitComment() {
  const body = text.value.trim()
  if (!body) return
  const url = imageUrl.value.trim()
  if (url && !/^https?:\/\//i.test(url)) { alert('Image URL must start with http(s)://'); return }
  store.addComment(idNum.value, { author: author.value, text: body, imageUrl: url })
  author.value = ''
  text.value = ''
  imageUrl.value = ''
  commentSuccess.value = 'Comment submitted successfully!'
  setTimeout(() => (commentSuccess.value = ''), 1000)
}
</script>
