import React, { useState, useMemo } from 'react';
import { ActivityLogItem } from '../types';
import {
  TrendingUp,
  Activity,
  Calendar,
  MousePointerClick,
  LogIn,
  PhoneCall,
  Heart,
  Store,
  Users,
  BarChart3,
  LineChart as LineChartIcon,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface UserActivityChartProps {
  logs: ActivityLogItem[];
  onNavigateToActivityLogs?: () => void;
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({
  logs,
  onNavigateToActivityLogs,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [activeHoverPoint, setActiveHoverPoint] = useState<{
    dateStr: string;
    count: number;
    breakdown: Record<string, number>;
    x: number;
    y: number;
  } | null>(null);

  // Helper to categorize log action types
  const getActionCategory = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act === 'LOGIN' || act === 'REGISTER') return 'Auth (Login/Register)';
    if (act === 'PRODUCT_CLICK' || act === 'CLICK_PRODUCT') return 'Product Clicks';
    if (act === 'SHOP_CLICK' || act === 'CLICK_SHOP') return 'Shop Visits';
    if (
      act === 'WHATSAPP_CLICK' ||
      act === 'CALL_CLICK' ||
      act.includes('WHATSAPP') ||
      act.includes('CALL')
    )
      return 'Leads (Call/WhatsApp)';
    if (act.includes('WISHLIST')) return 'Wishlist Actions';
    if (act.includes('SHOP')) return 'Shop Management';
    if (act.includes('PRODUCT')) return 'Product Management';
    return 'Other Interactions';
  };

  // Process logs into daily timeline data based on selected timeRange
  const timelineData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const now = new Date();
    let daysToInclude = 14;
    if (timeRange === '7d') daysToInclude = 7;
    if (timeRange === '14d') daysToInclude = 14;
    if (timeRange === '30d') daysToInclude = 30;

    // Filter logs by date range if not 'all'
    const cutoffDate = new Date();
    if (timeRange !== 'all') {
      cutoffDate.setDate(now.getDate() - daysToInclude + 1);
      cutoffDate.setHours(0, 0, 0, 0);
    } else {
      // Find oldest log
      const dates = logs.map((l) => new Date(l.createdAt).getTime()).filter((t) => !isNaN(t));
      if (dates.length > 0) {
        cutoffDate.setTime(Math.min(...dates));
        cutoffDate.setHours(0, 0, 0, 0);
      }
    }

    // Build day buckets map
    const buckets: Record<string, { dateObj: Date; count: number; breakdown: Record<string, number> }> = {};

    if (timeRange !== 'all') {
      for (let i = daysToInclude - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        buckets[key] = { dateObj: d, count: 0, breakdown: {} };
      }
    }

    logs.forEach((log) => {
      if (!log.createdAt) return;
      const logDate = new Date(log.createdAt);
      if (isNaN(logDate.getTime())) return;
      if (timeRange !== 'all' && logDate < cutoffDate) return;

      const key = logDate.toISOString().split('T')[0];
      if (!buckets[key]) {
        buckets[key] = { dateObj: logDate, count: 0, breakdown: {} };
      }

      buckets[key].count += 1;
      const cat = getActionCategory(log.action);
      buckets[key].breakdown[cat] = (buckets[key].breakdown[cat] || 0) + 1;
    });

    const sortedKeys = Object.keys(buckets).sort();
    return sortedKeys.map((key) => {
      const b = buckets[key];
      const label = b.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        dateStr: key,
        displayDate: label,
        count: b.count,
        breakdown: b.breakdown,
      };
    });
  }, [logs, timeRange]);

  // Category Aggregates for Doughnut / Progress distribution
  const categoryStats = useMemo(() => {
    const counts: Record<string, { count: number; color: string; icon: any }> = {
      'Auth (Login/Register)': { count: 0, color: '#3B82F6', icon: LogIn },
      'Product Clicks': { count: 0, color: '#6366F1', icon: MousePointerClick },
      'Shop Visits': { count: 0, color: '#F59E0B', icon: Store },
      'Leads (Call/WhatsApp)': { count: 0, color: '#10B981', icon: PhoneCall },
      'Wishlist Actions': { count: 0, color: '#F43F5E', icon: Heart },
      'Shop Management': { count: 0, color: '#D97706', icon: Store },
      'Product Management': { count: 0, color: '#A855F7', icon: Sparkles },
      'Other Interactions': { count: 0, color: '#64748B', icon: Activity },
    };

    let totalFilteredLogs = 0;

    timelineData.forEach((day) => {
      Object.entries(day.breakdown).forEach(([cat, val]) => {
        if (!counts[cat]) {
          counts[cat] = { count: 0, color: '#F97316', icon: Activity };
        }
        counts[cat].count += val;
        totalFilteredLogs += val;
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        color: data.color,
        icon: data.icon,
        percentage: totalFilteredLogs > 0 ? Math.round((data.count / totalFilteredLogs) * 100) : 0,
      }))
      .filter((item) => item.count > 0 || timelineData.length === 0)
      .sort((a, b) => b.count - a.count);
  }, [timelineData]);

  // Overall metrics calculation
  const totalEventsInView = useMemo(() => {
    return timelineData.reduce((acc, curr) => acc + curr.count, 0);
  }, [timelineData]);

  const peakDay = useMemo(() => {
    if (timelineData.length === 0) return { displayDate: 'N/A', count: 0 };
    return timelineData.reduce(
      (max, curr) => (curr.count > max.count ? curr : max),
      timelineData[0]
    );
  }, [timelineData]);

  const avgDailyEvents = useMemo(() => {
    if (timelineData.length === 0) return 0;
    return Math.round(totalEventsInView / timelineData.length);
  }, [totalEventsInView, timelineData]);

  // Calculations for SVG chart geometry
  const maxCount = useMemo(() => {
    const max = Math.max(...timelineData.map((d) => d.count), 5);
    return Math.ceil(max * 1.15); // headroom for top labels
  }, [timelineData]);

  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = useMemo(() => {
    if (timelineData.length === 0) return [];
    const stepX = timelineData.length > 1 ? chartW / (timelineData.length - 1) : chartW / 2;

    return timelineData.map((item, index) => {
      const x = paddingX + index * stepX;
      const y = paddingY + chartH - (item.count / maxCount) * chartH;
      return { x, y, ...item };
    });
  }, [timelineData, maxCount, chartW, chartH]);

  // Path data for smooth curve
  const linePathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return path;
  }, [points]);

  const areaPathD = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingY + chartH;
    const lineD = linePathD;
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;

    return `${lineD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathD, points, paddingY, chartH]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              User Activity Analytics
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {totalEventsInView} Log Events
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual log timeline of customer logins, shop visits, product interest, and lead conversions.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Area Line Chart View"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trend</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bars</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            {(['7d', '14d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer uppercase ${
                  timeRange === range
                    ? 'bg-slate-800 text-orange-400 border border-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All' : range}
              </button>
            ))}
          </div>

          {onNavigateToActivityLogs && (
            <button
              onClick={onNavigateToActivityLogs}
              className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 ml-auto sm:ml-0"
            >
              <span>Audit Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats KPI Mini Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-400" /> Total Logged Events
          </div>
          <div className="text-xl font-black text-white">{totalEventsInView}</div>
          <div className="text-[10px] text-slate-400">In selected timeline</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> Daily Average
          </div>
          <div className="text-xl font-black text-emerald-400">{avgDailyEvents}</div>
          <div className="text-[10px] text-slate-400">Events per day</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" /> Peak Activity Day
          </div>
          <div className="text-xl font-black text-amber-300 truncate">{peakDay.displayDate}</div>
          <div className="text-[10px] text-amber-400/80 font-medium">{peakDay.count} events recorded</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Top Action Category
          </div>
          <div className="text-base font-bold text-indigo-300 truncate">
            {categoryStats[0]?.name || 'None'}
          </div>
          <div className="text-[10px] text-indigo-400/80 font-medium">
            {categoryStats[0]?.count || 0} events ({categoryStats[0]?.percentage || 0}%)
          </div>
        </div>
      </div>

      {/* Main Visual Section: Interactive SVG Chart & Category Breakdown Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* SVG Chart Container (2 columns on lg) */}
        <div className="lg:col-span-2 relative bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-slate-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              Activity Volume ({timeRange.toUpperCase()})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Hover points for detailed breakdown</span>
          </div>

          {timelineData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Activity className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
              <p className="font-semibold text-slate-300 text-sm">No activity log records found for this period</p>
              <p className="text-xs text-slate-500">Events will appear automatically as users interact with the app.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  {/* Area Gradient */}
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#F97316" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Bar Gradient */}
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingY + chartH - ratio * chartH;
                  const val = Math.round(ratio * maxCount);
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        strokeOpacity="0.4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        fill="#64748B"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Line & Area Mode */}
                {chartType === 'line' && (
                  <>
                    {/* Area path */}
                    <path d={areaPathD} fill="url(#activityGradient)" />

                    {/* Line path */}
                    <path
                      d={linePathD}
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]"
                    />

                    {/* Data Points */}
                    {points.map((pt, idx) => (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onMouseEnter={() =>
                          setActiveHoverPoint({
                            dateStr: pt.displayDate,
                            count: pt.count,
                            breakdown: pt.breakdown,
                            x: pt.x,
                            y: pt.y,
                          })
                        }
                        onMouseLeave={() => setActiveHoverPoint(null)}
                      >
                        {/* Outer glow ring */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          className="fill-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        {/* Core point */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#FFFFFF"
                          stroke="#EA580C"
                          strokeWidth="2.5"
                          className="group-hover:scale-125 transition-transform"
                        />
                      </g>
                    ))}
                  </>
                )}

                {/* Bar Mode */}
                {chartType === 'bar' && (
                  <g>
                    {points.map((pt, idx) => {
                      const barWidth = Math.max(12, Math.min(28, (chartW / points.length) * 0.55));
                      const barHeight = Math.max(2, (pt.count / maxCount) * chartH);
                      const barX = pt.x - barWidth / 2;
                      const barY = paddingY + chartH - barHeight;

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer group"
                          onMouseEnter={() =>
                            setActiveHoverPoint({
                              dateStr: pt.displayDate,
                              count: pt.count,
                              breakdown: pt.breakdown,
                              x: pt.x,
                              y: barY,
                            })
                          }
                          onMouseLeave={() => setActiveHoverPoint(null)}
                        >
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            rx="5"
                            fill="url(#barGradient)"
                            className="group-hover:brightness-125 transition-all"
                          />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* X-axis labels */}
                {points.map((pt, idx) => {
                  // Skip every second label if too crowded
                  const showLabel =
                    points.length <= 14 || idx % 2 === 0 || idx === points.length - 1;
                  if (!showLabel) return null;

                  return (
                    <text
                      key={idx}
                      x={pt.x}
                      y={svgHeight - 8}
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {pt.displayDate}
                    </text>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {activeHoverPoint && (
                <div
                  className="absolute pointer-events-none z-20 glass-panel p-3 rounded-xl border border-orange-500/40 bg-slate-950/95 text-xs text-white shadow-2xl space-y-1.5 transition-all transform -translate-x-1/2 -translate-y-full mb-2"
                  style={{
                    left: `${(activeHoverPoint.x / svgWidth) * 100}%`,
                    top: `${(activeHoverPoint.y / svgHeight) * 100}%`,
                  }}
                >
                  <div className="font-bold text-orange-400 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                    <span>{activeHoverPoint.dateStr}</span>
                    <span className="bg-orange-500/20 text-orange-300 text-[10px] px-2 py-0.5 rounded-full font-black">
                      {activeHoverPoint.count} Events
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] min-w-[140px]">
                    {Object.keys(activeHoverPoint.breakdown).length === 0 ? (
                      <div className="text-slate-400 italic">No activity recorded</div>
                    ) : (
                      Object.entries(activeHoverPoint.breakdown).map(([cat, val]) => (
                        <div key={cat} className="flex items-center justify-between text-slate-300">
                          <span className="truncate text-slate-400 pr-2">{cat}:</span>
                          <span className="font-bold text-white">{val}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Category Breakdown (Right column) */}
        <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              Event Type Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Distribution</span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {categoryStats.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 text-center">No categories recorded</div>
            ) : (
              categoryStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-200 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white font-bold">{item.count}</span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(item.percentage, 3)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="italic">Data updated in real-time</span>
            {onNavigateToActivityLogs && (
              <button
                onClick={onNavigateToActivityLogs}
                className="text-orange-400 hover:text-orange-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Full Audit Trail →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
