"use client";

import CommonHeading from "@/app/components/CommonHeading";
import { FAQ_DATA } from "@/constants";
import { Disclosure } from "@headlessui/react";
import { Plus, X } from "lucide-react";

export default function FaqSection() {
    return (
        <div className="faqPage">
            <section className="px-3 md:px-8 lg:px-10 py-7 md:py-10 lg:py-10">
                <div className="mx-auto rounded-2xl md:p-10 max-w-full">
                    <div className="grid grid-cols-1 gap-4 md:gap-10 max-w-4xl mx-auto">
                        {/* ================= LEFT CONTENT (STICKY) ================= */}
                        <div className="">
                            <CommonHeading
                                level={1}
                                title="Frequently Asked Questions"
                                noMargin
                                className="text-left"
                            />
                            <p className="text-sm text-foreground leading-relaxed">
                                Have questions? You're not alone. Here are some of the most common things people ask us, answered clearly to help you get started with confidence.
                            </p>
                        </div>

                        {/* ================= RIGHT ACCORDIONS ================= */}
                        <div className="space-y-3">
                            {FAQ_DATA.map((faq, index) => (
                                <Disclosure key={index}>
                                    {({ open }) => (
                                        <div className="border border-foreground/20 rounded-xl px-3 py-3 md:px-5 md:py-4">
                                            <Disclosure.Button className="flex w-full items-center justify-between text-left">
                                                <span className="font-medium text-sm md:text-base text-foreground">
                                                    {faq.question}
                                                </span>
                                                {open ? (
                                                    <X size={18} />
                                                ) : (
                                                    <Plus size={18} />
                                                )}
                                            </Disclosure.Button>

                                            <Disclosure.Panel className="mt-3 text-sm text-foreground/80 leading-relaxed">
                                                {faq.answer}
                                            </Disclosure.Panel>
                                        </div>
                                    )}
                                </Disclosure>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
