import AnimatedSection from "@/app/components/AnimatedSection";
import CommonHeading from "@/app/components/CommonHeading";

export default function TermsAndConditionsPage() {
    return (
        <div className="cmsPage gradientBg">
        <AnimatedSection>
            <section className="">
                <div className="px-3 md:px-8 lg:px-10 pt-24 md:pt-8 pb-8 md:pb-20 lg:pb-20">
                    <div className="max-w-3xl md:max-w-4xl mx-auto">
                        <CommonHeading
                            level={1}
                            title="Terms & Conditions"
                            noMargin
                        />

                        <p className="mt-5 md:mt-6 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed">
                            Welcome to Privora. At Privora, we are dedicated to offering thoughtfully curated jewellery and a seamless online experience. These Terms &amp; Conditions are created to clearly explain how our website, products, and services operate, while also outlining certain practical limitations that may arise. By accessing our website or placing an order, you agree to the terms outlined below.
                        </p>

                        <div className="mt-14 md:mt-20 space-y-12 md:space-y-16">
                            <Section
                                title="1. Thoughtful Product Naming & Descriptive Information"
                                text="At Privora, we carefully name and describe our jewellery to help customers identify and appreciate each design. Product names and titles are meant for reference and styling purposes only and should not be considered as a definition or assurance of quality, durability, material, or performance. All jewellery available on Privora is presented as fashion jewellery unless clearly specified otherwise."
                            />

                            <Section
                                title="2. Product Sourcing & Availability"
                                text="We take pride in selecting jewellery from trusted third-party vendors and suppliers. While the products are sold under the Privora brand, they are not manufactured by us. Because each piece is sourced and crafted by different suppliers, small variations in finish, detailing, size, colour, or overall appearance may naturally occur."
                            />

                            <Section
                                title="3. Product Images & Natural Variations"
                                text="We strive to present our products through clear images and accurate details to help you make confident choices. However, due to factors such as lighting, photography, screen settings, or manufacturing batches, the actual product may show slight differences in colour, size, texture, or detailing. Measurements mentioned are approximate and minor variations are part of the nature of fashion jewellery."
                            />

                            <Section
                                title="4. Order Processing with Flexibility"
                                text="Our team works diligently to process all orders smoothly and efficiently. At the same time, Privora reserves the right to accept, limit, modify, or cancel any order when necessary. This may occur due to stock limitations, pricing or listing inaccuracies, operational requirements, or security considerations. In the event that an order is cancelled by Privora, any payment received will be addressed in accordance with our applicable refund process."
                            />

                            <Section
                                title="5. Transparent Pricing & Information Accuracy"
                                text="We work hard to keep all prices, product details, and availability information accurate and up to date. On rare occasions, unintentional errors may appear due to technical or human reasons. Privora retains the right to correct such information at any time and ensure that customers receive clear and updated details."
                            />

                            <Section
                                title="6. Everyday Wear & Product Expectations"
                                text="Privora jewellery is designed for style, elegance, and everyday enjoyment. The longevity and appearance of each product may vary. Changes such as fading, oxidation, loosening of stones, or wear over time may occur depending on usage, care, and environmental factors. While we aim to provide well-crafted pieces, we do not offer a formal guarantee or warranty on jewellery products."
                            />

                            <Section
                                title="7. Jewellery Care & Maintenance Guidance"
                                text="With gentle care, jewellery can be enjoyed for longer. We recommend avoiding contact with water, perfumes, chemicals, sweat, and moisture, and storing jewellery in a dry place when not in use. Changes that occur due to handling, storage, or regular wear are considered natural and are beyond Privora's responsibility."
                            />

                            <Section
                                title="8. Respectful Reviews & Customer Feedback"
                                text="We truly value customer feedback and encourage honest reviews to help others make informed choices. To maintain a positive and respectful space, Privora reserves the right to review, moderate, or remove content that may be inappropriate, misleading, offensive, or unrelated. All feedback should be shared responsibly and based on genuine experiences."
                            />

                            <Section
                                title="9. Responsible Use & Fair Liability"
                                text="We aim to provide a reliable and enjoyable shopping experience. However, Privora's responsibility, in any situation, is limited to the value of the product purchased. We are not responsible for indirect or incidental outcomes related to product use or website access."
                            />

                            <Section
                                title="10. Responsible Use of Our Jewellery"
                                text="Privora jewellery is created for personal enjoyment and everyday use. We kindly request that our products are not misused, altered, or resold for commercial purposes without prior approval. This helps us maintain the integrity of the brand and ensure a fair experience for all customers."
                            />

                            <Section
                                title="11. Creative Content & Brand Ownership"
                                text="All content displayed on the Privora website, including images, text, graphics, logos, designs, and brand elements, represents our creative effort and identity. This content remains the property of Privora and may not be copied, reused, distributed, or reproduced without prior written permission."
                            />

                            <Section
                                title="12. Care for Your Privacy"
                                text="Your trust matters to us. Any personal information shared with Privora is handled responsibly and used only for order processing, customer support, and communication related to our services. We respect your privacy and do not misuse customer data."
                            />

                            <Section
                                title="13. Fair Legal Framework"
                                text="These Terms & Conditions are governed by the laws of India. Any matters related to the use of our website or services will be handled under the applicable Indian legal framework."
                            />

                            <Section
                                title="14. Growing & Improving Our Policies"
                                text="As Privora continues to grow, we may update these Terms & Conditions to better serve our customers and improve clarity. Any changes will be reflected on the website, and continued use indicates acceptance of the updated terms."
                            />

                            <Section
                                title="15. Always Here to Help"
                                text="If you have any questions, concerns, or need assistance regarding these Terms & Conditions, please reach out through our Contact Us section. We are always happy to support you."
                            />
                        </div>

                        <p className="mt-14 text-center text-[14px] md:text-base text-foreground/80 leading-relaxed font-medium">
                            By choosing Privora, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions.
                        </p>
                    </div>
                </div>
            </section>
        </AnimatedSection>
        </div>
    );
}


function Section({
    title,
    text,
}: {
    title: string;
    text: string;
}) {
    return (
        <div>
            <h2 className="font-times text-[20px] md:text-2xl mb-3 md:mb-4 text-foreground">
                {title}
            </h2>
            <p className="text-[14px] md:text-base text-foreground/80 leading-relaxed">
                {text}
            </p>
        </div>
    );
}
