const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const initHomepageSmoothScroll = () => {
  const isHomepage = document.body.dataset.template === "index";

  if (!isHomepage || prefersReducedMotion.matches || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined" || typeof window.ScrollSmoother === "undefined") {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger, window.ScrollSmoother);

  const existingSmoother = window.ScrollSmoother.get();
  if (existingSmoother) {
    existingSmoother.kill();
  }

  window.ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.8,
    smoothTouch: 0.12,
    effects: true,
  });
};

const initHeroBannerAnimation = () => {
  const hero = document.querySelector("[data-hero-banner]");

  if (!hero || prefersReducedMotion.matches || typeof window.gsap === "undefined") {
    return;
  }

  const heroImage = hero.querySelector("[data-hero-image]");
  const heroOverlay = hero.querySelector("[data-hero-overlay]");
  const heroItems = hero.querySelectorAll("[data-hero-item]");

  const timeline = window.gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  if (heroImage) {
    timeline.fromTo(
      heroImage,
      {
        scale: 1.12,
      },
      {
        duration: 1.6,
        scale: 1,
      },
    );
  }

  if (heroOverlay) {
    timeline.fromTo(
      heroOverlay,
      {
        opacity: 0,
      },
      {
        duration: 1,
        opacity: 1,
      },
      0,
    );
  }

  if (heroItems.length) {
    timeline.fromTo(
      heroItems,
      {
        y: 36,
        opacity: 0,
      },
      {
        duration: 0.9,
        opacity: 1,
        stagger: 0.14,
        y: 0,
      },
      0.25,
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initHomepageSmoothScroll();
  initHeroBannerAnimation();
});
