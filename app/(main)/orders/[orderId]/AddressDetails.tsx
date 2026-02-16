"use client";

interface AddressType {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile?: string;
  phone?: string;
}

const PRIVORA_WAREHOUSE: AddressType = {
  fullName: "Privora (Warehouse)",
  line1: "Plot No. 45, Phoenix Industrial Estate",
  line2: "Viman Nagar",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411014",
  country: "India",
  mobile: "+91 80000 12345",
};

export default function AddressDetails({
  shippingAddress,
  billingAddress,
}: {
  shippingAddress?: AddressType | null;
  billingAddress?: AddressType | null;
}) {
  if (!shippingAddress) return null;

  const finalBilling = billingAddress || PRIVORA_WAREHOUSE;

  return (
    <div className="lg:col-span-2 bg-background border border-foreground/20 rounded-2xl p-4 md:p-6">
      <p className="font-medium text-lg mb-4">Address Details</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AddressBlock title="Billing Address" address={finalBilling} />
        <AddressBlock title="Shipping Address" address={shippingAddress} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <Info label="Order Placed by" value={shippingAddress.fullName} />
        <Info label="Order Placed at" value="Privora Website" />
        <Info label="Order Delivered at" value="Doorstep" />
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: AddressType;
}) {
  const phoneDisplay = address.mobile || address.phone || "N/A";

  return (
    <div className="text-sm space-y-1">
      <p className="font-medium mb-2">{title}</p>
      <p className="font-medium">{address.fullName}</p>
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}, {address.state} {address.pincode}
      </p>
      <p>{address.country}</p>
      <p>Phone: {phoneDisplay}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="font-medium text-sm text-foreground">{value}</p>
    </div>
  );
}
