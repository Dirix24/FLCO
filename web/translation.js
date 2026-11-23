"use strict";

(() => {
  const button = document.getElementById("enable-translation");
  const selector = document.getElementById("page-translation");
  const message = document.getElementById("translation-status");

  const panel = document.getElementById("idioma");
  const shortcut = document.getElementById("language-button");

  shortcut?.addEventListener("click", () => {
    panel.open = true;
    panel.scrollIntoView({block: "start"});
    const languages = selector.querySelector("select");
    if (button.hidden && languages) {
      languages.focus();
    } else {
      panel.querySelector("summary").focus({preventScroll: true});
      if (!button.disabled) button.click();
    }
  });

  button.addEventListener("click", () => {
    button.disabled = true;
    message.textContent = "Cargando idiomas… / Loading languages…";
    const script = document.createElement("script");
    const observer = new MutationObserver(() => {
      const languages = selector.querySelector("select");
      if (!languages || languages.options.length < 2) return;
      observer.disconnect();
      clearTimeout(timeout);
      languages.setAttribute("aria-label", "Idioma / Language");
      button.hidden = true;
      message.textContent = "";
      languages.focus();
    });

    function unavailable() {
      clearTimeout(timeout);
      observer.disconnect();
      script.remove();
      delete window.initFLCOTranslation;
      selector.replaceChildren();
      button.disabled = false;
      message.textContent = "El selector no está disponible. Usa el enlace de Google Translate.";
    }

    const timeout = setTimeout(unavailable, 12000);
    observer.observe(selector, {childList: true, subtree: true});

    window.initFLCOTranslation = () => {
      delete window.initFLCOTranslation;
      try {
        new window.google.translate.TranslateElement({pageLanguage: "es"}, selector.id);
      } catch {
        unavailable();
      }
    };
    script.src = "https://translate.google.com/translate_a/element.js?cb=initFLCOTranslation";
    script.addEventListener("error", unavailable, {once: true});
    document.head.append(script);
  });
})();
