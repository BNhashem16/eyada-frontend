/* Theme bootstrap. Runs before React hydrates so the page renders with the
 * user's preferred theme and avoids flash-of-wrong-theme. Loaded as an
 * external script (not inline) so no CSP nonce is required: the `'self'`
 * directive in script-src is sufficient on every route. */
(function () {
  try {
    var theme = localStorage.getItem("eyada-theme") || "system";
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    var resolved = theme === "system" ? systemTheme : theme;
    document.documentElement.classList.add(resolved);
  } catch (e) {
    /* localStorage unavailable; default light */
  }
})();
