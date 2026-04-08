"use client";

const PAYPAL_EMAIL = "AbdelrahmanAbdelati20@gmail.com";

const PLANS = [
  {
    name: "Starter",
    price: 297,
    setup: 997,
    period: "month",
    features: [
      "1 Website Widget",
      "500 AI Conversations/month",
      "Lead Capture & Management",
      "Conversation History",
      "Basic Analytics Dashboard",
      "Email Support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: 597,
    setup: 997,
    period: "month",
    features: [
      "5 Website Widgets",
      "2,000 AI Conversations/month",
      "Advanced Lead Scoring",
      "Property Matching AI",
      "CRM Integration Ready",
      "Priority Support",
      "Custom AI Training",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 1497,
    setup: 1497,
    period: "month",
    features: [
      "Unlimited Widgets",
      "Unlimited AI Conversations",
      "Custom AI Training",
      "White-Label Option",
      "Full API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const handlePaySetup = (plan: typeof PLANS[0]) => {
    const itemName = encodeURIComponent(`CloserAI ${plan.name} Plan - Setup Fee`);
    // PayPal direct payment link using business email
    const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&amount=${plan.setup}&currency_code=USD&item_name=${itemName}&no_shipping=1&return=${encodeURIComponent(window.location.origin + '/login')}&cancel_return=${encodeURIComponent(window.location.origin + '/pricing')}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"}}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">
              Closer<span className="text-blue-600">AI</span>
            </span>
          </a>
          <a href="/login" className="text-gray-600 hover:text-blue-600">Already a client? Login</a>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            One-time setup fee + monthly subscription. Cancel anytime.
            Every plan includes our AI-powered lead capture technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "text-white shadow-2xl scale-105"
                  : "bg-white border-2 border-gray-100 shadow-sm"
              }`}
              style={plan.popular ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
            >
              {plan.popular && (
                <div className="text-xs font-bold uppercase tracking-wider mb-4 text-yellow-300">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className={plan.popular ? "text-white/70" : "text-gray-500"}>/{plan.period}</span>
              </div>
              <div className={`text-sm mb-6 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                + ${plan.setup} one-time setup
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-yellow-300" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePaySetup(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition text-center ${
                  plan.popular
                    ? "bg-white text-blue-700 hover:bg-gray-100"
                    : "text-white hover:opacity-90"
                }`}
                style={!plan.popular ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
              >
                Get Started — Pay ${plan.setup} Setup
              </button>
            </div>
          ))}
        </div>

        {/* How Payment Works */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">How Payment Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Pay Setup Fee</h3>
              <p className="text-gray-600 text-sm">One-time payment via PayPal. We'll set up your AI assistant within 24 hours.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Get Your Dashboard</h3>
              <p className="text-gray-600 text-sm">You'll receive login credentials and your AI will be customized to your brand.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Monthly Subscription</h3>
              <p className="text-gray-600 text-sm">After setup, you'll subscribe to your monthly plan via PayPal. Cancel anytime.</p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-3xl mx-auto mt-16 bg-green-50 rounded-2xl p-8 border border-green-200 text-center">
          <h3 className="text-xl font-bold text-green-800 mb-2">7-Day Money-Back Guarantee</h3>
          <p className="text-green-700">
            Not satisfied? Get a full refund of your setup fee within 7 days. No questions asked.
            We're confident you'll see results within the first week.
          </p>
        </div>
      </div>
    </div>
  );
}
