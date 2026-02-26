import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  AlertCircle, 
  Store, 
  CheckCircle2, 
  RefreshCw,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  onRefresh?: () => void;
}

export default function Dashboard({ onRefresh }: DashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/responses');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading && !analytics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium">Analyzing market data...</p>
        </div>
      </div>
    );
  }

  const rawData = analytics?.raw || [];

  return (
    <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Market Analysis</h1>
            <p className="text-slate-500 text-sm sm:text-base">Real-time insights from Hero Agro Foods survey</p>
          </div>
          <button 
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm min-h-[44px]"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh Analysis
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <MetricCard 
            label="Total Responses" 
            value={analytics?.total || 0} 
            icon={Users} 
            color="blue" 
          />
          <MetricCard 
            label="Top Competitor" 
            value={analytics?.marketShare?.[0]?.name || 'N/A'} 
            subValue={`${analytics?.marketShare?.[0]?.percentage || 0}% Market Share`}
            icon={TrendingUp} 
            color="indigo" 
          />
          <MetricCard 
            label="Main Pain Point" 
            value={analytics?.topPainPoints?.[0]?.name || 'N/A'} 
            subValue={`${analytics?.topPainPoints?.[0]?.count || 0} Mentions`}
            icon={AlertCircle} 
            color="red" 
          />
          <MetricCard 
            label="Retailer Interest" 
            value={analytics?.distribution?.['Shop / Retailer'] || 0} 
            subValue="Active Retailers"
            icon={Store} 
            color="emerald" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Market Share Chart-like List */}
          <div className="lg:col-span-2 glass-card p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-display font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Brand Dominance
            </h3>
            <div className="space-y-6">
              {analytics?.marketShare?.map((brand: any) => (
                <div key={brand.name}>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-700">{brand.name}</span>
                    <span className="text-blue-600">{brand.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${brand.percentage}%` }}
                      className="h-full bg-blue-500 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locality Analysis */}
          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-display font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={20} />
              Locality Spend
            </h3>
            <div className="space-y-4">
              {analytics?.localityAnalysis?.map((item: any) => (
                <div key={item.area} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.area}</p>
                    <p className="text-xs text-slate-500">Avg. Monthly Spend</p>
                  </div>
                  <span className="text-lg font-display font-bold text-indigo-600">₹{item.avgSpend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table / Mobile Cards */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-display font-bold">Recent Responses</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 50 Entries</span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Respondent</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Locality</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Brand</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawData.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{r.name || r.respondent_name}</p>
                      <p className="text-xs text-slate-500">{r.mobile}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {r.type || r.respondent_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{r.area || r.locality}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">{r.current_brand || r.current_brand_ || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                        <CheckCircle2 size={14} />
                        Cloud Synced
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {rawData.map((r: any, idx: number) => (
              <div key={idx} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{r.name || r.respondent_name}</p>
                    <p className="text-xs text-slate-500">{r.mobile}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {r.type || r.respondent_type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {r.area || r.locality}
                  </div>
                  <div className="flex items-center gap-1">
                    <Store size={12} />
                    {r.current_brand || r.current_brand_ || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                    <CheckCircle2 size={12} />
                    Synced
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>

          {rawData.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No responses recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 truncate">{value}</p>
        {subValue && <p className="text-xs font-medium text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}
