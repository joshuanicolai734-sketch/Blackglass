// Blackglass launch kit: OG images, profile image, nine posts (two carousels) and three vertical videos.
// Edit copy here, then run `node render.mjs` (see README.md). Captions, alt text and links live in KIT.md.
import { C, arrow, base, bezierSrc, foot, label, lockup, mark, octOutline, P, pane, screens } from "./lib.mjs";
import { teasers } from "./teaser.mjs";

const post = (body, css = "") => base({ w: 1080, h: 1350, body, css });
const slideNo = (n, of) => `${String(n).padStart(2, "0")} / ${String(of).padStart(2, "0")}`;
const cta = (text = "Join the preview list") => `<div class="btn"><span>${text}</span>${arrow}</div>`;

/* ---------- OG images (1200×630) ---------- */
const og = (title, sub, visual) => base({
  w: 1200, h: 630,
  body: `<div style="position:absolute;left:72px;top:64px;width:640px">${label("Blackglass")}
    <h1 class="display" style="font-size:78px;margin-top:34px">${title}</h1>
    <p style="margin-top:26px;font-size:28px;line-height:1.35;color:${C.text2}">${sub}</p></div>
    <div style="position:absolute;left:72px;bottom:56px">${lockup(30)}</div>
    <div style="position:absolute;right:40px;top:-60px">${octOutline(520)}</div>${visual}`,
});

export const ogImages = [
  { id: "og-home", out: "public/og/home.png", w: 1200, h: 630,
    html: og("Know what today asks of you.", "Programme, sessions, movement guides and food targets in one Android app.",
      `<div style="position:absolute;right:120px;top:70px">${pane({ src: screens.plan, width: 300, crop: 560 })}</div>`) },
  { id: "og-get", out: "public/og/get.png", w: 1200, h: 630,
    html: og("Be first on the Android build.", "Blackglass for Android is in development. Join the free preview list.",
      `<div style="position:absolute;right:120px;top:70px">${pane({ src: screens.move, width: 300, crop: 560, pos: "center 30%" })}</div>`) },
  { id: "og-coaching", out: "public/og/coaching.png", w: 1200, h: 630,
    html: og("Coaching with Josh.", "12 weeks of strength and physique coaching. NZ$59 a week. Based in Dunedin.",
      `<div style="position:absolute;right:100px;top:120px;width:330px;padding:36px;background:${C.bone};color:${C.ink};clip-path:polygon(22px 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%,0 22px)">
        <p class="mono" style="font-size:16px;color:#45484d">Founding coaching</p>
        <p class="display" style="font-size:80px;margin-top:22px">NZ$59</p>
        <p class="mono" style="font-size:16px;margin-top:14px;color:#45484d;line-height:1.6">a week for 12 weeks<br/>NZ$708 total</p></div>`) },
];

/* ---------- Profile image (1080×1080, circle-safe) ---------- */
export const profile = [
  { id: "profile", out: "social/exports/profile/blackglass-profile-1080.png", w: 1080, h: 1080,
    html: base({ w: 1080, h: 1080, bg: "flat", body: `<div style="position:absolute;inset:0;display:grid;place-items:center">${mark(560)}</div>` }) },
];

/* ---------- Posts (1080×1350) ---------- */
const headline = (text, size = 112, top = 150) => `<h2 class="display" style="position:absolute;left:72px;right:72px;top:${top}px;font-size:${size}px">${text}</h2>`;
const kicker = (text, top = 84) => `<div style="position:absolute;left:72px;top:${top}px">${label(text)}</div>`;
const body = (text, top, w = 820) => `<p style="position:absolute;left:72px;top:${top}px;width:${w}px;font-size:36px;line-height:1.4;color:${C.text2}">${text}</p>`;
const ticks = (items, top, left = 72) => `<div style="position:absolute;left:${left}px;top:${top}px;display:grid;gap:22px;font-size:32px;line-height:1.35">${items.map((i) => `<div class="tick"><span>${i}</span></div>`).join("")}</div>`;

