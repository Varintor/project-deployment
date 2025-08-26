// src/stores/news.js
import { defineStore } from "pinia";

/* helper สำหรับ normalize รูป Unsplash */
function normalizeImageUrl(url = "", { w = 1200, q = 60 } = {}) {
  if (!url) return "";
  try {
    const u = new URL(url, location.origin);
    if (u.protocol !== "https:") u.protocol = "https:";
    if (u.hostname.includes("images.unsplash.com")) {
      if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
      if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
      if (!u.searchParams.has("w")) u.searchParams.set("w", String(w));
      if (!u.searchParams.has("q")) u.searchParams.set("q", String(q));
    }
    return u.toString();
  } catch {
    return url;
  }
}

export const useNewsStore = defineStore("news", {
  state: () => ({
    items: [],
    comments: [],
    // votes: { [newsId]: { fake: number, not_fake: number, unclear: number } }
    votes: {},
    // userVotes: { [newsId]: 'fake' | 'not_fake' | 'unclear' }
    userVotes: {},
    filter: "all",   // 'all' | 'fake' | 'not_fake' | 'unclear'
    pageSize: 10,
    page: 1,
    loading: false,
    keyword: "",
    _loaded: false,
    _loadPromise: null,
  }),

  getters: {
    // สถานะจากคะแนนโหวต: ผู้ชนะ (เสมอ -> 'unclear')
    getEffectiveStatusById: (state) => (id) => {
      const nid = Number(id);
      const v = state.votes[nid] || { fake: 0, not_fake: 0, unclear: 0 };
      const total = (v.fake || 0) + (v.not_fake || 0) + (v.unclear || 0);
      if (total === 0) {
        return state.items.find((n) => n.id === nid)?.status || "not_fake";
      }
      const max = Math.max(v.fake || 0, v.not_fake || 0, v.unclear || 0);
      const winners = ["fake", "not_fake", "unclear"].filter((k) => (v[k] || 0) === max);
      return winners.length === 1 ? winners[0] : "unclear";
    },

    filteredItems(state) {
      let arr = state.items.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      if (state.filter !== "all") {
        arr = arr.filter((n) => {
          const v = state.votes[n.id];
          const eff = v
            ? (() => {
                const fake = v.fake || 0, nf = v.not_fake || 0, un = v.unclear || 0;
                const max = Math.max(fake, nf, un);
                const winners = [
                  ...(fake === max ? ["fake"] : []),
                  ...(nf === max ? ["not_fake"] : []),
                  ...(un === max ? ["unclear"] : []),
                ];
                return winners.length === 1 ? winners[0] : "unclear";
              })()
            : n.status;
          return eff === state.filter;
        });
      }

      if (state.keyword.trim()) {
        const k = state.keyword.trim().toLowerCase();
        arr = arr.filter(
          (n) =>
            n.title.toLowerCase().includes(k) ||
            n.summary.toLowerCase().includes(k) ||
            n.reporter.toLowerCase().includes(k)
        );
      }
      return arr;
    },

    totalPages(state) {
      return Math.max(1, Math.ceil(this.filteredItems.length / state.pageSize));
    },

    currentItems(state) {
      const start = (state.page - 1) * state.pageSize;
      return this.filteredItems.slice(start, start + state.pageSize);
    },

    getById: (state) => (id) => state.items.find((n) => n.id === Number(id)),

    getCommentsByNews: (state) => (newsId) =>
      state.comments
        .filter((c) => c.newsId === Number(newsId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

    getVotesByNews: (state) => (newsId) =>
      state.votes[Number(newsId)] || { fake: 0, not_fake: 0, unclear: 0 },
  },

  actions: {
    loadUserVotes() {
      this.userVotes = {};
    },
    saveUserVotes() {},
    hasVoted(newsId) {
      return !!this.userVotes[Number(newsId)];
    },
    getMyVote(newsId) {
      return this.userVotes[Number(newsId)] || "";
    },

    async ensureLoaded() {
      return this.load();
    },

    async load() {
      if (this._loaded) return;
      if (this._loadPromise) return this._loadPromise;

      this._loadPromise = (async () => {
        this.loading = true;
        try {
          this.loadUserVotes();

          // ✅ โหลด db.json (รองรับทั้งรูปแบบ {news, votes} และแบบอาร์เรย์)
          const url = new URL(import.meta.env.BASE_URL + "db.json", location).toString();
          const resp = await fetch(url);
          if (!resp.ok) throw new Error("Failed to load db.json");
          const data = await resp.json();

          const items = [];
          const comments = [];

          // กรณี 1: { news: [...], votes: {...} }
          if (data && Array.isArray(data.news)) {
            for (const r of data.news) {
              items.push({
                id: r.id,
                title: r.title,
                summary: r.summary,
                body: r.summary,
                content: r.content || [],
                sources: r.sources || [],
                references: r.references || r.sources || [],
                status: r.status || "not_fake",
                reporter: r.reporter || "Source",
                createdAt: r.createdAt || new Date().toISOString(),
                imageUrl: normalizeImageUrl(r.imageUrl || "", { w: 1200, q: 60 }),
              });

              if (r.comments && Array.isArray(r.comments)) {
                for (const c of r.comments) {
                  comments.push({
                    id: c.id || `${r.id}-c-${Date.now()}`,
                    newsId: r.id,
                    author: c.author || "Anonymous",
                    text: c.text || "",
                    createdAt: c.createdAt || new Date().toISOString(),
                    imageUrl: normalizeImageUrl(c.imageUrl || "", { w: 800, q: 60 }),
                    likes: c.likes || 0,
                    editable: false,
                  });
                }
              }
            }

            // votes
            if (data.votes && typeof data.votes === "object") {
              Object.keys(data.votes).forEach((nid) => {
                const id = Number(nid);
                const v = data.votes[nid] || {};
                this.votes[id] = {
                  fake: Number(v.fake || 0),
                  not_fake: Number(v.not_fake || 0),
                  unclear: Number(v.unclear || 0),
                };
              });
            } else {
              // ถ้าไม่เจอ votes ในไฟล์ → เซ็ตเป็น 0 ทั้งหมด
              items.forEach((n) => {
                if (!this.votes[n.id]) {
                  this.votes[n.id] = { fake: 0, not_fake: 0, unclear: 0 };
                }
              });
            }
          }
          // กรณี 2: เป็นอาร์เรย์ข่าวตรง ๆ (แบบที่คุณใช้อยู่)
          else if (Array.isArray(data)) {
            for (const r of data) {
              items.push({
                id: r.id,
                title: r.title,
                summary: r.summary,
                body: r.summary,
                content: r.content || [],
                sources: r.sources || [],
                references: r.references || r.sources || [],
                status: r.status || "not_fake",
                reporter: r.reporter || "Source",
                createdAt: r.createdAt || new Date().toISOString(),
                imageUrl: normalizeImageUrl(r.imageUrl || "", { w: 1200, q: 60 }),
              });

              if (r.comments && Array.isArray(r.comments)) {
                for (const c of r.comments) {
                  comments.push({
                    id: c.id || `${r.id}-c-${Date.now()}`,
                    newsId: r.id,
                    author: c.author || "Anonymous",
                    text: c.text || "",
                    createdAt: c.createdAt || new Date().toISOString(),
                    imageUrl: normalizeImageUrl(c.imageUrl || "", { w: 800, q: 60 }),
                    likes: c.likes || 0,
                    editable: false,
                  });
                }
              }

              // ไม่มีส่วน votes แยก → ตั้งค่าเริ่มต้น 0
              if (!this.votes[r.id]) {
                this.votes[r.id] = { fake: 0, not_fake: 0, unclear: 0 };
              }
            }
          } else {
            throw new Error("db.json format not recognized");
          }

          this.items = items;
          this.comments = comments;
          this._loaded = true;
        } catch (e) {
          console.error("news.load failed:", e);
          throw e;
        } finally {
          this.loading = false;
        }
      })();

      try {
        await this._loadPromise;
      } finally {
        this._loadPromise = null;
      }
    },

    setFilter(f) {
      this.filter = f; // 'all' | 'fake' | 'not_fake' | 'unclear'
      this.page = 1;
    },
    setPageSize(n) {
      this.pageSize = Number(n);
      this.page = 1;
    },
    setPage(p) {
      this.page = Math.min(Math.max(1, p), this.totalPages);
    },
    setKeyword(k) {
      this.keyword = k;
      this.page = 1;
    },

    // โหวต: รองรับ 'fake' | 'not_fake' | 'unclear'
    addVote(newsId, kind) {
      const id = Number(newsId);

      // รองรับ boolean เก่า (true=fake, false=not_fake)
      let vote = kind;
      if (typeof kind === "boolean") vote = kind ? "fake" : "not_fake";

      if (!["fake", "not_fake", "unclear"].includes(vote)) return false;

      if (!this.votes[id]) this.votes[id] = { fake: 0, not_fake: 0, unclear: 0 };

      const prev = this.userVotes[id];
      if (prev === vote) return false; // โหวตซ้ำค่าเดิม ไม่เพิ่มแต้ม

      // ถอนแต้มเดิมถ้ามี (เพื่อให้เปลี่ยนใจได้)
      if (prev) this.votes[id][prev] = Math.max(0, (this.votes[id][prev] || 0) - 1);

      // เพิ่มแต้มใหม่
      this.votes[id][vote] = (this.votes[id][vote] || 0) + 1;

      // จำโหวตของผู้ใช้เฉพาะ session
      this.userVotes[id] = vote;
      return true;
    },

    addComment(newsId, payload) {
      const id = Number(newsId);
      const createdAt = new Date().toISOString();
      this.comments.unshift({
        id: `${id}-u-${Date.now()}`,
        newsId: id,
        author: (payload.author || "Anonymous").trim(),
        text: (payload.text || "").trim(),
        imageUrl: (payload.imageUrl || "").trim(),
        createdAt,
        likes: 0,
        editable: true,
      });
    },

    editComment(commentId, text, imageUrl) {
      const c = this.comments.find((c) => c.id === commentId);
      if (c && c.editable) {
        c.text = (text || "").trim();
        c.imageUrl = (imageUrl || "").trim();
      }
    },

    deleteComment(commentId) {
      const idx = this.comments.findIndex((c) => c.id === commentId);
      if (idx >= 0 && this.comments[idx].editable) this.comments.splice(idx, 1);
    },

    likeComment(commentId) {
      const c = this.comments.find((c) => c.id === commentId);
      if (c) c.likes++;
    },
  },
});
