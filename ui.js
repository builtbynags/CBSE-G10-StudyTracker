window.UI = {
  renderShell() {
    document.getElementById("root").innerHTML = `
      <div id="loginScreen">
        <div>
          <h1>CBSE 10: Lock-In Mode</h1>
          <input id="loginUser" type="text" placeholder="Enter Student Name" />
          <input id="loginPass" type="password" placeholder="Enter Secret Passcode" />
          <button id="loginBtn">Open Dashboard</button>
        </div>RT
      </div>
      <div id="appScreen" class="hidden">
        <p id="dailyQuote"></p>
        <header>
          <div>
            <div>
              <h1><span id="displayUser"></span>'s Lock-In Tracker <span id="syncStatus" class="sync-pill">Syncing...</span></h1>
              <p>Rule: Write Physics, Chem & Bio in separate designated exam sections.</p>
            </div>
            <div class="header-right">
              <div class="glitter-schedule">
                <span>🗓️ Pre-Boards: <b>Jan 4</b> (<b id="pbCountdown">--</b>)</span>
                <span class="divider">|</span>
                <span>🎓 Final Boards: <b>Feb 16</b> (<b id="boardCountdown">--</b>)</span>
              </div>
              <button id="logoutBtn">Switch</button>
            </div>
          </div>
        </header>
        <main>
          <div id="subjectStrip" class="sub-strip"></div>

          <div class="main-tabs">
            <button id="tabPlanner" class="m-tab active">📊 1. Planner & Unified Timeline</button>
            <button id="tabGuide" class="m-tab">📚 2. Prep Guide & Step Resources</button>
          </div>

          <div id="viewPlanner" class="space-y">
            <div class="planner-bar">
              <div class="filter-group">
                <button data-f="all" class="f-btn active">All Chapters</button>
                <button data-f="urgent" class="f-btn">🔴 Backlog & Today</button>
                <button data-f="core" class="f-btn">Core Subjects</button>
                <button data-f="booster" class="f-btn">Boosters</button>
              </div>
              <div class="mini-timer">
                <span>⚡ Sprint: <b id="timerDisplay">25:00</b></span>
                <button id="timerBtn">Start</button>
                <button id="resetTimerBtn">Reset</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Target Window</th>
                    <th>Subject</th>
                    <th>Chapter</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="timelineBody"></tbody>
              </table>
            </div>
          </div>

          <div id="viewGuide" class="hidden space-y">
            <div id="subjectTabs"></div>

            <div class="guide-top-grid">
              <div class="card">
                <div class="sec-title">📋 Official CBSE Unit Weightage</div>
                <table class="mini-table">
                  <thead><tr><th>Unit Name</th><th>Marks</th></tr></thead>
                  <tbody id="marksTableBody"></tbody>
                </table>
              </div>
              <div class="card wall-card">
                <div class="sec-title">📌 Subject Sticky-Note & Formula Link Wall</div>
                <div class="pin-row">
                  <input id="subNoteInput" type="text" placeholder="Paste formula link (https://...) or reel trick..." />
                  <button id="addSubNoteBtn">+ Pin</button>
                </div>
                <div id="subWallGrid" class="sticky-grid"></div>
              </div>
            </div>

            <div class="workspace-grid">
              <div class="chap-sidebar">
                <div class="sec-title" style="padding:8px 10px;">Select Chapter</div>
                <div id="chapterTabs"></div>
              </div>
              <div id="activeChapterBox" class="chap-workspace"></div>
            </div>
          </div>
        </main>
      </div>`;
  }
};
