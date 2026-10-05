/* ============================================================
   Shri Kshetra Ganagapur — front-end app
   All bookings/payments are simulated and stored in localStorage
   until a real backend + payment gateway is connected.
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3200); };

  /* ---------- Time (always IST) ---------- */
  function ist() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(new Date()).map(x => [x.type, x.value]));
    const h = +p.hour, m = +p.minute;
    return { h, m, s: +p.second, mins: h * 60 + m, dow: p.weekday, ymd: `${p.year}-${p.month}-${p.day}` };
  }
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt12 = t => { let [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; };
  const fmtDur = mins => mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60 ? (mins % 60) + " m" : ""}`.trim();
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  /* ---------- Crowd model (heuristic estimate) ---------- */
  const HOUR_CURVE = { 2: 25, 3: 30, 4: 30, 5: 40, 6: 55, 7: 65, 8: 75, 9: 80, 10: 85, 11: 90, 12: 70, 13: 20, 14: 35, 15: 40, 16: 45, 17: 55, 18: 65, 19: 80, 20: 70, 21: 45 };
  function isFestival(dateStr) { return FESTIVALS.some(f => dateStr >= f.date && dateStr <= (f.end || f.date)); }
  function crowdAt(hour, dow, dateStr) {
    let v = HOUR_CURVE[hour] ?? 10;
    const mult = { Thu: 1.55, Sun: 1.3, Sat: 1.15, Mon: 1, Tue: .9, Wed: .9, Fri: 1 }[dow] || 1;
    v *= mult;
    if (isFestival(dateStr)) v *= 1.5;
    return Math.min(100, Math.round(v));
  }
  function crowdInfo(v) {
    if (v < 45) return { label: "Low", wait: "10–20 min", color: "var(--green)", cls: "g" };
    if (v < 75) return { label: "Medium", wait: "20–45 min", color: "var(--yellow)", cls: "y" };
    return { label: "Heavy", wait: "1–2 hours", color: "var(--red)", cls: "r" };
  }

  /* ---------- Live status ---------- */
  function currentSlot(mins) {
    const i = SCHEDULE.findIndex(s => mins >= toMin(s.start) && mins < toMin(s.end));
    const next = SCHEDULE.find(s => toMin(s.start) > mins) || SCHEDULE[0];
    return { cur: i >= 0 ? SCHEDULE[i] : null, idx: i, next };
  }

  function renderStatus() {
    const t = ist();
    $("#clock").textContent = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
    const { cur, next } = currentSlot(t.mins);
    const open = cur && cur.darshan;
    const pill = $("#openPill");
    pill.textContent = open ? "● Open for Darshan" : "● Darshan Closed";
    pill.classList.toggle("closed", !open);
    $("#nowRitual").textContent = cur ? cur.name : "Temple closed for the night";
    $("#nowRange").textContent = cur ? `${fmt12(cur.start)} – ${fmt12(cur.end)}` : "Opens 2:30 AM with Kakad Arati";
    let diff = toMin(next.start) - t.mins; if (diff <= 0) diff += 1440;
    $("#nextRitual").textContent = `${next.icon} ${next.name}`;
    $("#nextIn").textContent = `at ${fmt12(next.start)} · in ${fmtDur(diff)}`;

    const v = open ? crowdAt(t.h, t.dow, t.ymd) : 0;
    const ci = crowdInfo(v);
    $("#crowdLabel").textContent = open ? ci.label : "—";
    $("#crowdWait").textContent = open ? ci.wait : "—";
    $("#crowdFill").style.width = v + "%";
    const g = $("#gaugeFill"); g.style.width = Math.max(v, 8) + "%"; g.style.background = ci.color;
    $("#gaugeLabel").textContent = open ? `${ci.label} · ~${ci.wait}` : "Darshan closed now";

    // timeline highlight
    $$("#timeline li").forEach((li, i) => {
      const s = SCHEDULE[i];
      li.classList.toggle("now", t.mins >= toMin(s.start) && t.mins < toMin(s.end));
      li.classList.toggle("past", t.mins >= toMin(s.end));
    });

    // live darshan label
    const arati = cur && /arati|mangalarati/i.test(cur.name);
    $("#liveTitle").textContent = arati ? `${cur.name} — streaming now` : "Live Darshan";
    $("#liveSub").textContent = arati ? "Join devotees across the world" : `Next arati stream: ${SCHEDULE.find(s => /arati/i.test(s.name) && toMin(s.start) > t.mins)?.name || "Kakad Arati"}`;
  }

  function renderTimeline() {
    $("#timeline").innerHTML = SCHEDULE.map(s => `
      <li><span class="tl-time">${fmt12(s.start)}</span><span class="tl-dot">${s.icon}</span>
        <div class="tl-body"><span class="tl-tag">${s.darshan ? "Darshan open" : "Closed"}</span><b>${s.name}</b><p>${s.desc}</p></div></li>`).join("");
    const t = ist();
    const d = new Date(t.ymd + "T00:00:00");
    const day = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const fest = FESTIVALS.find(f => t.ymd >= f.date && t.ymd <= (f.end || f.date));
    $("#todayLabel").innerHTML = `<b>${day}</b>${t.dow === "Thu" ? " · <b>Guruvar</b> — Palakhi seva tonight, expect heavy crowds" : ""}${fest ? ` · 🪔 <b>${fest.name}</b>` : ""}. Timings change on festivals, Purnima & Amavasya.`;
  }

  function renderCrowdChart() {
    const t = ist(), c = $("#crowdChart"), dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth || 320, h = 90;
    c.width = w * dpr; c.height = h * dpr; c.style.height = h + "px";
    const x = c.getContext("2d"); x.scale(dpr, dpr);
    const hours = Object.keys(HOUR_CURVE).map(Number);
    const bw = w / hours.length;
    let best = null;
    hours.forEach((hr, i) => {
      const closed = hr === 13;
      const v = closed ? 0 : crowdAt(hr, t.dow, t.ymd);
      if (!closed && hr >= 14 && hr <= 18 && (!best || v < best.v)) best = { hr, v };
      const bh = (v / 100) * (h - 18);
      x.fillStyle = hr === t.h ? "#e2711d" : v >= 75 ? "#e9a395" : v >= 45 ? "#efd08a" : "#9fd3b0";
      x.beginPath(); x.roundRect ? x.roundRect(i * bw + 2, h - 14 - bh, bw - 4, bh, 3) : x.rect(i * bw + 2, h - 14 - bh, bw - 4, bh); x.fill();
      if (i % 3 === 0) { x.fillStyle = "#5e4a3e"; x.font = "10px Mukta, sans-serif"; x.fillText((hr % 12 || 12) + (hr < 12 ? "a" : "p"), i * bw + 2, h - 2); }
    });
    $("#bestTime").textContent = best ? `${fmt12(best.hr + ":00")} – ${fmt12(best.hr + 2 + ":00")}` : "2:30 PM – 4:30 PM";
  }

  /* ---------- Digital token ---------- */
  function tokenState() {
    const tk = store.get("gg_token", null);
    if (!tk || tk.day !== ist().ymd) return null;
    const elapsed = (Date.now() - tk.issued) / 60000;
    const current = Math.min(tk.num, tk.startCurrent + Math.floor(elapsed / 1.2));
    return { ...tk, current };
  }
  function renderToken() {
    const box = $("#tokenBox"), tk = tokenState();
    if (!tk) {
      box.innerHTML = `<button class="btn-maroon" id="getToken">🎟️ Get Darshan Token</button>`;
      $("#getToken").onclick = () => {
        const t = ist(), { cur } = currentSlot(t.mins);
        if (!cur || !cur.darshan) return toast("Darshan is closed right now — tokens open with the next darshan window.");
        const startCurrent = 80 + Math.floor(Math.random() * 40);
        const ahead = Math.round(crowdAt(t.h, t.dow, t.ymd) / 3) + 4;
        store.set("gg_token", { day: t.ymd, num: startCurrent + ahead, startCurrent, issued: Date.now() });
        renderToken(); toast("Token issued. We'll alert you as your turn approaches 🔔");
        if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
      };
      return;
    }
    const left = tk.num - tk.current, pct = Math.round(((tk.current - tk.startCurrent) / (tk.num - tk.startCurrent)) * 100);
    box.innerHTML = `
      <div class="token-display"><div class="mine"><small>Your token</small><b>A${tk.num}</b></div><div><small>Now serving</small><b>A${tk.current}</b></div></div>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <p>${left > 0 ? `⏳ About <b>${Math.max(2, Math.round(left * 1.2))} minutes</b> · ${left} devotees ahead` : "🙏 <b>Your turn — please proceed to the darshan queue gate.</b>"}</p>
      <button class="btn-ghost sm" id="dropToken">Cancel token</button>`;
    $("#dropToken").onclick = () => { store.set("gg_token", null); renderToken(); };
    if (left <= 5 && left > 0 && !tk.notified) {
      tk.notified = true; store.set("gg_token", tk);
      toast(`🔔 Your darshan token A${tk.num} is approaching`);
      if ("Notification" in window && Notification.permission === "granted") new Notification("Shri Kshetra Ganagapur", { body: `Your darshan token A${tk.num} is approaching.` });
    }
  }

  /* ---------- Sevas ---------- */
  function renderSevas() {
    $("#sevaGrid").innerHTML = SEVAS.map(s => `
      <article class="seva reveal">
        <div class="seva-img"><img src="${s.img}" alt="" loading="lazy">${s.popular ? '<span class="badge">Popular</span>' : ""}</div>
        <div class="seva-body">
          <h3>${s.name}</h3>
          <div class="seva-meta"><span>🕐 ${s.time}</span><span>⏳ ${s.dur}</span></div>
          <p>${s.desc}</p>
          <div class="seva-foot"><span class="price">${inr(s.price)}</span><button class="btn-maroon sm" data-seva="${s.id}">Book</button></div>
        </div>
      </article>`).join("");
  }

  /* ---------- Audio (gentle tanpura drone as preview) ---------- */
  let audio = null;
  function stopAudio() {
    if (!audio) return;
    const { ctx, gain } = audio; gain.gain.setTargetAtTime(0, ctx.currentTime, .4);
    setTimeout(() => ctx.close(), 1500); audio = null;
    $$("#audioList li").forEach(li => { li.classList.remove("playing"); $("button", li).textContent = "▶"; });
  }
  function playDrone(li) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return toast("Audio not supported in this browser");
    const ctx = new AC(), gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
    [138.6, 207.9, 277.2, 69.3].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = i === 3 ? "sine" : "triangle"; o.frequency.value = f; g.gain.value = [.25, .18, .12, .3][i];
      lfo.frequency.value = .15 + i * .07; lg.gain.value = .08; lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(gain); o.start(); lfo.start();
    });
    gain.gain.setTargetAtTime(.18, ctx.currentTime, 1);
    audio = { ctx, gain };
    li.classList.add("playing"); $("button", li).textContent = "❚❚";
  }
  function renderAudio() {
    $("#audioList").innerHTML = AUDIO.map((a, i) => `<li data-i="${i}"><button aria-label="Play">▶</button><div><b>${a.t}</b><small>${a.s}</small></div><span class="eq"><i></i><i></i><i></i></span></li>`).join("");
    $("#audioList").addEventListener("click", e => {
      const li = e.target.closest("li"); if (!li) return;
      const was = li.classList.contains("playing"); stopAudio();
      if (!was) { playDrone(li); toast(`Playing tanpura preview — full "${AUDIO[li.dataset.i].t}" recording to be added`); }
    });
    $("#liveBtn").onclick = () => toast("Live stream will be available once the temple enables broadcasting 🙏");
  }

  /* ---------- Map ---------- */
  let map, markers = {};
  const dirUrl = p => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.q)}`;
  const viewUrl = p => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q)}`;
  const CAT_ICON = { temple: "🛕", transport: "🚆", facility: "🏨" };
  function renderMap() {
    const list = $("#placeList");
    list.innerHTML = PLACES.map(p => `
      <div class="place" data-id="${p.id}" data-cat="${p.cat}">
        <img src="${p.img}" alt="" loading="lazy">
        <div><b>${p.name}</b><p>${p.desc}</p>
          <div class="acts"><a href="${viewUrl(p)}" target="_blank" rel="noopener">📍 View</a><a href="${dirUrl(p)}" target="_blank" rel="noopener">🚗 Directions</a></div></div>
      </div>`).join("");

    if (!window.L) { $("#map").innerHTML = '<p style="padding:20px">Map could not load — check your connection.</p>'; return; }
    map = L.map("map", { scrollWheelZoom: false }).setView([17.1745, 76.5260], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
    PLACES.forEach(p => {
      const icon = L.divIcon({ className: "", html: `<div class="pin ${p.cat}"><span>${CAT_ICON[p.cat]}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });
      markers[p.id] = L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`
        <div class="pop"><img src="${p.img}" alt=""><b>${p.name}</b><br><a href="${dirUrl(p)}" target="_blank" rel="noopener">🚗 Get directions</a></div>`);
      markers[p.id].on("click", () => selectPlace(p.id, false));
    });
    list.addEventListener("click", e => { if (e.target.closest("a")) return; const el = e.target.closest(".place"); if (el) selectPlace(el.dataset.id, true); });
    $("#mapFilters").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$("#mapFilters .chip").forEach(c => c.classList.toggle("on", c === b));
      const cat = b.dataset.cat, shown = [];
      PLACES.forEach(p => {
        const on = cat === "all" || p.cat === cat;
        $(`.place[data-id="${p.id}"]`).hidden = !on;
        if (on) { markers[p.id].addTo(map); shown.push([p.lat, p.lng]); } else markers[p.id].remove();
      });
      if (shown.length) map.fitBounds(shown, { padding: [40, 40], maxZoom: 16 });
    });
  }
  function selectPlace(id, fly) {
    const p = PLACES.find(x => x.id === id); if (!p) return;
    $$(".place").forEach(el => el.classList.toggle("on", el.dataset.id === id));
    const el = $(`.place[data-id="${id}"]`); el && el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (map && fly) { map.flyTo([p.lat, p.lng], 16, { duration: .8 }); markers[id].openPopup(); }
  }
  function goToPlace(id) { $("#explore").scrollIntoView({ behavior: "smooth" }); setTimeout(() => selectPlace(id, true), 600); }

  /* ---------- Teerthas & nearby ---------- */
  function renderTeerthas() {
    $("#teerthaList").innerHTML = TEERTHAS.map(t => `<li><b>${t.n}</b><span>${t.m}</span></li>`).join("");
    const near = ["sangam", "sangameshwar", "kalleshwar", "hanuman"].map(id => PLACES.find(p => p.id === id));
    const dist = { sangam: "≈2 km from the Math", sangameshwar: "At the confluence", kalleshwar: "On the Bhima bank", hanuman: "On the village approach" };
    $("#nearbyGrid").innerHTML = near.map(p => `<div class="near reveal" data-place="${p.id}"><img src="${p.img}" alt="" loading="lazy"><div><b>${p.name}</b><span>📍 ${dist[p.id]}</span></div></div>`).join("");
  }

  /* ---------- Festivals ---------- */
  function renderFestivals() {
    const today = ist().ymd;
    const upcoming = FESTIVALS.filter(f => (f.end || f.date) >= today);
    $("#festGrid").innerHTML = upcoming.map(f => {
      const d = new Date(f.date + "T00:00:00");
      const range = f.end ? `${d.getDate()}–${new Date(f.end + "T00:00:00").getDate()}` : d.getDate();
      return `<article class="fest ${f.big ? "big" : ""} reveal" data-fest="${f.date}">
        <div class="fest-date"><small>${d.toLocaleDateString("en-IN", { month: "short" })}</small><b${f.end ? ' class="rng"' : ""}>${range}</b><small>${d.getFullYear()}</small></div>
        <div><h3>${f.name}</h3><p>${f.desc}</p><span class="crowd-tag ${f.crowd}">${f.crowd === "high" ? "Heavy crowd expected" : "Moderate crowd"}</span></div></article>`;
    }).join("");
    const next = upcoming.find(f => f.date > today) || upcoming[0];
    if (next) {
      const tick = () => {
        const ms = new Date(next.date + "T06:00:00+05:30") - Date.now();
        if (ms <= 0) { $("#countdown").innerHTML = `<span class="cd-l">🪔 <b style="display:inline;font-size:1.1rem">${next.name}</b> is today</span>`; return; }
        const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
        $("#countdown").innerHTML = `<span class="cd-l">Next: <br><b style="font-size:1.05rem;display:inline">${next.name}</b></span><div class="cd-n"><b>${d}</b><small>days</small></div><div class="cd-n"><b>${h}</b><small>hrs</small></div><div class="cd-n"><b>${m}</b><small>min</small></div>`;
      };
      tick(); setInterval(tick, 30000);
    }
    $("#festGrid").addEventListener("click", e => {
      const el = e.target.closest(".fest"); if (!el) return;
      const f = FESTIVALS.find(x => x.date === el.dataset.fest);
      openModal(`<p class="eyebrow">Festival</p><h2>${f.name}</h2>
        <p>${new Date(f.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${f.end ? " – " + new Date(f.end + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : ""}</p>
        <p>${f.desc}</p>
        <div class="summary"><div><span>Crowd forecast</span><b>${f.crowd === "high" ? "🔴 Heavy — 1–3 hr wait" : "🟡 Moderate"}</b></div><div><span>Accommodation</span><b>Book 3–4 weeks ahead</b></div><div><span>Special sevas</span><b>Palakhi, Maha Pooja, Annadana</b></div></div>
        <div class="modal-actions"><button class="btn-ghost" data-open="stayAny">🏨 Find a room</button><button class="btn-maroon" data-open="seva">🙏 Book a seva</button></div>`);
    });
  }

  /* ---------- Planner ---------- */
  function renderPlanner() {
    const f = $("#planForm"), now = new Date();
    const pad = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    const a = new Date(now); a.setDate(a.getDate() + ((5 - a.getDay() + 7) % 7 || 7)); a.setHours(8, 0, 0, 0);
    const b = new Date(a); b.setDate(b.getDate() + 1); b.setHours(20, 0, 0, 0);
    f.arr.value = pad(a); f.dep.value = pad(b);
    f.addEventListener("submit", e => {
      e.preventDefault();
      const arr = new Date(f.arr.value), dep = new Date(f.dep.value), n = +f.n.value || 1, elders = f.elders.checked;
      if (!(dep > arr)) return toast("Departure must be after arrival");
      const pool = [
        [5 * 60, "🌅 Sangam snana & Audumbar puja"], [6 * 60, "🔔 Guru Arati at the Math"], [7 * 60, "🙏 Nirguna Paduka darshan"],
        [8 * 60 + 30, "🌸 Your seva / Rudrabhisheka"], [10 * 60, "🛕 Sangameshwar & Kalleshwar temples"], [11 * 60 + 30, "🔥 Maha Mangalarati"],
        [12 * 60, "🍚 Mahaprasad at Annadana Hall"], [13 * 60, "🌿 Rest" + (elders ? " (recommended for elders)" : "")], [14 * 60 + 30, "🙏 Afternoon darshan (calmest time)"],
        [16 * 60, elders ? "📿 Guru Charitra parayana in the mandapa" : "💧 Ashta Teertha circuit"], [18 * 60, "🛍️ Temple street & prasadam shopping"],
        [19 * 60 + 30, "🔥 Evening Maha Mangalarati"], [21 * 60, "🌙 Shejarati"],
      ];
      const days = []; let cursor = new Date(arr), i = 1, firstDarshanDone = false;
      while (cursor < dep && i <= 5) {
        const dayStart = new Date(cursor); dayStart.setHours(0, 0, 0, 0);
        const from = i === 1 ? arr.getHours() * 60 + arr.getMinutes() : 4 * 60 + 30;
        const lastDay = ymd(cursor) === ymd(dep);
        const to = lastDay ? dep.getHours() * 60 + dep.getMinutes() - 60 : 22 * 60;
        const items = [];
        if (i === 1) items.push([from, `🏨 Arrive & check in (${n} devotee${n > 1 ? "s" : ""})`]);
        const isThu = dayStart.getDay() === 4;
        if (i > 1) items.push([2 * 60 + 30, "🪔 Kakad Arati (optional)"]);
        pool.forEach(([t, txt]) => { if (t >= from + 45 && t <= to) items.push([t, txt]); });
        if (!firstDarshanDone && !items.some(x => /darshan/i.test(x[1])) && to - from > 90) items.push([from + 60, "🙏 Nirguna Paduka darshan"]);
        if (items.some(x => /darshan/i.test(x[1]))) firstDarshanDone = true;
        if (isThu && 20 * 60 <= to) items.push([20 * 60, "🎉 Thursday Palakhi procession"]);
        if (lastDay) items.push([to + 60, "🚆 Depart — Shri Guru Datta 🙏"]);
        items.sort((x, y) => x[0] - y[0]);
        days.push({ label: `Day ${i} · ${dayStart.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`, items });
        cursor = new Date(dayStart); cursor.setDate(cursor.getDate() + 1); cursor.setHours(4, 30); i++;
      }
      const t2 = m => fmt12(`${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, "0")}`);
      $("#itinerary").innerHTML = days.map(d => `<div class="it-day"><h4>${d.label}</h4><ul>${d.items.map(([t, x]) => `<li><span>${t2(t)}</span>${x}</li>`).join("")}</ul></div>`).join("") +
        `<div class="modal-actions"><button class="btn-ghost sm" onclick="window.print()">🖨️ Print plan</button><button class="btn-maroon sm" data-open="darshan">Book darshan slot →</button></div>`;
    });
  }

  /* ---------- Stay ---------- */
  function renderStay() {
    $("#stayGrid").innerHTML = STAY.map((s, i) => `
      <article class="room reveal"><img src="${s.img}" alt="" loading="lazy"><div class="room-body"><small>${s.type}</small><h3>${s.name}</h3>
      <div class="tags">${s.feat.map(f => `<span>${f}</span>`).join("")}</div>
      <div class="room-foot"><span class="price">${inr(s.price)} <small>/ night</small></span><button class="btn-maroon sm" data-stay="${i}">Check</button></div></div></article>`).join("");
  }

  /* ---------- Reach ---------- */
  function renderReach() {
    const keys = Object.keys(ROUTES);
    $("#reachTabs").innerHTML = keys.map((k, i) => `<button data-r="${k}" class="${i ? "" : "on"}"><b>From ${ROUTES[k].label}</b><small>${ROUTES[k].dist}</small></button>`).join("");
    const show = k => { $("#reachModes").innerHTML = ROUTES[k].modes.map(([ic, t, d], i) => `<div class="mode" style="animation-delay:${i * .08}s"><span class="ic">${ic}</span><div><b>${t}</b><p>${d}</p></div></div>`).join(""); };
    show(keys[0]);
    $("#reachTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#reachTabs button").forEach(x => x.classList.toggle("on", x === b)); show(b.dataset.r); });
  }

  /* ---------- Guru Charitra ---------- */
  function chapterTitle(i) { return GC_CHAPTERS[i] || `Adhyaya ${i + 1}`; }
  function renderGC(all = false) {
    const n = all ? 53 : 8;
    $("#gcList").innerHTML = Array.from({ length: n }, (_, i) => `<li><em>${i + 1}</em><span>${chapterTitle(i)}</span><button title="Read" data-gc="read" data-i="${i}">📖</button><button title="Listen" data-gc="listen" data-i="${i}">🔊</button><button title="Download PDF" data-gc="pdf" data-i="${i}">⬇️</button></li>`).join("");
    $("#gcMore").textContent = all ? "Show fewer" : "Show all 53 adhyayas";
  }
  function initGC() {
    let all = false; renderGC();
    $("#gcMore").onclick = () => { all = !all; renderGC(all); };
    $("#gcLangs").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$("#gcLangs .chip").forEach(c => c.classList.toggle("on", c === b)); toast(`Showing Guru Charitra in ${b.textContent}`); });
    $("#gcList").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; const i = +b.dataset.i;
      if (b.dataset.gc === "read") {
        let size = 1.05;
        openModal(`<p class="eyebrow">Shri Guru Charitra · Adhyaya ${i + 1}</p><h2>${chapterTitle(i)}</h2>
          <div class="reader-bar"><button class="chip" id="fsDown">A−</button><button class="chip" id="fsUp">A+</button><button class="chip" id="prevCh" ${i ? "" : "disabled"}>‹ Prev</button><button class="chip" id="nextCh" ${i < 52 ? "" : "disabled"}>Next ›</button></div>
          <div class="reader" id="reader"><p><b>॥ श्री गणेशाय नमः ॥ श्री सरस्वत्यै नमः ॥ श्री गुरुभ्यो नमः ॥</b></p>
          <p>The full text of this adhyaya will be loaded here from the temple's authorised edition in the selected language, with verse numbering and audio sync.</p>
          <p><i>Parayana tip:</i> Traditionally the Guru Charitra is read as a seven-day saptaha — adhyayas 1–7 on day one, continuing until adhyaya 53 on the seventh day — in a clean place, facing east or north, after lighting a lamp before Shri Guru.</p></div>`, true);
        $("#fsUp").onclick = () => { size += .1; $("#reader").style.fontSize = size + "rem"; };
        $("#fsDown").onclick = () => { size = Math.max(.85, size - .1); $("#reader").style.fontSize = size + "rem"; };
        const go = j => { if (!$(`[data-gc="read"][data-i="${j}"]`)) { all = true; renderGC(true); } $(`[data-gc="read"][data-i="${j}"]`).click(); };
        $("#prevCh").onclick = () => go(i - 1);
        $("#nextCh").onclick = () => go(i + 1);
      } else if (b.dataset.gc === "listen") toast(`🔊 Audio for Adhyaya ${i + 1} will stream here`);
      else toast(`⬇️ PDF for Adhyaya ${i + 1} will be available for download`);
    });
  }

  /* ---------- Gallery & lightbox ---------- */
  let lbList = [], lbIdx = 0;
  function renderGallery(tag = "all") {
    const items = GALLERY.filter(g => tag === "all" || g.tag === tag);
    $("#masonry").innerHTML = items.map((g, i) => `<figure data-gi="${GALLERY.indexOf(g)}" style="animation-delay:${i * .03}s"><img src="${g.src}" alt="${esc(g.cap)}" loading="lazy"><figcaption>${g.cap}</figcaption></figure>`).join("");
  }
  function openLB(list, idx) { lbList = list; lbIdx = idx; showLB(); $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; }
  function showLB() { const it = lbList[lbIdx]; $("#lbImg").src = it.src; $("#lbCap").textContent = it.cap || ""; }
  function closeLB() { $("#lightbox").hidden = true; document.body.style.overflow = ""; }
  function initGallery() {
    renderGallery();
    $("#galFilters").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$("#galFilters .chip").forEach(c => c.classList.toggle("on", c === b)); renderGallery(b.dataset.tag); });
    $("#masonry").addEventListener("click", e => {
      const f = e.target.closest("figure"); if (!f) return;
      const vis = $$("#masonry figure").map(x => GALLERY[x.dataset.gi]);
      openLB(vis, vis.indexOf(GALLERY[f.dataset.gi]));
    });
    document.addEventListener("click", e => {
      const el = e.target.closest("[data-lb]"); if (!el) return;
      const src = el.dataset.lb, g = GALLERY.find(x => x.src === src);
      openLB([{ src, cap: g?.cap || el.querySelector("figcaption b")?.textContent || el.alt || "" }], 0);
    });
    const lb = $("#lightbox");
    $(".lb-x", lb).onclick = closeLB;
    $(".lb-prev", lb).onclick = () => { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; showLB(); };
    $(".lb-next", lb).onclick = () => { lbIdx = (lbIdx + 1) % lbList.length; showLB(); };
    lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", e => {
      if (!lb.hidden) { if (e.key === "Escape") closeLB(); if (e.key === "ArrowLeft") $(".lb-prev", lb).click(); if (e.key === "ArrowRight") $(".lb-next", lb).click(); }
      else if (e.key === "Escape" && !$("#modal").hidden) closeModal();
    });
  }

  /* ---------- Modal ---------- */
  function openModal(html, wide = false) { $("#modalBody").innerHTML = html; $(".modal-card").classList.toggle("wide", wide); $("#modal").hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }

  /* ---------- Bookings ---------- */
  const bookings = () => store.get("gg_bookings", []);
  function saveBooking(b) { const all = bookings(); all.unshift(b); store.set("gg_bookings", all); }
  function newId(prefix) { return prefix + new Date().getFullYear() + String(Math.floor(Math.random() * 1e6)).padStart(6, "0"); }
  const dateOpts = (days = 30) => Array.from({ length: days }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

  function devoteeFields(extra = false) {
    return `<div class="form">
      <div class="row"><label>Devotee name<input name="name" required placeholder="Full name"></label><label>Mobile (OTP)<input name="phone" required inputmode="tel" pattern="[0-9+ ]{10,14}" placeholder="10-digit mobile"></label></div>
      ${extra ? `<div class="row"><label>Gotra<input name="gotra" placeholder="e.g. Kashyapa"></label><label>Nakshatra<select name="nak"><option value="">Select</option>${["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"].map(n => `<option>${n}</option>`).join("")}</select></label></div>
      <div class="row"><label>Rashi<select name="rashi"><option value="">Select</option>${["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"].map(n => `<option>${n}</option>`).join("")}</select></label><label>Family members (optional)<input name="family" placeholder="Names, comma separated"></label></div>
      <label>Sankalpa / prayer<textarea name="sankalpa" rows="2" placeholder="Your wish or intention for the seva"></textarea></label>` : ""}
    </div>`;
  }
  function readForm(root) { const o = {}; $$("input,select,textarea", root).forEach(el => { if (el.name) o[el.name] = el.type === "checkbox" ? el.checked : el.value.trim(); }); return o; }
  function validate(root) { const bad = $$("input[required],select[required]", root).find(el => !el.checkValidity()); if (bad) { bad.reportValidity(); return false; } return true; }

  function payStep(summaryRows, total, onPaid) {
    return `<h3>Review & Pay</h3><div class="summary">${summaryRows.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join("")}<div class="tot"><span>Total</span><span>${total ? inr(total) : "Free"}</span></div></div>
      ${total ? `<div class="pay-methods"><button class="opt on" data-pm="UPI"><b>📱 UPI</b><small>GPay, PhonePe, Paytm</small></button><button class="opt" data-pm="Card"><b>💳 Card</b><small>Debit / Credit</small></button><button class="opt" data-pm="Net Banking"><b>🏦 Net Banking</b><small>All major banks</small></button></div>` : ""}`;
  }

  function wizard({ title, eyebrow, steps, finish }) {
    let step = 0; const state = {};
    const draw = () => {
      openModal(`<p class="eyebrow">${eyebrow}</p><h2>${title}</h2><div class="steps">${steps.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
        <div id="wz">${steps[step].html(state)}</div>
        <div class="modal-actions">${step ? '<button class="btn-ghost" id="wzBack">← Back</button>' : "<span></span>"}<button class="btn-maroon" id="wzNext">${step === steps.length - 1 ? (steps[step].cta || "Confirm") : "Continue →"}</button></div>`);
      steps[step].bind && steps[step].bind(state, $("#wz"));
      $("#wzBack") && ($("#wzBack").onclick = () => { step--; draw(); });
      $("#wzNext").onclick = () => {
        const s = steps[step];
        if (s.validate && !s.validate(state, $("#wz"))) return;
        if (step < steps.length - 1) { step++; draw(); } else finish(state);
      };
    };
    draw();
  }
  function pickBind(attr, key, cb) { return (state, root) => { root.addEventListener("click", e => { const b = e.target.closest(`[${attr}]`); if (!b || b.disabled) return; $$(`[${attr}]`, root).forEach(x => x.classList.toggle("on", x === b)); state[key] = b.getAttribute(attr); cb && cb(state, root); }); }; }
  function pmBind(state, root) { state.pm = state.pm || "UPI"; root.addEventListener("click", e => { const b = e.target.closest("[data-pm]"); if (!b) return; $$("[data-pm]", root).forEach(x => x.classList.toggle("on", x === b)); state.pm = b.dataset.pm; }); }

  function dateGrid(state) {
    return `<h3>Choose date</h3><div class="opt-grid">${dateOpts(14).map(d => { const k = ymd(d), thu = d.getDay() === 4, fest = isFestival(k); return `<button class="opt ${state.date === k ? "on" : ""}" data-date="${k}"><b>${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</b><small>${fest ? "🪔 Festival" : thu ? "Guruvar · busy" : "Available"}</small></button>`; }).join("")}</div>`;
  }

  function bookDarshan() {
    wizard({
      eyebrow: "Darshan Booking", title: "Book your Darshan",
      steps: [
        { html: s => dateGrid(s), bind: pickBind("data-date", "date"), validate: s => s.date || (toast("Please choose a date"), false) },
        {
          html: s => { const t = ist(); return `<h3>Time slot</h3><div class="slot-grid">${SLOTS.map(sl => { const past = s.date === t.ymd && toMin(sl) <= t.mins; const left = past ? 0 : 20 + ((toMin(sl) * 7 + s.date.length) % 180); return `<button class="opt ${s.slot === sl ? "on" : ""}" data-slot="${sl}" ${past ? "disabled" : ""}><b>${fmt12(sl)}</b><small>${past ? "Closed" : left + " left"}</small></button>`; }).join("")}</div>
            <h3 style="margin-top:20px">Darshan type</h3><div class="opt-grid" id="dtypes">${DARSHAN_TYPES.map(d => `<button class="opt ${s.type === d.id ? "on" : ""}" data-dtype="${d.id}"><b>${d.name}</b><small>${d.price ? inr(d.price) + " / person" : "Free"} · ${d.note}</small></button>`).join("")}</div>
            <div class="form" style="margin-top:16px"><label>Number of devotees<input type="number" id="dcount" min="1" max="20" value="${s.count || 2}"></label></div>`; },
          bind: (s, root) => { pickBind("data-slot", "slot")(s, root); root.addEventListener("click", e => { const b = e.target.closest("[data-dtype]"); if (!b) return; $$("[data-dtype]", root).forEach(x => x.classList.toggle("on", x === b)); s.type = b.dataset.dtype; }); },
          validate: (s, root) => { s.count = Math.max(1, +$("#dcount", root).value || 1); if (!s.slot) return toast("Please choose a time slot"), false; if (!s.type) return toast("Please choose a darshan type"), false; return true; },
        },
        { html: s => `<h3>Devotee details</h3>${devoteeFields(false)}`, bind: (s, root) => { if (s.dev) Object.entries(s.dev).forEach(([k, v]) => { const el = $(`[name=${k}]`, root); if (el) el.value = v; }); }, validate: (s, root) => { if (!validate(root)) return false; s.dev = readForm(root); return true; } },
        {
          html: s => { const dt = DARSHAN_TYPES.find(d => d.id === s.type); s.total = dt.price * s.count; return payStep([["Date", new Date(s.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })], ["Slot", fmt12(s.slot)], ["Type", dt.name], ["Devotees", s.count], ["Name", s.dev.name]], s.total); },
          bind: pmBind, cta: "Pay & Confirm",
        },
      ],
      finish: s => {
        const dt = DARSHAN_TYPES.find(d => d.id === s.type);
        const b = { id: newId("GD"), kind: "Darshan", title: dt.name, date: s.date, slot: fmt12(s.slot), count: s.count, name: s.dev.name, phone: s.dev.phone, amount: s.total, pm: s.total ? s.pm : "—", created: Date.now() };
        saveBooking(b); receipt(b);
      },
    });
  }

  function bookSeva(preset) {
    wizard({
      eyebrow: "Seva & Sankalpa", title: "Book a Seva",
      steps: [
        { html: s => { s.seva = s.seva || preset; return `<h3>Choose seva</h3><div class="opt-grid">${SEVAS.map(x => `<button class="opt ${s.seva === x.id ? "on" : ""}" data-sv="${x.id}"><b>${x.name}</b><small>${inr(x.price)} · ${x.time}</small></button>`).join("")}</div>
            <h3 style="margin-top:20px">How will you attend?</h3><div class="opt-grid"><button class="opt ${s.mode !== "remote" ? "on" : ""}" data-mode="person"><b>🛕 In person</b><small>I will be present at the temple</small></button><button class="opt ${s.mode === "remote" ? "on" : ""}" data-mode="remote"><b>📦 On my behalf</b><small>Priest performs with sankalpa · prasadam posted</small></button></div>`; },
          bind: (s, root) => { s.mode = s.mode || "person"; pickBind("data-sv", "seva")(s, root); root.addEventListener("click", e => { const b = e.target.closest("[data-mode]"); if (!b) return; $$("[data-mode]", root).forEach(x => x.classList.toggle("on", x === b)); s.mode = b.dataset.mode; }); },
          validate: s => s.seva || (toast("Please choose a seva"), false),
        },
        { html: s => dateGrid(s), bind: pickBind("data-date", "date"), validate: s => s.date || (toast("Please choose a date"), false) },
        {
          html: s => `<h3>Devotee & sankalpa</h3>${devoteeFields(true)}${s.mode === "remote" ? `<div class="form" style="margin-top:12px"><label>Prasadam delivery address<textarea name="addr" rows="2" required placeholder="House, street, city, PIN — India or international"></textarea></label></div>` : ""}`,
          bind: (s, root) => { if (s.dev) Object.entries(s.dev).forEach(([k, v]) => { const el = $(`[name=${k}]`, root); if (el) el.value = v; }); },
          validate: (s, root) => { if (!validate(root)) return false; const ta = $("[name=addr]", root); if (ta && !ta.value.trim()) { ta.reportValidity(); return false; } s.dev = readForm(root); return true; },
        },
        {
          html: s => { const sv = SEVAS.find(x => x.id === s.seva); s.total = sv.price + (s.mode === "remote" ? 150 : 0); return payStep([["Seva", sv.name], ["Date", new Date(s.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })], ["Devotee", s.dev.name], ["Gotra / Nakshatra", [s.dev.gotra, s.dev.nak].filter(Boolean).join(" · ") || "—"], ["Mode", s.mode === "remote" ? "On behalf + prasadam (₹150 postage)" : "In person"]], s.total); },
          bind: pmBind, cta: "Pay & Confirm",
        },
      ],
      finish: s => {
        const sv = SEVAS.find(x => x.id === s.seva);
        const b = { id: newId("GS"), kind: "Seva", title: sv.name, date: s.date, slot: sv.time, name: s.dev.name, phone: s.dev.phone, gotra: s.dev.gotra, nak: s.dev.nak, rashi: s.dev.rashi, sankalpa: s.dev.sankalpa, remote: s.mode === "remote", addr: s.dev.addr, amount: s.total, pm: s.pm, created: Date.now() };
        saveBooking(b); receipt(b);
      },
    });
  }

  function bookStay(i) {
    const room = STAY[i] || STAY[0];
    wizard({
      eyebrow: "Accommodation", title: room.name,
      steps: [
        {
          html: s => { const today = ymd(new Date()); return `<h3>Check availability</h3><div class="form"><div class="row"><label>Check-in<input type="date" name="in" min="${today}" value="${s.in || today}" required></label><label>Check-out<input type="date" name="out" min="${today}" value="${s.out || ymd(new Date(Date.now() + 864e5))}" required></label></div><div class="row"><label>Rooms<input type="number" name="rooms" min="1" max="6" value="${s.rooms || 1}"></label><label>Guests<input type="number" name="guests" min="1" max="20" value="${s.guests || 2}"></label></div></div><p class="muted small" style="margin-top:10px">${room.feat.join(" · ")}</p>`; },
          validate: (s, root) => { if (!validate(root)) return false; Object.assign(s, readForm(root)); s.nights = Math.round((new Date(s.out) - new Date(s.in)) / 864e5); if (s.nights < 1) return toast("Check-out must be after check-in"), false; const fest = isFestival(s.in); if (fest) toast("🪔 Festival dates — limited rooms left"); return true; },
        },
        { html: s => `<p class="muted">✅ ${s.rooms} room(s) available for ${s.nights} night(s).</p><h3>Guest details</h3>${devoteeFields(false)}`, validate: (s, root) => { if (!validate(root)) return false; s.dev = readForm(root); return true; } },
        { html: s => { s.total = room.price * s.nights * (+s.rooms || 1); return payStep([["Property", room.name], ["Dates", `${s.in} → ${s.out}`], ["Nights × Rooms", `${s.nights} × ${s.rooms}`], ["Guest", s.dev.name]], s.total); }, bind: pmBind, cta: "Pay & Confirm" },
      ],
      finish: s => { const b = { id: newId("GA"), kind: "Stay", title: room.name, date: s.in, slot: `${s.nights} night(s) · ${s.rooms} room(s)`, name: s.dev.name, phone: s.dev.phone, amount: s.total, pm: s.pm, created: Date.now() }; saveBooking(b); receipt(b); },
    });
  }

  function donate(fund = "General Donation", amount) {
    const amts = [501, 1001, 5001, 11001];
    wizard({
      eyebrow: "Donation", title: fund,
      steps: [
        {
          html: s => { s.fund = s.fund || fund; s.amount = s.amount || amount || 1001; return `<h3>Fund</h3><div class="opt-grid">${["General Donation", "Annadana", "Temple Development", "Go Seva", "Nandadeep", "Festivals", "Veda Pathashala"].map(f => `<button class="opt ${s.fund === f ? "on" : ""}" data-fund-pick="${f}"><b>${f}</b></button>`).join("")}</div>
            <h3 style="margin-top:20px">Amount</h3><div class="opt-grid">${amts.map(a => `<button class="opt ${s.amount == a ? "on" : ""}" data-amt="${a}"><b>${inr(a)}</b></button>`).join("")}</div>
            <div class="form" style="margin-top:12px"><label>Or enter amount (₹)<input type="number" id="amtIn" min="11" value="${s.amount}"></label><label class="chk"><input type="checkbox" id="g80"> I need an 80G receipt (PAN required)</label></div>`; },
          bind: (s, root) => {
            pickBind("data-fund-pick", "fund")(s, root);
            root.addEventListener("click", e => { const b = e.target.closest("[data-amt]"); if (!b) return; $$("[data-amt]", root).forEach(x => x.classList.toggle("on", x === b)); s.amount = +b.dataset.amt; $("#amtIn", root).value = s.amount; });
            $("#amtIn", root).addEventListener("input", e => { s.amount = +e.target.value; $$("[data-amt]", root).forEach(x => x.classList.toggle("on", +x.dataset.amt === s.amount)); });
          },
          validate: (s, root) => { s.g80 = $("#g80", root).checked; if (!(s.amount >= 11)) return toast("Minimum donation is ₹11"), false; return true; },
        },
        { html: s => `<h3>Donor details</h3>${devoteeFields(false)}${s.g80 ? `<div class="form" style="margin-top:12px"><label>PAN<input name="pan" required pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" placeholder="ABCDE1234F"></label></div>` : ""}`, validate: (s, root) => { if (!validate(root)) return false; s.dev = readForm(root); return true; } },
        { html: s => payStep([["Fund", s.fund], ["Donor", s.dev.name], ["80G receipt", s.g80 ? "Yes" : "No"]], s.amount), bind: pmBind, cta: "Donate" },
      ],
      finish: s => { const b = { id: newId("GN"), kind: "Donation", title: s.fund, date: ymd(new Date()), slot: s.g80 ? "80G receipt" : "Receipt", name: s.dev.name, phone: s.dev.phone, amount: s.amount, pm: s.pm, created: Date.now() }; saveBooking(b); receipt(b); },
    });
  }

  function receipt(b) {
    openModal(`<div class="receipt"><div class="ok">🙏</div><p class="eyebrow" style="justify-content:center">Shri Guru Datta</p><h2>${b.kind === "Donation" ? "Thank you for your offering" : "Booking confirmed"}</h2>
      <div class="bid">${b.id}</div><div class="qr" id="qr"></div>
      <div class="summary"><div><span>${b.kind}</span><b>${esc(b.title)}</b></div><div><span>Date</span><b>${new Date(b.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</b></div>${b.slot ? `<div><span>Details</span><b>${esc(b.slot)}</b></div>` : ""}<div><span>Devotee</span><b>${esc(b.name)}</b></div><div class="tot"><span>Paid</span><span>${b.amount ? inr(b.amount) + " · " + b.pm : "Free"}</span></div></div>
      <p class="muted small">${b.kind === "Darshan" ? "Show this QR at the darshan entrance for verification." : "A confirmation has been sent to your WhatsApp (simulated)."}</p>
      <div class="modal-actions"><button class="btn-ghost" onclick="window.print()">🖨️ Print</button><a class="btn-ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`🙏 Shri Guru Datta\nYour ${b.kind} booking is confirmed.\nBooking ID: ${b.id}\nDate: ${b.date}\n${b.kind}: ${b.title}`)}">💬 Share</a><button class="btn-maroon" data-open="account">My Bookings</button></div></div>`);
    if (window.QRCode) new QRCode($("#qr"), { text: `GGP|${b.id}|${b.date}|${b.count || 1}`, width: 150, height: 150, colorDark: "#5a1414", correctLevel: QRCode.CorrectLevel.M });
    toast("✅ " + b.id + " confirmed");
  }

  function prasadStage(b) { const mins = (Date.now() - b.created) / 60000; return Math.min(4, Math.floor(mins / 2) + 1); }

  function account(tab = "all") {
    const all = bookings();
    const list = all.filter(b => tab === "all" || b.kind === tab);
    const kinds = ["all", "Darshan", "Seva", "Stay", "Donation"];
    openModal(`<div id="acc"><p class="eyebrow">Devotee Dashboard</p><h2>My Bookings</h2>
      <div class="tabs">${kinds.map(k => `<button class="chip ${k === tab ? "on" : ""}" data-acc="${k}">${k === "all" ? "All" : k}${k === "all" ? ` (${all.length})` : ""}</button>`).join("")}</div>
      ${list.length ? list.map(b => `<div class="bk"><div class="bk-top"><b>${esc(b.title)}</b><code>${b.id}</code></div>
        <small>${b.kind} · ${b.date} · ${esc(b.slot || "")} · ${b.amount ? inr(b.amount) : "Free"}</small>
        ${b.remote ? `<div class="track">${["Booked", "Seva performed", "Prasadam packed", "Dispatched", "Delivered"].map((s, i) => `<span class="${i <= prasadStage(b) ? "done" : ""}">${s}</span>`).join("")}</div>` : ""}
        <div style="margin-top:8px"><button class="linklike" style="color:var(--saffron)" data-receipt="${b.id}">View receipt / QR</button></div></div>`).join("")
        : `<div class="it-empty" style="height:200px">🪔<p>No bookings yet. Book a darshan or seva to see it here.</p></div>`}
      <p class="muted small">Sign-in with mobile OTP and cloud sync will be enabled with the production backend. Prasadam tracking is simulated.</p></div>`, true);
    $("#acc").addEventListener("click", e => {
      const t = e.target.closest("[data-acc]"); if (t) return account(t.dataset.acc);
      const r = e.target.closest("[data-receipt]"); if (r) receipt(bookings().find(b => b.id === r.dataset.receipt));
    });
  }

  function credits() {
    openModal(`<p class="eyebrow">Attribution</p><h2>Photo credits</h2><p class="muted">Images from Wikimedia Commons, used under their stated licences.</p>
      <div class="credits-list">${CREDITS.map(c => `<div>${c.file.split("/").pop()} — <b>${esc(c.author)}</b>, ${c.license} · <a href="${c.source}" target="_blank" rel="noopener">source</a></div>`).join("")}</div>`, true);
  }

  /* ---------- Chat assistant ---------- */
  function answer(q) {
    const s = q.toLowerCase();
    if (/now|today|open|current/.test(s) && !/kakad/.test(s)) {
      const t = ist(), { cur, next } = currentSlot(t.mins);
      return `Right now (${fmt12(`${t.h}:${t.m}`)} IST): ${cur ? `<b>${cur.name}</b> — darshan ${cur.darshan ? "open" : "closed"}` : "the temple is closed for the night"}. Next: <b>${next.name}</b> at ${fmt12(next.start)}.`;
    }
    let best = null, score = 0;
    FAQ.forEach(f => { const sc = f.k.reduce((a, k) => a + (s.includes(k) ? k.length : 0), 0); if (sc > score) { score = sc; best = f; } });
    return best ? best.a : `I can help with timings, sevas, how to reach, stay, Sangam, Madhukari, festivals and Guru Charitra. For anything else please contact the temple office.`;
  }
  function initChat() {
    const body = $("#chatBody");
    const add = (txt, who) => { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = txt; body.appendChild(d); body.scrollTop = body.scrollHeight; };
    add("🙏 Jai Guru Datta! Ask me about timings, sevas, travel, stay or the history of Ganagapur.", "bot");
    const sugg = ["Is the temple open now?", "What time is Kakad Arati?", "How to reach from Hyderabad?", "What is Madhukari?", "Where is Sangam?", "Where can I stay?"];
    $("#chatSugg").innerHTML = sugg.map(x => `<button>${x}</button>`).join("");
    const ask = q => { if (!q.trim()) return; add(esc(q), "me"); setTimeout(() => add(answer(q), "bot"), 350); };
    $("#chatSugg").addEventListener("click", e => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    $("#chatForm").addEventListener("submit", e => { e.preventDefault(); ask($("#chatInput").value); $("#chatInput").value = ""; });
    $("#chatFab").onclick = () => { $("#chat").hidden = !$("#chat").hidden; if (!$("#chat").hidden) $("#chatInput").focus(); };
    $("#chatClose").onclick = () => ($("#chat").hidden = true);
  }

  /* ---------- i18n ---------- */
  function applyLang(l) {
    const dict = I18N[l] || I18N.en;
    $$("[data-i18n]").forEach(el => { const k = el.dataset.i18n; if (dict[k]) el.textContent = dict[k]; });
    document.documentElement.lang = l; store.set("gg_lang", l);
  }

  /* ---------- Global wiring ---------- */
  function wire() {
    document.addEventListener("click", e => {
      const o = e.target.closest("[data-open]");
      if (o) {
        e.preventDefault(); const k = o.dataset.open;
        ({ darshan: bookDarshan, seva: () => bookSeva(), donate: () => donate(), account: () => account(), credits, stayAny: () => { closeModal(); $("#stay").scrollIntoView({ behavior: "smooth" }); } })[k]?.();
        return;
      }
      const sv = e.target.closest("[data-seva]"); if (sv) return bookSeva(sv.dataset.seva);
      const st = e.target.closest("[data-stay]"); if (st) return bookStay(+st.dataset.stay);
      const fd = e.target.closest(".fund-grid [data-fund]"); if (fd) return donate(fd.dataset.fund);
      const am = e.target.closest(".amounts button");
      if (am) { const fund = am.parentElement.dataset.fund; return donate(fund, am.dataset.custom ? undefined : +am.textContent.replace(/\D/g, "")); }
      const pl = e.target.closest("[data-place]"); if (pl) { e.preventDefault(); return goToPlace(pl.dataset.place); }
      if (e.target.closest(".js-wa")) { e.preventDefault(); window.open(`https://wa.me/${TEMPLE.whatsapp}?text=${encodeURIComponent("🙏 Jai Guru Datta. I need assistance at Ganagapur.")}`, "_blank", "noopener"); }
    });
    $("#modalX").onclick = closeModal;
    $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
    $("#burger").onclick = () => $("#menu").classList.toggle("open");
    $$("#menu a").forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("open")));
    const lang = store.get("gg_lang", "en"); $("#lang").value = lang; applyLang(lang);
    $("#lang").onchange = e => applyLang(e.target.value);

    $("#addr").textContent = TEMPLE.address;
    $("#fPhone").textContent = TEMPLE.phone;
    $$(".js-phone").forEach(a => (a.href = "tel:" + TEMPLE.phone.replace(/[^\d+]/g, "")));
    $("#fMail").href = "mailto:" + TEMPLE.email;
    $("#yr").textContent = new Date().getFullYear();

    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12 });
    const observe = () => $$(".reveal:not(.in), .sec-head:not(.reveal)").forEach(el => { el.classList.add("reveal"); io.observe(el); });
    observe(); setTimeout(observe, 500);
  }

  /* ---------- Boot ---------- */
  renderTimeline(); renderSevas(); renderAudio(); renderTeerthas(); renderFestivals(); renderPlanner(); renderStay(); renderReach(); initGC(); initGallery(); initChat(); wire();
  renderMap();
  renderStatus(); renderCrowdChart(); renderToken();
  setInterval(() => { renderStatus(); renderToken(); }, 15000);
  window.addEventListener("resize", () => { clearTimeout(renderCrowdChart._t); renderCrowdChart._t = setTimeout(renderCrowdChart, 200); });
})();
