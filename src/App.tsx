import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Info,
  History,
  ThumbsUp,
  Store,
  MessageSquare
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
  name: '',
  mobile: '',
  area: '',
  type: 'Household',
  otherType: '',
  waterTypes: [],
  otherWaterType: '',
  currentBrand: '',
  price20l: '',
  price1l: '',
  price500ml: '',
  monthly20l: '',
  dailyBottles: '',
  problems: [],
  switchingReasons: [],
  cheaperSwitch: '',
  retailerFastestSize: '',
  retailerMargin: '',
  retailerCredit: '',
  retailerTryHeroAgroFoods: '',
  comments: '',
};

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  const fetchResponses = async () => {
    setIsLoadingResponses(true);
    try {
      const response = await fetch('/api/responses');
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setIsLoadingResponses(false);
    }
  };

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

  if (showDashboard) {
    const analytics = responses as any;
    const rawData = analytics.raw || [];

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Market Analysis Dashboard</h1>
              <p className="text-slate-500">Hero Agro Foods Market Survey Insights</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={fetchResponses}
                disabled={isLoadingResponses}
                className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <History size={18} className={isLoadingResponses ? 'animate-spin' : ''} />
                {isLoadingResponses ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button 
                onClick={() => setShowDashboard(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Survey
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Responses</p>
              <p className="text-4xl font-display font-bold text-blue-600">{analytics.total || 0}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Competitor</p>
              <p className="text-xl font-display font-bold text-slate-900">
                {analytics.marketShare?.[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-slate-500">{analytics.marketShare?.[0]?.percentage || 0}% Share</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Pain Point</p>
              <p className="text-xl font-display font-bold text-slate-900">
                {analytics.topPainPoints?.[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-slate-500">{analytics.topPainPoints?.[0]?.count || 0} Mentions</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Retailer Interest</p>
              <p className="text-xl font-display font-bold text-emerald-600">
                {analytics.distribution?.['Shop / Retailer'] || 0}
              </p>
              <p className="text-sm text-slate-500">Active Retailers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Market Share List */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <Store className="text-blue-600" size={20} />
                Market Share Analysis
              </h3>
              <div className="space-y-4">
                {analytics.marketShare?.map((brand: any) => (
                  <div key={brand.name}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>{brand.name}</span>
                      <span>{brand.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${brand.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Points Analysis */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                Top Pain Points
              </h3>
              <div className="space-y-4">
                {analytics.topPainPoints?.map((point: any) => (
                  <div key={point.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">{point.name}</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                      {point.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Responses Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-display font-bold">Recent Responses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Respondent</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Area</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawData.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{r.name || r.respondent_name}</p>
                        <p className="text-xs text-slate-500">{r.mobile}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.type || r.respondent_type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{r.area || r.locality}</td>
                      <td className="p-4 text-sm text-slate-600">{r.current_brand || r.current_brand_ || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase">
                          <CheckCircle2 size={14} />
                          Synced
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Thank You!</h2>
          <p className="text-slate-600 mb-8">Your response has been recorded successfully. We appreciate your time and feedback.</p>
          <button 
            onClick={() => {
              setFormData(initialData);
              setStep(1);
              setIsSubmitted(false);
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Another Response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button 
            onClick={() => {
              setShowDashboard(true);
              fetchResponses();
            }}
            className="absolute right-0 top-0 p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="View Dashboard"
          >
            <History size={24} />
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 mb-6">
            <Droplets size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">Hero Agro Foods Study</h1>
          <p className="text-slate-500 text-lg">Market Survey for Packaged Drinking Water & Water ATM</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Basic Information</h2>
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
                      <div className="grid grid-cols-2 gap-3">
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
                    {formData.type === 'Other' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Please specify</label>
                        <input 
                          type="text" name="otherType" value={formData.otherType} onChange={handleInputChange}
                          className="input-field"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Current Water Usage</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">What type of water do you use? (Select all that apply)</label>
                      <div className="grid grid-cols-2 gap-3">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Brand</label>
                        <input 
                          type="text" name="currentBrand" value={formData.currentBrand} onChange={handleInputChange}
                          placeholder="e.g. Bisleri, Kinley" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (20L Jar)</label>
                        <input 
                          type="text" name="price20l" value={formData.price20l} onChange={handleInputChange}
                          placeholder="₹" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (1L Bottle)</label>
                        <input 
                          type="text" name="price1l" value={formData.price1l} onChange={handleInputChange}
                          placeholder="₹" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (500ml Bottle)</label>
                        <input 
                          type="text" name="price500ml" value={formData.price500ml} onChange={handleInputChange}
                          placeholder="₹" className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monthly 20L Jars</label>
                        <input 
                          type="number" name="monthly20l" value={formData.monthly20l} onChange={handleInputChange}
                          placeholder="Quantity" className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Daily Bottles</label>
                        <input 
                          type="number" name="dailyBottles" value={formData.dailyBottles} onChange={handleInputChange}
                          placeholder="Quantity" className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Problems Faced</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Bad taste', 'Delivery delay', 'Leakage', 'Dirty jars', 
                      'High price', 'No fixed delivery time', 'No hygiene guarantee', 'No issue'
                    ].map((p) => (
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
                  <div className="flex items-center gap-3 mb-6">
                    <ThumbsUp className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Switching Interest</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Would you switch brand if:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['Better price', 'Better taste', 'Faster delivery', 'Hygienic sealed cap', 'Trusted local brand'].map((r) => (
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
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">If ₹2–3 cheaper, will you try new brand?</label>
                      <div className="flex gap-4">
                        {['Yes', 'Maybe', 'No'].map((opt) => (
                          <label key={opt} className={`flex-1 checkbox-label ${formData.cheaperSwitch === opt ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <input 
                              type="radio" name="cheaperSwitch" value={opt} checked={formData.cheaperSwitch === opt}
                              onChange={handleInputChange} className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && formData.type === 'Shop / Retailer' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Store className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Retailer Section</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Fastest selling size:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['250ml', '500ml', '1L'].map((opt) => (
                          <label key={opt} className={`checkbox-label ${formData.retailerFastestSize === opt ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <input 
                              type="radio" name="retailerFastestSize" value={opt} checked={formData.retailerFastestSize === opt}
                              onChange={handleInputChange} className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current margin per bottle (₹)</label>
                      <input 
                        type="text" name="retailerMargin" value={formData.retailerMargin} onChange={handleInputChange}
                        placeholder="₹" className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Credit period:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Cash', '7 days', '15 days'].map((opt) => (
                          <label key={opt} className={`checkbox-label ${formData.retailerCredit === opt ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <input 
                              type="radio" name="retailerCredit" value={opt} checked={formData.retailerCredit === opt}
                              onChange={handleInputChange} className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Would you try Hero Agro Foods if margin is higher?</label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map((opt) => (
                          <label key={opt} className={`flex-1 checkbox-label ${formData.retailerTryHeroAgroFoods === opt ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <input 
                              type="radio" name="retailerTryHeroAgroFoods" value={opt} checked={formData.retailerTryHeroAgroFoods === opt}
                              onChange={handleInputChange} className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(step === totalSteps) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-blue-600" />
                    <h2 className="text-2xl font-display font-bold">Additional Comments</h2>
                  </div>
                  <textarea 
                    name="comments" value={formData.comments} onChange={handleInputChange}
                    rows={4} placeholder="Any other feedback or requirements..."
                    className="input-field resize-none"
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-10">
                {step > 1 && (
                  <button 
                    onClick={prevStep}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button 
                    onClick={nextStep}
                    className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Next <ArrowRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'} <Send size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Info size={14} />
          <span>Your data is secure and will be used for research purposes only.</span>
        </div>
      </div>
    </div>
  );
}
