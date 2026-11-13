window.UI = {
  renderShell() {
    document.getElementById("root").innerHTML = `
      <div id="loginScreen" class="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-4">
          <h1 class="text-2xl font-extrabold text-center">Cherry's 90% Command Center</h1>
          <input id="loginUser" type="text" value="Cherry" class="w-full px-4 py-2.5 border rounded-xl font-semibold" />
          <input id="loginPass" type="password" placeholder="Enter Secret Passcode" class="w-full px-4 py-2.5 border rounded-xl" />
          <button id="loginBtn" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Open Dashboard</button>
        </div>
      </div>
      <div id="appScreen" class="hidden">
        <div class="bg-orange-500 text-white px-4 py-2 text-center text-xs sm:text-sm font-bold"><p id="dailyQuote"></p></div>
        <header class="bg-white border-b sticky top-0 z-30 p-3">
          <div class="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div>
              <h1 class="text-lg font-extrabold"><span id="displayUser">Cherry</span>'s 90% Tracker <span id="syncStatus" class="text-xs font-normal text-amber-600 ml-2">Local Mode</span></h1>
              <p class="text-xs text-slate-500">Write Physics, Chem & Bio in separate exam sections!</p>
            </div>
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg">Pre-Boards: <b id="pbCountdown">--</b></span>
              <span class="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">Boards: <b id="boardCountdown">--</b></span>
              <button id="logoutBtn" class="border px-2.5 py-1.5 rounded-lg">Switch</button>
            </div>
          </div>
        </header>
        <main class="max-w-6xl mx-auto px-4 pt-5 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-2xl border">
              <div class="text-xs font-bold text-slate-500">CORE THEORY BANKED (TARGET 210/240)</div>
              <div class="text-3xl font-extrabold mt-1"><span id="totalBanked">0</span> <span class="text-sm text-slate-400">/ 240M</span></div>
              <div class="w-full bg-slate-100 h-2 rounded-full mt-2"><div id="totalProgressBar" class="bg-emerald-500 h-2 rounded-full" style="width:0%"></div></div>
            </div>
            <div class="bg-white p-4 rounded-2xl border text-xs space-y-1">
              <div class="font-bold text-indigo-600">DAILY FLOW</div>
              <div><b>4:30-5:15 PM:</b> Core Step 1-2 (NCERT)</div>
              <div><b>5:30-6:15 PM:</b> Core Step 3-5 (PYQ/CFPQ)</div>
              <div><b>6:30-6:55 PM:</b> Eng / Jpn / AI Rotation</div>
            </div>
            <div class="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-between">
              <div class="text-xs font-bold text-amber-400">25-MIN DOPAMINE SPRINT</div>
              <div id="timerDisplay" class="text-2xl font-mono font-extrabold text-center">25:00</div>
              <div class="flex gap-2">
                <button id="timerBtn" class="flex-1 bg-amber-500 text-slate-900 font-bold py-1 rounded-lg text-xs">Start</button>
                <button id="resetTimerBtn" class="bg-slate-700 px-3 py-1 rounded-lg text-xs">Reset</button>
              </div>
            </div>
          </div>
          <div id="backlogSection" class="hidden bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
            <div class="text-sm font-extrabold text-amber-900 mb-2">Floating Backlog (<span id="backlogCount">0</span> Overdue)</div>
            <div id="backlogList" class="grid grid-cols-1 sm:grid-cols-3 gap-2"></div>
          </div>
          <div id="portalsContainer" class="bg-white p-3 rounded-2xl border flex flex-wrap gap-2 text-xs"></div>
          <div id="subjectTabs" class="flex gap-2 overflow-x-auto pb-1"></div>
          <div id="chaptersContainer" class="space-y-4"></div>
        </main>
      </div>`;
  }
};
