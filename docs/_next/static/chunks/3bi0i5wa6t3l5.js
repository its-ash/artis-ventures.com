(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,26797,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(90072),o=e.i(75056),l=e.i(98903);e.i(46471);var r=e.i(52374),n=e.i(31318);let s=e.i(91824).q.footer,u=`
  float revealFront() { return uRise * 1.05 - 0.02; }
`,v=`
  uniform float uRise, uTime, uWave;
  varying vec2 vUv;
  varying float vShade, vLift;
  ${u}

  float wave(vec2 p) { return sin(p.x * 1.3 - uTime * 0.9) * 0.5 + sin(p.x * 0.7 + p.y * 1.1 + uTime * 0.6) * 0.5; }

  void main() {
    vUv = uv;
    // Each column lifts just behind the dissolve front, then rides the wave.
    float e = clamp((revealFront() - uv.x * 0.6) * 4.0, 0.0, 1.0);
    e = 1.0 - pow(1.0 - e, 3.0);
    vec2 q = position.xy;
    float amp = uWave * e;
    vec3 p = position;
    p.z += wave(q) * amp - (1.0 - e) * 0.8;
    float dx = (wave(q + vec2(0.02, 0.0)) - wave(q - vec2(0.02, 0.0))) / 0.04 * amp;
    float dy = (wave(q + vec2(0.0, 0.02)) - wave(q - vec2(0.0, 0.02))) / 0.04 * amp;
    vec3 n = normalize(normalMatrix * normalize(vec3(-dx, -dy, 1.0)));
    vShade = dot(n, normalize(vec3(-0.4, 0.5, 0.8)));
    vLift = e;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`,f=`
  uniform sampler2D uMap;
  uniform float uRise, uTime, uSweep, uOpacity;
  uniform vec3 uDeep, uTeal, uGlint;
  varying vec2 vUv;
  varying float vShade, vLift;
  ${n.I}
  ${u}

  void main() {
    vec3 t = texture2D(uMap, vUv).rgb;
    float f = revealFront();
    float thr = vUv.x * 0.6 + noise(vUv * vec2(26.0, 8.0)) * 0.25;
    float show = smoothstep(thr - 0.02, thr + 0.02, f);
    float edge = show * (1.0 - smoothstep(0.0, 0.06, f - thr));
    float alpha = t.r * show + t.g * 0.28 * show + edge * max(t.r, t.g) * 0.9;
    if (alpha < 0.003) discard;
    // Liquid sheen: bands that drift through the strokes, lit by the rolling surface.
    float flow = noise(vUv * vec2(4.0, 2.0) + vec2(uTime * 0.08, -uTime * 0.05));
    float band = 0.5 + 0.5 * sin((vUv.x * 3.0 + vUv.y * 1.5 + flow * 2.0) * 3.14159 - uTime * 0.6);
    float lit = max(vShade, 0.0);
    vec3 col = mix(uDeep, uTeal, smoothstep(0.2, 0.9, band)) * (0.65 + 0.5 * lit);
    col += uGlint * pow(lit, 8.0) * 0.5 * vLift;
    col += uGlint * smoothstep(0.12, 0.0, abs(vUv.x - uSweep)) * 0.6 * t.r;
    col = mix(col, uGlint * 1.15, clamp(edge, 0.0, 1.0));
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * uOpacity);
  }
`;function c({tex:e,drive:o,motion:n,onReady:u}){let p=(0,a.useMemo)(()=>new i.CQ(e.w,e.h,160,40),[e]),m=(0,a.useMemo)(()=>{let t;return t=e.maps[0],new i.Zg({vertexShader:v,fragmentShader:f,transparent:!0,depthWrite:!1,side:i.Vs,uniforms:{uMap:{value:t},uRise:{value:0},uTime:{value:0},uWave:{value:s.wave},uSweep:{value:-1},uOpacity:{value:1},uDeep:{value:new i.Es("#1d6f76")},uTeal:{value:new i.Es("#33b7c2")},uGlint:{value:new i.Es("#7fd6db")}}})},[e]),h=(0,a.useRef)(null),d=(0,a.useRef)(null),w=(0,a.useRef)({rise:0,tilt:s.tilt[0],time:0,fit:""}),g=-e.cap/2;return(0,a.useEffect)(()=>()=>p.dispose(),[p]),(0,a.useEffect)(()=>()=>m.dispose(),[m]),(0,a.useEffect)(()=>u(),[u]),(0,l.f)(({camera:t,size:a},l)=>{let u=h.current,v=d.current;if(!u||!v)return;let f=w.current,c=`${a.width}x${a.height}`;if(c!==f.fit){f.fit=c;let o=Math.tan(i.rB.degToRad(26)/2),l=Math.max(e.tw/2/s.fit/(o*(a.width/Math.max(1,a.height))),e.cap/2/.7/o);t.position.set(0,-(.12*e.cap),l),t.lookAt(0,0,0)}let p=i.rB.clamp(o.current??0,0,1),m=n?Math.min(l,.1):10;(0,r.f)(f,"rise",n?p:1,.35,m),(0,r.f)(f,"tilt",i.rB.lerp(s.tilt[0],s.tilt[1],n?i.rB.smoothstep(p,0,.85):1),.45,m),n&&(f.time+=m),u.rotation.x=f.tilt,u.rotation.y=n?Math.sin(f.time*s.swaySpeed)*s.sway*f.rise:0;let g=v.material.uniforms;g.uRise.value=f.rise,g.uTime.value=f.time,g.uWave.value=n?s.wave:0,g.uSweep.value=n?f.time%s.sweep/s.sweep*2.2-.3:-1}),(0,t.jsx)("group",{ref:h,"position-y":g,children:(0,t.jsx)("mesh",{ref:d,geometry:p,material:m,"position-y":-g,frustumCulled:!1})})}e.s(["default",0,function({word:e,drive:i,motion:l,active:r,onReady:u}){let[v,f]=(0,a.useState)(null);return(0,a.useEffect)(()=>{let t=!1,a=null,i=matchMedia("(max-width: 1023px), (pointer: coarse)").matches?240:s.px;return(0,n.n)([e],2.6,i).then(e=>{if(t)return e.maps.forEach(e=>e.dispose());a=e,f(e)}),()=>{t=!0,a?.maps.forEach(e=>e.dispose())}},[e]),(0,t.jsx)(o.f,{frameloop:l?r?"always":"never":"demand",dpr:[1,1.75],gl:{alpha:!0,antialias:!0,powerPreference:"high-performance",stencil:!1},camera:{fov:26,near:.1,far:80,position:[0,0,12]},onCreated:e=>void(new URLSearchParams(location.search).has("debug")&&Object.assign(window,{__footerGL:e.get})),children:v&&(0,t.jsx)(c,{tex:v,drive:i,motion:l,onReady:u})})}])},91553,function(e){e.n(e.i(26797))},8155,e=>{"use strict";let t=e=>{let t,a=new Set,i=(e,i)=>{let o="function"==typeof e?e(t):e;if(!Object.is(o,t)){let e=t;t=(null!=i?i:"object"!=typeof o||null===o)?o:Object.assign({},t,o),a.forEach(a=>a(t,e))}},o=()=>t,l={setState:i,getState:o,getInitialState:()=>r,subscribe:e=>(a.add(e),()=>a.delete(e))},r=t=e(i,o,l);return l};e.s(["f",0,e=>e?t(e):t])}]);