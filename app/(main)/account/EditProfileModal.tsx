"use client";

import type React from "react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, AlertCircle } from "lucide-react";
import CommonInput from "@/app/components/input/CommonInput";
import CommonButton from "@/app/components/button/CommonButton";
import { useUpdateProfile, useUserProfile } from "@/hooks/use-auth";
import { User } from "@/services/auth-service";
import { toast } from "sonner";

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

type ValidationErrors = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}>;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
};

function ProfileForm({
  userProfile,
  onClose,
}: {
  userProfile: User;
  onClose: () => void;
}) {
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState<FormData>(() => {
    const nameParts = (userProfile.fullName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    return {
      firstName,
      lastName,
      email: userProfile.email || "",
      mobile: userProfile.mobile || "",
    };
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "firstName" || name === "lastName") {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateProfile.mutate(
      {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        mobile: formData.mobile,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          onClose();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update profile. Please try again.",
          );
        },
      },
    );
  };

  return (
    <>
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">Please fix the errors below</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonInput
            label="First name"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={updateProfile.isPending}
            error={errors.firstName}
            required
          />
          <CommonInput
            label="Last name"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={updateProfile.isPending}
            error={errors.lastName}
          />
        </div>

        <CommonInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={updateProfile.isPending}
          error={errors.email}
        />

        <div>
          <CommonInput
            label="Mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            value={formData.mobile}
            onChange={handleInputChange}
            disabled
            error={errors.mobile}
          />
          <p className="text-xs text-foreground/50 mt-1">
            Phone number cannot be changed
          </p>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <CommonButton
            type="button"
            variant="secondaryBtn"
            onClick={onClose}
            className="w-fit max-w-fit px-6"
            disabled={updateProfile.isPending}
          >
            Cancel
          </CommonButton>

          <CommonButton
            type="submit"
            disabled={updateProfile.isPending}
            className="w-fit max-w-fit px-6"
          >
            {updateProfile.isPending ? "Saving..." : "Save"}
          </CommonButton>
        </div>
      </form>
    </>
  );
}

export default function EditProfileModal({
  open,
  onClose,
}: EditProfileModalProps) {
  const { data: userProfile, isLoading } = useUserProfile();

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
              <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-background p-6">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium">
                    Edit profile
                  </Dialog.Title>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-foreground/10"
                    aria-label="Close modal"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center text-foreground/50">
                    Loading profile...
                  </div>
                ) : userProfile ? (
                  <ProfileForm
                    userProfile={userProfile}
                    onClose={onClose}
                    key={open ? "open" : "closed"}
                  />
                ) : (
                  <div className="py-8 text-center text-red-500">
                    Failed to load profile
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}