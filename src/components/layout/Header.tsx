export function Header() {
  return (
    <header className="w-full h-16 xl:h-20 bg-white/92 backdrop-blur-md border-b border-slate-200 flex items-center justify-start xl:justify-center px-4 xl:px-8 relative z-10">
      <div className="flex items-end justify-start xl:justify-center gap-1">
        <h1 className="text-xl xl:text-2xl font-bold leading-none font-montserrat">
          POPULATIONS
        </h1>
        <span className="text-lg xl:text-xl font-bold leading-none text-primary font-montserrat">
          /
        </span>
        <span className="text-lg xl:text-xl font-bold leading-none text-primary font-montserrat">
          JP
        </span>
      </div>
      <div className="absolute right-4 xl:right-8 h-full flex items-center">
        <a
          href="https://github.com/yukikurage/yumemi-test"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
          aria-label="View source on GitHub"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 xl:w-6 xl:h-6"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="hidden xl:inline text-sm font-medium">GitHub</span>
        </a>
      </div>
    </header>
  );
}
