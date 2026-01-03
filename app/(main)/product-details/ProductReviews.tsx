"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";

/* ================= MAIN EXPORT ================= */

export default function ProductReviews() {
  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto px-3 md:px-8 lg:px-10">
        <div className="max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-6 md:mb-16">
          <RatingSummary />
          <ReviewsGrid />
        </div>
      </div>
    </section>
  );
}

/* ================= RATING SUMMARY ================= */

function RatingSummary() {
  return (
    <div className="h-fit lg:sticky lg:top-2/6">
      <CommonHeading level={1} className="mb-10 text-left">
        Reviews
      </CommonHeading>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl font-semibold text-foreground">4.8</span>

        <div>
          <StarRow rating={5} />
          <p className="text-sm text-foreground/70">
            Based on 400+ verified buyers
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <RatingBar label="5" value={82} />
        <RatingBar label="4" value={14} />
        <RatingBar label="3" value={3} />
        <RatingBar label="2" value={1} />
        <RatingBar label="1" value={0} />
      </div>

      <CommonButton
        variant="primaryBtn"
        className="w-fit max-w-fit"
        aria-label="Add your rating"
      >
        Add Your Rating
      </CommonButton>
    </div>
  );
}

/* ================= STAR ROW ================= */

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          aria-hidden="true"
          className={
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

/* ================= RATING BAR ================= */

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 text-sm">{label}</span>
      <div
        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
        aria-label={`${value}% users rated ${label} stars`}
      >
        <div className="h-full bg-brand" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ================= REVIEWS GRID ================= */

function ReviewsGrid() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ReviewCard
          name="Pankaj Chaudhary"
          rating={5}
          review="Absolutely loved the finish and quality. Looks premium and feels very comfortable to wear. Definitely worth the price."
          images={["/img/pendant.webp", "/img/pendant.webp"]}
        />

        <ReviewCard
          name="Aviral Joshi"
          rating={5}
          review="Exceeded my expectations. The detailing is excellent and packaging was very neat. Bought it as a gift and it was appreciated a lot."
        />

        <ReviewCard
          name="Akanksha Gaur"
          rating={4}
          review="Elegant and classy design. Goes well with both traditional and western outfits. Would surely recommend."
        />

        <ReviewCard
          name="Ananya Gaur"
          rating={5}
          review="Beautiful craftsmanship. The shine and polish are perfect. I’ve worn it multiple times and received so many compliments."
        />

        <ReviewCard
          name="Sonu"
          rating={4}
          review="Very good quality for daily wear. Lightweight and comfortable. Delivery was also quick."
        />
      </div>

      <div className="mt-5 text-center">
        <CommonButton
          href="#"
          variant="secondaryBtn"
          className="max-w-fit"
          aria-label="View more reviews"
        >
          View More
        </CommonButton>
      </div>
    </div>
  );
}

/* ================= REVIEW CARD ================= */

function ReviewCard({
  name,
  rating,
  review,
  images = [],
}: {
  name: string;
  rating: number;
  review: string;
  images?: string[];
}) {
  return (
    <div className="border border-foreground/20 rounded-2xl p-4 md:p-6 flex flex-col">
      <p className="font-medium mb-1">{name}</p>
      <p className="text-xs text-foreground/70 mb-3">Verified Purchase</p>

      <StarRow rating={rating} />

      <p className="text-sm text-foreground mt-3 flex-1">{review}</p>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-md overflow-hidden border border-foreground/20"
            >
              <Image
                src={img}
                alt={`Customer review image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
