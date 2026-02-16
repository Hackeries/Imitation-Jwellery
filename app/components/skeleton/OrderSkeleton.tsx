export default function OrderSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 animate-pulse">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-gray-300 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <OrderSkeleton key={index} />
      ))}
    </div>
  );
}
