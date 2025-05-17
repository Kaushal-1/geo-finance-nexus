
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      features: [
        "Paper trading access",
        "Basic stock analysis",
        "5 watchlists max",
        "Standard API limits",
      ],
      buttonText: "Start Free",
      buttonClass: "bg-gradient-to-r from-blue-500 to-blue-600",
      popular: false,
    },
    {
      name: "Premium Plan",
      price: "$19.99/month",
      features: [
        "All Free features",
        "Enhanced Sonar analysis",
        "Unlimited watchlists",
        "Advanced alerts",
        "Real-time data",
      ],
      buttonText: "Upgrade to Premium",
      buttonClass: "bg-gradient-to-r from-teal to-teal-dark",
      popular: true,
    },
    {
      name: "Pro Trader Plan",
      price: "$49.99/month",
      features: [
        "All Premium features",
        "Live trading (0.1% commission)",
        "Advanced portfolio analysis",
        "Dedicated API access",
        "Priority support",
      ],
      buttonText: "Go Pro",
      buttonClass: "bg-gradient-to-r from-purple-600 to-blue-600",
      popular: false,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From free to pro, pick a plan that fits your trading journey
          </p>
          
          {/* Billing Toggle - Currently disabled but ready for future implementation */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
              Monthly
            </span>
            <button 
              className="relative mx-4 h-6 w-12 rounded-full bg-gradient-to-r from-teal to-teal-dark p-1"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              aria-label="Toggle billing cycle"
            >
              <motion.div 
                className="h-4 w-4 rounded-full bg-white" 
                animate={{ x: billingCycle === "monthly" ? 0 : 24 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>
              Yearly
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={cn(
                "rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-300",
                plan.popular 
                  ? "border-teal shadow-lg shadow-teal/20 bg-black/60" 
                  : "border-white/10 bg-black/40"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{
                boxShadow: plan.popular 
                  ? "0 0 25px rgba(0, 184, 212, 0.3)"
                  : "0 0 20px rgba(255, 255, 255, 0.1)"
              }}
            >
              {plan.popular && (
                <div className="bg-teal text-white text-xs font-bold px-3 py-1 rounded-t-xl text-center">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-3xl font-mono font-bold text-white">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-teal mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  className={`${plan.buttonClass} text-white py-3 px-4 rounded-lg w-full font-medium transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
