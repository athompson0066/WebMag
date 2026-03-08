import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { saveListingSubmission, ListingData } from '../services/supabaseService';

interface SalesPageProps {
  onClose: () => void;
  accentColor: string;
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";
const PAYPAL_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID || "";

const SalesPage: React.FC<SalesPageProps> = ({ onClose, accentColor }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<Partial<ListingData>>({
    first_name: '',
    last_name: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    email: '',
    website_url: '',
    title: '',
    description: ''
  });

  const [formStep, setFormStep] = useState(1);

  const isStep1Valid = !!(formData.first_name && formData.last_name && formData.email);
  const isStep2Valid = !!(formData.address && formData.city && formData.state && formData.postal_code);
  const isStep3Valid = !!(formData.website_url && formData.title);
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (formStep === 1 && isStep1Valid) setFormStep(2);
    else if (formStep === 2 && isStep2Valid) setFormStep(3);
  };

  const prevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handlePayPalApprove = async (data: any, actions: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // In a subscription, the subscription ID is directly returned in data
      const subscriptionId = data.subscriptionID;

      const fullData: ListingData = {
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        company_name: formData.company_name || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        postal_code: formData.postal_code || '',
        email: formData.email!,
        website_url: formData.website_url!,
        title: formData.title!,
        description: formData.description || '',
        paypal_transaction_id: subscriptionId,
        payment_status: 'ACTIVE_SUBSCRIPTION'
      };

      const result = await saveListingSubmission(fullData);

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError('Payment succeeded, but we failed to save your listing. Please contact support.');
      }
    } catch (err) {
      setSubmitError('An error occurred during payment processing.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white text-zinc-900 font-sans selection:bg-black selection:text-white overflow-y-auto admin-scroll">
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[120] w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform shadow-2xl"
      >
        <span className="text-2xl font-light">×</span>
      </button>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Visual Side */}
        <div className="w-full lg:w-1/2 bg-zinc-100 p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="text-[40rem] font-black leading-none absolute -top-20 -right-20 rotate-12 select-none">LIST</div>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-8 block">The Lead Engine</span>
            <h2 className="text-6xl lg:text-9xl font-serif font-black italic tracking-tighter leading-none mb-12">
              Stop Chasing <br /> Leads. <br /> Start Attracting <br /> Clients.
            </h2>
          </div>

          <div className="relative z-10">
            <div className="h-[3px] w-24 mb-12" style={{ backgroundColor: accentColor }}></div>
            <p className="text-xl lg:text-3xl font-light leading-relaxed text-zinc-600 max-w-md italic">
              Your kitchen renovation business deserves a platform that works as hard as you do. Join the Ontario Kitchen Report and get in front of local homeowners exactly when they’re ready to build.
            </p>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center bg-white border-l border-zinc-100">
          {!showForm && !submitSuccess && (
            <div className="max-w-md space-y-16 animate-fade-in">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8" style={{ color: accentColor }}>The Value Proposition</h3>
                <div className="space-y-10">
                  <div className="flex gap-8">
                    <span className="text-3xl font-serif italic text-zinc-200">01</span>
                    <div>
                      <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Pre-Qualified Visibility</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">Showcase your portfolio to local homeowners who are actively researching renovations. We filter out the "window shoppers" so you spend less time quoting and more time building.</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-3xl font-serif italic text-zinc-200">02</span>
                    <div>
                      <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Local Authority</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">Your brand is featured alongside the best in the province. Establish yourself as a trusted expert, not just another search result.</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-3xl font-serif italic text-zinc-200">03</span>
                    <div>
                      <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Direct Access</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">Your profile acts as a digital showroom. Homeowners don’t just read about you—they use our built-in tools to start a conversation with you directly.</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-3xl font-serif italic text-zinc-200">04</span>
                    <div>
                      <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">SEO-Driven Trust</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">Get a powerful, relevant backlink to your main site, strengthening your own digital presence and helping you climb the rankings naturally.</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-3xl font-serif italic text-zinc-200">05</span>
                    <div>
                      <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">The "No-Noise" Zone</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">Leave the social media shouting match behind. Our distraction-free, high-fidelity gallery ensures your project images—and your craftsmanship—take center stage.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-50 p-12 border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }}></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4">Secure Your Placement</h3>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed italic">$249 / Month to become a featured partner in the Ontario Kitchen Report.</p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setFormStep(1);
                    }}
                    className="w-full bg-black text-white py-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                  >
                    Submit Your Website
                  </button>
                  <p className="text-center text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Secure checkout via PayPal</p>
                </div>
              </section>
            </div>
          )}

          {showForm && !submitSuccess && (
            <div className="max-w-xl w-full mx-auto space-y-8 animate-fade-in relative z-10 pb-20">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => formStep === 1 ? setShowForm(false) : prevStep()}
                  className="text-xs text-zinc-400 hover:text-black uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  ← {formStep === 1 ? 'Back to Intro' : 'Previous Step'}
                </button>
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                  Step {formStep} of 3
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-black italic tracking-tighter mb-2">
                  {formStep === 1 && "Personal Details"}
                  {formStep === 2 && "Billing Address"}
                  {formStep === 3 && "Listing Details"}
                </h3>
                <p className="text-sm text-zinc-500">
                  {formStep === 1 && "Start by providing your contact information."}
                  {formStep === 2 && "Where should we send the receipts?"}
                  {formStep === 3 && "Tell us about the website you are listing."}
                </p>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 text-sm font-semibold rounded">
                  {submitError}
                </div>
              )}

              {/* STEP 1: Personal Details */}
              {formStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">First Name *</label>
                      <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Last Name *</label>
                      <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Company Name</label>
                    <input name="company_name" value={formData.company_name} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!isStep1Valid}
                    className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                  >
                    Continue to Address
                  </button>
                </div>
              )}

              {/* STEP 2: Billing Address */}
              {formStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Street Address *</label>
                    <input required name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">City *</label>
                      <input required name="city" value={formData.city} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">State/Prov *</label>
                      <input required name="state" value={formData.state} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Zip / Postal Code *</label>
                    <input required name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!isStep2Valid}
                    className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                  >
                    Continue to Listing Details
                  </button>
                </div>
              )}

              {/* STEP 3: Listing Content & Checkout */}
              {formStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Website URL *</label>
                      <input required type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://" className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Listing Title *</label>
                      <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-black text-sm resize-none"></textarea>
                    </div>
                  </div>

                  <div className="pt-8 mb-12 border-t border-zinc-100">
                    {isSubmitting && (
                      <div className="text-center p-4">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Processing...</p>
                      </div>
                    )}

                    {!isSubmitting && !isStep3Valid && (
                      <div className="w-full bg-zinc-100 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-center cursor-not-allowed">
                        Fill Required Fields to Pay
                      </div>
                    )}

                    {!isSubmitting && isStep3Valid && isFormValid && (
                      <div className="mt-4 animate-fade-in">
                        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, vault: true }}>
                          <PayPalButtons
                            style={{ layout: "vertical", color: "black", shape: "rect", height: 50 }}
                            createSubscription={(data, actions) => {
                              return actions.subscription.create({
                                plan_id: PAYPAL_PLAN_ID
                              });
                            }}
                            onApprove={handlePayPalApprove}
                          />
                        </PayPalScriptProvider>
                        <p className="text-center text-[10px] text-zinc-400 mt-4 leading-relaxed font-bold">
                          By proceeding, you agree to a recurring $249 / month subscription. <br />
                          You can cancel anytime.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {submitSuccess && (
            <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-4xl font-serif font-black italic tracking-tighter">Placement Secured</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Thank you for your submission. Your payment was successful and your website has been automatically added to the digital showcase slides.
              </p>
              <button
                onClick={onClose}
                className="inline-block mt-8 bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors"
              >
                Return to Showcase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
