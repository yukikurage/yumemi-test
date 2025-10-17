"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // マウント後にテーマを初期化（SSRミスマッチを回避）
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
      return;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = prefersDark ? "dark" : "light";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === null) return;
    // data-theme 属性を <html> に設定
    document.documentElement.dataset.theme = theme;
    // localStorage に保存
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // SSR中やマウント前は何も表示しない（ちらつき防止）
  if (theme === null) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/92 backdrop-blur-md border border-base-color-200" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/92 backdrop-blur-md border border-base-color-200 hover:bg-base-color-50 transition-colors cursor-pointer"
      aria-label={`テーマを${theme === "light" ? "ダーク" : "ライト"}モードに切り替え`}
      title={
        theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"
      }
    >
      {theme === "light" ? (
        <MoonIcon className="w-5 h-5 text-base-color-700" />
      ) : (
        <SunIcon className="w-5 h-5 text-base-color-700" />
      )}
    </button>
  );
}
