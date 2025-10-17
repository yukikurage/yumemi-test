type AgeGroup = "total" | "youth" | "working" | "elderly";

type AgeGroupSelectorProps = {
  selected: AgeGroup;
  onChange: (ageGroup: AgeGroup) => void;
};

const AGE_GROUPS = [
  { value: "total" as const, label: "全年齢" },
  { value: "youth" as const, label: "年少人口" },
  { value: "working" as const, label: "生産年齢人口" },
  { value: "elderly" as const, label: "老年人口" },
];

export function AgeGroupSelector({
  selected,
  onChange,
}: AgeGroupSelectorProps) {
  return (
    <div className="w-full xl:w-fit flex rounded-full border border-base-color-200 bg-white/92 backdrop-blur-md">
      {AGE_GROUPS.map((group) => (
        <button
          key={group.value}
          onClick={() => onChange(group.value)}
          className={`
            border-2 min-w-28 xl:min-w-32 h-8 text-sm font-medium transition-all cursor-pointer grow rounded-full
            ${
              selected === group.value
                ? "text-primary-text font-bold shadow-sm bg-primary-background border-primary-border "
                : "text-base-color-600 hover:text-base-color-900 border-transparent"
            }
          `}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}

export type { AgeGroup };
