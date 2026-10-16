// WhatsApp number that receives form submissions (country code, no + or spaces)
const WHATSAPP_NUMBER = "255753418105";

// ----- Mobile menu -----
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

// Close the menu after a link is tapped
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

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
