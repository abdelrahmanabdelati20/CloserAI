"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const PAYPAL_CLIENT_ID = "Ad0tNNgcXsJVUzrp2izuKq15cT4tCAAyEw6UqNIrKNwNMcHARRgQhqpwSUScL7B2dCnQ0UyvlFVuBZEw";

const PLANS = [
  { id: "starter", planId: "P-1LK62020A02608326NHLKVJI", name: "Starter", price: 297, features: ["1 Website", "1,000 conversations/mo", "Lead capture", "50+ Languages", "Email support"] },
  { id: "professional", planId: "P-97J20105C8054843BNHLKWRQ", name: "Professional", price: 597, features: ["5 Websites", "3,000 conversations/mo", "Priority support (24h)", "Property matching AI", "CRM integration"], popular: true },
  { id: "enterprise", planId: "P-7UV62933RP089234PNHLKXMA", name: "Enterprise", price: 1297, features: ["Unlimited Widgets", "10,000 conversations/mo", "Custom training", "Dedicated manager", "White-label"] },
];

export default function TrialExpiredPage() {
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [paypalReady, setPaypalReady] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  useEffect(() => {
    if (!paypalReady || !paypalRef.current) return;
    // Clear previous button
    paypalRef.current.innerHTML = "";

    const paypal = (window as any).paypal;
    if (!paypal) return;

    paypal.Buttons({
      style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
      createSubscription: function (_data: any, actions: any) {
        return actions.subscription.create({ plan_id: plan.planId });
      },
      onApprove: function (data: any) {
        setSubscriptionId(data.subscriptionID);
      },
    }).render(paypalRef.current);
  }, [paypalReady, selectedPlan, plan.planId]);

  if (subscriptionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Subscription Active!</h1>
          <p className="text-gray-600 mb-6">Your account has been reactivated. Your AI assistant is now back online 24/7.</p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200 text-left">
            <h3 className="font-bold text-green-900 mb-2">What&apos;s Next:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>&#10004; Your widget is live again on your website</li>
              <li>&#10004; All your previous leads and settings are preserved</li>
              <li>&#10004; PayPal will auto-charge you monthly</li>
              <li>&#10004; Cancel anytime from your PayPal account</li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-block w-full py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
          >
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        data-sdk-integration-source="button-factory"
        onReady={() => setPaypalReady(true)}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>C</div>
              <span className="text-xl font-bold">Closer<span className="text-blue-600">AI</span></span>
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600">Back to login</Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              YOUR 14-DAY TRIAL HAS ENDED
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Keep Your AI Running</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your data is safe. Subscribe now to reactivate your AI assistant instantly.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-5 mb-8 max-w-2xl mx-auto border border-yellow-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <strong>Your chat widget is currently offline.</strong> Visitors to your website are no longer being engaged. Subscribe now to restore service within 60 seconds.
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`text-left rounded-2xl p-6 border-2 transition ${
                  selectedPlan === p.id ? "border-blue-600 bg-blue-50 shadow-lg" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {(p as any).popular && <div className="text-xs font-bold text-blue-600 uppercase mb-2">Most Popular</div>}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <div className="text-3xl font-bold text-blue-600 my-2">${p.price}<span className="text-sm text-gray-400">/mo</span></div>
                <div className="text-xs text-green-600 font-semibold mb-3">No setup fee (you&apos;re already set up!)</div>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">Subscribe to {plan.name}</h3>
              <p className="text-gray-500 text-sm">${plan.price}/month, cancel anytime</p>
            </div>
            <div ref={paypalRef} />
            {!paypalReady && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading PayPal...</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-4">
              Your account reactivates instantly after payment
            </p>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Questions? Email <a href="mailto:AbdelrahmanAbdelati20@gmail.com" className="text-blue-600">AbdelrahmanAbdelati20@gmail.com</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
