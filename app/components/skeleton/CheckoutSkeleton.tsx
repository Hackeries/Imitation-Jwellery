export default function CheckoutSkeleton() {
  return (
    <div className="productListPage gradientBg min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-10 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-40 mb-4" />
              
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-48 mb-4" />
              
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-40 mb-4" />
              
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-4">
              <div className="h-7 bg-gray-200 rounded-lg animate-pulse w-40 mb-6" />
              
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-3" />
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full" />
              </div>

              {/* Summary Lines */}
              <div className="space-y-4 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="h-6 bg-gray-200 rounded animate-pulse w-28" />
                <div className="h-7 bg-gray-200 rounded animate-pulse w-24" />
              </div>

              {/* Place Order Button */}
              <div className="h-12 bg-gray-200 rounded-full animate-pulse w-full mb-4" />
              
              {/* Security Text */}
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
