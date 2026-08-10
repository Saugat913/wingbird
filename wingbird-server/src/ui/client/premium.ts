const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

if (!reduced) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
        } else {
          entry.target.classList.remove("in");
        }
      });
    },
    { rootMargin: "-80px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

const header = document.querySelector<HTMLElement>("header");
if (header) {
  const toggle = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

