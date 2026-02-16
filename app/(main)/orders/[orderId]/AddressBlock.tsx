
export default function AddressBlock({
  title,
}: {
  title: string;
}) {
  return (
    <div className="text-sm space-y-1">
      <p className="font-medium mb-2">{title}</p>

      <p className="font-medium">Olivia S</p>
      <p>Flat 302, Maple Residency</p>
      <p>MG Road, Sector 15</p>
      <p>Gurugram, Haryana 122001</p>
    </div>
  );
}