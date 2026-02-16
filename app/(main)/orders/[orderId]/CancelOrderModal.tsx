"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2 } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
  isLoading: boolean;
};

const reasons = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Changed my mind",
  "Other",
];

export default function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  const [selectedReason, setSelectedReason] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedReason || isLoading) return;

    onConfirm(selectedReason, note);
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
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-background p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Cancel Order
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    type="button"
                    aria-label="Close modal"
                    className="p-2 rounded-full hover:bg-foreground/10"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-sm text-foreground/70 mb-4">
                  Please let us know why you want to cancel this order.
                </p>

                <div className="space-y-3 mb-4">
                  {reasons.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-3 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-brand"
                      />
                      {reason}
                    </label>
                  ))}
                </div>

                {selectedReason === "Other" && (
                  <textarea
                    className="w-full rounded-md border border-foreground/20 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Please specify your reason"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}

                <div className="mt-6 flex gap-3 justify-end">
                  <CommonButton
                    variant="secondaryBtn"
                    onClick={onClose}
                    disabled={isLoading}
                    type="button"
                    className="max-w-fit"
                  >
                    Keep Order
                  </CommonButton>
                  <CommonButton
                    disabled={!selectedReason || isLoading}
                    className="max-w-fit"
                    onClick={handleSubmit}
                    type="button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Confirm Cancel"
                    )}
                  </CommonButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
