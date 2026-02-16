import Image from "next/image";
import CommonHeading from "@/app/components/CommonHeading";
import CommonButton from "@/app/components/button/CommonButton";
import HomeStoreFeature from "@/app/components/HomeStoreFeature";
import AnimatedSection from "@/app/components/AnimatedSection";

export default function AboutUsPage() {
    return (
        <div className="aboutPage gradientBg">
            <AnimatedSection>
                <section className="px-3 md:px-8 lg:px-10 py-8 md:py-16">
                    <div className="max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        {/* LEFT */}
                        <div>
                            <CommonHeading
                                level={1}
                                title={
                                    <>
                                        Crafted With Care.
                                        <br />
                                        Designed For Elegance.
                                    </>
                                }
                                className="text-left"
                                noMargin
                            />

                            <p className="mt-6 text-sm md:text-base text-foreground/80 max-w-xl leading-relaxed">
                                Privora is an online destination for thoughtfully curated jewelry and lifestyle accessories. We bring together trusted designs and quality products, offering a seamless shopping experience that blends style, value, and convenience.
                            </p>

                            <div className="mt-8">
                                <CommonButton className="max-w-fit px-8" href="/product-list">
                                    Explore Collection
                                </CommonButton>
                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="relative h-[350px] md:h-[520px] rounded-2xl overflow-hidden">
                            <Image
                                src="/img/about-us-1.webp"
                                alt="Privora craftsmanship"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>
            </AnimatedSection>
            <AnimatedSection>
                <section className="px-3 md:px-8 lg:px-10 py-5 md:py-12">
                    <div className="max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div className="relative h-[350px] md:h-[520px] rounded-2xl overflow-hidden">
                            <Image
                                src="/img/about-img-3.webp"
                                alt="Privora craftsmanship"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div>
                            <h2 className="font-times text-[22px] md:text-3xl mb-5">
                                Our Mission
                            </h2>

                            <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-6">
                                Our mission is to simplify online shopping by offering reliable products, transparent pricing, and a smooth customer journey. We focus on building trust at every step — from product discovery and secure payments to timely delivery and responsive support — so you can shop with confidence and ease, every time.

                                <br /><br />
                                We continuously work to improve our platform by listening to our customers and refining every touchpoint of the shopping experience. From carefully curating products to optimizing logistics and support, our goal is to deliver consistency, reliability, and satisfaction with every order placed on Privora.
                            </p>

                            <CommonButton variant="secondaryBtn" className="w-fit max-w-fit px-8" href="/contact-us">
                                Know More About Us
                            </CommonButton>
                        </div>
                    </div>
                </section>
            </AnimatedSection>
            <AnimatedSection>
                <section className="px-3 md:px-8 lg:px-10 py-8 md:py-16">
                    <div className="max-w-[1560px]  mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div>
                            <CommonHeading
                                level={1}
                                title='Our Story'
                                className="text-left"
                                noMargin
                            />

                            <p className="mt-6 text-sm md:text-base text-foreground/80 max-w-xl leading-relaxed">
                                Privora was created to bridge the gap between beautiful products and a dependable online shopping experience. We focus on curation, quality assurance, and customer satisfaction to make every purchase feel worthwhile.
                                <br />
                                <br />
                                We partner with trusted suppliers and carefully evaluate every product before it reaches our store. From material standards to packaging and delivery, quality checks ensure you receive exactly what you expect.
                            </p>

                            <div className="mt-8">
                                <CommonButton variant="secondaryBtn" className="max-w-fit px-8" href="/product-list">
                                    Explore Collection
                                </CommonButton>
                            </div>
                        </div>

                        <div className="relative h-[350px] md:h-[520px] rounded-2xl overflow-hidden">
                            <Image
                                src="/img/about-img-2.webp"
                                alt="Privora craftsmanship"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>
            </AnimatedSection>
            <AnimatedSection>
                <HomeStoreFeature />
            </AnimatedSection>
        </div>
    );
}