export const posts = [
  // P01 · Brand introduction (pinned)
  { id: "p01-intro", out: "social/exports/posts/p01-intro.png", w: 1080, h: 1350, html: post(`
    <div style="position:absolute;left:50%;top:92px;transform:translateX(-50%)">${octOutline(780)}</div>
    <div style="position:absolute;left:50%;top:282px;transform:translateX(-50%)">${mark(400)}</div>
    ${headline(`Train with intent.`, 128, 790)}
    ${body("Blackglass puts your programme, today’s session, movement guides and food targets in one Android app. Built in Dunedin.", 930, 880)}
    ${foot("Android · in development")}`) },

  // P02 · Carousel A: what the app does (6 slides)
  { id: "p02-1", out: "social/exports/carousel-a/p02-1.png", w: 1080, h: 1350, html: post(`
    ${kicker(`Swipe · ${slideNo(1, 6)}`)}${headline("Know what<br/>today asks<br/>of you.", 150, 170)}
    <div style="position:absolute;right:72px;top:690px">${pane({ src: screens.today, width: 440, crop: 520 })}</div>
    ${body("Four screens from the Android build. Here’s what each one does for your training.", 740, 440)}
    ${foot()}`) },
  { id: "p02-2", out: "social/exports/carousel-a/p02-2.png", w: 1080, h: 1350, html: post(`
    ${kicker(`01 Today · ${slideNo(2, 6)}`)}${headline("Pick up where<br/>you left off.", 104)}
    <div style="position:absolute;left:72px;top:420px">${pane({ src: screens.today, width: 470, crop: 760 })}</div>
    ${ticks(["Resume the session you started", "05 exercises, 12 sets at a glance", "Preview the day before you begin"], 480, 600)}
    ${foot(slideNo(2, 6))}`) },
  { id: "p02-3", out: "social/exports/carousel-a/p02-3.png", w: 1080, h: 1350, html: post(`
    ${kicker(`02 Plan · ${slideNo(3, 6)}`)}${headline("See the<br/>whole week.", 104)}
    <div style="position:absolute;left:72px;top:420px">${pane({ src: screens.plan, width: 470, crop: 760 })}</div>
    ${ticks(["Every training day laid out", "Blocks: week 1 of 6, build", "Push, Pull and Legs, twice"], 480, 600)}
    ${foot(slideNo(3, 6))}`) },
  { id: "p02-4", out: "social/exports/carousel-a/p02-4.png", w: 1080, h: 1350, html: post(`
    ${kicker(`03 Technique · ${slideNo(4, 6)}`)}${headline("Know how the<br/>lift should look.", 104)}
    <div style="position:absolute;left:72px;top:420px">${pane({ src: screens.move, width: 470, crop: 760, pos: "center 42%" })}</div>
    ${ticks(["The movement, played back", "Phases: brace, reach, return", "Muscles worked and your record"], 480, 600)}
    ${foot(slideNo(4, 6))}`) },
  { id: "p02-5", out: "social/exports/carousel-a/p02-5.png", w: 1080, h: 1350, html: post(`
    ${kicker(`04 Fuel · ${slideNo(5, 6)}`)}${headline("Keep food<br/>in the picture.", 104)}
    <div style="position:absolute;left:72px;top:420px">${pane({ src: screens.today, width: 470, crop: 760, pos: "center 88%" })}</div>
    ${ticks(["Daily calorie target", "Protein goal beside your training", "Quick meal: estimate and log"], 480, 600)}
    ${foot(slideNo(5, 6))}`) },
  { id: "p02-6", out: "social/exports/carousel-a/p02-6.png", w: 1080, h: 1350, html: post(`
    <div style="position:absolute;right:-120px;top:120px">${octOutline(760)}</div>
    ${kicker(`Get Blackglass · ${slideNo(6, 6)}`)}${headline("Be first on<br/>the Android<br/>build.", 132, 170)}
    ${body("Blackglass is in development and not yet publicly available. Join the free preview list and you’ll hear when there’s a build to try.", 660, 860)}
    <div style="position:absolute;left:72px;top:930px">${cta()}</div>
    <p class="mono" style="position:absolute;left:72px;top:1050px;font-size:22px;color:${C.text3}">Link in bio · No iPhone app</p>
    ${foot(slideNo(6, 6))}`) },

  // P03 · Benefit
  { id: "p03-plan", out: "social/exports/posts/p03-plan.png", w: 1080, h: 1350, html: post(`
    ${kicker("Why it helps")}${headline("Walk in<br/>with a plan.", 132)}
    ${body("No notes to scroll at the rack. The day’s exercises and sets are waiting when you open the app.", 470, 470)}
    <div style="position:absolute;right:72px;top:430px">${pane({ src: screens.plan, width: 430, crop: 780 })}</div>
    ${foot()}`) },

  // P04 · Real app demonstration
  { id: "p04-technique", out: "social/exports/posts/p04-technique.png", w: 1080, h: 1350, html: post(`
    ${kicker("Exercise guide · Ab wheel rollout")}
    <div style="position:absolute;left:72px;top:170px;display:grid;gap:4px">
      <p class="display" style="font-size:132px">Brace.</p><p class="display" style="font-size:132px;color:${C.volt}">Reach.</p><p class="display" style="font-size:132px">Return.</p></div>
    <div style="position:absolute;right:72px;top:180px">${pane({ src: screens.move, width: 420, crop: 900, pos: "center 55%" })}</div>
    ${body("Every exercise guide plays the movement and breaks it into phases, so you learn the pattern and control each rep.", 660, 460)}
    ${foot()}`) },

  // P05 · Practical product tip
  { id: "p05-tip-resume", out: "social/exports/posts/p05-tip-resume.png", w: 1080, h: 1350, html: post(`
    ${kicker("Tip 01")}${headline("Stopped<br/>mid-session?<br/>Resume it.", 124)}
    ${body("Life interrupts. Blackglass keeps your unfinished session on Today, ready to continue where you stopped.", 620, 470)}
    <div style="position:absolute;right:72px;top:560px">${pane({ src: screens.today, width: 430, crop: 600 })}</div>
    <p class="mono" style="position:absolute;left:72px;top:1060px;font-size:22px;color:${C.text3}">Today → Resume workout</p>
    ${foot()}`) },

  // P06 · Carousel B: how to read your week (5 slides)
  { id: "p06-1", out: "social/exports/carousel-b/p06-1.png", w: 1080, h: 1350, html: post(`
    <div style="position:absolute;right:-160px;top:260px">${octOutline(820)}</div>
    ${kicker(`Guide · ${slideNo(1, 5)}`)}${headline("How to read<br/>your week in<br/>Blackglass.", 128, 170)}
    ${body("Three things on the Train screen tell you what’s coming. Swipe through.", 640, 620)}
    ${foot()}`) },
  { id: "p06-2", out: "social/exports/carousel-b/p06-2.png", w: 1080, h: 1350, html: post(`
    ${kicker(`01 Blocks · ${slideNo(2, 5)}`)}${headline("Training runs<br/>in blocks.", 112)}
    ${body("“Week 1 of 6 · Build” tells you where you are in the current programme.", 430, 900)}
    <div style="position:absolute;left:72px;top:640px">${pane({ src: screens.plan, width: 936, crop: 460, pos: "center 26%" })}</div>
    ${foot(slideNo(2, 5))}`) },
  { id: "p06-3", out: "social/exports/carousel-b/p06-3.png", w: 1080, h: 1350, html: post(`
    ${kicker(`02 Days · ${slideNo(3, 5)}`)}${headline("Every day<br/>has a job.", 112)}
    ${body("This plan runs Push, Pull and Legs twice through the week. Each row is one session.", 430, 900)}
    <div style="position:absolute;left:72px;top:640px">${pane({ src: screens.plan, width: 936, crop: 460, pos: "center 58%" })}</div>
    ${foot(slideNo(3, 5))}`) },
  { id: "p06-4", out: "social/exports/carousel-b/p06-4.png", w: 1080, h: 1350, html: post(`
    ${kicker(`03 Sessions · ${slideNo(4, 5)}`)}${headline("Know the size<br/>of the session.", 112)}
    ${body("Today shows the exercises and sets waiting for you. Here: five exercises, twelve sets.", 430, 900)}
    <div style="position:absolute;left:72px;top:640px">${pane({ src: screens.today, width: 936, crop: 460, pos: "center 22%" })}</div>
    ${foot(slideNo(4, 5))}`) },
  { id: "p06-5", out: "social/exports/carousel-b/p06-5.png", w: 1080, h: 1350, html: post(`
    <div style="position:absolute;right:-120px;top:120px">${octOutline(760)}</div>
    ${kicker(`Get Blackglass · ${slideNo(5, 5)}`)}${headline("Want it on<br/>your phone?", 132, 170)}
    ${body("Blackglass for Android is in development. Join the preview list and you’ll hear when there’s a build to try.", 520, 860)}
    <div style="position:absolute;left:72px;top:780px">${cta()}</div>
    <p class="mono" style="position:absolute;left:72px;top:900px;font-size:22px;color:${C.text3}">Link in bio · Free · No newsletter</p>
    ${foot(slideNo(5, 5))}`) },

  // P07 · Benefit: food
  { id: "p07-fuel", out: "social/exports/posts/p07-fuel.png", w: 1080, h: 1350, html: post(`
    ${kicker("Why it helps")}${headline("Keep food<br/>in the picture.", 124)}
    <div style="position:absolute;left:72px;top:500px">${pane({ src: screens.today, width: 460, crop: 620, pos: "center 86%" })}</div>
    ${ticks(["A daily calorie target", "A protein goal beside your training", "Quick meal: estimate it and log it"], 560, 590)}
    ${foot()}`) },

  // P08 · Name transparency
  { id: "p08-formerly", out: "social/exports/posts/p08-formerly.png", w: 1080, h: 1350, html: post(`
    ${kicker("A note on the name")}
    <p class="display" style="position:absolute;left:72px;top:170px;font-size:112px;color:${C.grey}"><s style="text-decoration-thickness:6px">Obsidian</s></p>
    ${headline("Now<br/>Blackglass.", 140, 290)}
    ${body("Same app, new name. Blackglass was previously called Obsidian Fitness, and some screens in the current Android build still show the earlier name.", 600, 900)}
    <div style="position:absolute;left:72px;top:840px">${pane({ src: screens.today, width: 936, crop: 260, pos: "center 5%" })}</div>
    ${foot()}`) },

  // P09 · Getting started
  { id: "p09-start", out: "social/exports/posts/p09-start.png", w: 1080, h: 1350, html: post(`
    ${kicker("Getting started")}${headline("How to get<br/>Blackglass.", 128)}
    <div style="position:absolute;left:72px;right:72px;top:470px;display:grid;gap:16px">
      ${[["01", "Tap the link in our bio", "Open Get Blackglass."], ["02", "Join the preview list", "Name and email. Free, no newsletter."], ["03", "Hear when it’s ready", "Josh emails you when there’s an Android build to try."]]
        .map(([n, t, s]) => `<div style="padding:30px 34px;background:linear-gradient(135deg,#222429 0 50%,#1c1d21 50%);clip-path:polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)">
          <p class="mono" style="font-size:20px;color:${C.volt}">${n}</p><p style="font-size:40px;font-weight:700;letter-spacing:-.02em;margin-top:14px">${t}</p><p style="font-size:28px;color:${C.text2};margin-top:6px">${s}</p></div>`).join("")}
    </div>
    <p style="position:absolute;left:72px;right:72px;top:1105px;font-size:26px;line-height:1.45;color:${C.text3}">No iPhone app. Want a coach now? Josh’s 12-week coaching is open: NZ$59 a week.</p>
    ${foot()}`) },
];

