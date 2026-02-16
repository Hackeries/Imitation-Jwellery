import Link from "next/link";
import CommonHeading from "@/app/components/CommonHeading";

export default function OrderHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <CommonHeading
        level={1}
        title="Order Details"
        noMargin
        className="text-left"
      />
      <Link href="/account?tab=orders" className="commonLink text-sm">
        Go to My Orders
      </Link>
    </div>
  );
}