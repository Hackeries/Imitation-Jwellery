"use client";

import AuthGuard from "@/app/components/AuthGuard";
import AnimatedSection from "@/app/components/AnimatedSection";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import DeleteAddressConfirmModal from "@/app/components/DeleteAddressConfirm";
import SignOutConfirmModal from "@/app/components/SignoutConfirm";
import { OrderListSkeleton } from "@/app/components/skeleton";
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/hooks/use-address";
import { useLogout, useUserProfile, useIsLoggedIn } from "@/hooks/use-auth";
import { useOrders, useOrderDetails } from "@/hooks/use-orders";
import { useOrderReviews } from "@/hooks/use-reviews";
import type { Address, AddressFormData } from "@/services/address-service";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  Edit2Icon,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Package,
  StarIcon,
  Trash2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddAddressModal, { type AddAddressPayload } from "./AddAddressModal";
import EditProfileModal from "./EditProfileModal";
import RateOrderModal from "./RateOrderModal";

type DisplayAddress = {
  id: string;
  name: string;
  address: string;
  cityZip: string;
  isDefault: boolean;
};

function backendToDisplayAddress(backend: Address): DisplayAddress {
  return {
    id: backend._id,
    name: backend.fullName,
    address: backend.line1 + (backend.line2 ? `, ${backend.line2}` : ""),
    cityZip: `${backend.city}, ${backend.state} ${backend.pincode}`.replace(
      /\s+/g,
      " ",
    ),
    isDefault: backend.isDefault,
  };
}

