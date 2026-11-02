(function () {
  // ---------- Home: video pause button ----------
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

  // ---------- Post canvas ----------
  var vp = document.getElementById("vp");
  if (!vp) return;
  var world = vp.querySelector(".world");
  var panel = vp.parentNode;

  // Mouse: drag to pan (touch and trackpad scroll natively)
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

  // ---------- Zoom + phone framing ----------
  var MIN_ZOOM = 0.3;      // phones: smallest starting scale
  var FIT_HEIGHT = false;  // phones: true = start zoomed out until the whole height fits too
  var MIN = 0.25, MAX = 4; // limits for the zoom buttons, Ctrl+scroll and pinch

  var w0 = world.style.width, h0 = world.style.height;
  var phone = matchMedia("(max-width: 700px)");
  var W = parseFloat(w0) || 2900, H = parseFloat(h0) || 1650;
  var s = 1, fit = 1, userZoom = false;

  // The sizer gives the scroll area its real (scaled) size, whatever the browser does with transforms
  var sizer = document.createElement("div");
  sizer.style.position = "relative";
  vp.appendChild(sizer);
  sizer.appendChild(world);
  world.style.position = "absolute";
  world.style.left = "0";
  world.style.top = "0";
  world.style.minWidth = "0";
  world.style.minHeight = "0";
  world.style.transformOrigin = "0 0";
  vp.style.touchAction = "pan-x pan-y";

  function layout() {
    var sw = Math.max(W * s, vp.clientWidth), sh = Math.max(H * s, vp.clientHeight);
    sizer.style.width = sw + "px";
    sizer.style.height = sh + "px";
    world.style.width = sw / s + "px";
    world.style.height = sh / s + "px";
    world.style.transform = "scale(" + s + ")";
    world.style.setProperty("--s", s);
    world.style.setProperty("--fit", fit);
  }

  function measure() {
    if (!phone.matches) { W = parseFloat(w0) || 2900; H = parseFloat(h0) || 1650; fit = 1; return; }
    var w = 0, h = 0;
    world.querySelectorAll(".it").forEach(function (el) {
      w = Math.max(w, el.offsetLeft + el.offsetWidth);
      h = Math.max(h, el.offsetTop + el.offsetHeight);
    });
    W = w + 24; H = h + 24;
    fit = Math.min(1, vp.clientWidth / W);
    if (FIT_HEIGHT) fit = Math.min(fit, vp.clientHeight / H);
    fit = Math.max(MIN_ZOOM, fit);
  }

  function frame() {
    measure();
    if (!userZoom) s = fit;
    layout();
    console.log("canvas scale", s.toFixed(2), "content", Math.round(W) + "x" + Math.round(H));
  }

  // Zoom to scale ns, keeping the canvas point (px, py) under the screen point (cx, cy)
  function zoomAt(ns, cx, cy, px, py) {
    ns = Math.min(MAX, Math.max(MIN, ns));
    var r = vp.getBoundingClientRect(), ax = cx - r.left, ay = cy - r.top;
    if (px === undefined) { px = (vp.scrollLeft + ax) / s; py = (vp.scrollTop + ay) / s; }
    s = ns; userZoom = true;
    layout();
    vp.scrollLeft = px * s - ax;
    vp.scrollTop = py * s - ay;
  }
  function zoomCentre(k) {
    var r = vp.getBoundingClientRect();
    zoomAt(s * k, r.left + vp.clientWidth / 2, r.top + vp.clientHeight / 2);
  }

  // Ctrl + scroll wheel, or a trackpad pinch
  vp.addEventListener("wheel", function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoomAt(s * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY);
  }, { passive: false });

  // Two-finger pinch on a touch screen
  var pinch = null;
  function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function mid(t) { return [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2]; }
  vp.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      var m = mid(e.touches), r = vp.getBoundingClientRect();
      pinch = { d: dist(e.touches), s0: s, px: (vp.scrollLeft + m[0] - r.left) / s, py: (vp.scrollTop + m[1] - r.top) / s };
    } else { pinch = null; }
  }, { passive: true });
  vp.addEventListener("touchmove", function (e) {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    var m = mid(e.touches);
    zoomAt(pinch.s0 * dist(e.touches) / pinch.d, m[0], m[1], pinch.px, pinch.py);
  }, { passive: false });
  var endPinch = function (e) { if (e.touches.length < 2) pinch = null; };
  vp.addEventListener("touchend", endPinch);
  vp.addEventListener("touchcancel", endPinch);

  // Zoom buttons
  var box = document.createElement("div");
  box.className = "zc";
  box.style.cssText = "position:absolute;right:14px;bottom:46px;z-index:3;display:flex;gap:6px";
  [["\u2212", "Zoom out", function () { zoomCentre(1 / 1.25); }],
    ["+", "Zoom in", function () { zoomCentre(1.25); }],
    ["Fit", "Reset zoom", function () { userZoom = false; frame(); vp.scrollLeft = 0; vp.scrollTop = 0; }]
  ].forEach(function (d) {
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "chip"; btn.textContent = d[0];
    btn.setAttribute("aria-label", d[1]); btn.addEventListener("click", d[2]);
    box.appendChild(btn);
  });
  panel.appendChild(box);

  var hint = panel.querySelector(".hint");
  if (hint) hint.textContent = matchMedia("(pointer: coarse)").matches ? "Drag to move" : "Drag to move, Ctrl+scroll to zoom";

  frame();
  addEventListener("resize", frame);
  addEventListener("load", frame);
  if (document.fonts) document.fonts.ready.then(frame);
  world.querySelectorAll("img").forEach(function (i) { i.addEventListener("load", frame); });
})();