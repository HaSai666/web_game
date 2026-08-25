/*
 * Evidence-driven haunt state.
 *
 * The player never sees these category names or stage numbers. They are an
 * internal contract shared by the forum renderer, the corruption layer,
 * sound and endings. Progress is monotonic for one investigation: changing
 * routes, refreshing or returning home can deepen the archive, never restore
 * an earlier skin. Only the explicit replay action clears these keys.
 */
(function () {
  "use strict";

  var STAGE_KEY = "bbs_haunt_stage";
  var MANUAL_KEY = "bbs_evidence_manual";
  var ANCHOR_KEY = "bbs_story_anchors";
  var TYPES = ["person", "room", "ritual", "identity", "server"];

  var BASE_EVIDENCE = {
    person: [
      "t_granny", "f_lamp_debt", "f_rightlamp_note", "f_granny_letter",
      "u_youdeng", "t_hama"
    ],
    room: [
      "f_floorplan", "f_door_watch", "f_neighbor_tape", "f_room_rental",
      "f_chair_back", "t_recovered"
    ],
    ritual: [
      "t_folk", "t_eleven", "t_ten", "t_hama", "t_main", "del_wu"
    ],
    identity: [
      "t_return", "f_reply_shadow", "f_editor_cache", "u_tidengren",
      "draft1", "draft2", "draft3", "t_ip"
    ],
    server: [
      "f_rack_log", "f_mod_backup", "t_server", "t_log3", "t_log5",
      "del_37", "pm_admin", "t_close"
    ]
  };

  var FIRST_LEAKS = [
    "t_exp1", "t_exp2", "t_exp2b", "t_exp3", "t_exp3b",
    "f_photo_clock", "f_audio_log", "x_apple_lab", "x_ash_route",
    "x_mary_audio", "x_mary_delete"
  ];
  var LATE_SERVER_ANCHORS = [
    "t_log5", "f_mod_backup", "x_restore_first", "x_server_night",
    "x_shutdown_vote", "x_restore_notes", "x_visitor_mail"
  ];

  function clamp(value) {
    value = parseInt(value, 10);
    if (!isFinite(value)) value = 0;
    return Math.max(0, Math.min(5, value));
  }
  function readJson(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function readStage() {
    try { return clamp(localStorage.getItem(STAGE_KEY)); }
    catch (e) { return 0; }
  }
  function writeStage(value) {
    try { localStorage.setItem(STAGE_KEY, String(clamp(value))); } catch (e) {}
  }
  function visited() {
    var list = readJson("bbs_visited", []);
    return Array.isArray(list) ? list : [];
  }
  function has(list, id) { return list.indexOf(id) !== -1; }

  function allStoryThreads() {
    var groups = [
      window.BBS && BBS.threads,
      window.BBS_STORY && BBS_STORY.threads,
      window.BBS_FILLER && BBS_FILLER.threads,
      window.BBS_EXPANSION && BBS_EXPANSION.threads,
      window.BBS_EXTENDED && BBS_EXTENDED.threads
    ];
    var out = [], seen = {};
    for (var g = 0; g < groups.length; g++) {
      var list = groups[g] || [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || seen[item.id]) continue;
        seen[item.id] = true;
        out.push(item);
      }
    }
    return out;
  }

  function evidence() {
    var opened = visited();
    var manual = readJson(MANUAL_KEY, {});
    var result = { person: [], room: [], ritual: [], identity: [], server: [] };
    var i, type, id;

    for (var t = 0; t < TYPES.length; t++) {
      type = TYPES[t];
      var base = BASE_EVIDENCE[type];
      for (i = 0; i < base.length; i++) {
        id = base[i];
        if (has(opened, id) && result[type].indexOf(id) === -1) result[type].push(id);
      }
      var extra = manual && Array.isArray(manual[type]) ? manual[type] : [];
      for (i = 0; i < extra.length; i++) if (result[type].indexOf(extra[i]) === -1) result[type].push(extra[i]);
    }

    var threads = allStoryThreads();
    for (i = 0; i < threads.length; i++) {
      var thread = threads[i];
      if (!has(opened, thread.id)) continue;
      var marks = Array.isArray(thread.evidence) ? thread.evidence : (thread.evidence ? [thread.evidence] : []);
      for (var m = 0; m < marks.length; m++) {
        type = marks[m];
        if (result[type] && result[type].indexOf(thread.id) === -1) result[type].push(thread.id);
      }
    }

    /* Account and interaction evidence is as valid as a thread. */
    try {
      var account = localStorage.getItem("bbs_session") || "";
      if (account === "提灯人" && result.identity.indexOf("login:提灯人") === -1) result.identity.push("login:提灯人");
      if (account === "青灯" && result.server.indexOf("login:青灯") === -1) result.server.push("login:青灯");
      if (localStorage.getItem("bbs_choice_neighbor-tape") && result.room.indexOf("choice:neighbor-tape") === -1) result.room.push("choice:neighbor-tape");
      if (localStorage.getItem("bbs_choice_mod-snapshot") && result.server.indexOf("choice:mod-snapshot") === -1) result.server.push("choice:mod-snapshot");
      if (localStorage.getItem("bbs_read_rightlamp") === "1" && result.person.indexOf("pm:rightlamp") === -1) result.person.push("pm:rightlamp");
    } catch (e) {}
    return result;
  }

  function typeCount(state) {
    var n = 0;
    for (var i = 0; i < TYPES.length; i++) if (state[TYPES[i]].length) n++;
    return n;
  }
  function anchors() {
    var value = readJson(ANCHOR_KEY, {});
    return value && typeof value === "object" ? value : {};
  }
  function routeThread() {
    var parts = location.hash.replace(/^#\/?/, "").split("/");
    return parts[0] === "thread" ? (parts[1] || "") : "";
  }
  function canEnterFinal(state) {
    state = state || evidence();
    for (var i = 0; i < TYPES.length; i++) if (!state[TYPES[i]].length) return false;
    return true;
  }
  function hasAny(list, values) {
    for (var i = 0; i < values.length; i++) if (has(list, values[i])) return true;
    return false;
  }
  function calculate() {
    var opened = visited();
    var state = evidence();
    var a = anchors();
    var count = typeCount(state);
    var next = 0;
    var leakConfirmed = hasAny(opened, FIRST_LEAKS);

    if (leakConfirmed) next = 1;
    if (leakConfirmed && count >= 2) next = 2;
    if (a.fifth_voice || has(opened, "x_lock_discussion")) next = 3;
    if (count >= 4 && (hasAny(opened, LATE_SERVER_ANCHORS) || localStorage.getItem("bbs_choice_mod-snapshot"))) next = 4;
    if (canEnterFinal(state) && routeThread() === "t_37") next = 5;
    return Math.max(readStage(), next);
  }

  function applyBody(stage, state) {
    if (!document.body) return;
    stage = clamp(stage);
    state = state || evidence();
    var old = document.body.getAttribute("data-haunt-stage");
    document.body.setAttribute("data-haunt-stage", String(stage));
    document.body.setAttribute("data-final-ready", canEnterFinal(state) ? "true" : "false");
    for (var i = 0; i < TYPES.length; i++) {
      document.body.setAttribute("data-evidence-" + TYPES[i], state[TYPES[i]].length ? "true" : "false");
    }

    /* Legacy selectors remain mapped while the six-stage skin takes over. */
    document.body.classList.remove("t1", "t2", "t3");
    document.body.classList.add(stage <= 1 ? "t1" : (stage <= 3 ? "t2" : "t3"));
    document.body.setAttribute("data-atmosphere-tier", stage <= 1 ? "1" : (stage <= 3 ? "2" : "3"));
    document.body.setAttribute("data-archive-depth", String(stage));

    if (old !== String(stage)) {
      try { window.dispatchEvent(new CustomEvent("archiveevidencechange", { detail: { stage: stage, evidence: state } })); }
      catch (e) { try { window.dispatchEvent(new Event("archiveevidencechange")); } catch (e2) {} }
    }
  }
  function refresh() {
    var state = evidence();
    var next = calculate();
    writeStage(next);
    applyBody(next, state);
    return next;
  }
  function record(type, id) {
    if (TYPES.indexOf(type) === -1 || !id) return refresh();
    var manual = readJson(MANUAL_KEY, {});
    if (!manual || typeof manual !== "object") manual = {};
    if (!Array.isArray(manual[type])) manual[type] = [];
    if (manual[type].indexOf(id) === -1) manual[type].push(id);
    writeJson(MANUAL_KEY, manual);
    return refresh();
  }
  function markAnchor(name) {
    if (!name) return refresh();
    var value = anchors();
    if (!value[name]) {
      value[name] = new Date().toISOString();
      writeJson(ANCHOR_KEY, value);
    }
    return refresh();
  }
  function get() { return readStage(); }
  function summary() {
    var state = evidence();
    return { stage: readStage(), evidence: state, typeCount: typeCount(state), finalReady: canEnterFinal(state), anchors: anchors() };
  }

  window.ArchiveEvidenceState = {
    types: TYPES.slice(),
    get: get,
    refresh: refresh,
    record: record,
    markAnchor: markAnchor,
    evidence: evidence,
    summary: summary,
    canEnterFinal: canEnterFinal
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  window.addEventListener("hashchange", function () { setTimeout(refresh, 0); });
  window.addEventListener("storage", refresh);
})();
