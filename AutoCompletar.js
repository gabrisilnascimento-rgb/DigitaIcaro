/**
 * Digita o texto exibido no desafio no campo de resposta.
 *
 * IMPORTANTE:
 * 1. Este arquivo precisa ser incluído no HTML da página do jogo.
 * 2. Ajuste PROMPT_SELECTOR e INPUT_SELECTOR aos seletores reais do jogo.
 * 3. O script não envia dados para nenhum servidor.
 */
(() => {
  "use strict";

  const CONFIG = {
    // Ajuste estes seletores conforme o HTML real do jogo:
    PROMPT_SELECTOR: "[data-typing-text], #texto-alvo, .texto-alvo, .text-to-type",
    INPUT_SELECTOR: "textarea, input[type='text'], [contenteditable='true']",
    DELAY_BETWEEN_KEYS_MS: 18
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function getPromptElement() {
    return document.querySelector(CONFIG.PROMPT_SELECTOR);
  }

  function getInputElement() {
    const candidates = [...document.querySelectorAll(CONFIG.INPUT_SELECTOR)];
    return candidates.find((el) => {
      const style = getComputedStyle(el);
      return !el.disabled &&
        !el.readOnly &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.getBoundingClientRect().width > 0 &&
        el.getBoundingClientRect().height > 0;
    });
  }

  function setText(input, value) {
    input.focus();

    if (input.isContentEditable) {
      input.textContent = value;
      input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: value
      }));
      return;
    }

    const prototype = input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (setter) setter.call(input, value);
    else input.value = value;

    input.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: value
    }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function typeText(input, text) {
    input.focus();

    // Simula digitação tecla por tecla quando o jogo depende de eventos de teclado.
    // O conteúdo é digitado somente após o clique do usuário no botão.
    if (input.isContentEditable) {
      input.textContent = "";
      for (const char of text) {
        input.dispatchEvent(new KeyboardEvent("keydown", {
          key: char, bubbles: true
        }));
        input.textContent += char;
        input.dispatchEvent(new InputEvent("input", {
          bubbles: true, inputType: "insertText", data: char
        }));
        input.dispatchEvent(new KeyboardEvent("keyup", {
          key: char, bubbles: true
        }));
        await sleep(CONFIG.DELAY_BETWEEN_KEYS_MS);
      }
      return;
    }

    // Em campos comuns, atualiza o valor de forma compatível com formulários.
    setText(input, text);
  }

  function addButton() {
    if (document.getElementById("digita-icaro-autocomplete")) return;

    const button = document.createElement("button");
    button.id = "digita-icaro-autocomplete";
    button.type = "button";
    button.textContent = "Preencher texto";
    Object.assign(button.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      padding: "12px 16px",
      border: "0",
      borderRadius: "10px",
      background: "#2457d6",
      color: "#fff",
      font: "600 14px system-ui, sans-serif",
      boxShadow: "0 4px 16px rgba(0,0,0,.25)",
      cursor: "pointer"
    });

    button.addEventListener("click", async () => {
      const promptElement = getPromptElement();
      const input = getInputElement();

      if (!promptElement) {
        alert("Não encontrei o texto do desafio. Ajuste PROMPT_SELECTOR no arquivo AutoCompletar.js.");
        return;
      }
      if (!input) {
        alert("Não encontrei o campo de digitação. Ajuste INPUT_SELECTOR no arquivo AutoCompletar.js.");
        return;
      }

      const text = (promptElement.innerText || promptElement.textContent || "").trim();
      if (!text) {
        alert("O texto do desafio está vazio.");
        return;
      }

      await typeText(input, text);
    });

    document.body.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButton, { once: true });
  } else {
    addButton();
  }
})();
