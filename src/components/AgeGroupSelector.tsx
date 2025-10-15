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
    <div className="w-full md:w-96 inline-flex bg-gray-100 rounded-lg p-1">
      {AGE_GROUPS.map((group) => (
        <button
          key={group.value}
          onClick={() => onChange(group.value)}
          className={`
            py-1 md:py-2 text-sm font-medium transition-all rounded-md cursor-pointer grow
            ${
              selected === group.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
