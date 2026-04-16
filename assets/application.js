const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const initDeliveryTruckAnimation = () => {
  const deliverySection = document.querySelector("[data-delivery-section]");
  const truck = document.querySelector("[data-delivery-truck-wrap]");
  const heading = document.querySelector("[data-delivery-heading]");

  if (!deliverySection || !truck || !heading || prefersReducedMotion.matches || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  window.gsap.set(truck, {
    opacity: 0,
    rotation: 5,
    scale: 0.92,
    transformOrigin: "center center",
    xPercent: 45,
    y: 24,
  });

  window.gsap.set(heading, {
    opacity: 0,
    x: -8,
  });

  const entranceTimeline = window.gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
    scrollTrigger: {
      trigger: deliverySection,
      start: "top 82%",
      toggleActions: "play none none reverse",
    },
  });

  entranceTimeline
    .to(truck, {
      duration: 1.2,
      opacity: 1,
      rotation: 0,
      scale: 1,
      xPercent: 0,
      y: 0,
    })
    .to(
      heading,
      {
        duration: 0.3,
        opacity: 1,
        x: 0,
      },
      0.1,
    );
};

const initHomepageScrollStory = () => {
  const isHomepage = document.body.dataset.template === "index";
  const hero = document.querySelector("[data-hero-banner]");
  const heroTitle = document.querySelector("[data-hero-title]");
  const nextSection = document.querySelector("[data-next-section]");

  if (!isHomepage || !hero || !heroTitle || !nextSection || prefersReducedMotion.matches || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  window.gsap.set(nextSection, {
    opacity: 1,
    scale: 1.5,
    transformOrigin: "center top",
    y: 140,
  });

  window.gsap
    .timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
    .to(
      heroTitle,
      {
        ease: "none",
        opacity: 0,
        scale: 1.65,
      },
      0,
    )
    .to(
      nextSection,
      {
        ease: "none",
        opacity: 1,
        scale: 1,
        y: 0,
      },
      0.08,
    );
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
  initHeroBannerAnimation();
  initHomepageScrollStory();
  initDeliveryTruckAnimation();
});
