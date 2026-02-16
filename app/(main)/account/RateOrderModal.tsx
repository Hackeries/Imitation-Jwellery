"use client";

import { Fragment, useState, useRef, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Star, Loader2, Upload } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import { toast } from "sonner";
import { useCreateBulkReviews } from "@/hooks/use-reviews";
import Image from "next/image";
import { OrderDetails } from "@/services/orders-service";
import { ReviewItem } from "@/services/review-service";
import { getImageUrl } from "@/lib/image-utils";

interface RateOrderModalProps {
  open: boolean;
  onClose: () => void;
  order?: OrderDetails | null;
  mode?: "edit" | "view";
  existingReviews?: ReviewItem[];
}

interface ReviewState {
  rating: number;
  title: string;
  comment: string;
  files: File[];
}

export default function RateOrderModal({
  open,
  onClose,
  order,
  mode = "edit",
  existingReviews = [],
}: RateOrderModalProps) {
  // State to track ratings for multiple items by ID
  const [reviews, setReviews] = useState<
    Record<
      string,
      {
        rating: number;
        title: string;
        comment: string;
        files: File[];
      }
    >
  >({});

  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bulkReviewMutation = useCreateBulkReviews();

  const existingReviewsMap = useMemo(() => {
    const map = new Map<string, ReviewItem>();
    existingReviews.forEach((review) => {
      const productId =
        typeof review.productId === "string"
          ? review.productId
          : review.productId._id;
      map.set(productId, review);
    });
    return map;
  }, [existingReviews]);

  useEffect(() => {
    if (open && order?.items) {
      const initialReviews: typeof reviews = {};
      order.items.forEach((item) => {
        const existingReview = existingReviewsMap.get(item.productId);
        initialReviews[item.productId] = {
          rating: existingReview?.rating || 0,
          title: existingReview?.title || "",
          comment: existingReview?.comment || "",
          files: [],
        };
      });
      setReviews(initialReviews);
    }
  }, [open, order, existingReviewsMap]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setReviews({});
        setHoveredProductId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const updateReview = (
    productId: string,
    field: keyof ReviewState,
    value: number | string | File[],
  ) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (
    productId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const currentFiles = reviews[productId]?.files || [];

      if (currentFiles.length + newFiles.length > 3) {
        toast.error("You can upload a maximum of 3 images per product");
        return;
      }

      updateReview(productId, "files", [...currentFiles, ...newFiles]);
    }
  };

  const removeFile = (productId: string, index: number) => {
    const currentFiles = reviews[productId]?.files || [];
    updateReview(
      productId,
      "files",
      currentFiles.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = () => {
    if (!order || !order.id) {
      toast.error("Order not found");
      return;
    }

    const ratedProducts = Object.entries(reviews)
      .filter(([, review]) => {
        const rating = Number(review.rating);
        return rating > 0 && rating <= 5;
      })
      .map(([productId, review]) => {
        const cleanReview: {
          productId: string;
          rating: number;
          title?: string;
          comment?: string;
        } = {
          productId: String(productId),
          rating: Number(review.rating),
        };

        const trimmedTitle = (review.title || "").trim();
        if (trimmedTitle && trimmedTitle.length >= 5) {
          cleanReview.title = trimmedTitle;
        }

        const trimmedComment = (review.comment || "").trim();
        if (trimmedComment && trimmedComment.length >= 10) {
          cleanReview.comment = trimmedComment;
        }

        return cleanReview;
      });

    if (ratedProducts.length === 0) {
      toast.error("Please rate at least one product");
      return;
    }

    const filesByProductId: Record<string, File[]> = {};
    ratedProducts.forEach((ratedProduct) => {
      const review = reviews[ratedProduct.productId];
      if (review && review.files && review.files.length > 0) {
        filesByProductId[ratedProduct.productId] = review.files;
      }
    });

    const BATCH_SIZE = 10;
    const batches: Array<{
      orderId: string;
      products: Array<{
        productId: string;
        rating: number;
        title?: string;
        comment?: string;
      }>;
      filesByProductId: Record<string, File[]>;
    }> = [];

    for (let i = 0; i < ratedProducts.length; i += BATCH_SIZE) {
      const batchProducts = ratedProducts.slice(i, i + BATCH_SIZE);
      const batchFilesByProductId: Record<string, File[]> = {};

      batchProducts.forEach((product) => {
        if (filesByProductId[product.productId]) {
          batchFilesByProductId[product.productId] =
            filesByProductId[product.productId];
        }
      });

      batches.push({
        orderId: String(order.id),
        products: batchProducts,
        filesByProductId: batchFilesByProductId,
      });
    }

    const submitBatches = async () => {
      try {
        for (const batch of batches) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve, reject) => {
            bulkReviewMutation.mutate(batch, {
              onSuccess: () => resolve(null),
              onError: (err) => reject(err),
            });
          });
        }
        onClose();
      } catch {
        toast.error("Failed to submit all reviews");
      }
    };

    submitBatches();
  };

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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium">
                    {mode === "view" ? "Your Reviews" : "Rate Order Items"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {!order || order.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">
                      No items found to rate in this order.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`${order.items.length >= 5
                        ? "max-h-[60vh] overflow-y-auto custom-scrollbar"
                        : ""
                        } mb-6`}
                    >
                      <div className="space-y-0">
                        {order.items.map((item, idx) => {
                          const editReview = reviews[item.productId];
                          const viewReview = existingReviewsMap.get(
                            item.productId,
                          );
                          const isLastItem = idx === order.items.length - 1;

                          // In view mode, skip items that weren't rated
                          if (
                            mode === "view" &&
                            (!viewReview || !viewReview.rating)
                          ) {
                            return null;
                          }

                          return (
                            <div
                              key={item.productId}
                              className={`py-6 ${!isLastItem ? "border-b border-gray-100" : ""
                                }`}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                  <Image
                                    src={getImageUrl(item.thumbnail)}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground truncate">
                                    {item.productName}
                                  </h4>
                                  <p className="text-sm text-foreground/60">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mb-4">
                                <p className="text-sm text-foreground/70">
                                  {mode === "view"
                                    ? "Your Rating"
                                    : "How was your experience?"}
                                </p>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                      key={star}
                                      className={
                                        mode === "edit"
                                          ? "focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                          : ""
                                      }
                                    >
                                      {mode === "edit" ? (
                                        <button
                                          type="button"
                                          className="focus:outline-none transition-transform hover:scale-110"
                                          onClick={() =>
                                            updateReview(
                                              item.productId,
                                              "rating",
                                              star,
                                            )
                                          }
                                          onMouseEnter={() =>
                                            setHoveredProductId(item.productId)
                                          }
                                          onMouseLeave={() =>
                                            setHoveredProductId(null)
                                          }
                                          aria-label={`Rate ${star} stars`}
                                        >
                                          <Star
                                            size={24}
                                            className={`${star <=
                                              (hoveredProductId ===
                                                item.productId
                                                ? Math.max(
                                                  editReview?.rating || 0,
                                                  0,
                                                )
                                                : editReview?.rating || 0)
                                              ? "fill-amber-400 text-amber-400"
                                              : "fill-gray-100 text-gray-300"
                                              } transition-colors`}
                                          />
                                        </button>
                                      ) : (
                                        <Star
                                          size={24}
                                          className={`${star <= (viewReview?.rating || 0)
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-gray-100 text-gray-300"
                                            }`}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {mode === "edit" ? (
                                <input
                                  placeholder="Review Title (e.g. Great Product!)"
                                  value={editReview?.title || ""}
                                  onChange={(e) =>
                                    updateReview(
                                      item.productId,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-lg border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand mb-3"
                                  aria-label={`Review Title for ${item.productName}`}
                                />
                              ) : viewReview?.title ? (
                                <p className="text-sm font-medium text-foreground mb-3">
                                  {viewReview.title}
                                </p>
                              ) : null}

                              {mode === "edit" ? (
                                <textarea
                                  placeholder="Write a review..."
                                  rows={3}
                                  value={editReview?.comment || ""}
                                  onChange={(e) =>
                                    updateReview(
                                      item.productId,
                                      "comment",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-lg border border-foreground/20 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none mb-3"
                                  aria-label={`Review Content for ${item.productName}`}
                                />
                              ) : viewReview?.comment ? (
                                <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                                  {viewReview.comment}
                                </p>
                              ) : null}

                              {mode === "edit" ? (
                                <div>
                                  <input
                                    type="file"
                                    id={`image-upload-${item.productId}`}
                                    ref={(el) => {
                                      if (el)
                                        fileInputRefs.current[item.productId] =
                                          el;
                                    }}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) =>
                                      handleFileChange(item.productId, e)
                                    }
                                    title={`Upload review images for ${item.productName}`}
                                    aria-label={`Upload review images for ${item.productName}`}
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    {(editReview?.files || []).map(
                                      (file, idx) => (
                                        <div
                                          key={idx}
                                          className="relative h-16 w-16 rounded-md overflow-hidden border border-foreground/10 bg-gray-50"
                                        >
                                          <Image
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                          />
                                          <button
                                            onClick={() =>
                                              removeFile(item.productId, idx)
                                            }
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md hover:bg-red-600 transition-colors"
                                            aria-label="Remove image"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ),
                                    )}
                                    {(editReview?.files || []).length < 3 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          fileInputRefs.current[
                                            item.productId
                                          ]?.click()
                                        }
                                        className="h-16 w-16 rounded-md border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center text-foreground/40 hover:border-brand hover:text-brand transition-colors bg-white"
                                        aria-label="Add Image"
                                      >
                                        <Upload size={20} />
                                        <span className="text-[10px] mt-1">
                                          Add Img
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : mode === "view" &&
                                viewReview?.images &&
                                viewReview.images.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {viewReview.images.map((imageUrl, idx) => (
                                    <div
                                      key={idx}
                                      className="relative h-16 w-16 rounded-md overflow-hidden border border-foreground/10 bg-gray-50"
                                    >
                                      <Image
                                        src={getImageUrl(imageUrl)}
                                        alt={`Review image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {mode === "edit" && (
                      <CommonButton
                        onClick={handleSubmit}
                        className="w-full justify-center"
                        disabled={bulkReviewMutation.isPending}
                      >
                        {bulkReviewMutation.isPending ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Reviews"
                        )}
                      </CommonButton>
                    )}
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
