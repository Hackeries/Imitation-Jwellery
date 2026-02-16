import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import RangeSlider from "@/app/components/RangeSlider";

function MobileFilterSheet({
  open,
  onClose,
  price,
  setPrice,
}: {
  open: boolean;
  onClose: () => void;
  price: [number, number];
  setPrice: (v: [number, number]) => void;
}) {
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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* BOTTOM SHEET */}
        <div className="fixed inset-0 flex items-end">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="w-full rounded-t-2xl bg-background p-6 max-h-[85vh] overflow-y-auto">
              
              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-lg font-medium">
                  Filters
                </Dialog.Title>
                <button onClick={onClose}>
                  <X size={20} />
                </button>
              </div>

              {/* AVAILABILITY */}
              <div className="mb-6">
                <p className="font-medium mb-3">Availability</p>
                <FilterAvailability />
              </div>

              {/* PRICE */}
              <div className="mb-8">
                <p className="font-medium mb-3">Price</p>
                <RangeSlider min={0} max={500} value={price} onChange={setPrice} />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <CommonButton
                  variant="secondaryBtn"
                  onClick={onClose}
                >
                  Clear
                </CommonButton>

                <CommonButton onClick={onClose}>
                  Apply Filters
                </CommonButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function FilterAvailability() {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" className="accent-brand" />
        In Stock (10)
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" className="accent-brand" />
        Out of Stock (0)
      </label>
    </div>
  );
}
