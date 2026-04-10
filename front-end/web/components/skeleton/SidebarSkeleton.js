const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-80 border-r border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="skeleton h-6 w-28 mb-2" />
        <div className="skeleton h-4 w-52" />
      </div>

      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <div className="skeleton h-10 w-full rounded-full" />
        </div>
      </div>

      <div className="overflow-y-auto w-full h-full p-2">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-3 flex items-center gap-3 rounded-lg border-b border-gray-100"
          >
            <div className="relative shrink-0">
              <div className="skeleton w-11 h-11 rounded-full" />
              <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border-2 border-white bg-gray-200" />
            </div>

            <div className="text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-44" />
            </div>

            <div className="hidden lg:flex items-center justify-center p-1">
              <div className="skeleton w-5 h-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
