"use client";

import type React from "react";
import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, AlertCircle, Loader2, Home, Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import CommonInput from "@/app/components/input/CommonInput";
import CommonButton from "@/app/components/button/CommonButton";
import { useAddAddress, useUpdateAddress } from "@/hooks/use-address";
import { Address, AddressFormData } from "@/services/address-service";


export type AddAddressPayload = AddressFormData;

interface ExtendedAddress extends Omit<Address, "label"> {
  label?: string;
  type?: string;
}

type AddAddressModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: AddressFormData) => void;
  isEdit?: boolean;
  initialData?: ExtendedAddress | null;
  isLoading?: boolean;
};

const getInitialFormData = (
  isEdit: boolean,
  initialData: ExtendedAddress | null | undefined,
): AddressFormData => {
  if (isEdit && initialData) {
    return {
      fullName: initialData.fullName || "",
      mobile: initialData.mobile || "",
      line1: initialData.line1 || "",
      line2: initialData.line2 || "",
      landmark: initialData.landmark || "",
      city: initialData.city || "",
      state: initialData.state || "",
      pincode: initialData.pincode || "",
      country: initialData.country || "India",
      label: initialData.label || initialData.type || "Home",
      isDefault: initialData.isDefault || false,
    };
  }
  return {
    fullName: "",
    mobile: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    label: "Home",
    isDefault: false,
  };
};

export default function AddAddressModal({
  open,
  onClose,
  isEdit = false,
  initialData,
  onSave,
  isLoading: externalLoading,
}: AddAddressModalProps) {
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();

  const isLoading =
    externalLoading ||
    addAddressMutation.isPending ||
    updateAddressMutation.isPending;

  const [formData, setFormData] = useState<AddressFormData>(
    getInitialFormData(isEdit, initialData),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});
  const [pincodeValidation, setPincodeValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    message: string;
  }>({
    isValidating: false,
    isValid: false,
    message: "",
  });

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setFormData(getInitialFormData(isEdit, initialData));
        setErrors({});
        setPincodeValidation({
          isValidating: false,
          isValid: false,
          message: "",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, isEdit, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\s/g, ""))) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!formData.line1.trim()) newErrors.line1 = "Address line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "PIN code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddressFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof AddressFormData];
        return newErrors;
      });
    }
    if (name === "pincode") {
      setPincodeValidation({
        isValidating: false,
        isValid: false,
        message: "",
      });
    }
  };

  const setLabel = (label: string) => {
    setFormData((prev) => ({ ...prev, label }));
  };

  const handlePincodeBlur = async () => {
    const pincode = formData.pincode.trim();

    if (!pincode) {
      setPincodeValidation({
        isValidating: false,
        isValid: false,
        message: "",
      });
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setPincodeValidation({
        isValidating: false,
        isValid: false,
        message: "PIN code must be 6 digits",
      });
      return;
    }

    // Skip backend validation
    setPincodeValidation({
      isValidating: false,
      isValid: true,
      message: "",
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.pincode;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;



    if (onSave) {
      onSave(formData);
      return;
    }

    if (isEdit && initialData?._id) {
      updateAddressMutation.mutate(
        { addressId: initialData._id, addressData: formData },
        { onSuccess: () => onClose() },
      );
    } else {
      addAddressMutation.mutate(formData, {
        onSuccess: () => onClose(),
      });
    }
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
              <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-background p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium">
                    {isEdit ? "Edit address" : "Add new address"}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                    disabled={isLoading}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">
                      Please fix the errors below
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="text-xs font-medium ml-1 mb-2 block">
                      Save address as
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLabel("Home")}
                        className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${formData.label === "Home"
                          ? "border-brand bg-brand/5 text-brand font-medium"
                          : "border-foreground/20 text-foreground/70 hover:border-foreground/40"
                          }`}
                      >
                        <Home size={16} /> Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setLabel("Work")}
                        className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${formData.label === "Work"
                          ? "border-brand bg-brand/5 text-brand font-medium"
                          : "border-foreground/20 text-foreground/70 hover:border-foreground/40"
                          }`}
                      >
                        <Briefcase size={16} /> Work
                      </button>
                      <button
                        type="button"
                        onClick={() => setLabel("Other")}
                        className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${formData.label === "Other"
                          ? "border-brand bg-brand/5 text-brand font-medium"
                          : "border-foreground/20 text-foreground/70 hover:border-foreground/40"
                          }`}
                      >
                        <MapPin size={16} /> Other
                      </button>
                    </div>
                  </div>

                  <CommonInput
                    label="Country/region"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <CommonInput
                    label="Full name"
                    name="fullName"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    error={errors.fullName}
                    required
                  />
                  <CommonInput
                    label="Mobile number"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    error={errors.mobile}
                    required
                  />
                  <CommonInput
                    label="Address line 1"
                    name="line1"
                    placeholder="Street, area, landmark"
                    value={formData.line1}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    error={errors.line1}
                    required
                  />
                  <CommonInput
                    label="Address line 2 (optional)"
                    name="line2"
                    placeholder="Apartment, suite, etc"
                    value={formData.line2}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <CommonInput
                    label="Landmark (optional)"
                    name="landmark"
                    placeholder="Near park, school, etc."
                    value={formData.landmark}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CommonInput
                      label="City"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      error={errors.city}
                      required
                    />
                    <CommonInput
                      label="State"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      error={errors.state}
                      required
                    />
                    <div>
                      <CommonInput
                        label="PIN code"
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="PIN code"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        onBlur={handlePincodeBlur}
                        disabled={isLoading || pincodeValidation.isValidating}
                        error={errors.pincode}
                        required
                      />
                      {pincodeValidation.isValidating && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                          <Loader2 size={14} className="animate-spin" />
                          Verifying pincode...
                        </div>
                      )}

                      {!pincodeValidation.isValid && pincodeValidation.message && !pincodeValidation.isValidating && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle size={14} />
                          {pincodeValidation.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <CommonButton
                      type="button"
                      variant="secondaryBtn"
                      onClick={onClose}
                      className="w-fit px-6"
                      disabled={isLoading}
                    >
                      Cancel
                    </CommonButton>
                    <CommonButton
                      type="submit"
                      className="w-fit px-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} />{" "}
                          Saving...
                        </div>
                      ) : (
                        "Save"
                      )}
                    </CommonButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
