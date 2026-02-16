import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import AnimatedSection from "@/app/components/AnimatedSection";
import { COMPANY_INFO, BILLING_ADDRESS } from "@/constants";

export default function ContactInfoSection() {
    return (
        <section className="gradientBg">
            <AnimatedSection>
                <div className="px-3 md:px-8 lg:px-10 py-8 md:py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            {/* ================= LEFT CONTENT ================= */}
                            <div>
                                {/* Heading */}
                                <h2 className="font-times text-3xl md:text-4xl mb-4">
                                    Contact Us
                                </h2>

                                <p className="text-sm md:text-base text-foreground/80 max-w-md mb-10">
                                    Have questions or need assistance? We’re here to help.
                                    Reach out to Privora and our team will get back to you shortly.
                                </p>

                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-6">
                                        Contact Information
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {/* Phone */}
                                        <div className="flex flex-col items-start">
                                            <div className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center mb-3">
                                                <Phone size={18} />
                                            </div>
                                            <p className="text-sm font-medium">{COMPANY_INFO.PHONE}</p>
                                            <p className="text-xs text-foreground/70">
                                                Mon – Sat, 10am–6pm
                                            </p>
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col items-start">
                                            <div className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center mb-3">
                                                <Mail size={18} />
                                            </div>
                                            <p className="text-sm font-medium">
                                                {COMPANY_INFO.EMAIL}
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                Email us anytime
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div className="flex flex-col items-start">
                                            <div className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center mb-3">
                                                <MapPin size={18} />
                                            </div>
                                            <p className="text-sm font-medium">
                                                Maharashtra, India
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {BILLING_ADDRESS.fullName}
                                                <br />
                                                {BILLING_ADDRESS.line1}
                                                <br />
                                                {BILLING_ADDRESS.line2},
                                                <br />
                                                {BILLING_ADDRESS.city} - {BILLING_ADDRESS.pincode}
                                                <br />
                                                {BILLING_ADDRESS.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ================= RIGHT IMAGE ================= */}
                            <div className="relative hidden lg:block">
                                <div className="relative w-full h-[420px] md:h-[520px] rounded-t-full overflow-hidden">
                                    <Image
                                        src="/img/bracelet-img.webp"
                                        alt="Contact us"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
}
