import AnimatedSection from "@/app/components/AnimatedSection";
import CommonHeading from "@/app/components/CommonHeading";

export default function ShippingPolicyPage() {
  return (
    <div className="cmsPage gradientBg">
      <AnimatedSection>
        <section>
          <div className="px-3 md:px-8 lg:px-10 py-8 md:py-20 lg:py-20">
            <div className="max-w-3xl md:max-w-4xl mx-auto">
              <CommonHeading
                level={1}
                title="Shipping Policy"
                noMargin
              />

              <p className="mt-5 md:mt-6 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed">
                At Privora, we are committed to offering a smooth and trustworthy shopping experience. This policy outlines how your orders are processed and delivered.
              </p>

              <div className="mt-14 md:mt-20 space-y-12 md:space-y-16">
                <Section
                  title="Order Processing"
                  text="We aim to process and ship orders within a reasonable timeframe after confirmation. Estimated delivery timelines may vary based on location, courier partners, weather conditions, or other operational factors."
                />

                <Section
                  title="Shipping & Delivery"
                  text="While we work closely with reliable logistics partners, delivery delays caused by external circumstances may occasionally occur. Once an order has been shipped, tracking details will be shared where available. Privora is not responsible for delays, losses, or issues caused by courier partners after dispatch, though we will always try our best to assist you in coordinating and resolving concerns."
                />

                <Section
                  title="Shipping Charges"
                  text="Shipping charges, if applicable, will be displayed at checkout before order confirmation. Shipping charges are generally non-refundable unless the return is due to an error from our side, such as an incorrect or damaged item being sent."
                />

                <Section
                  title="Incorrect Address"
                  text="Please ensure your shipping address is accurate. Privora is not responsible for orders delivered to incorrect addresses provided by customers."
                />

                <Section
                  title="Policy Updates"
                  text="Privora reserves the right to update or modify this policy at any time to reflect operational needs or regulatory requirements. Any changes will be effective once published on our website. By placing an order with us, you agree to the terms outlined in this policy."
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
