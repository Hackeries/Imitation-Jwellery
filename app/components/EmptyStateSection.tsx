"use client";

import Image from "next/image";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import Link from "next/link";

type EmptyStateSectionProps = {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
};

export default function EmptyStateSection({
  image,
  title,
  description,
  buttonText,
  buttonHref,
}: EmptyStateSectionProps) {
  return (
    <section className="px-4 py-8 md:py-12 flex justify-center">
      <div className="w-full max-w-2xl bg-[#fefbf6] border border-[#4E342E]/10 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-lg shadow-[#4E342E]/5">

        {/* IMAGE */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain opacity-90"
            priority
          />
        </div>

        {/* TEXT */}
        <CommonHeading
          level={2}
          title={<span className="font-times italic text-3xl md:text-4xl text-[#4E342E]">{title}</span>}
          description={description}
          className="mb-2"
          descriptionClassName="text-[#4E342E]/70 max-w-md mx-auto text-base"
          noMargin
        />

        {/* ACTION */}
        <div className="mt-8">
          <Link href={buttonHref}>
            <CommonButton
              variant="secondaryBtn"
              className="px-8 py-3 text-sm tracking-widest min-w-[200px]"
            >
              {buttonText}
            </CommonButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
