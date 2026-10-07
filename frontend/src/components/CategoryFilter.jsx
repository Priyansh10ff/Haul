import { CATEGORIES } from "../lib/format";

const OPTIONS = [{ value: "", label: "All" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];

const CategoryFilter = ({ category, setCategory }) => {
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value, label }) => {
        const active = category === value;

        return (
          <button
            key={label}
            type="button"
            onClick={() => setCategory(value)}
            aria-pressed={active}
            className={`min-h-11 rounded-full border px-5 text-[15px] transition-colors ${
              active
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-body hover:border-ink"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
