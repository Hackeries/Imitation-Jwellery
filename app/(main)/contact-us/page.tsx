"use client";

import { useState } from "react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import CommonInput from "@/app/components/input/CommonInput";
import CommonTextarea from "@/app/components/input/CommonTextArea";
import { useContactForm } from "@/hooks/use-contact";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import AnimatedSection from "@/app/components/AnimatedSection";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const contactMutation = useContactForm();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "name") {
      processedValue = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    try {
      const result = await contactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
      });
      setIsSuccess(true);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsSuccess(false);
  };

  return (
    <div className="contactUsPage gradientBg">
      <AnimatedSection>
        <section className="px-3 md:px-8 lg:px-10 py-8 md:py-16 lg:py-24">
          <div className="max-w-lg mx-auto">
            <CommonHeading
              level={1}
              title="Contact Us"
              description="If you have any questions or need assistance, we're here to help. Feel free to reach out & we'll get back to you promptly."
            />

            {isSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-times font-medium mb-2">
                  Message Sent!
                </h2>
                <p className="text-foreground/70 mb-8">
                  Thank you for reaching out. We&apos;ll get back to you within 24
                  hours.
                </p>
                <CommonButton variant="secondaryBtn" onClick={handleReset}>
                  Send Another Message
                </CommonButton>
              </div>
            ) : (
              <form className="mt-12" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                  <CommonInput
                    name="name"
                    label="Name"
                    placeholder="Enter Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <CommonInput
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <CommonInput
                  name="phone"
                  type="tel"
                  label="Number"
                  placeholder="Enter Your Number"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <CommonTextarea
                  name="message"
                  label="Message"
                  placeholder="Enter Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

                <div className="flex justify-center md:pt-6">
                  <CommonButton
                    variant="primaryBtn"
                    type="submit"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Question"}
                  </CommonButton>
                </div>
              </form>
            )}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