/* ---------- Vertical videos (1080×1920, 30 fps). seek(t) is a pure function of time in seconds. ---------- */
const video = (bodyHtml, seekSrc, css = "") => base({ w: 1080, h: 1920, body: bodyHtml, css, bg: "light" })
  .replace("</body>", `<script>${bezierSrc}\nconst $=s=>document.querySelector(s);\nwindow.seek=function(t){${seekSrc}};</script></body>`);
const endCard = (line) => `<div id="end" style="position:absolute;inset:0;opacity:0">
  <div style="position:absolute;left:72px;top:360px">${lockup(64)}</div>
  <h2 class="display" style="position:absolute;left:72px;right:140px;top:560px;font-size:120px">${line}</h2>
  <p style="position:absolute;left:72px;right:160px;top:980px;font-size:40px;line-height:1.35;color:${C.text2}">Android app in development. Join the free preview list.</p>
  <div style="position:absolute;left:72px;top:1180px">${cta()}</div>
  <p class="mono" style="position:absolute;left:72px;top:1310px;font-size:26px;color:${C.text3}">Link in bio · blackglass.co.nz</p></div>`;

// Intro mark reused in V1: rim drawn by two mask strokes, pane set, facet wipe, light sweep, glint.
const introMark = `<svg id="mk" viewBox="0 0 88 88" width="440" height="440" style="position:absolute;left:320px;top:620px;overflow:visible">
  <defs><mask id="rm" maskUnits="userSpaceOnUse" x="-10" y="-10" width="108" height="108"><path class="rs" d="M10.361 13.189 20.05 3.5H67.95L84.5 20.05V67.95L74.811 77.639" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="147" stroke-dashoffset="147"/><path class="rs" d="M13.189 10.361 3.5 20.05V67.95L20.05 84.5H67.95L77.639 74.811" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="147" stroke-dashoffset="147"/></mask>
  <clipPath id="fc"><path id="fw" d="M-400 400 400-400H-400Z"/></clipPath><clipPath id="oc"><path d="${P.pane}"/></clipPath>
  <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="8" y2="8"><stop offset="0" stop-color="#F4F5EF" stop-opacity="0"/><stop offset=".5" stop-color="#F4F5EF" stop-opacity=".36"/><stop offset="1" stop-color="#F4F5EF" stop-opacity="0"/></linearGradient></defs>
  <g id="dv"><path id="gr" fill="${C.ink}" fill-rule="evenodd" opacity="0" d="M-2000 -2000H2088V2088H-2000ZM7 22.101 22.101 7H65.899L81 22.101V65.899L65.899 81H22.101L7 65.899Z"/>
  <path id="pn" fill="${C.pane}" opacity="0" d="${P.pane}"/><path id="fa" clip-path="url(#fc)" fill="${C.facet}" d="${P.facet}"/><path id="gl" fill="${C.volt}" opacity="0" d="${P.glint}"/>
  <g clip-path="url(#oc)"><path id="sw" fill="url(#lg)" d="M-100 100 100-100h16L-84 100Z"/></g>
  <path mask="url(#rm)" fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></g></svg>`;

