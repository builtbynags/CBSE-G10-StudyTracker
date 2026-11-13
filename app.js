import { firebaseConfig } from "./firebase-config.js";

window.UI.renderShell();
const SYLLABUS = { ...window.CORE_DATA, ...window.BOOSTER_DATA.syllabus };
const PORTALS = window.BOOSTER_DATA.portals;

const STEP_DEFS = [
  { key: "s1", title: "Step 1: NCERT Concepts & Solved Examples", builtin: true },
  { key: "s2", title: "Step 2: NCERT Exemplar", portalIdx: 0 },
  { key: "s3", title: "Step 3: CFPQ (Competency Questions)", portalIdx: 2 },
  { key: "s4", title: "Step 4: PYQs (Past Year Questions)", portalIdx: 1 },
  { key: "s5", title: "Step 5: Sample Papers & Revision", portalIdx: 3 }
];

let db = null, fsMod = null, currentUser = "", activeTab = "planner", filterMode = "all";
let activeSub = "Mathematics", activeChapId = "m13";
let state = { checks: {}, subNotes: {}, stepNotes: {} }, sec = 1500, tInt = null;

async function initFirebase() {
  try {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE") {
      const base = "https://" + "www.gstatic" + ".com/firebasejs/10.12.2/";
      const appMod = await import(base + "firebase-app.js");
      fsMod = await import(base + "firebase-firestore.js");
      db = fsMod.getFirestore(appMod.initializeApp(firebaseConfig));
      if (currentUser) listenCloud();
    }
  } catch (err) { console.error(err); }
}

async function save() {
  localStorage.setItem(`cbse_${currentUser}`, JSON.stringify(state));
  if (db && fsMod && currentUser) {
    await fsMod.setDoc(fsMod.doc(db, "trackers", currentUser.toLowerCase()), state, { merge: true });
    document.getElementById("syncStatus").textContent = "Cloud Synced";
  }
}

function listenCloud() {
  if (!db || !fsMod || !currentUser) return;
  fsMod.onSnapshot(fsMod.doc(db, "trackers", currentUser.toLowerCase()), snap => {
    if (snap.exists()) {
      const d = snap.data();
      state = { checks: d.checks || {}, subNotes: d.subNotes || {}, stepNotes: d.stepNotes || {} };
      localStorage.setItem(`cbse_${currentUser}`, JSON.stringify(state));
      render();
      document.getElementById("syncStatus").textContent = "Live Cloud Synced";
    } else save();
  });
}

function formatStickyText(txt) {
  const esc = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">Open Resource Link ↗</a>');
}

function render() {
  renderSubjectStrip();
  renderPlannerTable();
  renderPrepGuide();
}

