import React from "react";
import {
  Headset,
  BadgeCheck,
  Truck,
  CreditCard,
} from "lucide-react";

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: <Headset size={30} />,
    title: "Customer Support",
    description: "Always here to help, whenever you need us.",
  },
  {
    icon: <BadgeCheck size={30} />,
    title: "Premium Quality",
    description: "Carefully crafted products you can trust.",
  },
  {
    icon: <Truck size={30} />,
    title: "Fast Shipping",
    description: "Reliable delivery, right to your doorstep.",
  },
  {
    icon: <CreditCard size={30} />,
    title: "Secure Payment",
    description: "Your transactions are safe and protected.",
  },
];

const HomeStoreFeature: React.FC = () => {
  return (
    <section className="px-3 py-7 md:px-8 lg:px-10 md:py-10 lg:py-20">
      <div className="max-w-[1560px] mx-auto bg-[#faf7f3] rounded-2xl">
        <div className="px-3 py-4 grid gap-4 md:gap-2 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 md:px-8 md:not-even:border-r  lg:not-last:border-r md:border-foreground/50">
              <div className="text-background rounded-full bg-brand p-2">
                {feature.icon}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-foreground">
                  {feature.title}
                </h4>
                <p className="text-sm text-foreground/70">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm md:text-base text-foreground/80 leading-relaxed max-w-3xl mx-auto mt-8 md:mt-12">
        At Privora, we bring you simply stunning jewelry we love — affordable pieces for everyone, crafted by people just like you.
      </p>
    </section>
  );
};

export default HomeStoreFeature;
