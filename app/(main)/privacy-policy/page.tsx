import AnimatedSection from "@/app/components/AnimatedSection";
import CommonHeading from "@/app/components/CommonHeading";

export default function PrivacyPolicyPage() {
  return (
    <div className="cmsPage gradientBg">
      <AnimatedSection>
        <section>
          <div className="px-3 md:px-8 lg:px-10 py-8 md:py-20 lg:py-20">
            <div className="max-w-3xl md:max-w-4xl mx-auto">
              <CommonHeading
                level={1}
                title="Privacy Policy"
                noMargin
              />

              <p className="mt-5 md:mt-6 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed">
                At Privora, your trust matters to us. This Privacy Policy explains how we responsibly collect, use, and protect your information while keeping the process simple and comfortable for both you and us. Our goal is to offer a safe, transparent, and enjoyable experience whenever you interact with our brand.
              </p>

              <div className="mt-14 md:mt-20 space-y-12 md:space-y-16">
                <Section
                  title="1. Our Promise to You"
                  text="We are committed to respecting your privacy and handling your information with care. Any details shared with us are used only to provide our services smoothly, improve your experience, and maintain clear communication. We collect only what is necessary and avoid unnecessary or intrusive data practices."
                />

                <Section
                  title="2. Information We May Collect"
                  text="When you browse our website, place an order, or contact us, we may collect basic information such as your name, phone number, email address, shipping address, and order-related details. We may also collect limited technical information like device type or website usage data to help us understand how our platform is used and how we can improve it."
                />

                <Section
                  title="3. How Your Information Is Used"
                  text="Your information helps us process orders, arrange deliveries, provide customer support, and share important updates related to your purchase or our services. From time to time, we may also use your details to inform you about offers or updates related to Privora. We do not use your information in ways that are unrelated to our brand or services."
                />

                <Section
                  title="4. Keeping Your Information Safe"
                  text="We take reasonable steps to protect your personal information through secure systems and trusted service partners. While no online platform can guarantee complete security, we follow standard practices to reduce risks and safeguard your data to the best of our ability."
                />

                <Section
                  title="5. Sharing Information Responsibly"
                  text="We do not sell, rent, or misuse customer information. Your details may be shared only with reliable third-party partners such as payment gateways, delivery partners, or technical service providers, strictly for completing orders and supporting our operations. These partners are expected to handle information responsibly."
                />

                <Section
                  title="6. External Websites and Services"
                  text="While using our website, you may come across external links, pop-ups, or third-party services that are not owned or managed by Privora. We are not responsible for the privacy practices or content of such external platforms, and we encourage users to review their policies separately."
                />

                <Section
                  title="7. Cookies and Website Functionality"
                  text="Our website may use cookies or similar tools to ensure smooth functionality, remember preferences, and understand browsing behaviour. These tools help us improve our website experience. You can manage or disable cookies through your browser settings if you prefer."
                />

                <Section
                  title="8. Your Role in Data Accuracy"
                  text="We request customers to provide accurate and updated information to help us serve them better. Privora is not responsible for issues arising from incorrect or incomplete details shared by the user."
                />

                <Section
                  title="9. Policy Updates"
                  text="As our brand grows and our services evolve, we may update this Privacy Policy from time to time. Any changes will be reflected on our website. Continued use of our services indicates acceptance of the updated policy."
                />

                <Section
                  title="10. Your Consent"
                  text="By using the Privora website or services, you agree to the collection and use of information as described in this Privacy Policy."
                />

                <Section
                  title="11. We're Here to Help"
                  text="If you have any questions or concerns about this Privacy Policy or how your information is handled, please reach out through the Contact Us section on our website. We're always happy to assist."
                />
              </div>

              <p className="mt-14 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed font-medium">
                By choosing Privora, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
              </p>
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