function renderSubjectStrip() {
  document.getElementById("subjectStrip").innerHTML = Object.keys(SYLLABUS).map(sub => {
    const chaps = SYLLABUS[sub];
    const totalSteps = chaps.length * 5;
    let doneSteps = 0, doneChaps = 0;
    chaps.forEach(c => {
      const cnt = STEP_DEFS.filter(st => state.checks[`${c.id}_${st.key}`]).length;
      doneSteps += cnt;
      if (cnt === 5) doneChaps++;
    });
    const pct = Math.round((doneSteps / totalSteps) * 100);
    return `<div data-s="${sub}" class="strip-card">
      <div class="strip-top"><span>${sub}</span><span class="strip-pct">${pct}%</span></div>
      <div class="strip-sub">${doneChaps}/${chaps.length} Chapters Done</div>
      <div class="strip-bar"><div class="strip-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");

  document.querySelectorAll(".strip-card").forEach(el => el.onclick = () => {
    activeSub = el.dataset.s;
    activeChapId = SYLLABUS[activeSub][0].id;
    switchTab("guide");
  });
}

function renderPlannerTable() {
  const today = new Date().toISOString().split("T")[0];
  let allRows = [];
  Object.keys(SYLLABUS).forEach(sub => {
    SYLLABUS[sub].forEach(c => {
      const done = STEP_DEFS.filter(st => state.checks[`${c.id}_${st.key}`]).length;
      const isCore = ["Mathematics", "Science", "Social Science"].includes(sub);
      allRows.push({ sub, isCore, ...c, done });
    });
  });

  allRows.sort((a, b) => a.deadline.localeCompare(b.deadline));
  const nextActive = allRows.find(r => r.done < 5 && r.deadline >= today);

  const filtered = allRows.filter(r => {
    if (filterMode === "urgent") return (r.done < 5 && r.deadline < today) || (nextActive && r.id === nextActive.id);
    if (filterMode === "core") return r.isCore;
    if (filterMode === "booster") return !r.isCore;
    return true;
  });

  document.getElementById("timelineBody").innerHTML = filtered.map(r => {
    const isDone = r.done === 5;
    const isOverdue = !isDone && r.deadline < today;
    const isToday = nextActive && r.id === nextActive.id;
    let rowCls = isDone ? "row-done" : isOverdue ? "row-red" : isToday ? "row-today" : "";
    let badge = isDone
      ? `<span class="badge b-done">✅ DONE</span>`
      : isOverdue
      ? `<span class="badge b-red">🔴 NOT DONE (Backlog)</span>`
      : isToday
      ? `<span class="badge b-today">🎯 DO TODAY</span>`
      : `<span class="badge b-up">⏳ UPCOMING</span>`;

    return `<tr data-sub="${r.sub}" data-id="${r.id}" class="t-row ${rowCls}">
      <td><b>${r.deadline}</b></td>
      <td>${r.sub}</td>
      <td><b>${r.name}</b></td>
      <td>${r.done}/5 Steps</td>
      <td>${badge}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll(".t-row").forEach(tr => tr.onclick = () => {
    activeSub = tr.dataset.sub;
    activeChapId = tr.dataset.id;
    switchTab("guide");
  });
}

function renderPrepGuide() {
  document.getElementById("subjectTabs").innerHTML = Object.keys(SYLLABUS).map(s =>
    `<button data-s="${s}" class="tab ${s === activeSub ? "active" : ""}">${s}</button>`
  ).join("");
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => {
    activeSub = b.dataset.s;
    activeChapId = SYLLABUS[activeSub][0].id;
    render();
  });

  // Unit Marks Table
  const unitMap = {};
  SYLLABUS[activeSub].forEach(c => { unitMap[c.unit] = (unitMap[c.unit] || 0) + c.marks; });
  document.getElementById("marksTableBody").innerHTML = Object.entries(unitMap).map(([u, m]) =>
    `<tr><td>${u}</td><td><b>${m}M</b></td></tr>`
  ).join("");

  // Subject Sticky Wall
  const sNotes = state.subNotes[activeSub] || [];
  document.getElementById("subWallGrid").innerHTML = sNotes.length
    ? sNotes.map((txt, idx) => `<div class="sticky-note"><span>${formatStickyText(txt)}</span><button data-idx="${idx}" class="del-note del-sub">×</button></div>`).join("")
    : `<span style="font-size:11px;color:#92400e;">No pinned notes yet. Paste any formula link or reel tip above!</span>`;

  document.querySelectorAll(".del-sub").forEach(btn => btn.onclick = () => {
    state.subNotes[activeSub].splice(Number(btn.dataset.idx), 1);
    save(); render();
  });

  // Vertical Chapter Tabs
  const chaps = SYLLABUS[activeSub];
  if (!chaps.some(c => c.id === activeChapId)) activeChapId = chaps[0].id;

  document.getElementById("chapterTabs").innerHTML = chaps.map(c => {
    const done = STEP_DEFS.filter(st => state.checks[`${c.id}_${st.key}`]).length;
    return `<button data-id="${c.id}" class="c-tab ${c.id === activeChapId ? "active" : ""} ${done === 5 ? "done" : ""}">
      <span>${c.name}</span><span>${done}/5</span>
    </button>`;
  }).join("");
  document.querySelectorAll(".c-tab").forEach(b => b.onclick = () => { activeChapId = b.dataset.id; render(); });

  // Active Chapter 5-Step Workspace
  const ch = chaps.find(c => c.id === activeChapId);
  const doneCount = STEP_DEFS.filter(st => state.checks[`${ch.id}_${st.key}`]).length;

  document.getElementById("activeChapterBox").innerHTML = `
    <div class="ws-head">
      <div>
        <span style="font-size:11px;font-weight:700;color:#4f46e5;">${ch.unit} • Due: ${ch.deadline}</span>
        <h2>${ch.name}</h2>
      </div>
      <span class="badge ${doneCount === 5 ? "b-done" : "b-today"}">${doneCount}/5 Steps Completed</span>
    </div>
    ${STEP_DEFS.map(st => {
      const chk = !!state.checks[`${ch.id}_${st.key}`];
      const stepKey = `${ch.id}_${st.key}`;
      const notesList = state.stepNotes[stepKey] || [];
      const portal = st.portalIdx !== undefined ? PORTALS[st.portalIdx] : null;

      return `<div class="step-section ${chk ? "step-done" : ""}">
        <div class="step-top">
          <label class="step-check">
            <input type="checkbox" data-k="${stepKey}" class="chk-inp" ${chk ? "checked" : ""} />
            <span>${st.title}</span>
          </label>
          ${portal ? `<a href="${portal.url}" target="_blank" class="portal-link">${portal.label} ↗</a>` : ""}
        </div>
        ${st.builtin ? `<div class="builtin-box"><b>⭐ High-Yield Topics:</b> ${ch.topics.join(" • ")}<br/><b>⚡ Cheat Sheet:</b> ${ch.notes}</div>` : ""}
        <div class="pin-row">
          <input type="text" id="inp_${stepKey}" placeholder="Pin link (https://...) or note specifically for ${st.title}..." />
          <button data-sk="${stepKey}" class="add-step-note">+ Pin</button>
        </div>
        <div class="sticky-grid">
          ${notesList.map((n, i) => `<div class="sticky-note"><span>${formatStickyText(n)}</span><button data-sk="${stepKey}" data-i="${i}" class="del-note del-st">×</button></div>`).join("")}
        </div>
      </div>`;
    }).join("")}
  `;

  document.querySelectorAll(".chk-inp").forEach(el => el.onchange = () => {
    state.checks[el.dataset.k] = el.checked;
    save(); render();
  });

  document.querySelectorAll(".add-step-note").forEach(btn => btn.onclick = () => {
    const sk = btn.dataset.sk;
    const val = document.getElementById(`inp_${sk}`).value.trim();
    if (!val) return;
    if (!state.stepNotes[sk]) state.stepNotes[sk] = [];
    state.stepNotes[sk].push(val);
    save(); render();
  });

  document.querySelectorAll(".del-st").forEach(btn => btn.onclick = () => {
    state.stepNotes[btn.dataset.sk].splice(Number(btn.dataset.i), 1);
    save(); render();
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById("tabPlanner").classList.toggle("active", tab === "planner");
  document.getElementById("tabGuide").classList.toggle("active", tab === "guide");
document.getElementById("viewPlanner").classList.toggle("hidden", tab !== "planner");
document.getElementById("viewGuide").classList.toggle("hidden", tab !== "guide");
}
function login(u, p) {
currentUser = u + "_" + p;
document.getElementById("displayUser").textContent = u;
document.getElementById("loginScreen").classList.add("hidden");
document.getElementById("appScreen").classList.remove("hidden");
const loc = localStorage.getItem(cbse_${currentUser});
if (loc) {
const d = JSON.parse(loc);
state = { checks: d.checks || {}, subNotes: d.subNotes || {}, stepNotes: d.stepNotes || {} };
}
listenCloud();
render();
}
document.getElementById("tabPlanner").onclick = () => switchTab("planner");
document.getElementById("tabGuide").onclick = () => switchTab("guide");
document.querySelectorAll(".f-btn").forEach(b => b.onclick = () => {
document.querySelectorAll(".f-btn").forEach(x => x.classList.remove("active"));
b.classList.add("active");
filterMode = b.dataset.f;
renderPlannerTable();
});
document.getElementById("addSubNoteBtn").onclick = () => {
const inp = document.getElementById("subNoteInput");
const val = inp.value.trim();
if (!val) return;
if (!state.subNotes[activeSub]) state.subNotes[activeSub] = [];
state.subNotes[activeSub].push(val);
inp.value = "";
save(); render();
};
document.getElementById("dailyQuote").textContent = window.BOOSTER_DATA.quotes[new Date().getDate() % 4];
const now = new Date(); now.setHours(0,0,0,0);
document.getElementById("pbCountdown").textContent = Math.max(0, Math.ceil((new Date("2027-01-04") - now) / 86400000)) + "d";
document.getElementById("boardCountdown").textContent = Math.max(0, Math.ceil((new Date("2027-02-16") - now) / 86400000)) + "d";
document.getElementById("loginBtn").onclick = () => { const u = document.getElementById("loginUser").value.trim(), p = document.getElementById("loginPass").value.trim(); if (u && p) { localStorage.setItem("cbse_sess", JSON.stringify({ u, p })); login(u, p); } };
document.getElementById("logoutBtn").onclick = () => { localStorage.removeItem("cbse_sess"); location.reload(); };
document.getElementById("timerBtn").onclick = () => { if (tInt) { clearInterval(tInt); tInt = null; document.getElementById("timerBtn").textContent = "Start"; } else { document.getElementById("timerBtn").textContent = "Pause"; tInt = setInterval(() => { if (--sec <= 0) { clearInterval(tInt); alert("Sprint Done!"); } document.getElementById("timerDisplay").textContent = ${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}; }, 1000); } };
document.getElementById("resetTimerBtn").onclick = () => { clearInterval(tInt); tInt = null; sec = 1500; document.getElementById("timerDisplay").textContent = "25:00"; document.getElementById("timerBtn").textContent = "Start"; };
const s = localStorage.getItem("cbse_sess"); if (s) { const { u, p } = JSON.parse(s); login(u, p); }
initFirebase();
