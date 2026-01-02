"use client"

import type React from "react"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"
import CommonInput from "@/app/components/input/CommonInput"
import CommonButton from "@/app/components/button/CommonButton"

type AddAddressModalProps = {
  open: boolean
  onClose: () => void
  isEdit?: boolean
  onSave?: (address: {
    country: string
    firstName: string
    lastName: string
    address: string
    apartment: string
    city: string
    state: string
    pincode: string
  }) => void
}

export default function AddAddressModal({ open, onClose, isEdit = false, onSave }: AddAddressModalProps) {
  const [formData, setFormData] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSave) {
      onSave(formData)
    }
    // Reset form and close
    setFormData({
      country: "India",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
    })
    onClose()
  }

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

        {/* MODAL */}
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
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium">
                    {isEdit ? "Edit address" : "Add new address"}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/10">
                    <X size={18} />
                  </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="">
                  {/* Country */}
                  <CommonInput
                    label="Country/region"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />

                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CommonInput
                      label="First name"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <CommonInput
                      label="Last name"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Address */}
                  <CommonInput
                    label="Address"
                    name="address"
                    placeholder="Street, area, landmark"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />

                  {/* Apartment */}
                  <CommonInput
                    label="Apartment, suite, etc (optional)"
                    name="apartment"
                    placeholder="Apartment, suite, etc"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />

                  {/* City, State, PIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CommonInput
                      label="City"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                    <CommonInput
                      label="State"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                    <CommonInput
                      label="PIN code"
                      name="pincode"
                      type="number"
                      placeholder="PIN code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="pt-4 flex items-center justify-between">
                    {isEdit ? (
                      <button type="button" className="text-sm text-red-600 hover:underline">
                        Delete
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex gap-3">
                      <CommonButton type="button" variant="secondaryBtn" onClick={onClose} className="w-fit px-6">
                        Cancel
                      </CommonButton>
                      <CommonButton type="submit" className="w-fit px-6">
                        Save
                      </CommonButton>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