export const videos = [
  { id: "v1-train-with-intent", out: "social/exports/video/v1-train-with-intent.mp4", w: 1080, h: 1920, duration: 12,
    html: video(`${introMark}
      <div id="wm" style="position:absolute;left:72px;right:72px;top:1140px;display:flex;justify-content:center;clip-path:inset(0 100% 0 0)">
        <svg viewBox="118 24 409.593 40" width="820"><path fill="${C.bone}" d="${P.wordmark}"/></svg></div>
      <div id="hero" style="position:absolute;inset:0;opacity:0">
        <div style="position:absolute;left:72px;top:250px">${label("Training app · Built in Dunedin")}</div>
        <h1 class="display" style="position:absolute;left:72px;right:140px;top:330px;font-size:150px"><span class="ln" style="display:block">Know what</span><span class="ln" style="display:block">today asks</span><span class="ln" style="display:block">of you.</span></h1>
        <div id="ph" style="position:absolute;left:230px;top:900px">${pane({ src: screens.plan, width: 620, crop: 760 })}</div></div>
      ${endCard("Train with<br/>intent.")}`,
    `const d=(s,v)=>s.forEach(e=>e.setAttribute('stroke-dashoffset',v));
     d(document.querySelectorAll('.rs'),147*(1-eIO(k(t,.25,1.05))));
     const gone=1-k(t,3.5,3.65);
     $('#pn').setAttribute('opacity',eIO(k(t,.8,1.1))*gone);$('#fa').setAttribute('opacity',gone);
     const f=14.55+(45-14.55)*eOut(k(t,1.0,1.4));$('#fw').setAttribute('transform','translate('+f+' '+f+')');
     const s=-8+96*eIO(k(t,1.5,2.0));$('#sw').setAttribute('transform','translate('+s+' '+s+')');
     $('#gl').setAttribute('opacity',t>=1.62?gone:0);
     $('#wm').style.clipPath='inset(0 '+(100-100*eOut(k(t,2.2,2.8)))+'% 0 0)';
     const dv=k(t,3.5,4.2), sc=1+60*eIn(dv);
     $('#gr').setAttribute('opacity',t>=3.5?1:0);
     $('#dv').setAttribute('transform','translate(44 44) scale('+sc+') translate(-44 -44)');
     document.body.querySelector('.bg').style.opacity=t>=3.5?0:1;$('#wm').style.opacity=t>=3.5?0:1;
     $('#hero').style.opacity=t>=3.5?1:0;
     document.querySelectorAll('.ln').forEach((e,i)=>{const p=eOut(k(t,3.9+i*.12,4.7+i*.12));e.style.opacity=p;e.style.transform='translateY('+(40*(1-p))+'px)';});
     const pp=eOut(k(t,4.6,5.6));$('#ph').style.transform='translateY('+(260*(1-pp))+'px)';$('#ph').style.opacity=pp;
     $('#ph .pane-in img').style.objectPosition='center '+(8*eIO(k(t,5.8,8.2)))+'%';
     const out=k(t,8.3,8.7);$('#hero').style.opacity=t<3.5?0:1-out;$('#end').style.opacity=eOut(k(t,8.6,9.2));
     $('#mk').style.display=t>=4.2?'none':'block';`) },

  { id: "v2-plan-to-last-set", out: "social/exports/video/v2-plan-to-last-set.mp4", w: 1080, h: 1920, duration: 15,
    html: video(`<div style="position:absolute;right:-220px;top:360px">${octOutline(1100)}</div>
      <h1 id="hook" class="display" style="position:absolute;left:72px;right:140px;top:300px;font-size:140px">Your whole<br/>week. One<br/>app.</h1>
      ${[["today", screens.today, "01 Today", "Pick up where<br/>you left off.", "top"], ["plan", screens.plan, "02 Plan", "See the<br/>whole week.", "top"], ["move", screens.move, "03 Technique", "Brace. Reach.<br/>Return.", "center 45%"]]
        .map(([id, src, k, h, pos]) => `<div id="s-${id}" style="position:absolute;inset:0;opacity:0">
          <div style="position:absolute;left:72px;top:220px">${label(k)}</div>
          <h2 class="display" style="position:absolute;left:72px;right:140px;top:300px;font-size:112px">${h}</h2>
          <div class="pw" style="position:absolute;left:190px;top:620px">${pane({ src, width: 700, crop: 900, pos })}</div></div>`).join("")}
      ${endCard("From the plan<br/>to the last set.")}`,
    `const hk=k(t,.1,.7), ho=k(t,1.6,2.0);$('#hook').style.opacity=eOut(hk)*(1-ho);$('#hook').style.transform='translateY('+(30*(1-eOut(hk)))+'px)';
     const seg=[['today',2.0,5.5],['plan',5.5,9.0],['move',9.0,12.5]];
     seg.forEach(([id,a,b],i)=>{const el=$('#s-'+id), pw=el.querySelector('.pw'), img=el.querySelector('img');
       const inn=eOut(k(t,a,a+.7)), out=k(t,b-.25,b);
       el.style.opacity=t<a||t>b?0:1-out;
       pw.style.clipPath='polygon(0 0,'+(220*inn)+'% 0,0 '+(220*inn)+'%)';
       el.querySelector('h2').style.transform='translateY('+(34*(1-inn))+'px)';
       img.style.objectPosition=id==='move'?'center '+(45+10*eIO(k(t,a+.8,b)))+'%':'center '+(30*eIO(k(t,a+.8,b)))+'%';});
     $('#end').style.opacity=eOut(k(t,12.5,13.1));`) },

  { id: "v3-brace-reach-return", out: "social/exports/video/v3-brace-reach-return.mp4", w: 1080, h: 1920, duration: 12,
    html: video(`<div id="lb" style="position:absolute;left:72px;top:220px">${label("Exercise guide · Ab wheel rollout")}</div>
      <div id="pw" style="position:absolute;left:72px;right:72px;top:620px;height:820px;overflow:hidden">
        ${pane({ src: screens.move, width: 936, crop: 820, pos: "center 58%" })}</div>
      ${["Brace.", "Reach.", "Return."].map((w, i) => `<p class="display ph" id="ph${i}" style="position:absolute;left:72px;top:300px;font-size:190px;opacity:0;${i === 1 ? `color:${C.volt}` : ""}">${w}</p>`).join("")}
      <p id="cap" style="position:absolute;left:72px;right:160px;top:1480px;font-size:40px;line-height:1.35;color:${C.text2};opacity:0">Every exercise guide plays the movement and breaks it into phases.</p>
      ${endCard("Learn the pattern.<br/>Control the rep.")}`,
    `const inn=eOut(k(t,.2,1.0));$('#pw').style.opacity=inn;$('#pw').style.transform='translateY('+(80*(1-inn))+'px) scale('+(1+.12*eIO(k(t,1,8)))+')';
     ['0','1','2'].forEach((i,n)=>{const a=1.0+n*2.2, p=eOut(k(t,a,a+.5)), o=n<2?k(t,a+1.9,a+2.2):0;$('#ph'+i).style.opacity=p*(1-o);$('#ph'+i).style.transform='translateY('+(30*(1-p))+'px)';});
     $('#cap').style.opacity=eOut(k(t,1.6,2.2))*(1-k(t,8.1,8.5));
     const out=k(t,8.3,8.7);$('#pw').style.opacity=inn*(1-out);$('#ph2').style.opacity=Math.min(+$('#ph2').style.opacity,1-out);
     $('#lb').style.opacity=1-out;$('#end').style.opacity=eOut(k(t,8.6,9.2));`) },
];

export const all = [...ogImages, ...profile, ...posts, ...videos, ...teasers];
