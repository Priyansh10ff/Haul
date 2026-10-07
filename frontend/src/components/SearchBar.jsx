import { SearchIcon } from "./Icons";

const SearchBar = ({ search, setSearch }) => {
  return (
    <label className="flex min-h-11 flex-1 basis-72 items-center gap-2.5 rounded-full border border-line bg-white px-[18px] focus-within:border-ink">
      <SearchIcon size={16} className="text-muted" />
      <span className="sr-only">Search products</span>
      <input
        type="search"
        placeholder="Search headphones, books, mugs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-body outline-none placeholder:text-faint"
      />
    </label>
  );
};

export default SearchBar;
