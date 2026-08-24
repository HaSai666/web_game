/*
 * The archive's colour grade is part of the investigation state, not a
 * property of one route.  Keep it monotonic so a detour to the forum home,
 * search, login, or a private message cannot wash the story back to neutral.
 */
(function () {
  "use strict";

  var KEY = "bbs_atmosphere_tier";

  function clamp(value) {
    var n = parseInt(value, 10);
    if (n >= 3) return 3;
    if (n === 2) return 2;
    return 1;
  }

  function stored() {
    try { return clamp(localStorage.getItem(KEY)); }
    catch (e) { return 1; }
  }

  function domTier() {
    var body = document.body;
    if (!body) return 1;
    var match = String(body.className || "").match(/(?:^|\s)t([123])(?:\s|$)/);
    return match ? clamp(match[1]) : clamp(body.getAttribute("data-atmosphere-tier"));
  }

  function apply(requested) {
    var next = Math.max(stored(), domTier(), clamp(requested));
    try { localStorage.setItem(KEY, String(next)); } catch (e) {}
    if (document.body) {
      document.body.classList.remove("t1", "t2", "t3");
      document.body.classList.add("t" + next);
      document.body.setAttribute("data-atmosphere-tier", String(next));
    }
    return next;
  }

  window.ArchiveAtmosphereState = {
    key: KEY,
    get: stored,
    apply: apply
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { apply(); }, { once: true });
  } else {
    apply();
  }
})();
