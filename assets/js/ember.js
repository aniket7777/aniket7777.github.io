/* Ember Blinds: the WebGL effect behind the hero (.hero #cv) and the closing band (.closing #cv2). Settings: the #effect-settings JSON on the page if present, otherwise the defaults below (the tuned values). */
/* =================== Ember Blinds hero ===================
   The steel blinds geometry (slats, angle, perspective, curves, crease, sheen, sway, click ripple), lit by heat instead of a spotlight.
   The cursor leaves a wide, soft trail of heat behind it that spreads, rises and fades; the slats open slightly where it is warm.
   No movement, no heat, so there is never a bright point under the pointer. A slow ember wanders when nobody is moving.
   The loop only runs while the hero is on screen. */
function emberBlinds(hero, canvas, opts) {
  opts = opts || {};
  var ZONE = opts.zone || [0, 1];   // the vertical band (0 = bottom, 1 = top) where the blinds are visible; the idle ember stays inside it
  if (!hero || !canvas) return;
  // [min, max, default]; defaults are the tuned values, so pages without a settings block look identical
  var SCHEMA = { count: [1, 40, 19], minWidth: [0, 200, 77], angle: [-90, 90, 35], persp: [-1, 1, -0.78], curves: [0, 30, 9.7], freq: [0.5, 20, 4.2], drift: [0, 2, 0.81],
    irregular: [0, 1, 0.12], profile: [-1, 1, 0], crease: [0, 1.5, 0.87], seam: [0, 1, 0.12], relief: [0, 1, 1], shine: [0, 2, 0.31], sway: [0, 1, 0.4], bend: [0, 3, 0.6],
    tiltHeat: [0, 1.5, 0.76], size: [0, 1, 0.6], amount: [0, 2, 1], spread: [0, 1, 0.6], linger: [0, 1, 0.65], rise: [0, 1.5, 0.35], lag: [0, 1, 0.5], idle: [0, 1, 0.6],
    intensity: [0.3, 2.5, 1.2], ambient: [0, 0.6, 0.06], grain: [0, 1.5, 0.45] };
  // phone profile: touch screens have no hover, so the field breathes on its own and a tap releases heat where it lands
  var PHONE = { minWidth: [0, 200, 38], size: [0, 1, 0.38], amount: [0, 3, 0.76], idle: [0, 2, 0.44], breath: [0, 1, 0.6], breathSpeed: [0.1, 2, 0.95],
    tapHeat: [0, 3, 0.85], tapSize: [0, 1, 0.56], intensity: [0.3, 2.5, 1.58], ambient: [0, 0.6, 0.07] };
  function clampFrom(schema, src) { var o = {}; src = src || {}; for (var k in schema) { var r = schema[k], v = Number(src[k]); o[k] = isFinite(v) && src[k] !== undefined && src[k] !== null ? Math.min(r[1], Math.max(r[0], v)) : r[2]; } return o; }
  var raw = {}; try { raw = JSON.parse(document.getElementById('effect-settings').textContent) || {}; } catch (e) {}
  var P = clampFrom(SCHEMA, raw); P.shineRight = raw.shineRight === true; P.phone = clampFrom(PHONE, raw.phone);
  var css = getComputedStyle(document.documentElement);
  var stops = ['--effect-peak', '--effect-glow', '--effect-deep', '--effect-base'].map(function (n) { return css.getPropertyValue(n).trim() || '#000000'; });
  var hexRGB = function (h) { var c = h.replace('#', ''); return [parseInt(c.substr(0, 2), 16) / 255, parseInt(c.substr(2, 2), 16) / 255, parseInt(c.substr(4, 2), 16) / 255]; };
  var STOPS = new Float32Array([].concat(hexRGB(stops[0]), hexRGB(stops[1]), hexRGB(stops[2]), hexRGB(stops[3])));
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var mobile = false; try { mobile = matchMedia('(hover: none) and (pointer: coarse)').matches; } catch (e) {}
  function E(k) { return mobile && P.phone[k] !== undefined ? P.phone[k] : P[k]; }   // effective value: the phone override on touch screens
  var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { hero.classList.add('no-gl'); return; }

  var VS = '#version 300 es\nvoid main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }';
  var FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uAngle; uniform float uCount; uniform float uPersp; uniform float uCurves;
uniform float uFreq; uniform float uCurvePhase; uniform float uIrr; uniform float uProfile; uniform float uCrease; uniform float uSeam; uniform float uShineFlip;
uniform float uRelief; uniform float uShine; uniform float uSway; uniform float uBend; uniform float uTiltHeat;
uniform sampler2D uTrail; uniform float uIntensity; uniform float uAmbient; uniform float uGrain; uniform vec3 uStops[4]; uniform vec4 uWaves[4];
out vec4 outColor;
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 rotate2D(vec2 p, float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p; }
// the steel blinds' own slat space: rotation, perspective widening, and the sine curves
vec2 blindSpace(vec2 uv0){
  float aspect = uRes.x / uRes.y;
  vec2 p = uv0 * 2.0 - 1.0; p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle); pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;
  if (abs(uPersp) > 0.001) { float k = uPersp * 2.2; uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0); }
  if (uCurves > 0.0) { float a = uv.y * uFreq + uCurvePhase, b = uv.x * uFreq, w = 0.01 * uCurves; uv.x += sin(a) * w; uv.y += cos(b) * w; }
  return uv;
}
vec3 grad(float t){ t = clamp(t, 0.0, 1.0) * 3.0; int i = int(min(floor(t), 2.0)); return mix(uStops[i], uStops[i + 1], t - float(i)); }
float heatAt(vec2 uv){ return 1.0 - exp(-texture(uTrail, uv).r * 1.4); }
void main(){
  vec2 frag = gl_FragCoord.xy; vec2 uv0 = frag / uRes; float aspect = uRes.x / uRes.y;
  vec2 bm = blindSpace(uv0);
  float count = max(uCount, 1.0); float phase = bm.x * count;
  phase += uIrr * 0.9 * sin(bm.x * count * 0.83 + 1.7) * (0.6 + 0.4 * sin(bm.x * count * 0.29 + 0.4)); // uneven slat widths
  float slat = floor(phase); float s = phase - slat;
  float aa = clamp(count * 1.25 / min(uRes.x, uRes.y), 0.001, 0.12) * (1.0 + uSeam * 7.0);       // wider seam between slats
  float edgeBlend = 1.0 - smoothstep(0.0, aa, min(s, 1.0 - s));
  float across = mix(s, 0.5, edgeBlend); if (uShineFlip > 0.5) across = 1.0 - across;
  // each slat is a curved surface: it shows the heat behind it shifted across the slat, so neighbours do not line up
  float c = cos(uAngle), sn = sin(uAngle);
  vec2 dirUV = vec2(c / aspect, sn) * 0.5;
  float heat = heatAt(uv0 + dirUV * (across - 0.5) * uBend / count * 2.0);
  // slats tilt: their own sway, plus they open where it is warm (the blinds' hover tilt, driven by heat, not a pointer)
  float tilt = uSway * 0.5 * sin(uTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uTime * 0.37 + slat * 0.21));
  tilt += uTiltHeat * heat * 1.1;
  float pulse = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 wv = uWaves[i]; if (wv.w <= 0.0) continue;
    float age = uTime - wv.z; if (age < 0.0 || age > 1.6) continue;
    float life = age / 1.6; vec2 o = blindSpace(wv.xy / uRes);
    float k = (abs(slat + 0.5 - o.x * count) - age * max(count, 4.0) * 0.95) / (0.8 + life * 1.2);
    float along = (bm.y - o.y) / max(0.42 + life * 0.5, 0.01);
    float ring = exp(-k * k) * exp(-along * along) * (1.0 - life) * (1.0 - life) * smoothstep(0.0, 0.2, age);
    tilt += ring * 0.9; pulse += ring;
  }
  float ramp = pow(clamp(across, 0.0, 1.0), exp(tilt * 0.9));                 // 0 = the lit edge, 1 = into the fold
  float crease = uCrease * 0.38 * smoothstep(0.62, 1.0, ramp);
  // the glow: the heat field, plus a faint ember that always sits in the slats so the structure never goes fully dark
  float amb = uAmbient * (0.35 + 0.65 * smoothstep(0.0, 1.0, bm.x)) * (0.75 + 0.25 * sin(bm.y * 3.0 + uTime * 0.15));
  float g = heat * uIntensity + amb;
  float body = 1.0 - uRelief * 0.8 * pow(ramp, exp(-uProfile * 1.3));         // profile: flat (light falls off late) to round (falls off early)
  float sheen = uShine * exp(-pow((across - 0.035) / 0.07, 2.0)) * (1.0 - edgeBlend);
  float lum = g * body - crease * g * 0.6 + sheen * (0.1 + 1.1 * g) + pulse * 0.12 * (0.3 + g);
  lum = max(lum, 0.0); lum = pow(lum, 1.2); lum = lum / (1.0 + 0.35 * lum);    // soft shoulder: the glow never clips to a hot point
  vec3 col = grad(1.0 - clamp(lum, 0.0, 1.0));
  col *= 1.0 - min(0.45 * uRelief + 0.5 * uSeam, 0.95) * edgeBlend;            // the dark seam between slats
  float n = hash(frag + fract(uTime) * 61.0) + hash(frag.yx + 17.0) - 1.0;
  col += n * 0.07 * uGrain * (0.3 + 0.7 * smoothstep(0.0, 0.5, lum));
  col *= 1.0 - 0.22 * pow(length(uv0 - 0.5) * 1.25, 2.0);
  outColor = vec4(max(col, uStops[3] * 0.6), 1.0);
}`;
  // heat field: spreads, rises, fades; deposits come from a point lagging the cursor and scale with its speed
  var SFS = `#version 300 es
