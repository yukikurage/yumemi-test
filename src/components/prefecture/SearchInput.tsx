import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type SearchInputProps = {
  onChange?: (value: string) => void;
  value?: string;
};

export function SearchInput({ onChange, value }: SearchInputProps) {
  const hasValue = value && value.length > 0;

  return (
    <div className="w-full h-fit relative">
      <label htmlFor="prefecture-search" className="sr-only">
        都道府県を検索
      </label>
      <input
        id="prefecture-search"
        type="text"
        placeholder="都道府県で絞り込み"
        className="w-full px-4 py-2 border bg-white/92 backdrop-blur-md transition-all focus:bg-white border-base-color-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => onChange?.(e.target.value)}
        value={value}
        aria-label="都道府県を検索"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-color-400 flex items-center">
        {hasValue ? (
          <button
            onClick={() => onChange?.("")}
            className="hover:text-base-color-600 transition-colors cursor-pointer"
            aria-label="検索をクリア"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        ) : (
          <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
