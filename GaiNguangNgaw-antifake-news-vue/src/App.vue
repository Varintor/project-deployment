<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import { HomeIcon, InformationCircleIcon  } from '@heroicons/vue/24/outline'

const store = useNewsStore()
const { page, pageSize } = storeToRefs(store)

const homeTo = computed(() => ({
  name: 'home',
  query: {
    page: '1',
    size: String(pageSize.value || 10),
    filter: 'all',
  },
}))
</script>


<template>
  <div>
    <header class="bg-[#fff5ec]/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link :to="homeTo" 
        class="relative z-10 block"
>
  <div class="flex items-center space-x-2 font-bold text-xl font-mystery">
    <img src="/logo.png" alt="logo" class="w-20 h-20 -mt-2 -mb-2" />
    <span class="text-[#b63f2f]">GNN Anti-Fake News</span>
  </div>
</router-link>


        <nav class="flex text-sm text-[#b63f2f]">
  <!-- Home -->
  <router-link
    :to="homeTo"
    class="group relative inline-flex items-center h-9 rounded-full mr-2 px-3
           text-sm text-[#b63f2f] transition-all duration-500 ease-out transform-gpu
           hover:bg-white/25 hover:backdrop-blur-2xl hover:backdrop-saturate-150
           hover:ring-1 hover:ring-white/50
           hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_30px_rgba(0,0,0,0.18)]
           focus-visible:bg-white/25 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150
           focus-visible:ring-1 focus-visible:ring-white/50
           will-change-[transform,opacity]"
  >
    <!-- ชั้นสะท้อน/เงา + เส้น sheen เฉียง -->
    <span class="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
      <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/30 blur-lg
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-100 group-focus-visible:opacity-100"></span>
      <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/10 blur-md
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-100 group-focus-visible:opacity-100"></span>
      <span class="absolute -inset-y-4 -inset-x-1 rounded-full
                   bg-gradient-to-b from-white/50 via-white/10 to-transparent
                   rotate-[-25deg] translate-x-6
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-70 group-focus-visible:opacity-70"></span>
    </span>

    <HomeIcon
      class="w-5 h-5 transition-transform duration-500 ease-out transform-gpu
             group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5" />

    <span
      class="ml-2 whitespace-nowrap overflow-hidden
             max-w-0 opacity-0 translate-x-1
             transition-[max-width,opacity,transform] duration-500 ease-out
             group-hover:max-w-[6rem] group-hover:opacity-100 group-hover:translate-x-0
             group-focus-visible:max-w-[6rem] group-focus-visible:opacity-100 group-focus-visible:translate-x-0">
      Home
    </span>
  </router-link>

  <!-- About -->
  <router-link
    to="/about"
    class="group relative inline-flex items-center h-9 rounded-full px-3
           text-sm text-[#b63f2f] transition-all duration-500 ease-out transform-gpu
           hover:bg-white/25 hover:backdrop-blur-2xl hover:backdrop-saturate-150
           hover:ring-1 hover:ring-white/50
           hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_30px_rgba(0,0,0,0.18)]
           focus-visible:bg-white/25 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150
           focus-visible:ring-1 focus-visible:ring-white/50
           will-change-[transform,opacity]"
  >
    <span class="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
      <span class="absolute inset-x-2 top-0 h-1/2 rounded-full bg-white/30 blur-lg
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-100 group-focus-visible:opacity-100"></span>
      <span class="absolute inset-x-3 bottom-0 h-1/2 rounded-full bg-black/10 blur-md
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-100 group-focus-visible:opacity-100"></span>
      <span class="absolute -inset-y-4 -inset-x-1 rounded-full
                   bg-gradient-to-b from-white/50 via-white/10 to-transparent
                   rotate-[-25deg] translate-x-6
                   opacity-0 transition-opacity duration-500
                   group-hover:opacity-70 group-focus-visible:opacity-70"></span>
    </span>

    <InformationCircleIcon
      class="w-5 h-5 transition-transform duration-500 ease-out transform-gpu
             group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5" />

    <span
      class="ml-2 whitespace-nowrap overflow-hidden
             max-w-0 opacity-0 translate-x-1
             transition-[max-width,opacity,transform] duration-500 ease-out
             group-hover:max-w-[6rem] group-hover:opacity-100 group-hover:translate-x-0
             group-focus-visible:max-w-[6rem] group-focus-visible:opacity-100 group-focus-visible:translate-x-0">
      About
    </span>
  </router-link>
</nav>


      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <footer class="text-center py-8 text-xs text-gray-500">
      <p>GaiNguangNgaw Anti-Fake News</p>
    </footer>
  </div>
</template>