const FullPageLoader = () => (
  <div
    role="status"
    className="flex min-h-screen items-center justify-center bg-paper"
  >
    <span className="animate-pulse text-[40px] font-bold tracking-[-0.05em] text-ink motion-reduce:animate-none">
      haul<span className="text-sage">.</span>
    </span>
    <span className="sr-only">Loading</span>
  </div>
);

export default FullPageLoader;
