/**
 * ページ読み込み時のちらつき防止用スクリプト
 * SSR時に <html> タグに data-theme を設定
 */
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
          document.documentElement.dataset.theme = stored;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // data-theme を設定しないことで @media (prefers-color-scheme) に従う
        }
      } catch (e) {
        // localStorage が使えない場合は何もしない
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
