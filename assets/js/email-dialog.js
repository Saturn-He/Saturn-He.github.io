/**
 * Contact dialog for the e-mail links (same look as the citation dialog).
 * Two choices side by side: copy the address, or open the visitor's mail app.
 * Without JavaScript the links stay plain mailto links.
 */
(function () {
  "use strict";

  const focusableSelector = ["button:not([disabled])", "a[href]", "[tabindex]:not([tabindex='-1'])"].join(",");
  let active = null;

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  function setCopyState(button, state) {
    const icon = button.querySelector("i");
    const en = button.querySelector(".lang-en");
    const zh = button.querySelector(".lang-zh");
    button.classList.toggle("is-copied", state === "copied");
    button.classList.toggle("is-error", state === "error");
    if (state === "copied") {
      icon.className = "fas fa-check"; en.textContent = "Copied"; zh.textContent = "已复制";
    } else if (state === "error") {
      icon.className = "fas fa-exclamation-circle"; en.textContent = "Press Ctrl+C to copy"; zh.textContent = "已选中，请按 Ctrl+C";
    } else {
      icon.className = "fas fa-copy"; en.textContent = "Copy address"; zh.textContent = "复制邮箱";
    }
  }

  function open(email, trigger) {
    if (active) active.close(true);

    const modal = document.createElement("div");
    modal.className = "citation-modal email-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "email-dialog-title");
    modal.innerHTML = `
      <section class="citation-modal__panel email-modal__panel" tabindex="-1">
        <header class="citation-modal__header">
          <div class="citation-modal__heading">
            <h2 class="citation-modal__title" id="email-dialog-title">
              <span class="lang-en">Contact by e-mail</span><span class="lang-zh">联系邮箱</span>
            </h2>
            <p class="email-modal__address"></p>
          </div>
          <button class="citation-dismiss-btn" type="button" aria-label="Close" title="Close">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </header>
        <div class="citation-modal__body email-options">
          <div class="email-option">
            <h3 class="email-option__title"><i class="fas fa-copy" aria-hidden="true"></i>
              <span class="lang-en">Copy the address</span><span class="lang-zh">复制邮箱地址</span></h3>
            <p class="email-option__desc">
              <span class="lang-en">Copies the address to your clipboard, so you can paste it into the mail service you use, such as web mail or a phone app.</span>
              <span class="lang-zh">把邮箱地址复制到剪贴板，再粘贴到你常用的邮箱（网页邮箱、手机邮箱等）里发信。</span>
            </p>
            <button class="citation-copy-btn email-option__btn" type="button" aria-live="polite">
              <i class="fas fa-copy" aria-hidden="true"></i>
              <span class="lang-en">Copy address</span><span class="lang-zh">复制邮箱</span>
            </button>
          </div>
          <div class="email-option">
            <h3 class="email-option__title"><i class="fas fa-paper-plane" aria-hidden="true"></i>
              <span class="lang-en">Write in your mail app</span><span class="lang-zh">用邮件程序发送</span></h3>
            <p class="email-option__desc">
              <span class="lang-en">Opens the default mail app on your computer or phone (e.g. Outlook, Apple Mail) with a new message to me. If nothing happens, no mail app is set up; use "Copy address" instead.</span>
              <span class="lang-zh">打开电脑或手机上默认的邮件程序（如 Outlook、Apple 邮件），新建一封发给我的邮件。若点击后没有反应，说明未设置邮件程序，请改用「复制邮箱」。</span>
            </p>
            <a class="citation-download-btn email-option__btn" href="">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>
              <span class="lang-en">Send directly</span><span class="lang-zh">直接发送</span>
            </a>
          </div>
        </div>
      </section>`;

    const panel = modal.querySelector(".email-modal__panel");
    const address = modal.querySelector(".email-modal__address");
    const copyButton = modal.querySelector(".citation-copy-btn");
    const sendLink = modal.querySelector(".citation-download-btn");
    const closeButton = modal.querySelector(".citation-dismiss-btn");
    const controller = new AbortController();
    const signal = controller.signal;
    let resetTimer = null;
    let removed = false;

    address.textContent = email;
    sendLink.href = "mailto:" + email;

    function cleanup() {
      if (removed) return;
      removed = true;
      controller.abort();
      window.clearTimeout(resetTimer);
      modal.remove();
      if (active && active.modal === modal) active = null;
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    }

    function close(immediate) {
      if (removed) return;
      if (immediate) { cleanup(); return; }
      modal.classList.add("is-closing");
      modal.addEventListener("animationend", cleanup, { once: true });
      window.setTimeout(cleanup, 220);
    }

    async function copyAddress() {
      window.clearTimeout(resetTimer);
      try {
        await copyText(email);
        setCopyState(copyButton, "copied");
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(address);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setCopyState(copyButton, "error");
      }
      resetTimer = window.setTimeout(() => setCopyState(copyButton, "idle"), 2500);
    }

    function onKey(event) {
      if (event.key === "Escape") { event.preventDefault(); close(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll(focusableSelector));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    closeButton.addEventListener("click", () => close(false), { signal });
    copyButton.addEventListener("click", copyAddress, { signal });
    modal.addEventListener("click", (event) => { if (event.target === modal) close(false); }, { signal });
    document.addEventListener("keydown", onKey, { signal });

    document.body.appendChild(modal);
    active = { modal, close };
    window.requestAnimationFrame(() => panel.focus());
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a.jh-email-open");
    if (!link) return;
    event.preventDefault();
    open(link.getAttribute("data-email") || link.getAttribute("href").replace(/^mailto:/, ""), link);
  });

  window.EmailDialog = { open };
})();
