// WhatsApp number that receives form submissions (country code, no + or spaces)
const WHATSAPP_NUMBER = "255753418105";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ----- Loading screen -----
function finishLoading() {
  if (root.classList.contains("loaded")) return;
  root.classList.add("loaded");
  startWordCycle();
}
window.addEventListener("load", () => setTimeout(finishLoading, reduceMotion ? 0 : 1300));
setTimeout(finishLoading, 4000); // safety net if an image is slow

// ----- Hero: highlight Move / Pay / Manage one after another -----
function startWordCycle() {
  const words = document.querySelectorAll(".hero-title .word > span");
  if (!words.length) return;
  let i = 0;
  const light = () => {
    words.forEach((w, n) => w.classList.toggle("lit", n === i));
    i = (i + 1) % words.length;
  };
  setTimeout(() => {
    light();
    if (!reduceMotion) setInterval(light, 2200);
  }, 1400);
}

// ----- Navigation: shrink on scroll, progress bar, back-to-top -----
const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress");
const toTop = document.querySelector(".to-top");

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  nav.classList.toggle("scrolled", y > 40);
  progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  toTop.classList.toggle("show", y > 700);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

// ----- Mobile menu -----
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

function setMenu(open) {
  links.classList.toggle("open", open);
  nav.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ----- Highlight the menu link of the section on screen -----
const navMap = {};
links.querySelectorAll('a[href^="#"]:not(.btn)').forEach((a) => (navMap[a.getAttribute("href").slice(1)] = a));
const sectionSpy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    Object.values(navMap).forEach((a) => a.classList.remove("active"));
    const link = navMap[entry.target.id];
    if (link) link.classList.add("active");
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => sectionSpy.observe(s));

// ----- Scroll reveal -----
// Reveals every element that has entered (or already passed) the screen, so fast scrolling never skips one
let pending = [...document.querySelectorAll(".reveal")];
let revealQueued = false;

function revealVisible() {
  revealQueued = false;
  const limit = window.innerHeight * 0.92;
  pending = pending.filter((el) => {
    if (el.getBoundingClientRect().top > limit) return true;
    el.classList.add("in");
    // Hand control back to each element's own hover transitions once revealed
    const delay = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
    setTimeout(() => el.classList.remove("reveal"), 1100 + delay * 1000);
    return false;
  });
}
function queueReveal() {
  if (!revealQueued && pending.length) {
    revealQueued = true;
    requestAnimationFrame(revealVisible);
  }
}
window.addEventListener("scroll", queueReveal, { passive: true });
window.addEventListener("resize", queueReveal);
queueReveal();

// ----- Fancy pointer effects (desktop only) -----
if (finePointer && !reduceMotion) {
  // 3D tilt + spotlight on product cards
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      card.style.transform = "perspective(900px) rotateX(" + (0.5 - y) * 8 + "deg) rotateY(" + (x - 0.5) * 10 + "deg) translateY(-6px)";
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });

  // Magnetic buttons
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = "translate(" + x * 0.18 + "px," + y * 0.3 + "px)";
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });

  // Hero background follows the mouse a little (parallax)
  const hero = document.querySelector(".hero");
  const blobs = hero.querySelectorAll(".blob");
  hero.addEventListener("pointermove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    blobs.forEach((b, i) => (b.style.translate = x * (40 + i * 30) + "px " + y * (40 + i * 30) + "px"));
  });
}

// "Start a Conversation" pre-selects Partnership in the contact form
document.querySelectorAll("[data-subject]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelector('#contact-form [name="subject"]').value = btn.dataset.subject;
  })
);

// ----- Forms -> WhatsApp -----
function openWhatsApp(text) {
  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
}

document.getElementById("waitlist-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const interests = [...f.querySelectorAll('[name="interest"]:checked')].map((c) => c.value);
  openWhatsApp(
    "Hello Afri Fynex, I want to join the waitlist.\n" +
      "Name: " + f.elements.name.value + "\n" +
      "Email/Phone: " + f.elements.contact.value + "\n" +
      "Interested in: " + (interests.length ? interests.join(", ") : "Not specified")
  );
  f.reset();
});

document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  openWhatsApp(
    "Hello Afri Fynex,\n" +
      "Subject: " + f.elements.subject.value + "\n" +
      "Name: " + f.elements.name.value + "\n" +
      "Email: " + (f.elements.email.value || "-") + "\n" +
      "Phone: " + (f.elements.phone.value || "-") + "\n\n" +
      f.elements.message.value
  );
  f.reset();
});
