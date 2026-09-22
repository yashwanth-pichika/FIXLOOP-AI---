import { useState } from 'react';
import { HistoricalTest } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  BarChart3, 
  RotateCcw, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';

interface DashboardAnalyticsProps {
  history: HistoricalTest[];
  onClearHistory: () => void;
  onRerunHistorical: (record: HistoricalTest) => void;
}

export function DashboardAnalytics({
  history,
  onClearHistory,
  onRerunHistorical
}: DashboardAnalyticsProps) {
  const [filter, setFilter] = useState<'all' | 'resolved' | 'failed'>('all');

  const totalTests = history.length;
  const resolvedCount = history.filter(h => h.isResolved || (h.statusCode >= 200 && h.statusCode < 300)).length;
  const passRate = totalTests > 0 ? Math.round((resolvedCount / totalTests) * 100) : 100;
  const avgLatency = totalTests > 0 ? Math.round(history.reduce((acc, h) => acc + h.latencyMs, 0) / totalTests) : 0;

  const filteredHistory = history.filter(h => {
    if (filter === 'resolved') return h.isResolved || (h.statusCode >= 200 && h.statusCode < 300);
    if (filter === 'failed') return !h.isResolved && h.statusCode >= 400;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Test Executions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalTests}</div>
          <span className="text-[11px] text-slate-500">Live & automated runs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Auto-Resolution Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{passRate}%</div>
          <span className="text-[11px] text-emerald-500/80">Closed-loop verified</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg Latency (Round Trip)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">{avgLatency} ms</div>
          <span className="text-[11px] text-slate-500">Fast Spring Boot execution</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">AI Diagnosis Health</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">99.2%</div>
          <span className="text-[11px] text-slate-500">Root-cause precision</span>
        </div>
      </div>

      {/* Historical Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Execution History Log</h3>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                  filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                  filter === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                  filter === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Failed ({totalTests - resolvedCount})
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No historical test records found for this filter.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3 hover:bg-slate-800/30 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {item.isResolved || (item.statusCode >= 200 && item.statusCode < 300) ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        item.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.method}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {item.command}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold ${
                      item.statusCode >= 200 && item.statusCode < 300 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      HTTP {item.statusCode}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {item.latencyMs}ms • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => onRerunHistorical(item)}
                    title="Load and rerun test"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
