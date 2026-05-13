export function BallDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-28 rounded-2xl bg-white/10" />
      <div>
        <div className="mb-4 h-7 w-48 rounded-lg bg-white/15" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fill,minmax(90px,1fr))]">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-36 rounded-2xl border-2 border-white/10 bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="flex flex-col gap-6 rounded-3xl border-2 border-white/10 bg-white/10 p-6 md:flex-row md:items-center">
        <div className="mx-auto size-48 rounded-3xl bg-white/15 md:mx-0 md:size-52" />
        <div className="flex-1 space-y-3">
          <div className="mx-auto h-10 w-48 rounded-lg bg-white/15 md:mx-0" />
          <div className="mx-auto h-6 w-24 rounded bg-white/10 md:mx-0" />
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <div className="h-8 w-20 rounded-full bg-white/15" />
            <div className="h-8 w-20 rounded-full bg-white/15" />
          </div>
          <div className="mx-auto h-11 w-40 rounded-full bg-white/10 md:mx-0" />
          <div className="h-16 rounded-xl bg-white/10" />
        </div>
      </div>
      <div className="h-24 rounded-2xl bg-white/10" />
      <div className="h-48 rounded-2xl bg-white/10" />
    </div>
  );
}

export function InlineRowSkeleton({ className = '' }: { className?: string }) {
  return <div className={`h-16 animate-pulse rounded-xl bg-white/10 ${className}`} aria-hidden />;
}
