const HentaiDetailSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="skeleton h-96 w-full rounded-lg"></div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="skeleton h-10 w-3/4 rounded"></div>
        <div className="flex gap-2">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-6 w-24 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-5/6 rounded"></div>
        </div>
        <div className="skeleton h-12 w-32 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default HentaiDetailSkeleton;
