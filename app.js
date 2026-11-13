import { firebaseConfig } from "./firebase-config.js";

if (!window.UI || !window.CORE_DATA || !window.BOOSTER_DATA) {
  document.getElementById("root").innerHTML = `<div style="padding:20px;color:red;font-weight:bold;">Check that ui.js, core-data.js, and booster-data.js are saved properly!</div>`;
} else {
  window.UI.renderShell();
}

const SYLLABUS = { ...window.CORE_DATA, ...window.BOOSTER_DATA.syllabus };
const STEPS = window.BOOSTER_DATA.stepsMeta;
let db = null, fsMod = null, currentUser = "", activeSub = "Mathematics", state = { checks: {}, notes: {} }, sec = 1500, tInt = null;

async function initFirebase() {
  try {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE") {
      const base = "https://gstatic.com";
      const appMod = await import(base + "firebase-app.js");
      fsMod = await import(base + "firebase-firestore.js");
      db = fsMod.getFirestore(appMod.initializeApp(firebaseConfig));
      if (currentUser) listenCloud();
    }
  } catch (err) {
    console.error("Firebase load error:", err);
  }
}

async function save() {
  localStorage.setItem(`cbse_${currentUser}`, JSON.stringify(state));
  if (db && fsMod && currentUser) {
    await fsMod.setDoc(fsMod.doc(db, "trackers", currentUser.toLowerCase()), state, { merge: true });
    document.getElementById("syncStatus").textContent = "Cloud Synced";
    document.getElementById("syncStatus").className = "text-xs font-semibold text-emerald-600 ml-2";
  }
}

function listenCloud() {
  if (!db || !fsMod || !currentUser) return;
  fsMod.onSnapshot(fsMod.doc(db, "trackers", currentUser.toLowerCase()), snap => {
    if (snap.exists()) {
      state = { checks: snap.data().checks || {}, notes: snap.data().notes || {} };
      localStorage.setItem(`cbse_${currentUser}`, JSON.stringify(state));
      render();
      document.getElementById("syncStatus").textContent = "Live Cloud Synced";
      document.getElementById("syncStatus").className = "text-xs font-semibold text-emerald-600 ml-2";
    } else {
      save();
    }
  });
}

function render() {
  document.getElementById("subjectTabs").innerHTML = Object.keys(SYLLABUS).map(s =>
    `<button data-s="${s}" class="tab px-3 py-1.5 rounded-xl text-xs font-bold border ${s === activeSub ? "bg-slate-900 text-white" : "bg-white"}">${s}</button>`
  ).join("");
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => { activeSub = b.dataset.s; render(); });

  let banked = 0, overdue = [], today = new Date().toISOString().split("T")[0];
  ["Mathematics", "Science", "Social Science"].forEach(s => SYLLABUS[s].forEach(c => {
    const done = STEPS.filter(st => state.checks[`${c.id}_${st.key}`]).length;
    banked += c.marks * (done / 5);
    if (done < 5 && c.deadline < today) overdue.push({ s, ...c, done });
  }));
  document.getElementById("totalBanked").textContent = Math.round(banked);
  document.getElementById("totalProgressBar").style.width = `${Math.min(100, Math.round((banked / 240) * 100))}%`;

  const bSec = document.getElementById("backlogSection");
  if (overdue.length) {
    bSec.classList.remove("hidden");
    document.getElementById("backlogCount").textContent = overdue.length;
    document.getElementById("backlogList").innerHTML = overdue.map(i => `<div data-s="${i.s}" class="b-card cursor-pointer bg-white p-2 rounded-lg border text-xs font-bold">${i.s}: ${i.name} (${i.done}/5)</div>`).join("");
    document.querySelectorAll(".b-card").forEach(c => c.onclick = () => { activeSub = c.dataset.s; render(); });
  } else bSec.classList.add("hidden");

  document.getElementById("chaptersContainer").innerHTML = SYLLABUS[activeSub].map(c => {
    const done = STEPS.filter(st => state.checks[`${c.id}_${st.key}`]).length;
    return `<div class="bg-white p-4 rounded-2xl border space-y-3">
      <div class="flex justify-between items-center"><span class="text-xs font-bold text-indigo-600">${c.unit} • +${c.marks}M • Due ${c.deadline}</span><span class="text-xs font-bold">${done}/5</span></div>
      <h3 class="font-extrabold text-base">${c.name}</h3>
      <div class="grid md:grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-50 p-2.5 rounded-xl"><b>Topics:</b> ${c.topics.join(" | ")}</div>
        <div class="bg-indigo-50 p-2.5 rounded-xl"><b>Cheat Sheet:</b> ${c.notes}</div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">${STEPS.map(st => {
        const chk = !!state.checks[`${c.id}_${st.key}`];
        return `<div data-k="${c.id}_${st.key}" class="chk cursor-pointer p-2 rounded-xl border text-xs ${chk ? "bg-emerald-600 text-white" : "bg-white"}"><b>${st.label}</b><div class="text-[11px] opacity-80">${st.desc}</div></div>`;
      }).join("")}</div>
      <input data-n="${c.id}" value="${(state.notes[c.id] || "").replace(/"/g, "&quot;")}" placeholder="Red-pen mistake / Insta reel note..." class="note w-full text-xs bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5" />
    </div>`;
  }).join("");

  document.querySelectorAll(".chk").forEach(el => el.onclick = () => { state.checks[el.dataset.k] = !state.checks[el.dataset.k]; save(); render(); });
  document.querySelectorAll(".note").forEach(el => el.onchange = () => { state.notes[el.dataset.n] = el.value; save(); });
}

function login(u, p) {
  currentUser = `${u}_${p}`;
  document.getElementById("displayUser").textContent = u;
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");
  const loc = localStorage.getItem(`cbse_${currentUser}`);
  if (loc) state = JSON.parse(loc);
  listenCloud();
  render();
}

document.getElementById("dailyQuote").textContent = window.BOOSTER_DATA.quotes[new Date().getDate() % 4];
document.getElementById("portalsContainer").innerHTML = window.BOOSTER_DATA.portals.map(p => `<a href="${p.url}" target="_blank" class="${p.cls} font-semibold px-2.5 py-1 rounded border">${p.label}</a>`).join("");
const now = new Date(); now.setHours(0,0,0,0);
document.getElementById("pbCountdown").textContent = Math.max(0, Math.ceil((new Date("2027-01-04") - now) / 86400000)) + "d";
document.getElementById("boardCountdown").textContent = Math.max(0, Math.ceil((new Date("2027-02-16") - now) / 86400000)) + "d";
document.getElementById("loginBtn").onclick = () => { const u = document.getElementById("loginUser").value.trim(), p = document.getElementById("loginPass").value.trim(); if (u && p) { localStorage.setItem("cbse_sess", JSON.stringify({ u, p })); login(u, p); } };
document.getElementById("logoutBtn").onclick = () => { localStorage.removeItem("cbse_sess"); location.reload(); };
document.getElementById("timerBtn").onclick = () => { if (tInt) { clearInterval(tInt); tInt = null; } else tInt = setInterval(() => { if (--sec <= 0) { clearInterval(tInt); alert("Sprint Done!"); } document.getElementById("timerDisplay").textContent = `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`; }, 1000); };
document.getElementById("resetTimerBtn").onclick = () => { clearInterval(tInt); tInt = null; sec = 1500; document.getElementById("timerDisplay").textContent = "25:00"; };
const s = localStorage.getItem("cbse_sess"); if (s) { const { u, p } = JSON.parse(s); login(u, p); }
initFirebase();
