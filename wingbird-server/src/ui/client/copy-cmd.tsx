document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
  const icon = btn.querySelector<HTMLElement>("[data-copy-icon]");
  btn.addEventListener("click", async () => {
    const cmd = btn.getAttribute("data-copy") ?? "";
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = cmd;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    if (icon) {
      const prev = icon.textContent;
      icon.textContent = "✓";
      btn.classList.add("border-emerald-500");
      setTimeout(() => {
        icon.textContent = prev;
        btn.classList.remove("border-emerald-500");
      }, 1200);
    }
  });
});
