// Shared content for all three directions — single source of truth.
// Kid voice: short, lowercase, deadpan-funny, no buzzwords.

const KHALIL = {
  name: "khalil",
  age: 10,
  handle: "@khalilgaming2020",
  subs: { current: 744, goal: 1000 },

  // Per-mode hero copy. Toggle swaps these in.
  modes: {
    gaming: {
      tagline: "streamer · gamer · 100% goat",
      bio: "fortnite mostly. roblox glitch hunter. brawl stars trio till the wheels fall off. i post the clips that make my friends scream.",
      cta: "▶ subscribe",
      vibe: "loadout ready",
    },
    football: {
      tagline: "striker · madridista · forever 7",
      bio: "real madrid till i die. hat-tricks at recess. i'm ronaldo when i grow up. (or maybe vini. but probably ronaldo.)",
      cta: "▶ subscribe",
      vibe: "boots laced",
    },
  },

  // Video library — five real-sounding kid-grammar titles.
  videos: [
    { id: "v1", title: "i won a 1v1 vs my dad (he was actually trying)", views: "2.1K", ago: "3 days ago", duration: "8:42", tag: "fortnite", thumb: { from: "#5b3aa6", to: "#1a0a3a", emoji: "🎮" } },
    { id: "v2", title: "ranking every brawler from worst to BROKEN",       views: "1.4K", ago: "1 week ago", duration: "12:08", tag: "brawl stars", thumb: { from: "#d97757", to: "#7a2e1a", emoji: "⭐" } },
    { id: "v3", title: "i found the WEIRDEST glitch in roblox",            views: "894",  ago: "2 weeks ago", duration: "6:15", tag: "roblox", thumb: { from: "#2a7d4f", to: "#0e3a1f", emoji: "🟩" } },
    { id: "v4", title: "every real madrid goal i scored at recess (real)", views: "3.2K", ago: "1 month ago", duration: "4:50", tag: "football", thumb: { from: "#1a3a8a", to: "#000d33", emoji: "⚽" } },
    { id: "v5", title: "trying to break 1000 subs — read my book if i cry", views: "560", ago: "1 month ago", duration: "9:30", tag: "vlog", thumb: { from: "#b8527a", to: "#3a0a1f", emoji: "🐐" } },
  ],

  now: {
    gaming:   { playing: "Fortnite — Zero Build", watching: "MrBeast challenges", reading: "Diary of a Wimpy Kid #18", listening: "Bad Bunny" },
    football: { playing: "FC 25 Career Mode", watching: "Champions League highlights", reading: "Pelé: My Life", listening: "FIFA soundtrack 2002" },
  },

  book: {
    title: "The Goat Chronicles",
    subtitle: "stories my grandma started and i'm finishing",
    chapter: "ch. 4 of 12",
    status: "first copies dropping soon",
  },

  about: [
    "yo. i'm khalil. i'm 10.",
    "i play fortnite, roblox, and brawl stars, and i post the clips that make my friends scream. when i'm not gaming i'm chasing a football around — biggest real madrid fan you'll ever meet, and yeah i'm definitely ronaldo when i grow up.",
    "writing a book with my grandma. trying to hit 1k subs. if you read this far you're a real one.",
  ],
};

window.KHALIL = KHALIL;
