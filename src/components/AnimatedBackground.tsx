import { useEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const AnimatedBackground = () => {
  useEffect(() => {
    const svg = document.getElementById("ts-bg-svg") as SVGSVGElement | null;
    if (!svg) return;

    const NS = "http://www.w3.org/2000/svg";
    let W = window.innerWidth;
    let H = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };
    window.addEventListener("resize", handleResize);

    const C = {
      primary:      "hsl(24, 95%, 45%)",
      primaryFaint: "hsl(24, 50%, 82%)",
      meshLine:     "hsl(220, 13%, 78%)",
      meshNode:     "hsl(220, 13%, 65%)",
      muted:        "hsl(220, 10%, 55%)",
      mutedLight:   "hsl(220, 10%, 72%)",
      blue:         "hsl(215, 55%, 60%)",
    };

    function rand(a: number, b: number) { return Math.random() * (b - a) + a; }
    function mkEl(tag: string, attrs: Record<string, string | number>) {
      const e = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
      return e;
    }
    function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

    const ctx = gsap.context(() => {

      // ═══ AMBIENT ORBS ═══
      const orbLayer = document.getElementById("ts-orb-layer")!;
      const orbColors = ["hsl(24, 70%, 92%)", "hsl(215, 35%, 92%)", "hsl(145, 25%, 92%)"];
      for (let i = 0; i < 4; i++) {
        const orb = mkEl("circle", {
          cx: rand(W * 0.1, W * 0.9), cy: rand(H * 0.1, H * 0.9),
          r: rand(80, 160), fill: orbColors[i % 3],
          opacity: "0.2", filter: "url(#ts-glow-wide)",
        });
        orbLayer.appendChild(orb);
        gsap.to(orb, { attr: { cx: rand(W * 0.1, W * 0.9), cy: rand(H * 0.1, H * 0.9) }, duration: rand(25, 45), ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to(orb, { opacity: rand(0.12, 0.25), duration: rand(10, 20), ease: "sine.inOut", repeat: -1, yoyo: true });
      }

      // ═══ LAYER 1: NEURAL MESH ═══
      const meshLinesG = document.getElementById("ts-mesh-lines")!;
      const meshNodesG = document.getElementById("ts-mesh-nodes")!;

      const nodes: { x: number; y: number; r: number }[] = [];
      const spacing = 90;
      const cols = Math.ceil(W / spacing) + 1;
      const rows = Math.ceil(H / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          nodes.push({
            x: spacing * c + rand(-spacing * 0.25, spacing * 0.25),
            y: spacing * r + rand(-spacing * 0.25, spacing * 0.25),
            r: rand(1, 2.8),
          });
        }
      }

      const lineEls: { el: Element; baseOpacity: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < spacing * 1.6) {
            const opacity = Math.max(0.12, 0.45 * (1 - dist / (spacing * 1.6)));
            const line = mkEl("line", {
              x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y,
              stroke: C.meshLine, "stroke-width": "0.5", "stroke-opacity": opacity.toFixed(3),
            });
            meshLinesG.appendChild(line);
            lineEls.push({ el: line, baseOpacity: opacity });
          }
        }
      }

      const nodeEls: Element[] = [];
      nodes.forEach(n => {
        const c = mkEl("circle", { cx: n.x, cy: n.y, r: n.r, fill: C.meshNode, opacity: "0.4" });
        meshNodesG.appendChild(c);
        nodeEls.push(c);
      });

      function pulseWeights() {
        const batch = Math.floor(rand(6, 14));
        for (let i = 0; i < batch; i++) {
          const idx = Math.floor(rand(0, lineEls.length));
          const { el: line, baseOpacity } = lineEls[idx];
          const isOrange = Math.random() > 0.5;
          gsap.timeline()
            .to(line, { attr: { "stroke-opacity": isOrange ? 0.6 : 0.45 }, stroke: isOrange ? C.primary : C.meshLine, "stroke-width": isOrange ? 1.8 : 1.2, duration: rand(0.6, 1.2), ease: "power2.out", delay: rand(0, 2.5) })
            .to(line, { attr: { "stroke-opacity": baseOpacity }, stroke: C.meshLine, "stroke-width": 0.5, duration: rand(2, 4), ease: "power1.inOut" });
        }
      }

      nodeEls.forEach(c => {
        gsap.to(c, { attr: { r: parseFloat(c.getAttribute("r")!) * rand(1.3, 1.8) }, opacity: rand(0.15, 0.45), duration: rand(3, 7), ease: "sine.inOut", repeat: -1, yoyo: true, delay: rand(0, 5) });
      });

      function flashNode() {
        const c = pick(nodeEls);
        gsap.timeline()
          .to(c, { fill: C.primary, opacity: 0.7, attr: { r: 4 }, duration: 0.4, ease: "power2.out" })
          .to(c, { fill: C.meshNode, opacity: 0.35, attr: { r: parseFloat(c.getAttribute("r")!) }, duration: 1.5, ease: "power1.inOut" });
      }

      gsap.timeline({ repeat: -1 })
        .call(pulseWeights).call(flashNode).to({}, { duration: 3.5 })
        .call(pulseWeights).call(flashNode).call(flashNode).to({}, { duration: 4 });

      // ═══ LAYER 2: RADAR CHARTS ═══
      const radarG = document.getElementById("ts-radar-layer")!;
      const rCx = W * 0.8, rCy = H * 0.32, rR = Math.min(W, H) * 0.18;
      const axes = ["Source", "Factual", "Bias", "Tone", "Context", "Evidence"];
      const nAxes = axes.length;

      for (let ring = 1; ring <= 4; ring++) {
        const r = (rR / 4) * ring;
        const pts: string[] = [];
        for (let a = 0; a < nAxes; a++) {
          const angle = (Math.PI * 2 / nAxes) * a - Math.PI / 2;
          pts.push(`${rCx + r * Math.cos(angle)},${rCy + r * Math.sin(angle)}`);
        }
        radarG.appendChild(mkEl("polygon", {
          points: pts.join(" "), fill: "none", stroke: C.mutedLight,
          "stroke-width": ring === 4 ? "0.7" : "0.3",
          "stroke-dasharray": ring < 4 ? "3,5" : "none", opacity: "0.6",
        }));
      }

      for (let a = 0; a < nAxes; a++) {
        const angle = (Math.PI * 2 / nAxes) * a - Math.PI / 2;
        radarG.appendChild(mkEl("line", {
          x1: rCx, y1: rCy, x2: rCx + rR * Math.cos(angle), y2: rCy + rR * Math.sin(angle),
          stroke: C.mutedLight, "stroke-width": "0.4", opacity: "0.5",
        }));
        const label = mkEl("text", {
          x: rCx + (rR + 16) * Math.cos(angle), y: rCy + (rR + 16) * Math.sin(angle) + 3,
          "text-anchor": "middle", "font-family": "'JetBrains Mono', monospace",
          "font-size": "9", fill: C.muted, opacity: "0.6", "letter-spacing": "0.04em",
        });
        label.textContent = axes[a];
        radarG.appendChild(label);
      }

      const dataFill = mkEl("polygon", { fill: C.primary, "fill-opacity": "0.08", stroke: C.primary, "stroke-width": "1.2", "stroke-opacity": "0.35" });
      radarG.appendChild(dataFill);

      const vertexDots: Element[] = [];
      for (let a = 0; a < nAxes; a++) {
        const dot = mkEl("circle", { r: "2.5", fill: C.primary, opacity: "0.5" });
        radarG.appendChild(dot);
        vertexDots.push(dot);
      }

      function radarPoints() {
        const pts: string[] = [], coords: { x: number; y: number }[] = [];
        for (let a = 0; a < nAxes; a++) {
          const angle = (Math.PI * 2 / nAxes) * a - Math.PI / 2;
          const r = rR * rand(0.3, 0.92);
          pts.push(`${rCx + r * Math.cos(angle)},${rCy + r * Math.sin(angle)}`);
          coords.push({ x: rCx + r * Math.cos(angle), y: rCy + r * Math.sin(angle) });
        }
        return { str: pts.join(" "), coords };
      }

      const initial = radarPoints();
      dataFill.setAttribute("points", initial.str);
      initial.coords.forEach((c, i) => {
        vertexDots[i].setAttribute("cx", String(c.x));
        vertexDots[i].setAttribute("cy", String(c.y));
      });

      function morphRadar() {
        const next = radarPoints();
        gsap.to(dataFill, { attr: { points: next.str }, duration: rand(3, 5), ease: "power1.inOut", onComplete: morphRadar });
        next.coords.forEach((c, i) => { gsap.to(vertexDots[i], { attr: { cx: c.x, cy: c.y }, duration: rand(3, 5), ease: "power1.inOut" }); });
      }
      gsap.delayedCall(1, morphRadar);

      // Mini radar (bottom-left)
      const r2Cx = W * 0.18, r2Cy = H * 0.72, r2R = Math.min(W, H) * 0.09;
      const r2Axes = ["Src", "Fact", "Bias"];
      const r2n = r2Axes.length;
      const r2G = mkEl("g", { opacity: "0.3" });
      radarG.appendChild(r2G);

      for (let ring = 1; ring <= 3; ring++) {
        const r = (r2R / 3) * ring;
        const pts: string[] = [];
        for (let a = 0; a < r2n; a++) {
          const angle = (Math.PI * 2 / r2n) * a - Math.PI / 2;
          pts.push(`${r2Cx + r * Math.cos(angle)},${r2Cy + r * Math.sin(angle)}`);
        }
        r2G.appendChild(mkEl("polygon", { points: pts.join(" "), fill: "none", stroke: C.mutedLight, "stroke-width": "0.3", opacity: "0.5" }));
      }
      for (let a = 0; a < r2n; a++) {
        const angle = (Math.PI * 2 / r2n) * a - Math.PI / 2;
        r2G.appendChild(mkEl("line", {
          x1: r2Cx, y1: r2Cy, x2: r2Cx + r2R * Math.cos(angle), y2: r2Cy + r2R * Math.sin(angle),
          stroke: C.mutedLight, "stroke-width": "0.3", opacity: "0.4",
        }));
        const lbl = mkEl("text", {
          x: r2Cx + (r2R + 10) * Math.cos(angle), y: r2Cy + (r2R + 10) * Math.sin(angle) + 3,
          "text-anchor": "middle", "font-family": "'JetBrains Mono', monospace",
          "font-size": "7", fill: C.muted, opacity: "0.5",
        });
        lbl.textContent = r2Axes[a];
        r2G.appendChild(lbl);
      }
      const r2Data = mkEl("polygon", { fill: C.blue, "fill-opacity": "0.06", stroke: C.blue, "stroke-width": "0.8", "stroke-opacity": "0.3" });
      r2G.appendChild(r2Data);
      function r2Points() {
        return Array.from({ length: r2n }, (_, a) => {
          const angle = (Math.PI * 2 / r2n) * a - Math.PI / 2;
          const r = r2R * rand(0.3, 0.9);
          return `${r2Cx + r * Math.cos(angle)},${r2Cy + r * Math.sin(angle)}`;
        }).join(" ");
      }
      r2Data.setAttribute("points", r2Points());
      function morphR2() { gsap.to(r2Data, { attr: { points: r2Points() }, duration: rand(3, 5), ease: "power1.inOut", onComplete: morphR2 }); }
      gsap.delayedCall(2, morphR2);

      // ═══ LAYER 3: DATA FLOW PARTICLES ═══
      const particleG = document.getElementById("ts-particle-layer")!;

      function createFlow() {
        const x0 = rand(-100, W + 100), y0 = rand(-50, H + 50);
        const x3 = rand(-100, W + 100), y3 = rand(-50, H + 50);
        const d = `M${x0},${y0} C${rand(W * 0.1, W * 0.9)},${rand(H * 0.1, H * 0.9)} ${rand(W * 0.1, W * 0.9)},${rand(H * 0.1, H * 0.9)} ${x3},${y3}`;
        const trail = mkEl("path", { d, fill: "none", stroke: Math.random() > 0.4 ? C.primaryFaint : C.mutedLight, "stroke-width": "0.6", "stroke-dasharray": "4,8", opacity: "0" });
        particleG.appendChild(trail);
        const dot = mkEl("circle", { r: rand(2, 4), fill: Math.random() > 0.3 ? C.primary : C.blue, opacity: "0", filter: "url(#ts-glow-soft)" });
        particleG.appendChild(dot);
        const mp = mkEl("path", { d, fill: "none", stroke: "none" });
        particleG.appendChild(mp);
        const dur = rand(5, 9);
        gsap.timeline({ onComplete: () => { trail.remove(); dot.remove(); mp.remove(); } })
          .to(trail, { opacity: 0.4, duration: 1.2, ease: "power2.out" }, 0)
          .to(dot, { opacity: 0.8, duration: 0.5 }, 0)
          .to(dot, { motionPath: { path: mp, align: mp, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "none" }, 0)
          .to(trail, { opacity: 0, duration: 2.5 }, dur - 2.5)
          .to(dot, { opacity: 0, duration: 2 }, dur - 2);
      }

      gsap.timeline({ repeat: -1 })
        .call(createFlow).to({}, { duration: 1.5 })
        .call(createFlow).to({}, { duration: 2 })
        .call(createFlow).to({}, { duration: 1.8 })
        .call(createFlow).to({}, { duration: 2.5 });

      // ═══ LAYER 4: TEXT PARSING FRAGMENTS ═══
      const textG = document.getElementById("ts-text-layer")!;
      const fragments = [
        "parsing...", "tokenize()", "NLP_score", "bias: 0.12",
        "source: verified", "weight: 0.87", "credibility++",
        "fact_check()", "sentiment: 0.3", "confidence: 92%",
        "evidence[3]", "cross_ref()", "normalize()",
        "score = Σ(w·f)", "reliability:", "accuracy: 0.94",
        "claims: 7", "verified: true", "bias_detect()",
        "source_rank()", "context.parse", "entity.match",
        "REUTERS", "AP_NEWS", "tone: neutral",
        "rank: A+", "score: 82", "updated: now",
        "await analyze()", "model.predict()", "embed(text)",
        "vector[128]", "similarity: 0.91", "cluster: news",
      ];

      function spawnText() {
        const text = pick(fragments);
        const x = rand(60, W - 60), y = rand(80, H - 80);
        const isHighlight = Math.random() > 0.6;
        const t = mkEl("text", { x, y, "font-size": rand(9, 13), fill: isHighlight ? C.primary : C.muted, opacity: "0", "letter-spacing": "0.04em" });
        t.textContent = text;
        textG.appendChild(t);
        gsap.timeline({ onComplete: () => t.remove() })
          .to(t, { opacity: isHighlight ? 0.55 : 0.3, duration: rand(0.8, 1.5), ease: "power2.out" })
          .to(t, { y: y + rand(-25, -50), opacity: 0, duration: rand(4, 7), ease: "power1.in" });
      }

      gsap.timeline({ repeat: -1 })
        .call(() => { for (let i = 0; i < 4; i++) setTimeout(spawnText, i * 300); })
        .to({}, { duration: 2 });

      // ═══ LAYER 5: FLOATING SCORE BADGES ═══
      const scoreG = document.getElementById("ts-score-layer")!;

      function spawnScore() {
        const score = Math.floor(rand(58, 97));
        const x = rand(80, W - 80), y = rand(80, H - 80);
        const r = rand(16, 24);
        const g = mkEl("g", { transform: `translate(${x}, ${y})`, opacity: "0" });
        const circumference = 2 * Math.PI * r;
        const dashLen = (score / 100) * circumference;
        g.appendChild(mkEl("circle", { cx: 0, cy: 0, r, fill: "none", stroke: C.mutedLight, "stroke-width": "0.5", opacity: "0.3" }));
        g.appendChild(mkEl("circle", { cx: 0, cy: 0, r, fill: "none", stroke: score > 75 ? C.primary : C.muted, "stroke-width": "1.2", "stroke-dasharray": `${dashLen} ${circumference}`, "stroke-dashoffset": circumference * 0.25, "stroke-linecap": "round", opacity: "0.5" }));
        const txt = mkEl("text", { x: 0, y: 4, "text-anchor": "middle", "font-size": "11", "font-weight": "500", fill: score > 75 ? C.primary : C.muted, opacity: "0.7" });
        txt.textContent = String(score);
        g.appendChild(txt);
        scoreG.appendChild(g);
        gsap.timeline({ onComplete: () => g.remove() })
          .to(g, { opacity: 0.7, duration: rand(1.5, 2.5), ease: "power2.out" })
          .to(g, { attr: { transform: `translate(${x}, ${y - 15})` }, opacity: 0, duration: rand(5, 8), ease: "power1.in" });
      }

      gsap.timeline({ repeat: -1 })
        .call(spawnScore).to({}, { duration: 3.5 })
        .call(spawnScore).to({}, { duration: 4 })
        .call(spawnScore).to({}, { duration: 3 });

      // ═══ STAGGERED FADE-IN ═══
      gsap.from("#ts-mesh-layer",    { opacity: 0, duration: 2.5, ease: "power2.out" });
      gsap.from("#ts-radar-layer",   { opacity: 0, duration: 2.5, delay: 0.3, ease: "power2.out" });
      gsap.from("#ts-particle-layer",{ opacity: 0, duration: 2.5, delay: 0.6, ease: "power2.out" });
      gsap.from("#ts-text-layer",    { opacity: 0, duration: 2.5, delay: 0.9, ease: "power2.out" });
      gsap.from("#ts-score-layer",   { opacity: 0, duration: 2.5, delay: 1.2, ease: "power2.out" });
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
      ["ts-orb-layer", "ts-mesh-lines", "ts-mesh-nodes", "ts-radar-layer", "ts-particle-layer", "ts-text-layer", "ts-score-layer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
      });
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}
    >
      <svg
        id="ts-bg-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <filter id="ts-glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ts-glow-wide" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="ts-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="65%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </radialGradient>
          <mask id="ts-vignette">
            <rect width="100%" height="100%" fill="url(#ts-fade)" />
          </mask>
        </defs>

        <g id="ts-orb-layer" />

        <g mask="url(#ts-vignette)">
          <g id="ts-mesh-layer" opacity="0.55">
            <g id="ts-mesh-lines" fill="none" />
            <g id="ts-mesh-nodes" />
          </g>
          <g id="ts-radar-layer" opacity="0.4" />
          <g id="ts-particle-layer" opacity="0.5" />
          <g id="ts-text-layer" fontFamily="'JetBrains Mono', monospace" />
          <g id="ts-score-layer" fontFamily="'JetBrains Mono', monospace" />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
