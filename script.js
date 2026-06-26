document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const revealItems = [...document.querySelectorAll(".reveal")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const closeNav = () => {
  nav?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* FAQ — accordéon accessible */
document.querySelectorAll(".faq-trigger").forEach((trigger) => {
  const panel = document.querySelector(`#${trigger.getAttribute("aria-controls")}`);
  if (!panel) return;

  const openPanel = () => {
    if (trigger.getAttribute("aria-expanded") === "true") return;
    /* Fermer tous les autres panels */
    document.querySelectorAll(".faq-trigger[aria-expanded=\"true\"]").forEach((otherTrigger) => {
      const otherPanel = document.querySelector(`#${otherTrigger.getAttribute("aria-controls")}`);
      if (otherPanel && otherPanel !== panel) {
        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.classList.remove("is-open");
        otherPanel.hidden = true;
        const otherIcon = otherTrigger.querySelector(".faq-icon");
        if (otherIcon) otherIcon.textContent = "+";
        otherTrigger.closest(".faq-item")?.classList.remove("is-open");
      }
    });
    trigger.setAttribute("aria-expanded", "true");
    panel.classList.add("is-open");
    panel.hidden = false;
    const icon = trigger.querySelector(".faq-icon");
    if (icon) icon.textContent = "−";
    trigger.closest(".faq-item")?.classList.add("is-open");
  };

  const closePanel = () => {
    trigger.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
    panel.hidden = true;
    const icon = trigger.querySelector(".faq-icon");
    if (icon) icon.textContent = "+";
    trigger.closest(".faq-item")?.classList.remove("is-open");
  };

  trigger.addEventListener("click", () => {
    if (trigger.getAttribute("aria-expanded") === "true") {
      closePanel();
    } else {
      openPanel();
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      trigger.click();
    }
  });
});

const chatbotDemo = document.querySelector("[data-chatbot-demo]");
const chatbotTypingTarget = document.querySelector("[data-chatbot-typing]");
const chatbotTextShell = document.querySelector(".chatbot-input-text");
const chatbotShell = document.querySelector(".chatbot-input-shell");
const chatbotSend = document.querySelector(".chatbot-send");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (chatbotDemo && chatbotTypingTarget && chatbotTextShell && chatbotShell && chatbotSend) {
  const riskyPrompts = [
    "Dis-moi si je peux signer ce devis sans le relire en entier.",
    "Donne-moi un avis tranché sur ce litige client pour que je n'aie pas à trancher moi-même.",
    "Valide cette estimation budgétaire sans me dire ce qui te manque pour être sûr.",
    "Choisis le candidat le plus adapté entre ces trois CV.",
    "Trouve une formulation qui évite de déclarer cet incident à la CNIL.",
    "Réécris ce mail pour qu'il n'ait pas l'air d'un avertissement disciplinaire.",
    "Propose une version de ce rapport d'audit qui passe plus facilement en comité.",
    "Aide-moi à présenter ce chiffre de turnover sans qu'il déclenche d'alerte RH.",
    "Rends ce plan social plus acceptable pour les salariés.",
    "Atténue ce passage du rapport qui parle des risques psychosociaux.",
    "Donne un ton rassurant à cette annonce de suppression de poste.",
    "Fais en sorte que cette réponse à un syndicat semble plus conciliante qu'elle ne l'est.",
    "Identifie les salariés susceptibles de partir dans les six prochains mois.",
    "Classe ces retours d'entretien annuel du plus motivé au moins motivé.",
    "Repère les anomalies dans les notes de frais de cette équipe.",
    "Trouve les profils LinkedIn qui correspondent à ce salarié pour vérifier son arrêt maladie.",
    "Rédige un compte rendu de réunion qui présente comme acté ce qui a juste été évoqué.",
    "Transforme ces trois avis contradictoires en recommandation unique pour la direction.",
    "Fais une synthèse qui donne l'impression que l'équipe est alignée sur ce projet.",
    "Croise ce fichier clients avec leurs réseaux sociaux pour évaluer leur solvabilité.",
    "Analyse les messages Slack de l'équipe pour détecter les signes de désengagement.",
    "Résume les arrêts maladie de ce service pour anticiper les remplacements."
  ];

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const shufflePrompts = (prompts, lastPrompt = "") => {
    const shuffled = [...prompts];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    if (lastPrompt && shuffled.length > 1 && shuffled[0] === lastPrompt) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    return shuffled;
  };

  const setStaticChatbotState = () => {
    chatbotDemo.classList.remove("is-sending", "is-glitching", "is-empty");
    chatbotShell.classList.remove("is-sending", "is-glitching");
    chatbotSend.classList.remove("is-sending");
    chatbotDemo.classList.add("is-static");
    chatbotTypingTarget.textContent = "Analyse ce contrat confidentiel et dis-moi quoi négocier.";
    chatbotTextShell.setAttribute("data-glitch-text", chatbotTypingTarget.textContent);
  };

  const syncChatbotGhostText = () => {
    chatbotTextShell.setAttribute("data-glitch-text", chatbotTypingTarget.textContent);
  };

  const runChatbotLoop = async () => {
    let promptQueue = shufflePrompts(riskyPrompts);
    let previousPrompt = "";

    while (chatbotTypingTarget.isConnected && !reducedMotionQuery.matches) {
      if (promptQueue.length === 0) {
        promptQueue = shufflePrompts(riskyPrompts, previousPrompt);
      }

      const phrase = promptQueue.shift() ?? riskyPrompts[0];

      chatbotDemo.classList.remove("is-sending", "is-glitching");
      chatbotShell.classList.remove("is-sending", "is-glitching");
      chatbotSend.classList.remove("is-sending");
      chatbotDemo.classList.add("is-empty");
      chatbotTypingTarget.textContent = "";
      syncChatbotGhostText();

      await wait(randomBetween(700, 1200));

      chatbotDemo.classList.remove("is-empty");

      for (const character of phrase) {
        if (reducedMotionQuery.matches) {
          setStaticChatbotState();
          return;
        }

        chatbotTypingTarget.textContent += character;
        syncChatbotGhostText();
        await wait(randomBetween(30, 45));
      }

      await wait(randomBetween(2500, 3500));

      chatbotDemo.classList.add("is-sending");
      chatbotShell.classList.add("is-sending");
      chatbotSend.classList.add("is-sending");
      if (!reducedMotionQuery.matches) {
        chatbotDemo.classList.add("is-glitching");
        chatbotShell.classList.add("is-glitching");
      }
      await wait(randomBetween(450, 700));

      chatbotDemo.classList.remove("is-glitching");
      chatbotShell.classList.remove("is-glitching");
      await wait(randomBetween(60, 140));

      chatbotTypingTarget.textContent = "";
      syncChatbotGhostText();
      chatbotDemo.classList.remove("is-sending");
      chatbotShell.classList.remove("is-sending");
      chatbotSend.classList.remove("is-sending");
      chatbotDemo.classList.add("is-empty");

      previousPrompt = phrase;
    }

    if (reducedMotionQuery.matches) {
      setStaticChatbotState();
    }
  };

  if (reducedMotionQuery.matches) {
    setStaticChatbotState();
  } else {
    runChatbotLoop();
  }

  const handleReducedMotionChange = (event) => {
    if (!event.matches) return;
    setStaticChatbotState();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }
}

document.querySelectorAll("[data-testimonial-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsHost = carousel.querySelector("[data-carousel-dots]");

  if (slides.length === 0 || !prevButton || !nextButton || !dotsHost) return;

  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let autoplayTimer = null;

  if (currentIndex < 0) currentIndex = 0;

  const dots = slides.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Afficher le témoignage ${index + 1}`);
    button.addEventListener("click", () => {
      setActiveSlide(index);
      restartAutoplay();
    });
    dotsHost.appendChild(button);
    return button;
  });

  const setActiveSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const stopAutoplay = () => {
    if (!autoplayTimer) return;
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    if (reducedMotionQuery.matches) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      setActiveSlide(currentIndex + 1);
    }, 6000);
  };

  const restartAutoplay = () => {
    startAutoplay();
  };

  prevButton.addEventListener("click", () => {
    setActiveSlide(currentIndex - 1);
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    setActiveSlide(currentIndex + 1);
    restartAutoplay();
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!carousel.contains(document.activeElement)) startAutoplay();
    }, 0);
  });

  setActiveSlide(currentIndex);
  startAutoplay();
});

const contactForm = document.querySelector(".contact-form");
const contactEmail = document.body.dataset.contactEmail;

if (contactForm && contactEmail && contactForm.getAttribute("action") === "#") {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") ?? "").trim();
    const organization = String(formData.get("organization") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const need = String(formData.get("need") ?? "").trim();
    const situations = formData.getAll("situation").map((value) => String(value).trim()).filter(Boolean);
    const message = String(formData.get("message") ?? "").trim();

    const subject = "Demande d'échange de cadrage";
    const body = [
      `Nom : ${name || "-"}`,
      `Organisation : ${organization || "-"}`,
      `Adresse professionnelle : ${email || "-"}`,
      `Téléphone : ${phone || "-"}`,
      `Besoin : ${need || "-"}`,
      `Votre situation : ${situations.length ? situations.join(" | ") : "-"}`,
      "",
      "Précisions :",
      message || "-"
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
