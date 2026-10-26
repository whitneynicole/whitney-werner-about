// Subtle reveal on scroll for [data-reveal] elements. Content stays fully visible
// without JS and under prefers-reduced-motion; only elements that start below the
// fold are hidden, so nothing already on screen flickers. Transform-only motion
// does not cause layout shift.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight,
  );

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.opacity = "";
        el.style.transform = "";
        observer.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of targets) {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 500ms var(--ease-out), transform 500ms var(--ease-out)";
    observer.observe(el);
  }
}
