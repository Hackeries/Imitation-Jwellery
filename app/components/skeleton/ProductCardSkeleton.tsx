export default function ProductCardSkeleton() {
  return (
    <div className="group text-center h-full flex flex-col">
      <div className="commonProductImgWrap relative h-[250px] md:h-[320px] w-full overflow-hidden rounded-2xl mb-4 bg-gray-200">
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      </div>

      <div className="space-y-3 px-2">
        <div className="h-5 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