function OrderRatingBadge({
  orderId,
  onRate,
  onViewReviews,
}: {
  orderId: string;
  onRate: (e: React.MouseEvent) => void;
  onViewReviews: (e: React.MouseEvent) => void;
}) {
  const { data: reviews = [] } = useOrderReviews(orderId);
  const hasReviewed = reviews.length > 0;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (hasReviewed) {
    return (
      <button
        type="button"
        onClick={onViewReviews}
        className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity cursor-pointer"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`size-4 ${star <= Math.round(avgRating)
              ? "text-amber-500 fill-amber-500"
              : "text-gray-300"
              }`}
          />
        ))}
        <span className="ml-1 text-foreground/60 text-xs">
          {avgRating.toFixed(1)}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onRate}
      className="flex items-center gap-1 text-sm text-brand hover:underline font-medium"
    >
      <StarIcon className="text-amber-500 fill-amber-500 size-5" />
      Rate & Review
    </button>
  );
}

export default function Account() {
  const [openRateOrder, setOpenRateOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rateModalMode, setRateModalMode] = useState<"edit" | "view">("edit");
  const [openAddAddress, setOpenAddAddress] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openSignOutConfirm, setOpenSignOutConfirm] = useState(false);
  const [openDeleteAddress, setOpenDeleteAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const { data: userProfile } = useUserProfile();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: backendAddresses = [], isLoading: addressLoading } =
    useAddresses();
  const { data: selectedOrderDetails } = useOrderDetails(selectedOrderId || "");
  const { data: orderReviews = [] } = useOrderReviews(selectedOrderId || "");

  const logout = useLogout();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const userName = userProfile?.fullName || "Guest User";
  const userPhone = userProfile?.mobile || "";
  const userEmail = userProfile?.email || "";

  const handleAddressSave = (payload: AddAddressPayload) => {
    const isDefault =
      backendAddresses.length === 0
        ? true
        : (isEditAddress && editingAddress?.isDefault) || false;

    const finalPayload: AddressFormData = {
      ...payload,
      isDefault,
    };

    if (isEditAddress && editingAddress) {
      updateAddress.mutate(
        { addressId: editingAddress._id, addressData: finalPayload },
        {
          onSuccess: () => {
            setOpenAddAddress(false);
            setIsEditAddress(false);
            setEditingAddress(null);
          },
        },
      );
    } else {
      addAddress.mutate(finalPayload, {
        onSuccess: () => {
          setOpenAddAddress(false);
        },
      });
    }
  };

  const handleDeleteAddress = () => {
    if (selectedAddressId) {
      deleteAddress.mutate(selectedAddressId);
      setOpenDeleteAddress(false);
      setSelectedAddressId(null);
    }
  };

  const handleEditAddress = (addressId: string) => {
    const found = backendAddresses.find((a) => a._id === addressId) || null;
    if (found) {
      setEditingAddress(found);
      setIsEditAddress(true);
      setOpenAddAddress(true);
    }
  };

  const handleOpenRateModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRateModalMode("edit");
    setOpenRateOrder(true);
  };

  const handleViewReviews = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRateModalMode("view");
    setOpenRateOrder(true);
  };

  const isSaving = addAddress.isPending || updateAddress.isPending;

  return (
    <>
      <div className="accountPage bg-background min-h-screen">
        <AnimatedSection>
          <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <CommonHeading
              level={1}
              title="My Account"
              description="Manage your orders, addresses, and account details."
              className="mb-8 md:mb-12 text-center"
            />

            <TabGroup vertical className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* SIDEBAR - LEFT COLUMN */}
              <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:self-start">
                {/* User Profile Card - Brand Brown */}
                <div className="bg-brand border border-brand/10 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center text-white">
                  <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-white mb-4 shadow-inner">
                    <span className="font-times text-3xl font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-times text-xl font-medium text-white mb-1">
                    {userName}
                  </h3>
                  <p className="text-sm text-white/70 mb-4">{userEmail}</p>

                  <button
                    onClick={() => setOpenEditProfile(true)}
                    className="text-xs font-semibold uppercase tracking-wider text-white hover:text-white/80 hover:underline transition"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Navigation Menu */}
                <div className="bg-white border border-foreground/10 rounded-2xl p-3 shadow-sm overflow-hidden">
                  <TabList className="flex flex-col gap-1">
                    {[
                      { name: "My Orders", icon: MapPin }, // Icon placeholder, distinct below
                      { name: "My Addresses", icon: MapPin },
                      { name: "Settings", icon: Lock }
                    ].map((tab, idx) => (
                      <Tab
                        key={tab.name}
                        className={({ selected }) =>
                          `flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 outline-none ${selected
                            ? "bg-brand text-background shadow-md"
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                          }`
                        }
                      >
                        {/* Icons handled conditionally for cleaner code if creating array above is messy with imports */}
                        {idx === 0 && <Package className="w-4 h-4" />}
                        {idx === 1 && <MapPin className="w-4 h-4" />}
                        {idx === 2 && <Lock className="w-4 h-4" />}
                        {tab.name}
                      </Tab>
                    ))}
                  </TabList>

                  <div className="mt-3 pt-3 border-t border-foreground/10 px-3 pb-1">
                    <button
                      onClick={() => setOpenSignOutConfirm(true)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* CONTENT - RIGHT COLUMN */}
              <div className="lg:col-span-9">
                <TabPanels>
                  <TabPanel className="focus:outline-none">
                    <div className="bg-white border border-foreground/10 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
                      <h2 className="font-times text-2xl mb-6 pb-4 border-b border-foreground/10">Order History</h2>

                      {ordersLoading ? (
                        <OrderListSkeleton count={3} />
                      ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="h-16 w-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="text-foreground/30 w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium text-foreground mb-2">No orders yet</p>
                          <p className="text-foreground/60 mb-6 max-w-xs">Looks like you haven't placed any orders yet.</p>
                          <Link
                            href="/product-list"
                            className="bg-brand text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {orders.map((order) => (
                            <Link
                              key={order.id}
                              href={`/orders/${order.id}`}
                              className="block border border-foreground/10 rounded-xl p-5 hover:border-brand/30 hover:shadow-md transition-all group bg-background"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-sm px-2 py-1 bg-foreground/5 rounded-md text-foreground/70">#{order.orderNumber}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === "Delivered"
                                      ? "bg-green-100 text-green-700"
                                      : order.status === "Cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                      }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/60">
                                    {order.date} • {order.itemsCount} Items • <span className="font-medium text-foreground">{order.total}</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  {order.status === "Delivered" && (
                                    <div onClick={(e) => e.preventDefault()}>
                                      <OrderRatingBadge
                                        orderId={order.id}
                                        onRate={(e) => {
                                          e.preventDefault();
                                          handleOpenRateModal(order.id);
                                        }}
                                        onViewReviews={(e) => {
                                          e.preventDefault();
                                          handleViewReviews(order.id);
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-white transition-colors" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabPanel>

                  <TabPanel className="focus:outline-none">
                    <div className="bg-white border border-foreground/10 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-foreground/10">
                        <h2 className="font-times text-2xl">Saved Addresses</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditAddress(false);
                            setEditingAddress(null);
                            setOpenAddAddress(true);
                          }}
                          className="flex items-center gap-2 bg-brand text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
                        >
                          <Plus size={16} />
                          Add New
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-1">
                        {addressLoading && (
                          <div className="col-span-1 md:col-span-2 py-12 flex items-center justify-center">
                            <Loader2 className="animate-spin text-brand w-8 h-8" />
                          </div>
                        )}

                        {!addressLoading && backendAddresses.length === 0 && (
                          <div className="col-span-1 md:col-span-2 text-center py-12">
                            <p className="text-foreground/60 mb-4">No addresses saved yet.</p>
                            <button onClick={() => setOpenAddAddress(true)} className="text-brand font-medium hover:underline">Add an address</button>
                          </div>
                        )}

                        {!addressLoading &&
                          backendAddresses.map((backendAddr) => {
                            const address = backendToDisplayAddress(backendAddr);
                            return (
                              <div
                                key={address.id}
                                className={`relative border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 group ${address.isDefault
                                  ? "border-brand bg-brand/[0.02]"
                                  : "border-foreground/10 hover:border-brand/30 hover:shadow-sm"
                                  }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-full ${address.isDefault ? "bg-brand/10 text-brand" : "bg-foreground/5 text-foreground/50"}`}>
                                        <MapPin size={14} />
                                      </div>
                                      <p className="font-semibold text-sm">
                                        {address.name}
                                      </p>
                                    </div>
                                    {address.isDefault && (
                                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-brand/10 text-brand">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-sm text-foreground/70 leading-relaxed space-y-1 pl-9 mb-4">
                                    <p className="line-clamp-2">
                                      {address.address}
                                    </p>
                                    <p>{address.cityZip}</p>
                                    <p>India</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-foreground/5 mt-auto">
                                  {!address.isDefault && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-foreground/60 hover:text-brand transition px-3 py-1.5 rounded-lg hover:bg-foreground/5"
                                      onClick={() => setDefaultAddress.mutate(address.id)}
                                      disabled={setDefaultAddress.isPending}
                                    >
                                      Set Default
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleEditAddress(address.id)}
                                    className="p-2 text-foreground/60 hover:text-brand hover:bg-brand/5 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedAddressId(address.id);
                                      setOpenDeleteAddress(true);
                                    }}
                                    className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel className="focus:outline-none">
                    <div className="bg-white border border-foreground/10 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
                      <h2 className="font-times text-2xl mb-6 pb-4 border-b border-foreground/10">Account Settings</h2>

                      <div className="max-w-2xl">
                        <div className="p-6 border border-red-100 rounded-xl bg-red-50/30 flex items-start gap-5">
                          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <Lock size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-foreground mb-1">
                              Sign out everywhere
                            </h3>
                            <p className="text-sm text-foreground/70 mb-5 leading-relaxed">
                              This will log you out from all devices, including this one. Use this if you have lost a device or suspect unauthorized access.
                            </p>
                            <button
                              onClick={() => setOpenSignOutConfirm(true)}
                              className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg text-sm hover:bg-red-50 transition shadow-sm"
                            >
                              Sign out active sessions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </TabPanels>
              </div>
            </TabGroup>
          </section>
        </AnimatedSection>
      </div>

      <AddAddressModal
        open={openAddAddress}
        onClose={() => {
          setOpenAddAddress(false);
          setIsEditAddress(false);
          setEditingAddress(null);
        }}
        onSave={handleAddressSave}
        isEdit={isEditAddress}
        initialData={editingAddress}
        isLoading={isSaving}
      />
      <EditProfileModal
        open={openEditProfile}
        onClose={() => setOpenEditProfile(false)}
      />
      <SignOutConfirmModal
        open={openSignOutConfirm}
        onClose={() => setOpenSignOutConfirm(false)}
        onConfirm={() => {
          logout.mutate();
          setOpenSignOutConfirm(false);
        }}
      />
      <DeleteAddressConfirmModal
        open={openDeleteAddress}
        onClose={() => {
          setOpenDeleteAddress(false);
          setSelectedAddressId(null);
        }}
        onConfirm={handleDeleteAddress}
      />
      <RateOrderModal
        open={openRateOrder}
        onClose={() => {
          setOpenRateOrder(false);
          setSelectedOrderId(null);
        }}
        order={selectedOrderDetails}
        mode={rateModalMode}
        existingReviews={orderReviews}
      />
    </>
  );
}
