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
  // Phone screens follow the same order as the words: Move, Pay, Manage
  const screens = document.querySelectorAll(".scr");
  const tabs = document.querySelectorAll(".tab");
  let i = 0;
  const light = () => {
    words.forEach((w, n) => w.classList.toggle("lit", n === i));
    screens.forEach((s, n) => s.classList.toggle("active", n === i));
    tabs.forEach((t, n) => t.classList.toggle("on", n === i));
    if (screens[i] && screens[i].classList.contains("scr-pay")) countUp(screens[i].querySelector(".count"));
    i = (i + 1) % words.length;
  };
  setTimeout(() => {
    light();
    if (!reduceMotion) setInterval(light, 3600);
  }, 1400);
}

// Counts a number up from 0 (used on the Pay screen)
function countUp(el) {
  if (!el || reduceMotion) return;
  const target = Number(el.dataset.to);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / 1200, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString("en-US");
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ----- Section headings: split into words so they rise one by one -----
if (!reduceMotion) {
  document.querySelectorAll("h2.reveal").forEach((h2) => {
    let index = 0;
    const wrap = (content) => {
      const w = document.createElement("span");
      w.className = "w";
      const inner = document.createElement("span");
      inner.style.setProperty("--i", index++);
      inner.append(content);
      w.append(inner);
      return w;
    };
    [...h2.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/).filter(Boolean);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => frag.append(/^\s+$/.test(part) ? document.createTextNode(" ") : wrap(part)));
        node.replaceWith(frag);
      } else {
        node.replaceWith(wrap(node.cloneNode(true)));
      }
    });
    h2.classList.add("split");
  });
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

  // The hero phone tilts toward the mouse
  const phoneWrap = document.querySelector(".phone-wrap");
  if (phoneWrap) {
    hero.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      phoneWrap.style.setProperty("--ry", -8 + x * 16 + "deg");
      phoneWrap.style.setProperty("--rx", 4 - y * 10 + "deg");
    });
    hero.addEventListener("pointerleave", () => {
      phoneWrap.style.removeProperty("--ry");
      phoneWrap.style.removeProperty("--rx");
    });
  }

  // Soft light that follows the mouse on dark sections
  document.querySelectorAll(".hero, #vision, #partner, .waitlist-box").forEach((area) => {
    const spot = document.createElement("div");
    spot.className = "spotlight";
    area.prepend(spot);
    area.classList.add("has-spot");
    area.addEventListener("pointermove", (e) => {
      const r = area.getBoundingClientRect();
      spot.style.setProperty("--sx", e.clientX - r.left + "px");
      spot.style.setProperty("--sy", e.clientY - r.top + "px");
    });
  });
}

// ----- Founder photos drift slightly while scrolling (depth effect) -----
if (!reduceMotion) {
  const photos = document.querySelectorAll(".founder .photo, .leader .photo");
  let parallaxQueued = false;
  const parallax = () => {
    parallaxQueued = false;
    photos.forEach((p) => {
      const r = p.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
      p.style.translate = "0 " + offset.toFixed(1) + "px";
    });
  };
  window.addEventListener("scroll", () => {
    if (!parallaxQueued) {
      parallaxQueued = true;
      requestAnimationFrame(parallax);
    }
  }, { passive: true });
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
