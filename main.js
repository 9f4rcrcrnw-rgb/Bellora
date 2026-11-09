/* Bellora onepager
 * MailerLite: vul hieronder je account-ID en formulier-ID in.
 * Je vindt beide in de embed-code van je formulier (Forms > Embedded forms > HTML-code):
 *   https://assets.mailerlite.com/jsonp/ACCOUNT_ID/forms/FORM_ID/subscribe
 */
const MAILERLITE = { account: "", form: "" };

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* nav krijgt achtergrond na scrollen */
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* line-up: elke act "gaat live" wanneer hij in beeld komt */
const STAR = '<svg viewBox="-50 -50 100 100"><path d="M0-48L12-12 48 0 12 12 0 48-12 12-48 0-12-12Z"/></svg>';
document.querySelectorAll(".act").forEach((act) => {
  act.querySelectorAll(".notes span").forEach((s, i) => s.style.setProperty("--i", i));
});
function burst(act) {
  if (reduce) return;
  const img = act.querySelector(".act__media");
  const r = img.getBoundingClientRect();
  const a = act.getBoundingClientRect();
  const cx = r.left - a.left + r.width / 2;
  const cy = r.top - a.top + r.height * 0.3;
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.innerHTML = STAR;
    const el = s.firstChild;
    el.classList.add("burst");
    el.style.left = cx + "px";
    el.style.top = cy + "px";
    act.appendChild(el);
    const ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
    const dist = 140 + Math.random() * 160;
    const size = 0.6 + Math.random() * 1.4;
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(${size}) rotate(90deg)`, opacity: 1, offset: 0.7 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist * 1.1}px), calc(-50% + ${Math.sin(ang) * dist * 1.1 + 40}px)) scale(0)`, opacity: 0 },
      ],
      { duration: 1400, easing: "cubic-bezier(.2,.7,.3,1)", delay: 350 }
    ).onfinish = () => el.remove();
  }
}
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !e.target.classList.contains("is-live")) {
        e.target.classList.add("is-live");
        burst(e.target);
      }
    });
  },
  { threshold: 0.35 }
);
document.querySelectorAll(".act").forEach((a) => io.observe(a));

/* hero: lichte parallax */
const heroImg = document.querySelector(".hero__media img");
if (!reduce && heroImg) {
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroImg.style.translate = `0 ${y * 0.25}px`;
    },
    { passive: true }
  );
}

/* vuurwerk bij inschrijven */
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let parts = [];
function sizeCanvas() {
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
}
function star(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 ? s * 0.3 : s;
    ctx.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function fireworks(x, y) {
  if (reduce) return;
  sizeCanvas();
  const cols = ["#f27aae", "#8ed5f0", "#c58be3", "#f4c56a", "#d7193a"];
  for (let b = 0; b < 3; b++) {
    const bx = x + (b - 1) * 180 * devicePixelRatio;
    const by = y - (b === 1 ? 120 : 60) * devicePixelRatio;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (2 + Math.random() * 5) * devicePixelRatio;
      parts.push({ x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, s: (4 + Math.random() * 7) * devicePixelRatio, c: cols[(i + b) % cols.length], r: Math.random() * 6, d: b * 8 });
    }
  }
  requestAnimationFrame(tick);
}
function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parts = parts.filter((p) => p.life > 0);
  parts.forEach((p) => {
    if (p.d > 0) { p.d--; return; }
    p.x += p.vx; p.y += p.vy; p.vy += 0.08 * devicePixelRatio; p.vx *= 0.985; p.life -= 0.012; p.r += 0.08;
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.c;
    star(p.x, p.y, p.s, p.r);
  });
  ctx.globalAlpha = 1;
  if (parts.length) requestAnimationFrame(tick);
}

/* inschrijfformulier */
const form = document.getElementById("signup");
const msg = document.getElementById("form-msg");
function say(text, error) {
  msg.textContent = text;
  msg.classList.toggle("is-error", !!error);
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.querySelector("#f-name");
  const email = form.querySelector("#f-email");
  const optin = form.querySelector("#f-optin");
  [name, email, optin].forEach((f) => f.removeAttribute("aria-invalid"));
  if (!name.value.trim()) { name.setAttribute("aria-invalid", "true"); name.focus(); return say("Vul je voornaam in.", true); }
  if (!email.validity.valid || !email.value) { email.setAttribute("aria-invalid", "true"); email.focus(); return say("Vul een geldig e-mailadres in, zoals naam@voorbeeld.be.", true); }
  if (!optin.checked) { optin.setAttribute("aria-invalid", "true"); optin.focus(); return say("Vink aan dat je de nieuwsbrief wil ontvangen.", true); }

  const btn = form.querySelector("button");
  btn.disabled = true;
  say("Even geduld…");
  try {
    if (MAILERLITE.account && MAILERLITE.form) {
      const body = new FormData();
      body.append("fields[name]", name.value.trim());
      body.append("fields[email]", email.value.trim());
      body.append("ml-submit", "1");
      body.append("anticsrf", "true");
      const res = await fetch(`https://assets.mailerlite.com/jsonp/${MAILERLITE.account}/forms/${MAILERLITE.form}/subscribe`, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error("ml");
    }
    form.reset();
    say(`Je staat op de lijst, ${name.value.trim() || "jij"}! Check je mailbox om je inschrijving te bevestigen.`);
    const r = btn.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    fireworks((r.left - c.left + r.width / 2) * devicePixelRatio, (r.top - c.top) * devicePixelRatio);
  } catch (err) {
    say("Inschrijven lukte niet. Controleer je verbinding en probeer het opnieuw.", true);
  } finally {
    btn.disabled = false;
  }
});
