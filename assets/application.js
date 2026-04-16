const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const initManufacturersCounters = () => {
  const section = document.querySelector("[data-manufacturers-section]");
  const metricBoxes = document.querySelectorAll("[data-metric-box]");

  if (
    !section ||
    !metricBoxes.length ||
    prefersReducedMotion.matches ||
    typeof window.gsap === "undefined" ||
    typeof window.ScrollTrigger === "undefined"
  ) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  const parseMetricValue = (rawValue) => {
    const trimmed = rawValue.trim();
    const numberMatch = trimmed.match(/[\d,.]+/);

    if (!numberMatch) {
      return null;
    }

    const numericPart = numberMatch[0];
    const startIndex = numberMatch.index ?? 0;
    const endIndex = startIndex + numericPart.length;
    const prefix = trimmed.slice(0, startIndex);
    const suffix = trimmed.slice(endIndex);
    const normalizedNumber = numericPart.replace(/,/g, "");
    const finalValue = Number.parseFloat(normalizedNumber);
    const decimals = normalizedNumber.includes(".") ? normalizedNumber.split(".")[1].length : 0;

    if (Number.isNaN(finalValue)) {
      return null;
    }

    return {
      decimals,
      finalValue,
      prefix,
      suffix,
    };
  };

  metricBoxes.forEach((box, index) => {
    const valueEl = box.querySelector("[data-metric-value]");
    const labelEl = box.querySelector("[data-metric-label]");

    if (!valueEl) {
      return;
    }

    const parsedValue = parseMetricValue(valueEl.textContent || "");

    window.gsap.set(box, {
      opacity: 0,
      y: 36,
    });

    if (labelEl) {
      window.gsap.set(labelEl, {
        opacity: 0,
        y: 18,
      });
    }

    const revealTimeline = window.gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
      scrollTrigger: {
        trigger: box,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });

    revealTimeline.to(
      box,
      {
        duration: 0.6,
        opacity: 1,
        y: 0,
      },
      index * 0.08,
    );

    if (labelEl) {
      revealTimeline.to(
        labelEl,
        {
          duration: 0.4,
          opacity: 1,
          y: 0,
        },
        index * 0.08 + 0.1,
      );
    }

    if (!parsedValue) {
      return;
    }

    const counterState = { value: 0 };

    revealTimeline.to(
      counterState,
      {
        duration: 1.6,
        ease: "power2.out",
        value: parsedValue.finalValue,
        onUpdate: () => {
          const currentValue = parsedValue.decimals > 0 ? counterState.value.toFixed(parsedValue.decimals) : Math.round(counterState.value).toString();
          const formattedValue = Number(currentValue).toLocaleString(undefined, {
            minimumFractionDigits: parsedValue.decimals,
            maximumFractionDigits: parsedValue.decimals,
          });

          valueEl.textContent = `${parsedValue.prefix}${formattedValue}${parsedValue.suffix}`;
        },
      },
      index * 0.08 + 0.06,
    );
  });
};

