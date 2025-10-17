import type { components } from "@/generated/api";

type Prefecture = components["schemas"]["Prefecture"];

type PrefectureChipProps = {
  prefecture: Prefecture;
  onRemove: () => void;
};

export function PrefectureChip({ prefecture, onRemove }: PrefectureChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 h-8 bg-white border border-slate-200 has-[button:hover]:opacity-80 transition-all rounded-full shrink-0">
      <span className="text-sm">{prefecture.prefName}</span>
      <button
        onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer"
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
