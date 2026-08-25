/* Compatibility bridge for scripts written for the former three-colour skin. */
(function () {
  "use strict";

  var LEGACY_KEY = "bbs_atmosphere_tier";

  function legacyClamp(value) {
    var n = parseInt(value, 10);
    return n >= 3 ? 3 : (n === 2 ? 2 : 1);
  }
  function legacyStored() {
    try { return legacyClamp(localStorage.getItem(LEGACY_KEY)); }
    catch (e) { return 1; }
  }
  function legacyApply(requested) {
    var next = Math.max(legacyStored(), legacyClamp(requested));
    try { localStorage.setItem(LEGACY_KEY, String(next)); } catch (e) {}
    if (document.body) {
      document.body.classList.remove("t1", "t2", "t3");
      document.body.classList.add("t" + next);
      document.body.setAttribute("data-atmosphere-tier", String(next));
    }
    return next;
  }

  function apply(requested) {
    if (window.ArchiveEvidenceState) {
      var stage = window.ArchiveEvidenceState.refresh();
      /* Keep the old key only as a cache-compatibility hint. It can no longer
         raise or lower the six-stage investigation state. */
      try { localStorage.setItem(LEGACY_KEY, String(stage <= 1 ? 1 : (stage <= 3 ? 2 : 3))); } catch (e) {}
      return stage;
    }
    return legacyApply(requested);
  }
  function get() {
    return window.ArchiveEvidenceState ? window.ArchiveEvidenceState.get() : legacyStored();
  }

  window.ArchiveAtmosphereState = { key: LEGACY_KEY, get: get, apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { apply(); }, { once: true });
  else apply();
})();
