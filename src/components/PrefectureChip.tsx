import type { components } from "@/generated/api";

type Prefecture = components["schemas"]["Prefecture"];

type PrefectureChipProps = {
  prefecture: Prefecture;
  onRemove: () => void;
};

export function PrefectureChip({ prefecture, onRemove }: PrefectureChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full">
      <span className="text-sm font-medium">{prefecture.prefName}</span>
      <button
        onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-300 transition-colors"
        aria-label={`${prefecture.prefName}を削除`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3L3 9M3 3L9 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
