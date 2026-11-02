/* Portfolio scripts. Each feature is its own function, started in init(). */
"use strict";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* 1. Mobile menu toggle (closes after a link is chosen) */
function initMobileNav() {
  const btn = $("#navToggle"), links = $("#navLinks");
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", e => {
    if (e.target.tagName === "A") { links.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });
}

/* 2. Dark/light theme */
function initTheme() {
  const btn = $("#themeToggle");
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    btn.setAttribute("aria-pressed", String(theme === "dark"));
  };
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }
  apply(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });
}

/* 3. Typing effect */
function initTyping() {
  const target = $("#typed");
  const words = ["Network student", "HTML/CSS learner", "Future Developer"]; // the animation words loop
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { target.textContent = words[0]; return; }
  let w = 0, i = 0, deleting = false;
  (function tick() {
    const word = words[w];
    target.textContent = word.slice(0, i);
    i += deleting ? -1 : 1;
    let delay = deleting ? 50 : 100;
    if (!deleting && i > word.length) { deleting = true; delay = 1400; }
    else if (deleting && i < 0) { deleting = false; i = 0; w = (w + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  })();
}

/* 4. Time-based greeting */
function initGreeting() {
  const h = new Date().getHours();
  $("#greeting").textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* 5. Highlight the nav link of the section in view */
function initActiveNav() {
  const links = $$(".nav-links a");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        const on = a.getAttribute("href") === "#" + entry.target.id;
        a.classList.toggle("active", on);
        on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section").forEach(s => observer.observe(s));
}

/* 6. Scroll progress bar + 7. back-to-top button */
function initScrollUI() {
  const bar = $("#progress"), top = $("#toTop");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    top.hidden = scrollY < 600;
  };
  addEventListener("scroll", update, { passive: true });
  update();
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
}

/* 8. Filter projects by category */
function initFilters() {
  const chips = $$(".chip"), cards = $$("#projectGrid .card"), count = $("#count");
  const show = filter => {
    let n = 0;
    cards.forEach(card => {
      const match = filter === "all" || card.dataset.category.split(" ").includes(filter);
      card.hidden = !match;
      if (match) n++;
    });
    count.textContent = `Showing ${n} of ${cards.length} projects`;
  };
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => { c.classList.toggle("active", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
    show(chip.dataset.filter);
  }));
  show("all");
}

/* 9. Project details dialog (uses the native <dialog> for focus handling and Esc to close) */
function initDialog() {
  const dlg = $("#projectDialog");
  if (typeof dlg.showModal !== "function") return; // very old browsers: buttons do nothing
  let opener = null;
  $("#projectGrid").addEventListener("click", e => {
    const btn = e.target.closest("[data-project]");
    if (!btn) return;
    const p = PROJECTS[Number(btn.dataset.project)];
    if (!p) return;
    opener = btn;
    $("#dialogTitle").textContent = p.title;
    $("#dialogBody").textContent = p.body;
    $("#dialogLink").href = p.url;
    dlg.showModal();
  });
  $("#dialogClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // click outside
  dlg.addEventListener("close", () => opener && opener.focus());
}

/* 10. Animate skill bars when scrolled into view */
function initSkills() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$("li", entry.target).forEach(li => { $(".fill", li).style.width = li.dataset.level + "%"; });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  observer.observe($("#skills"));
}

/* 11. Copy email address to clipboard */
function initCopyEmail() {
  const btn = $("#copyEmail");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#emailLink").textContent);
      btn.textContent = "Copied";
    } catch (e) {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = "Copy address"), 2000);
  });
}

/* 12. Contact form: validation, character counter, front-end */
function initForm() {
  const form = $("#contactForm"), status = $("#formStatus"), msg = $("#message");
  const rules = {
    name: v => (v.trim().length >= 2 ? "" : "Enter your name (at least 2 characters)."),
    email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address."),
    message: v => (v.trim().length >= 10 ? "" : "Write at least 10 characters.")
  };
  const check = field => {
    const error = rules[field.name](field.value);
    $("#" + field.name + "Error").textContent = error;
    field.setAttribute("aria-invalid", String(Boolean(error)));
    return !error;
  };
  msg.addEventListener("input", () => ($("#count-msg").textContent = `${msg.value.length}/300`));
  $$("input, textarea", form).forEach(f => f.addEventListener("blur", () => check(f)));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const fields = $$("input, textarea", form);
    const valid = fields.map(check).every(Boolean); // run every check so all errors show
    if (!valid) { status.textContent = "Please fix the errors above."; fields.find(f => f.getAttribute("aria-invalid") === "true").focus(); return; }
    // Email visitor email app opens navigation.
    const subject = encodeURIComponent("Portfolio message from " + form.name.value);
    const body = encodeURIComponent(form.message.value + "\n\n" + form.email.value);
    location.href = `mailto:${$("#emailLink").textContent}?subject=${subject}&body=${body}`;
    status.textContent = "Thank you! Your email app should open with the message ready to send.";
    form.reset();
    $("#count-msg").textContent = "0/300";
  });
}

/* 13. Footer year */
function initYear() { $("#year").textContent = new Date().getFullYear(); }

function init() {
  [initMobileNav, initTheme, initTyping, initGreeting, initActiveNav, initScrollUI,
   initFilters, initDialog, initSkills, initCopyEmail, initForm, initYear].forEach(fn => {
    try { fn(); } catch (err) { console.error(`${fn.name} failed:`, err); }
  });
}
document.addEventListener("DOMContentLoaded", init);
