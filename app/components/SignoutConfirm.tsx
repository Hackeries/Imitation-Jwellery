"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";

type SignOutConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SignOutConfirmModal({
  open,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* BACKDROP */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* CONTAINER */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="flex h-full items-end sm:items-center justify-center">
            {/* PANEL */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-6 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-6 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-6 relative">
                
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Sign out everywhere
                  </Dialog.Title>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-foreground/10"
                    aria-label="Close"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* MOBILE DRAG INDICATOR */}
                <div className="sm:hidden w-12 h-1 rounded-full mx-auto mb-4" />

                {/* CONTENT */}
                <p className="text-sm text-foreground/70 mb-6">
                  This will sign you out from all devices, including this one.
                  You’ll need to sign in again to access your account.
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3 md:justify-end-end">
                  <CommonButton
                    variant="secondaryBtn"
                    className="w-full"
                    onClick={onClose}
                  >
                    Cancel
                  </CommonButton>

                  <CommonButton
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Sign out
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
