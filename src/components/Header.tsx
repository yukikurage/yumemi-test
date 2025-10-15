export function Header() {
  return (
    <header className="w-full h-20 bg-white border-b border-neutral-100 flex items-center justify-center">
      <div className="flex items-end justify-center gap-1">
        <h1 className="text-3xl font-bold leading-none font-montserrat">
          POPULATIONS
        </h1>
        <span className="text-2xl font-bold leading-none text-primary font-montserrat">
          /
        </span>
        <span className="text-2xl font-bold leading-none text-primary font-montserrat">
          JP
        </span>
      </div>
    </header>
  );
}