const initServicesTabs = () => {
  const tabSections = document.querySelectorAll("[data-services-tabs]");

  if (!tabSections.length) {
    return;
  }

  tabSections.forEach((section) => {
    const tabs = Array.from(section.querySelectorAll("[data-services-tab]"));
    const panels = Array.from(section.querySelectorAll("[data-services-panel]"));
    const panelsWrap = section.querySelector("[data-services-panels]");
    const initialTabId = section.dataset.initialTab;

    if (!tabs.length || !panels.length || !panelsWrap) {
      return;
    }

    let activeTabId = initialTabId || panels[0].dataset.panelId;
    let isAnimating = false;

    const getPanelById = (id) => panels.find((panel) => panel.dataset.panelId === id);

    const syncTabs = (nextId) => {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.tabTarget === nextId;
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });
    };

    const showPanelImmediately = (panel) => {
      panels.forEach((item) => {
        const isCurrent = item === panel;
        item.hidden = !isCurrent;
        item.setAttribute("aria-hidden", isCurrent ? "false" : "true");
        item.style.position = isCurrent ? "relative" : "absolute";
        item.style.inset = isCurrent ? "auto" : "0";
        item.style.width = isCurrent ? "auto" : "100%";
        item.style.visibility = isCurrent ? "visible" : "hidden";
        item.style.pointerEvents = isCurrent ? "auto" : "none";
        item.style.opacity = isCurrent ? "1" : "0";
        item.style.transform = "none";
      });
      panelsWrap.style.height = `${panel.offsetHeight}px`;
    };

    const activePanel = getPanelById(activeTabId) || panels[0];
    activeTabId = activePanel.dataset.panelId;
    syncTabs(activeTabId);
    showPanelImmediately(activePanel);

    const animateToPanel = (nextId) => {
      if (isAnimating || nextId === activeTabId) {
        return;
      }

      const currentPanel = getPanelById(activeTabId);
      const nextPanel = getPanelById(nextId);

      if (!currentPanel || !nextPanel) {
        return;
      }

      syncTabs(nextId);
      isAnimating = true;

      const currentHeight = currentPanel.offsetHeight;

      nextPanel.hidden = false;
      nextPanel.setAttribute("aria-hidden", "false");
      nextPanel.style.position = "absolute";
      nextPanel.style.inset = "0";
      nextPanel.style.width = "100%";
      nextPanel.style.visibility = "visible";
      nextPanel.style.pointerEvents = "none";

      const nextHeight = nextPanel.offsetHeight;
      const direction = panels.indexOf(nextPanel) > panels.indexOf(currentPanel) ? 1 : -1;

      panelsWrap.style.height = `${currentHeight}px`;

      if (typeof window.gsap === "undefined") {
        currentPanel.hidden = true;
        currentPanel.setAttribute("aria-hidden", "true");
        nextPanel.style.position = "relative";
        nextPanel.style.inset = "auto";
        nextPanel.style.width = "auto";
        nextPanel.style.pointerEvents = "auto";
        panelsWrap.style.height = `${nextHeight}px`;
        activeTabId = nextId;
        isAnimating = false;
        return;
      }

      window.gsap.killTweensOf([currentPanel, nextPanel, panelsWrap]);

      window.gsap.set(currentPanel, {
        opacity: 1,
        x: 0,
        position: "absolute",
        inset: 0,
        width: "100%",
        visibility: "visible",
      });

      window.gsap.set(nextPanel, {
        opacity: 0,
        x: 36 * direction,
      });

      const timeline = window.gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        onComplete: () => {
          currentPanel.hidden = true;
          currentPanel.setAttribute("aria-hidden", "true");
          currentPanel.style.position = "absolute";
          currentPanel.style.inset = "0";
          currentPanel.style.width = "100%";
          currentPanel.style.visibility = "hidden";
          currentPanel.style.pointerEvents = "none";
          currentPanel.style.opacity = "0";
          currentPanel.style.transform = "none";

          nextPanel.style.position = "relative";
          nextPanel.style.inset = "auto";
          nextPanel.style.width = "auto";
          nextPanel.style.visibility = "visible";
          nextPanel.style.pointerEvents = "auto";
          nextPanel.style.opacity = "1";
          nextPanel.style.transform = "none";

          panelsWrap.style.height = `${nextPanel.offsetHeight}px`;

          activeTabId = nextId;
          isAnimating = false;
        },
      });

      timeline.to(
        panelsWrap,
        {
          duration: 0.42,
          height: nextHeight,
        },
        0,
      );

      timeline.to(
        currentPanel,
        {
          duration: 0.26,
          opacity: 0,
          x: -28 * direction,
        },
        0,
      );

      timeline.to(
        nextPanel,
        {
          duration: 0.38,
          opacity: 1,
          x: 0,
        },
        0.08,
      );
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        animateToPanel(tab.dataset.tabTarget);
      });

      tab.addEventListener("keydown", (event) => {
        const currentIndex = tabs.indexOf(tab);
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        tabs[nextIndex].focus();
        animateToPanel(tabs[nextIndex].dataset.tabTarget);
      });
    });

    window.addEventListener("resize", () => {
      const currentPanel = getPanelById(activeTabId);
      if (currentPanel && !isAnimating) {
        panelsWrap.style.height = `${currentPanel.offsetHeight}px`;
      }
    });
  });
};

const initAdvantagesAnimation = () => {
  const rows = document.querySelectorAll("[data-advantage-row]");

  if (
    !rows.length ||
    prefersReducedMotion.matches ||
    typeof window.gsap === "undefined" ||
    typeof window.ScrollTrigger === "undefined"
  ) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  rows.forEach((row) => {
    const direction = row.dataset.advantageDirection === "right" ? 1 : -1;
    const media = row.querySelector("[data-advantage-media]");
    const accent = row.querySelector("[data-advantage-accent]");
    const eyebrow = row.querySelector("[data-advantage-eyebrow]");
    const title = row.querySelector("[data-advantage-title]");
    const body = row.querySelector("[data-advantage-body]");
    const copyParts = [eyebrow, title, body].filter(Boolean);

    if (media) {
      window.gsap.set(media, {
        clipPath: "inset(0 0 100% 0)",
        opacity: 0.7,
        scale: 1.12,
        transformOrigin: "center center",
        x: 90 * direction,
      });
    }

    if (accent) {
      window.gsap.set(accent, {
        opacity: 0,
        rotate: 10 * direction,
        scale: 0.85,
        x: 50 * direction,
        y: 36,
      });
    }

    if (copyParts.length) {
      window.gsap.set(copyParts, {
        opacity: 0,
        x: -48 * direction,
        y: 22,
      });
    }

    const timeline = window.gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
      scrollTrigger: {
        trigger: row,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });

    if (accent) {
      timeline.to(
        accent,
        {
          duration: 1,
          opacity: 0.55,
          rotate: 0,
          scale: 1,
          x: 0,
          y: 0,
        },
        0,
      );

      window.gsap.to(accent, {
        ease: "none",
        rotate: -8 * direction,
        scrollTrigger: {
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (media) {
      timeline.to(
        media,
        {
          duration: 1.15,
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          scale: 1,
          x: 0,
        },
        0.08,
      );
    }

    if (copyParts.length) {
      timeline.to(
        copyParts,
        {
          duration: 0.72,
          opacity: 1,
          stagger: 0.12,
          x: 0,
          y: 0,
        },
        0.18,
      );
    }
  });
};

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
  initManufacturersCounters();
  initServicesTabs();
  initHeroBannerAnimation();
  initHomepageScrollStory();
  initDeliveryTruckAnimation();
  initAdvantagesAnimation();
});
