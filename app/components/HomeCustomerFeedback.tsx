import Image from "next/image";
import CommonHeading from "./CommonHeading";
import { FALLBACK_HOME_REVIEWS } from "@/constants";
import { getImageUrl } from "@/lib/image-utils";

export default function HomeCustomerFeedback() {
  const reviews = FALLBACK_HOME_REVIEWS;

  return (
    <section className="py-7 md:py-12 lg:py-20 overflow-hidden">
      <div className="text-center mb-12">
        <CommonHeading
          level={1}
          title="Our Customers Love Us"
          description="5.0 stars based on all customer reviews"
        />
      </div>

      <div className="group relative">
        {reviews.length > 0 ? (
          <div className="flex w-max gap-8 animate-marquee-left">
            {[...Array(2)].map((_, loopIndex) => (
              <div key={loopIndex} className="flex gap-8">
                {reviews.map((review) => (
                  <div
                    key={`${loopIndex}-${review.id}`}
                    className="customerReviewCard min-w-[380px] max-w-[380px] bg-white rounded-full px-6 py-4 flex items-start gap-4 shadow-sm"
                  >
                    <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(review.image)}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{review.name}</p>
                        <div className="flex text-orange-400 text-sm">
                          ★★★★★
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-snug">
                        {review.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex text-orange-400 text-2xl justify-center mb-4">
              ★★★★★
            </div>
            <p className="text-foreground/70">
              Customer reviews will appear here soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
