export default function CartSkeleton() {
  return (
    <div className="productListPage gradientBg min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-10 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48 mb-2" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 flex gap-4"
              >
                {/* Product Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />

                {/* Product Details */}
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                  
                  <div className="flex items-center gap-4 mt-4">
                    {/* Quantity Selector */}
                    <div className="h-10 bg-gray-200 rounded-full animate-pulse w-28" />
                    
                    {/* Remove Button */}
                    <div className="h-10 bg-gray-200 rounded-full animate-pulse w-24" />
                  </div>
                </div>

                {/* Price */}
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-4">
              <div className="h-7 bg-gray-200 rounded-lg animate-pulse w-40 mb-6" />
              
              {/* Summary Lines */}
              <div className="space-y-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
              </div>

              {/* Checkout Button */}
              <div className="h-12 bg-gray-200 rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
