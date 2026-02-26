import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  User, 
  History, 
  AlertCircle, 
  ThumbsUp, 
  Store, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  CheckCircle2,
  Info
} from 'lucide-react';

type SurveyType = 'Household' | 'Shop / Retailer' | 'Hotel / Restaurant' | 'Office' | 'Construction Site' | 'Other';

interface FormData {
  name: string;
  mobile: string;
  area: string;
  type: SurveyType;
  otherType: string;
  waterTypes: string[];
  otherWaterType: string;
  currentBrand: string;
  price20l: string;
  price1l: string;
  price500ml: string;
  monthly20l: string;
  dailyBottles: string;
  problems: string[];
  switchingReasons: string[];
  cheaperSwitch: string;
  retailerFastestSize: string;
  retailerMargin: string;
  retailerCredit: string;
  retailerTryHeroAgroFoods: string;
  comments: string;
}

const initialData: FormData = {
  name: '', mobile: '', area: '', type: 'Household', otherType: '',
  waterTypes: [], otherWaterType: '', currentBrand: '', price20l: '',
  price1l: '', price500ml: '', monthly20l: '', dailyBottles: '',
  problems: [], switchingReasons: [], cheaperSwitch: '',
  retailerFastestSize: '', retailerMargin: '', retailerCredit: '',
  retailerTryHeroAgroFoods: '', comments: '',
};

export default function SurveyForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = formData.type === 'Shop / Retailer' ? 6 : 5;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isSubmitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">Thank You!</h2>
          <p className="text-slate-600 mb-8 text-sm sm:text-base">Your response has been recorded successfully. We appreciate your time and feedback.</p>
          <button 
            onClick={() => {
              setFormData(initialData);
              setStep(1);
              setIsSubmitted(false);
            }}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors min-h-[48px]"
          >
            Submit Another Response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8 sm:py-12 px-0 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header Section */}
        <div className="text-center mb-8 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 mb-4 sm:mb-6">
            <Droplets size={24} className="sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 mb-2">Market Survey</h1>
          <p className="text-slate-500 text-sm sm:text-lg">Packaged Drinking Water & Water ATM Study</p>
        </div>

        {/* Progress Bar - Sticky on mobile */}
        <div className="sticky top-16 z-40 bg-slate-50/80 backdrop-blur-sm py-2 px-4 sm:relative sm:top-0 sm:bg-transparent sm:mb-8">
          <div className="flex justify-between text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col sm:block">
          <div className="glass-card flex-1 sm:flex-none p-6 sm:p-10 rounded-none sm:rounded-2xl border-x-0 sm:border-x shadow-none sm:shadow-sm mb-24 sm:mb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Basic Information</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input 
                          type="text" name="name" value={formData.name} onChange={handleInputChange}
                          placeholder="Enter your name" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                        <input 
                          type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                          placeholder="10-digit mobile number" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Area / Locality</label>
                        <input 
                          type="text" name="area" value={formData.area} onChange={handleInputChange}
                          placeholder="e.g. Indiranagar, Bangalore" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Respondent Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {['Household', 'Shop / Retailer', 'Hotel / Restaurant', 'Office', 'Construction Site', 'Other'].map((t) => (
                            <label key={t} className={`checkbox-label ${formData.type === t ? 'bg-blue-50 border-blue-200' : ''}`}>
                              <input 
                                type="radio" name="type" value={t} checked={formData.type === t}
                                onChange={handleInputChange} className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm font-medium">{t}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <History className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Current Usage</h2>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Water types used:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {['20L Jar', '1L Bottle', '500ml Bottle', 'Borewell', 'Tanker', 'Other'].map((t) => (
                            <label key={t} className={`checkbox-label ${formData.waterTypes.includes(t) ? 'bg-blue-50 border-blue-200' : ''}`}>
                              <input 
                                type="checkbox" checked={formData.waterTypes.includes(t)}
                                onChange={() => handleCheckboxChange('waterTypes', t)}
                                className="checkbox-input"
                              />
                              <span className="text-sm font-medium">{t}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Brand</label>
                          <input type="text" name="currentBrand" value={formData.currentBrand} onChange={handleInputChange} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (20L Jar)</label>
                          <input type="text" name="price20l" value={formData.price20l} onChange={handleInputChange} placeholder="₹" className="input-field" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Problems Faced</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {['Bad taste', 'Delivery delay', 'Leakage', 'Dirty jars', 'High price', 'No hygiene guarantee'].map((p) => (
                        <label key={p} className={`checkbox-label ${formData.problems.includes(p) ? 'bg-blue-50 border-blue-200' : ''}`}>
                          <input 
                            type="checkbox" checked={formData.problems.includes(p)}
                            onChange={() => handleCheckboxChange('problems', p)}
                            className="checkbox-input"
                          />
                          <span className="text-sm font-medium">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsUp className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Switching Interest</h2>
                    </div>
                    <div className="space-y-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Would you switch if:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {['Better price', 'Better taste', 'Faster delivery', 'Hygienic sealed cap'].map((r) => (
                          <label key={r} className={`checkbox-label ${formData.switchingReasons.includes(r) ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <input 
                              type="checkbox" checked={formData.switchingReasons.includes(r)}
                              onChange={() => handleCheckboxChange('switchingReasons', r)}
                              className="checkbox-input"
                            />
                            <span className="text-sm font-medium">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && formData.type === 'Shop / Retailer' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Store className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Retailer Details</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current margin per bottle (₹)</label>
                        <input type="text" name="retailerMargin" value={formData.retailerMargin} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Credit period:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Cash', '7 days', '15 days'].map((opt) => (
                            <label key={opt} className={`checkbox-label ${formData.retailerCredit === opt ? 'bg-blue-50 border-blue-200' : ''}`}>
                              <input type="radio" name="retailerCredit" value={opt} checked={formData.retailerCredit === opt} onChange={handleInputChange} className="hidden" />
                              <span className="text-xs sm:text-sm font-medium text-center w-full">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === totalSteps && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="text-blue-600" size={20} />
                      <h2 className="text-xl sm:text-2xl font-display font-bold">Final Comments</h2>
                    </div>
                    <textarea 
                      name="comments" value={formData.comments} onChange={handleInputChange}
                      rows={4} placeholder="Any other feedback..."
                      className="input-field resize-none"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation - Fixed on mobile, inline on desktop */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:mt-8 z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[48px]"
              >
                <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
              </button>
            )}
            {step < totalSteps ? (
              <button 
                onClick={nextStep}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 min-h-[48px]"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 sm:py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 min-h-[48px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'} <Send size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 mb-24 sm:mb-0 text-center text-slate-400 text-xs flex items-center justify-center gap-2 px-4">
          <Info size={14} />
          <span>Secure research data collection.</span>
        </div>
      </div>
    </div>
  );
}
