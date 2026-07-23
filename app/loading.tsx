export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <div className="mb-10 h-10 w-2/3 max-w-md animate-pulse bg-line" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse bg-line" />
            <div className="mt-3 h-4 w-3/4 animate-pulse bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
