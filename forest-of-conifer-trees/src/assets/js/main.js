(function () {
  // Home video: pause button, and stay paused for people who prefer reduced motion
  var v = document.getElementById("vid"), b = document.getElementById("pp");
  if (v && b) {
    var hold = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lab = function () { b.textContent = v.paused ? "Play video" : "Pause video"; };
    b.addEventListener("click", function () {
      if (v.paused) { hold = false; v.play().catch(function () {}); }
      else { hold = true; v.pause(); }
    });
    v.addEventListener("play", lab);
    v.addEventListener("pause", lab);
    if (hold) { v.removeAttribute("autoplay"); v.pause(); }
    lab();
  }

  // Post canvas: drag with the mouse to pan (touch and trackpad scroll natively)
  var vp = document.getElementById("vp");
  if (vp) {
    var on = false, sx, sy, dx, dy;
    vp.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      on = true; sx = e.clientX; sy = e.clientY; dx = vp.scrollLeft; dy = vp.scrollTop;
      vp.classList.add("dg"); vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener("pointermove", function (e) {
      if (!on) return;
      vp.scrollLeft = dx - (e.clientX - sx);
      vp.scrollTop = dy - (e.clientY - sy);
    });
    var up = function () { on = false; vp.classList.remove("dg"); };
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", up);
  }
})();
