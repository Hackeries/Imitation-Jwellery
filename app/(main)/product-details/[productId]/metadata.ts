import type { Metadata } from "next";

interface ProductDetailsMetadataProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata(
  { params }: ProductDetailsMetadataProps
): Promise<Metadata> {
  const { productId } = await params;

  return {
    title: "Product Details | Privora",
    description: "Discover our exquisite jewelry collection at Privora.",
    openGraph: {
      title: "Product Details | Privora",
      description: "Discover our exquisite jewelry collection at Privora.",
      type: "website",
      images: [
        {
          url: "/img/og-image.png",
          width: 1200,
          height: 630,
          alt: "Privora Product",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Product Details | Privora",
      description: "Discover our exquisite jewelry collection at Privora.",
      images: ["/img/og-image.png"],
    },
  };
}