precision highp float;
uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec2 uA; uniform vec2 uB; uniform float uRad; uniform float uAmt; uniform float uKeep;
uniform float uSpread; uniform float uRise; uniform float uAsp; uniform float uT;
out vec4 o;
float h2(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 wob = (vec2(n2(uv * 5.0 + uT * 0.25), n2(uv * 5.0 + 19.0 - uT * 0.25)) - 0.5) * uTexel * 2.6;
  vec2 src = uv - vec2(0.0, uRise) * uTexel + wob;
  vec2 e = uTexel * 1.8;
  float c = texture(uPrev, src).r;
  float nb = texture(uPrev, src + vec2(e.x, 0)).r + texture(uPrev, src - vec2(e.x, 0)).r + texture(uPrev, src + vec2(0, e.y)).r + texture(uPrev, src - vec2(0, e.y)).r;
  float h = mix(c, nb * 0.25, uSpread) * uKeep;
  vec2 pa = (uv - uA) * vec2(uAsp, 1.0), ba = (uB - uA) * vec2(uAsp, 1.0);
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0); float d = length(pa - ba * t);
  h += uAmt * exp(-d * d / (uRad * uRad));
  o = vec4(min(h, 5.0), 0.0, 0.0, 1.0);
}`;
  function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(x)); return null; } return x; }
  function link(fs) { var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, VS), b = sh(gl.FRAGMENT_SHADER, fs); if (!a || !b) return null; gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    var L = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ''); L[nm] = gl.getUniformLocation(p, nm); } return { p: p, u: L }; }
  var main = link(FS), sim = link(SFS); if (!main || !sim) { hero.classList.add('no-gl'); return; }
  var vao = gl.createVertexArray();
  var floatOK = !!gl.getExtension('EXT_color_buffer_float'); gl.getExtension('OES_texture_float_linear');

  var W = 1, H = 1, ratio = 1, time = 0, last = 0, raf = 0, onScreen = true, idleFor = 99, idleMix = 1;
  var waves = new Float32Array(16), wi = 0, pointer = { x: 0, y: 0, inside: false };
  var trail = { w: 0, h: 0, tex: [], fbo: [], cur: 0 }, follow = null, prevF = null;
  function makeTrail() {
    var w = Math.max(64, Math.round(W / 4)), h = Math.max(64, Math.round(H / 4));
    trail.tex.forEach(function (t) { gl.deleteTexture(t); }); trail.fbo.forEach(function (f) { gl.deleteFramebuffer(f); }); trail.tex = []; trail.fbo = [];
    for (var j = 0; j < 2; j++) { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      if (floatOK) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); trail.tex.push(t); trail.fbo.push(fb); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); trail.w = w; trail.h = h;
  }
  function stepTrail(dt, target, gain) {
    if (!trail.w) makeTrail();
    var kf = 1 - Math.exp(-dt / (0.06 + P.lag * 0.35));
    if (!follow) follow = target.slice();
    follow[0] += (target[0] - follow[0]) * kf; follow[1] += (target[1] - follow[1]) * kf;
    var m = Math.min(W, H), a = prevF || follow, b = follow, dx = (b[0] - a[0]) * W / m, dy = (b[1] - a[1]) * H / m;   // movement in short-side units: a tall phone is not penalised
    var amt = Math.min(Math.sqrt(dx * dx + dy * dy) * 6, 0.3) * E('amount') * gain;   // no movement, no heat: never a source to see
    if (mobile) amt += E('idle') * 0.12 * dt * idleMix;                                  // phones: the wandering ember always lays a little heat
    prevF = follow.slice();
    simPass(dt, a, b, 0.04 + 0.16 * E('size'), amt);
  }
  function simPass(dt, a, b, rad, amt) {
    if (!trail.w) makeTrail();
    var src = trail.cur, dst = 1 - src, U = sim.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fbo[dst]); gl.viewport(0, 0, trail.w, trail.h); gl.useProgram(sim.p); gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trail.tex[src]); gl.uniform1i(U.uPrev, 0);
    gl.uniform2f(U.uTexel, 1 / trail.w, 1 / trail.h); gl.uniform2f(U.uA, a[0], a[1]); gl.uniform2f(U.uB, b[0], b[1]);
    gl.uniform1f(U.uRad, rad); gl.uniform1f(U.uAmt, amt);
    gl.uniform1f(U.uKeep, Math.pow(0.95 + 0.048 * P.linger, dt * 60)); gl.uniform1f(U.uSpread, Math.min(0.35 + 0.6 * P.spread, 0.98));
    gl.uniform1f(U.uRise, P.rise * 0.9 * dt * 60); gl.uniform1f(U.uAsp, W / H); gl.uniform1f(U.uT, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindFramebuffer(gl.FRAMEBUFFER, null); trail.cur = dst;
  }
  function wander(t) {
    var p;
    if (mobile) { t *= 1.6; p = [0.5 + 0.32 * Math.sin(t * 0.23) + 0.08 * Math.sin(t * 0.71), 0.5 + 0.34 * Math.sin(t * 0.19 + 1.1) + 0.06 * Math.cos(t * 0.57)]; }
    else p = [0.62 + 0.26 * Math.sin(t * 0.23) + 0.06 * Math.sin(t * 0.71), 0.5 + 0.28 * Math.sin(t * 0.19 + 1.1) + 0.05 * Math.cos(t * 0.57)];
    p[1] = ZONE[0] + p[1] * (ZONE[1] - ZONE[0]);   // squeeze the path into the visible band
    return p;
  }
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(main.p); gl.bindVertexArray(vao);
    var U = main.u;
    gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uTime, time);
    var mw = E('minWidth'), cnt = mw > 0 ? Math.max(1, Math.min(P.count, Math.floor(W / mw))) : P.count;
    var br = mobile && !reduce ? P.phone.breath * Math.sin(time * P.phone.breathSpeed * 1.6) : 0;   // phones: the whole field swells and settles
    gl.uniform1f(U.uCount, cnt); gl.uniform1f(U.uAngle, P.angle * Math.PI / 180); gl.uniform1f(U.uPersp, P.persp); gl.uniform1f(U.uCurves, P.curves);
    gl.uniform1f(U.uFreq, P.freq); gl.uniform1f(U.uCurvePhase, time * P.drift * 0.25); gl.uniform1f(U.uIrr, P.irregular); gl.uniform1f(U.uProfile, P.profile);
    gl.uniform1f(U.uCrease, P.crease); gl.uniform1f(U.uSeam, P.seam); gl.uniform1f(U.uShineFlip, P.shineRight ? 1 : 0);
    gl.uniform1f(U.uRelief, P.relief); gl.uniform1f(U.uShine, P.shine); gl.uniform1f(U.uSway, reduce ? 0 : P.sway); gl.uniform1f(U.uBend, P.bend); gl.uniform1f(U.uTiltHeat, P.tiltHeat);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trail.tex[trail.cur] || null); gl.uniform1i(U.uTrail, 0);
    gl.uniform1f(U.uIntensity, E('intensity') * (1 + 0.22 * br)); gl.uniform1f(U.uAmbient, E('ambient') * (1 + 0.9 * br)); gl.uniform1f(U.uGrain, P.grain);
    gl.uniform3fv(U.uStops, STOPS); gl.uniform4fv(U.uWaves, waves);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    raf = 0; var dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60; last = now; time += dt; idleFor += dt;
    var idle = !pointer.inside || idleFor > 2.5;
    idleMix += ((idle ? 1 : 0) - idleMix) * (1 - Math.exp(-dt / 0.8));
    var wv = wander(time), cur = [pointer.x / W, 1 - pointer.y / H];
    var tgt = pointer.inside ? [cur[0] + (wv[0] - cur[0]) * idleMix, cur[1] + (wv[1] - cur[1]) * idleMix] : wv;
    stepTrail(dt, tgt, 1 - idleMix * (1 - E('idle')));
    draw();
    if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && !reduce && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function resize() {
    var r = hero.getBoundingClientRect(), nw = Math.max(1, r.width), nh = Math.max(1, r.height);
    if (trail.w && Math.abs(nw - W) < 1 && Math.abs(nh - H) < 1) return;   // phone address bar showing or hiding: same size, keep the heat
    W = nw; H = nh;
    ratio = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2); canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
    trail.w = 0; follow = prevF = null; warm();
  }
  // first paint is never empty: run the wandering ember for a moment before the page is shown
  function warm() { for (var i = 0; i < 70; i++) { time += 1 / 60; stepTrail(1 / 60, wander(time), E('idle') * 1.4); } draw(); }
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.inside = true; idleFor = 0; wake(); }, { passive: true });
  hero.addEventListener('pointerleave', function () { pointer.inside = false; });
  ['pointerup', 'pointercancel'].forEach(function (t) { hero.addEventListener(t, function (e) { if (e.pointerType === 'touch') pointer.inside = false; }); });
  // listen on the whole band, not just the canvas: copy and footer sit above the canvas and would swallow the tap; links and buttons keep theirs
  hero.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('a, button, input, label, [tabindex]')) return; var r = hero.getBoundingClientRect(), o = wi * 4;
    if (mobile && !reduce) {   // a tap releases a burst of heat right there; a drag then carries on from the finger
      var pt = [(e.clientX - r.left) / W, 1 - (e.clientY - r.top) / H];
      simPass(1 / 60, pt, pt, 0.05 + 0.22 * P.phone.tapSize, 0.9 * P.phone.tapHeat);
      follow = pt.slice(); prevF = pt.slice(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.inside = true; idleFor = 0;
    } waves[o] = (e.clientX - r.left) * ratio; waves[o + 1] = (H - (e.clientY - r.top)) * ratio; waves[o + 2] = time; waves[o + 3] = 1; wi = (wi + 1) % 4; wake(); });
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); wake(); }, 120); });
  document.addEventListener('visibilitychange', wake);
  // arriving on screen after being away: lay down a moment of idle heat first, so the band never scrolls in cold
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var was = onScreen; onScreen = es[0].isIntersecting; if (onScreen && !was && !reduce) { for (var i = 0; i < 40; i++) { time += 1 / 60; stepTrail(1 / 60, wander(time), E('idle') * 1.4); } draw(); } wake(); }).observe(hero);
  resize(); wake();
}
emberBlinds(document.querySelector('.hero'), document.getElementById('cv'), { zone: [0.35, 1] });      // hero: fades out over its lower half
emberBlinds(document.querySelector('.closing'), document.getElementById('cv2'), { zone: [0, 0.75] });  // closing band: fades in from the top, so the ember lives low