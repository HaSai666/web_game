/* Compatibility surface. The two short visual frames now live in the
 * deterministic corruption layer; this file deliberately adds no extra jump
 * scare, idle title change or full-screen photograph. */
(function () {
  "use strict";

  function pulse(kind) {
    if (window.ArchiveAudio && window.ArchiveAudio.pulse) window.ArchiveAudio.pulse(kind || "soft");
  }
  function showPhoto(file, duration, note, kind) {
    if (window.ArchiveCorruption && window.ArchiveCorruption.showEquivalent) {
      window.ArchiveCorruption.showEquivalent(note || "附件在读取时缺少一帧。");
    }
    pulse(kind || "soft");
  }

  window.ArchiveAtmosphere = { showPhoto: showPhoto, pulse: pulse };
})();
