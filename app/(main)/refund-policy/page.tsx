import AnimatedSection from "@/app/components/AnimatedSection";
import CommonHeading from "@/app/components/CommonHeading";

export default function RefundPolicyPage() {
  return (
    <div className="cmsPage gradientBg">
      <AnimatedSection>
        <section>
          <div className="px-3 md:px-8 lg:px-10 py-8 md:py-20 lg:py-20">
            <div className="max-w-3xl md:max-w-4xl mx-auto">
              <CommonHeading
                level={1}
                title="Return, Refund, Replacement & Shipping Policy"
                noMargin
              />

              <p className="mt-5 md:mt-6 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed">
                At Privora, we are committed to offering a smooth and trustworthy shopping experience. This policy is designed to clearly explain how orders are handled, while reflecting standard Indian e-commerce practices and the nature of jewellery products. Our aim is to keep expectations transparent and the process comfortable for both our customers and our brand.
              </p>

              <div className="mt-14 md:mt-20 space-y-12 md:space-y-16">
                <Section
                  title="Returns"
                  text="We encourage customers to carefully check their jewellery at the time of delivery. If an item arrives damaged, defective, or different from what was ordered, you may contact us within 3 days of delivery with clear photos or videos of the product and its packaging. Requests shared within this timeframe will be reviewed with care, and we will guide you through the next steps if the return is approved. As our collection includes anti-tarnish jewellery, oxidized jewellery, and other fashion jewellery, slight differences in colour, finish, size, or detailing may naturally occur due to lighting conditions, screen resolution, or plating and handcrafted processes. These minor variations are not considered defects and may not qualify for return. Returns may not be applicable for requests raised after the 3-day window, for jewellery that has been used, altered, or damaged due to wear, improper storage, exposure to water, perfumes, chemicals, or physical impact. For hygiene and quality reasons, we may also be unable to accept returns once the product has been worn."
                />

                <Section
                  title="Replacement"
                  text="At Privora, we want you to feel confident and satisfied with your purchase. If you receive jewellery that is damaged, defective, or incorrect, and the concern is reported within 3 days of delivery, we may offer a replacement after a careful review. Clear images or videos of the product and packaging will help us assess the request smoothly. Replacements are subject to product availability. If the same design is unavailable, we may offer an alternative solution that best suits the situation, in line with standard Indian e-commerce practices. As our jewellery includes anti-tarnish, oxidized, and fashion pieces, minor variations in colour, finish, or detailing are considered natural and may not qualify for replacement. Once a replacement is approved, it will be processed and shipped within a reasonable timeframe. Replacement requests raised after the 3-day reporting window, or for items showing signs of use, wear, alteration, or improper handling, may not be eligible."
                />

                <Section
                  title="Refunds"
                  text="Once a return request is approved and the product is received and inspected, the refund (if applicable) will be processed to the original mode of payment. Refund timelines may vary depending on payment methods and banking procedures, in line with common Indian e-commerce standards. Shipping charges, if applicable, are generally non-refundable unless the return is due to an error from our side, such as an incorrect or damaged item being sent. Privora reserves the right to assess each case fairly before approving any refund."
                />

                <Section
                  title="Shipping"
                  text="We aim to process and ship orders within a reasonable timeframe after confirmation. Estimated delivery timelines may vary based on location, courier partners, weather conditions, or other operational factors. While we work closely with reliable logistics partners, delivery delays caused by external circumstances may occasionally occur. Once an order has been shipped, tracking details will be shared where available. Privora is not responsible for delays, losses, or issues caused by courier partners after dispatch, though we will always try our best to assist you in coordinating and resolving concerns."
                />

                <Section
                  title="General Information"
                  text="Privora reserves the right to update or modify this policy at any time to reflect operational needs or regulatory requirements. Any changes will be effective once published on our website. By placing an order with us, you agree to the terms outlined in this policy. For any questions or assistance regarding returns, refunds, or shipping, our support team is always happy to help. We appreciate your understanding and trust in Privora."
                />
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-times text-[20px] md:text-2xl mb-3 md:mb-4">
        {title}
      </h2>
      <p className="text-[14px] md:text-base text-foreground/80 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
