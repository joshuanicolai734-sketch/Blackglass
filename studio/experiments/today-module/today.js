/* Today module prototype. Sample data only. State is one small object; every change goes through render(). */
(function () {
  "use strict";
  var MOVES = [
    { name: "Back squat", sets: 3, reps: "5 reps" },
    { name: "Romanian deadlift", sets: 3, reps: "8 reps" },
    { name: "Split squat", sets: 2, reps: "10 reps each side" },
    { name: "Calf raise", sets: 2, reps: "12 reps" }
  ];
  var TOTAL = MOVES.reduce(function (n, m) { return n + m.sets; }, 0);
  var KEY = "bg-today-proto-v1";
  var LOCK_MS = 450; // a logged set holds the button briefly, so a rapid double click logs once

  var root = document.getElementById("today");
  var primary = document.getElementById("primary");
  var pause = document.getElementById("pause");
  var reset = document.getElementById("reset");
  var replay = document.getElementById("replay");
  var status = document.getElementById("status");
  var nextLine = document.getElementById("next-line");
  var nextSub = document.getElementById("next-sub");
  var railFill = root.querySelector(".rail-fill");
  var moveEls = Array.prototype.slice.call(root.querySelectorAll(".move"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var state = load() || { phase: "idle", done: 0 }; // phase: idle | active | paused | done
  var locked = false, lockTimer = 0, justIndex = -1;

  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY));
      if (s && /^(idle|active|paused|done)$/.test(s.phase) && s.done >= 0 && s.done <= TOTAL) {
        if (s.phase === "active") s.phase = "paused"; // a reload mid-session comes back paused, ready to resume
        return s;
      }
    } catch { /* storage unavailable: the demo still works */ }
    return null;
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: the demo still works */ } }

  // Position of the next set: which movement and which set within it.
  function where(done) {
    for (var i = 0; i < MOVES.length; i++) {
      if (done < MOVES[i].sets) return { m: i, s: done };
      done -= MOVES[i].sets;
    }
    return null;
  }
  function doneIn(i) {
    var n = state.done;
    for (var k = 0; k < i; k++) n -= MOVES[k].sets;
    return Math.max(0, Math.min(MOVES[i].sets, n));
  }

  function say(msg) { status.textContent = msg; }

  function render(announce) {
    var w = where(state.done);
    root.dataset.state = state.phase;

    moveEls.forEach(function (el, i) {
      var n = doneIn(i), cap = MOVES[i].sets;
      var ticks = el.querySelector(".ticks");
      if (!ticks.children.length) for (var t = 0; t < cap; t++) { var s = document.createElement("span"); s.className = "tick"; ticks.appendChild(s); }
      Array.prototype.forEach.call(ticks.children, function (tk, t) {
        tk.classList.toggle("done", t < n);
        tk.classList.remove("just");
        if (i === justIndex && t === n - 1 && !reduce.matches) { void tk.offsetWidth; tk.classList.add("just"); }
      });
      el.querySelector("[data-count]").textContent = n;
      el.classList.toggle("complete", n === cap);
      if (w && w.m === i && state.phase !== "idle" && state.phase !== "done") el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    justIndex = -1;
    railFill.style.strokeDashoffset = String(100 - (100 * state.done) / TOTAL);

    primary.hidden = false;
    pause.hidden = state.phase !== "active";
    reset.hidden = state.phase === "idle";
    replay.hidden = false;
    pause.setAttribute("aria-pressed", "false");

    if (state.phase === "idle") {
      primary.textContent = "Start session";
      nextLine.textContent = MOVES[0].name + ", set 1 of " + MOVES[0].sets;
      nextSub.textContent = MOVES[0].reps + " at a sample load.";
    } else if (state.phase === "done") {
      primary.textContent = "Start again";
      nextLine.textContent = "Session complete";
      nextSub.textContent = TOTAL + " of " + TOTAL + " sample sets logged. Nothing was saved or sent.";
    } else {
      var mv = MOVES[w.m];
      nextLine.textContent = mv.name + ", set " + (w.s + 1) + " of " + mv.sets;
      nextSub.textContent = mv.reps + " at a sample load.";
      primary.textContent = state.phase === "paused" ? "Resume session" : "Complete set";
    }
    if (announce) say(announce);
  }

  function hold() {
    locked = true; primary.setAttribute("aria-disabled", "true");
    if (!reduce.matches) primary.textContent = "Set logged"; // feedback at the thumb, where the press happened
    clearTimeout(lockTimer);
    lockTimer = setTimeout(function () { locked = false; primary.removeAttribute("aria-disabled"); render(); }, reduce.matches ? 0 : LOCK_MS);
  }

  primary.addEventListener("click", function () {
    if (locked) return;
    if (state.phase === "idle" || state.phase === "done") {
      state = { phase: "active", done: 0 };
      save(); render("Session started. Set 1 is next.");
    } else if (state.phase === "paused") {
      state.phase = "active";
      save(); render("Resumed. " + state.done + " of " + TOTAL + " sets logged.");
    } else {
      var w = where(state.done);
      justIndex = w.m;
      state.done += 1;
      if (state.done >= TOTAL) state.phase = "done";
      save();
      render(state.phase === "done" ? "Last set logged. Session complete." : "Set logged. " + state.done + " of " + TOTAL + ".");
      hold();
    }
  });

  pause.addEventListener("click", function () {
    if (state.phase !== "active") return;
    state.phase = "paused"; save(); render("Paused at " + state.done + " of " + TOTAL + " sets. Resume when ready.");
    primary.focus(); // the paused control moves to Resume; keep focus on something that stays visible
  });

  reset.addEventListener("click", function () {
    state = { phase: "idle", done: 0 }; save(); render("Reset. The sample session is back to the start.");
    primary.focus();
  });

  // Intro assembly. Plays once on load, on request, and never under reduced motion.
  function assemble() {
    if (reduce.matches) return;
    moveEls.forEach(function (el, i) { el.style.setProperty("--i", i); });
    root.classList.remove("assemble"); root.classList.add("assembling");
    void root.offsetWidth;
    requestAnimationFrame(function () {
      root.classList.add("assemble");
      setTimeout(function () { root.classList.remove("assembling", "assemble"); }, 1400); // lockout: back to static
    });
  }
  replay.addEventListener("click", assemble);

  // Stop work when offscreen: the intro only starts when the module is in view.
  render();
  if ("IntersectionObserver" in window && !reduce.matches) {
    root.classList.add("assembling"); // hold the rows hidden for the moment before the intro starts
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); assemble(); } }, { threshold: 0.2 });
    io.observe(root);
  }
})();
