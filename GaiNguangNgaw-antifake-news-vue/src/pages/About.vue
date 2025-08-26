<script setup>
import {
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CloudIcon,
  CpuChipIcon,
  EnvelopeIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Credibility Verification',
    desc: 'Show votes, evidence, and references transparently to help users decide faster',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Quality Comments',
    desc: 'Attach evidence links/images and encourage polite discussion to reduce misinformation',
  },
  {
    icon: BoltIcon,
    title: 'High Performance',
    desc: 'Fast load, clean code, easy maintenance',
  },
]

const stack = [
  'Vue 3', 'Vite', 'Pinia', 'Vue Router',
  'Tailwind CSS', 'Heroicons', 'Unsplash (Public images)', 'JSON (db.json)'
]

const team = [
  {
    name: '662115024 Teerada Bun-in',
    role: 'UX/UI Design & Frontend',
    avatar: '/image/S__26550288.jpg'
  },
  {
    name: '662115033 Plean Somjit',
    role: 'Research & Backend',
    avatar: '/image/S__26550283_0.jpg',
  },
  {
    name: '662115045 Varintorn Singhawattananurak',
    role: 'Data & Backend',
    avatar: '/image/S__26550285_0.jpg',
  },
]
</script>

<template>
  <main class="mx-auto max-w-6xl p-4 md:p-6">

    <!-- HERO (Liquid Glass + Gradient) -->
    <section class="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8
            bg-gradient-to-br from-[#ffe7d7] via-white to-[#e7f7f3]
            ring-1 ring-white/40 backdrop-blur-2xl
            shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_20px_60px_rgba(0,0,0,0.15)]">

      <!-- ambient glow / reflections -->
      <span class="pointer-events-none absolute inset-0">
        <span
          class="absolute -inset-10 bg-gradient-to-br from-orange-200/30 via-white/20 to-teal-200/30 blur-3xl"></span>
        <span class="absolute inset-x-6 -top-10 h-28 rounded-full bg-white/40 blur-2xl"></span>
        <span class="absolute inset-x-8 -bottom-12 h-28 rounded-full bg-black/10 blur-2xl"></span>
      </span>

      <div class="relative">
        <span class="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full
                bg-white/40 backdrop-blur ring-1 ring-white/50
                shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <SparklesIcon class="w-4 h-4 text-[#ea7139]" />
          About the Project
        </span>

        <h1 class="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          GaiNguangNgaw — Social Anti-Fake News System
        </h1>
        <p class="mt-3 text-gray-700 max-w-2xl">
          A platform where users can participate in verifying the credibility of news by voting whether it is fake or
          not,
          and by providing comments with supporting evidence.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <!-- Primary button (Orange liquid glass) -->
          <a href="https://www.youtube.com/watch?v=xxxxxxx"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold
            bg-[#ea7139]/80 backdrop-blur-md ring-1 ring-white/40 text-white
            shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.12)]
            transition hover:bg-[#ea7139]/90 hover:scale-[1.03] active:scale-100">
            watch our intro video
          </a>


          <!-- Secondary button (White liquid glass) -->
          <a href="https://github.com/chartchai-class/project-01-the-anti-fake-news-system-gai-nguang-ngaw"
            target="_blank" class="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold
                  bg-white/30 backdrop-blur-md ring-1 ring-white/50 text-gray-800
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.1)]
                  transition hover:bg-white/40 hover:scale-[1.03] active:scale-100">
            View Source Code
          </a>
        </div>
      </div>
    </section>

    <!-- GRID: VISION (liquid glass) -->
    <section class="grid gap-6 md:grid-cols-3 mb-8">
      <div class="md:col-span-3 relative rounded-2xl p-6
           bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
           shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_14px_44px_rgba(0,0,0,0.14)]
           transition-all duration-300 ease-out
           hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(0,0,0,0.25)]">
        <span class="pointer-events-none absolute inset-0">
          <span class="absolute inset-x-5 -top-10 h-24 rounded-full bg-white/25 blur-2xl"></span>
          <span class="absolute inset-x-6 -bottom-10 h-24 rounded-full bg-black/10 blur-2xl"></span>
        </span>
        <div class="relative">
          <h2 class="text-xl font-bold">Vision</h2>
          <p class="mt-2 text-gray-700 leading-7">
            Reduce the spread of misinformation with a simple user experience.
            Empower everyone to verify news with clear references/evidence
            and instantly updated status values.
          </p>
        </div>
      </div>
    </section>



    <!-- TECH STACK (glass chips, hover) -->
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-3">Tech Stack</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="s in stack" :key="s" class="px-3 py-1 rounded-full text-sm
             bg-white/25 backdrop-blur ring-1 ring-white/40 text-gray-800
             shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
             transition-all duration-300 ease-out
             hover:bg-white/40 hover:scale-[1.05] hover:font-semibold">
          {{ s }}
        </span>
      </div>
    </section>


    <!-- TEAM (liquid glass) -->
    <section class="mb-10">
      <div class="flex items-center gap-2">
        <UsersIcon class="w-5 h-5 text-[#ea7139]" />
        <h2 class="text-xl font-bold">Development Team</h2>
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="m in team" :key="m.name" class="relative rounded-2xl p-4 flex items-center gap-3
                bg-white/15 backdrop-blur-2xl ring-1 ring-white/35
                shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_12px_38px_rgba(0,0,0,0.14)]
                transition-all duration-300 ease-out
                hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-[0_12px_38px_rgba(0,0,0,0.25)]">
          <span class="pointer-events-none absolute inset-0">
            <span class="absolute inset-x-4 -top-10 h-24 rounded-full bg-white/25 blur-2xl"></span>
            <span class="absolute inset-x-5 -bottom-10 h-24 rounded-full bg-black/10 blur-2xl"></span>
          </span>
          <div class="relative flex items-center gap-3">
            <img :src="m.avatar" alt=""
              class="w-12 h-12 rounded-full object-cover ring-1 ring-white/50 bg-white/40 backdrop-blur" />
            <div>
              <div class="font-semibold">{{ m.name }}</div>
              <div class="text-sm text-gray-600">{{ m.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>


  </main>
</template>
