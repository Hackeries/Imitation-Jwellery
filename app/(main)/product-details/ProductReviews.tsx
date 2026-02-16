"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import { Star, User, Loader2, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import { getImageUrl } from "@/lib/image-utils";
import { useProductReviews } from "@/hooks/use-reviews";
import { ReviewItem } from "@/services/review-service";

interface ProductReviewsProps {
  productId?: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [openReview, setOpenReview] = useState(false);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProductReviews(productId || "");

  const pages = data?.pages || [];
  const reviews = pages.flatMap((page) => page.items) || [];

  const firstPageSummary = pages[0]?.summary;
  const total = firstPageSummary?.totalReviews ?? 0;
  const averageRating = firstPageSummary?.averageRating ?? 0;
  const distribution = firstPageSummary?.ratingDistribution ?? {
    "1_star": 0,
    "2_star": 0,
    "3_star": 0,
    "4_star": 0,
    "5_star": 0,
  };

  if (!productId) return null;

  return (
    <section className="mt-10 md:mt-14 border-t border-foreground/10 pt-10">
      <div className="mx-auto px-3 md:px-8 lg:px-10">
        <div className="max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start mb-6 md:mb-16">
          <div className="lg:col-span-4">
            <RatingSummary
              averageRating={averageRating}
              totalReviews={total}
              distribution={distribution}
              onAddReview={() => setOpenReview(true)}
            />
          </div>
          <div className="lg:col-span-8">
            <ReviewsGrid
              reviews={reviews}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
        </div>
      </div>

      <AddReviewPopup open={openReview} onClose={() => setOpenReview(false)} />
    </section>
  );
}

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution: {
    "1_star": number;
    "2_star": number;
    "3_star": number;
    "4_star": number;
    "5_star": number;
  };
  onAddReview: () => void;
}

function RatingSummary({
  averageRating,
  totalReviews,
  distribution,
  onAddReview,
}: RatingSummaryProps) {
  return (
    <div className="h-fit lg:sticky lg:top-24">
      <CommonHeading level={2} className="mb-8 text-left">
        Customer Reviews
      </CommonHeading>

      <div className="bg-foreground/5 rounded-2xl p-6 text-center mb-8">
        <span className="text-5xl font-times block mb-2 font-medium">
          {averageRating.toFixed(1)}
        </span>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={20}
              className={`${i <= Math.round(averageRating)
                ? "fill-brand text-brand"
                : "fill-foreground/20 text-transparent"
                }`}
            />
          ))}
        </div>
        <p className="text-sm text-foreground/60">
          Based on {totalReviews} Reviews
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <RatingBar
          label="5"
          value={distribution["5_star"]}
          total={totalReviews}
        />
        <RatingBar
          label="4"
          value={distribution["4_star"]}
          total={totalReviews}
        />
        <RatingBar
          label="3"
          value={distribution["3_star"]}
          total={totalReviews}
        />
        <RatingBar
          label="2"
          value={distribution["2_star"]}
          total={totalReviews}
        />
        <RatingBar
          label="1"
          value={distribution["1_star"]}
          total={totalReviews}
        />
      </div>

      <div className="text-center lg:text-left">
        <p className="text-sm text-foreground/60 mb-4">
          Share your thoughts with other customers
        </p>
        <CommonButton
          variant="secondaryBtn"
          className="w-full"
          onClick={onAddReview}
        >
          Write a Review
        </CommonButton>
      </div>
    </div>
  );
}

function RatingBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1 w-12 shrink-0 font-medium">
        <span>{label}</span>
        <Star size={12} className="fill-foreground text-foreground" />
      </div>
      <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-right text-foreground/60 shrink-0 text-xs">
        {value}
      </span>
    </div>
  );
}

interface ReviewsGridProps {
  reviews: ReviewItem[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

function ReviewsGrid({
  reviews,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: ReviewsGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="animate-spin text-brand" size={32} />
        <p className="text-foreground/60 text-sm">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-foreground/20 rounded-xl bg-foreground/5">
        <p className="text-foreground/60 mb-2">No reviews yet</p>
        <p className="text-sm text-foreground/40">
          Be the first to review this product
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 text-center border-t border-foreground/10 pt-8">
          <CommonButton
            variant="secondaryBtn"
            className="max-w-fit px-8"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
              </>
            ) : (
              "Load More Reviews"
            )}
          </CommonButton>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const timeAgo = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const validImages =
    review.images?.filter((img) => img && img.length > 0) || [];

  return (
    <div className="border-b border-foreground/10 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
            <User size={20} className="text-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {review.customerId?.fullName || "Verified Buyer"}
            </p>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${i <= review.rating
                    ? "fill-brand text-brand"
                    : "fill-foreground/20 text-transparent"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-foreground/40 shrink-0">{timeAgo}</span>
      </div>

      {review.title && (
        <h4 className="font-medium text-base mb-2">{review.title}</h4>
      )}

      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
        {review.comment}
      </p>

      {validImages.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((img: string, index: number) => (
            <ReviewImage
              key={index}
              src={img}
              alt={`Review image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-foreground/10 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity">
      {!loaded && (
        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={getImageUrl(src)}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        sizes="80px"
      />
    </div>
  );
}

function AddReviewPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-background rounded-2xl p-8 relative shadow-xl text-center">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="fill-current" />
              </div>

              <Dialog.Title className="text-xl font-medium mb-3">
                Write a Review
              </Dialog.Title>

              <p className="text-foreground/70 mb-8 leading-relaxed">
                To ensure authenticity, reviews can only be submitted for
                products you have purchased. Please go to your orders page to
                rate your purchased items.
              </p>

              <div className="flex flex-col gap-3">
                <CommonButton
                  href="/account?tab=orders"
                  className="w-full justify-center"
                >
                  Go to My Orders
                </CommonButton>
                <CommonButton
                  variant="secondaryBtn"
                  onClick={onClose}
                  className="w-full justify-center"
                >
                  Cancel
                </CommonButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
