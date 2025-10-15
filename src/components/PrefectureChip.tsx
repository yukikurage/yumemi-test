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
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-300 transition-colors"
        aria-label={`${prefecture.prefName}を削除`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
