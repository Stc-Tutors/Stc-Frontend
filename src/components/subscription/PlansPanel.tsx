"use client";

import { useEffect, useState } from "react";
import { GetPublicPricingPlansAction, SubscribeAction, GetMySubscriptionsAction } from "@/server/subscription";
import { PricingPlan } from "@/types/pricing-plan";
import { Subscription, SubscriptionStatus } from "@/types/subscription";

export default function PlansPanel() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [plansRes] = await GetPublicPricingPlansAction();
    const [subsRes] = await GetMySubscriptionsAction();
    setPlans(plansRes?.data ?? []);
    setSubscriptions(subsRes?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activeSubscription = subscriptions.find((s) => s.status === SubscriptionStatus.ACTIVE);

  const handleSubscribe = async (plan: PricingPlan) => {
    setSubscribingId(plan.id);
    setMessage(null);
    const [res, error] = await SubscribeAction(plan.id);
    setSubscribingId(null);

    if (error || !res?.data) {
      setMessage(error || "Could not start subscription");
      return;
    }

    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(res.data.access_code);
  };

  return (
    <div className="space-y-6">
      {activeSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          You're subscribed to{" "}
          <strong>{typeof activeSubscription.plan === "string" ? "a plan" : activeSubscription.plan.name}</strong>.
          {activeSubscription.currentPeriodEnd && (
            <> Renews {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}.</>
          )}
        </div>
      )}

      {message && <p className="text-sm text-red-500">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading plans...</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-gray-500">No subscription plans are available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
              <p className="text-2xl font-semibold mb-1">
                {plan.currency} {plan.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mb-4">per {plan.billingPeriod}</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i}>&bull; {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={
                  subscribingId === plan.id ||
                  (typeof activeSubscription?.plan === "string"
                    ? activeSubscription.plan === plan.id
                    : activeSubscription?.plan.id === plan.id)
                }
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {subscribingId === plan.id ? "Starting..." : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
