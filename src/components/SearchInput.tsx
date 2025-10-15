import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type SearchInputProps = {
  onChange?: (value: string) => void;
  value?: string;
};

export function SearchInput({ onChange, value }: SearchInputProps) {
  const hasValue = value && value.length > 0;

  return (
    <div className="w-full h-fit relative">
      <input
        type="text"
        placeholder="都道府県で絞り込み"
        className="w-full px-4 py-2 border bg-white border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => onChange?.(e.target.value)}
        value={value}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        {hasValue ? (
          <button
            onClick={() => onChange?.("")}
            className="hover:text-slate-600 transition-colors"
            aria-label="検索をクリア"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        ) : (
          <MagnifyingGlassIcon className="w-5 h-5" />
        )}
      </div>
    </div>
  );
}
