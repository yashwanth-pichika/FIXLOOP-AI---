import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PhoneSimulator } from './components/PhoneSimulator';
import { WorkbenchView } from './components/WorkbenchView';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { CameraOcrModal } from './components/CameraOcrModal';
import { TestSuiteModal } from './components/TestSuiteModal';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { InfoModal } from './components/InfoModal';
import { 
  PipelineStage, 
  ApiTestRequest, 
  ApiExecutionResult, 
  DiagnosisResult, 
  RetestResult, 
  HistoricalTest 
} from './types';
import { debuggerEngine } from './services/apiExecutionService';
import { DEMO_PRESET_SCENARIOS } from './data/mockApis';
import { X, Sparkles, Smartphone, Terminal, Activity } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'phone' | 'workbench'>('workbench');
  const [currentStage, setCurrentStage] = useState<PipelineStage>('idle');
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const [externalRequestToLoad, setExternalRequestToLoad] = useState<ApiTestRequest | null>(null);

  // Synchronized state for Workbench view
  const [activeRequest, setActiveRequest] = useState<ApiTestRequest | null>(null);
  const [executionResult, setExecutionResult] = useState<ApiExecutionResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [retestResult, setRetestResult] = useState<RetestResult | null>(null);
  const [historyList, setHistoryList] = useState<HistoricalTest[]>([]);

  // Load history initially
  useEffect(() => {
    setHistoryList(debuggerEngine.getHistory());
  }, []);

  // Update history list when retest or execution completes
  const refreshHistory = () => {
    setHistoryList(debuggerEngine.getHistory());
  };

  // Handler when OCR modal generates a parsed API test
  const handleApplyExtractedApi = (req: ApiTestRequest) => {
    setExternalRequestToLoad(req);
    setActiveRequest(req);
  };

  // Handler for re-running a historical test
  const handleRerunHistorical = (record: HistoricalTest) => {
    setIsHistoryOpen(false);
    const reconstructed: ApiTestRequest = {
      id: `req_hist_${Date.now()}`,
      method: record.method,
      url: record.url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'iQOO-Debugger-Client/v1.0 (Android 14)',
        'Accept': 'application/json'
      },
      scenarioTitle: `Rerun: ${record.command}`,
      commandPrompt: record.command,
      source: 'preset',
      timestamp: Date.now()
    };
    setExternalRequestToLoad(reconstructed);
    setActiveRequest(reconstructed);
  };

  const handleClearHistory = () => {
    debuggerEngine.clearHistory();
    setHistoryList([]);
  };

  // Workbench auto-fix & retest trigger
  const handleWorkbenchAutoFixAndRetest = async () => {
    if (!executionResult || !diagnosis) return;
    setCurrentStage('fix');
    await new Promise(r => setTimeout(r, 400));
    setCurrentStage('retest');
    const retest = await debuggerEngine.executeRetest(executionResult, diagnosis);
    setRetestResult(retest);
    setCurrentStage('verify');
    refreshHistory();
    setTimeout(() => setCurrentStage('idle'), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hackathon Showcase Welcome Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                fixloop-ai Prototype
              </h2>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                P0 + P1 + P2 Implemented
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Turn your smartphone into an intelligent API debugging companion. Speak test cases naturally, diagnose failures automatically via AI, generate fixes, and retest with closed-loop verification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="quick-demo-scenario-btn"
              onClick={() => {
                const sample = DEMO_PRESET_SCENARIOS[0];
                const req = debuggerEngine.parseNaturalLanguageIntent(sample.voicePrompt);
                setExternalRequestToLoad(req);
                setActiveRequest(req);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Launch Login Demo
            </button>
            <button
              onClick={() => setIsOcrOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition"
            >
              Scan API Doc (OCR)
            </button>
          </div>
        </div>

        {/* Dynamic View Layout */}
        {viewMode === 'phone' ? (
          /* Phone-First Mobile Showcase */
          <div className="space-y-6">
            <div className="flex justify-center">
              <PhoneSimulator
                onOpenOcr={() => setIsOcrOpen(true)}
                onOpenTestSuite={() => setIsTestSuiteOpen(true)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onStageChange={(stage) => setCurrentStage(stage)}
                externalRequestToLoad={externalRequestToLoad}
              />
            </div>

            {/* Architecture Flow Below Phone */}
            <div className="max-w-4xl mx-auto">
              <ArchitectureDiagram currentStage={currentStage} />
            </div>
          </div>
        ) : (
          /* Dual / Workbench Developer Cockpit */
          <div className="space-y-6">
            {/* System Architecture Diagram */}
            <ArchitectureDiagram currentStage={currentStage} />

            {/* Split Screen: Left = Phone, Right = Studio Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Phone Frame Column (4 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <PhoneSimulator
                  onOpenOcr={() => setIsOcrOpen(true)}
                  onOpenTestSuite={() => setIsTestSuiteOpen(true)}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                  onStageChange={(stage) => setCurrentStage(stage)}
                  externalRequestToLoad={externalRequestToLoad}
                />
              </div>

              {/* Workbench Console Column (7 cols) */}
              <div className="lg:col-span-7">
                <WorkbenchView
                  currentStage={currentStage}
                  activeRequest={activeRequest || externalRequestToLoad}
                  executionResult={executionResult}
                  diagnosis={diagnosis}
                  retestResult={retestResult}
                  onAutoFixAndRetest={handleWorkbenchAutoFixAndRetest}
                  onOpenOcr={() => setIsOcrOpen(true)}
                  onOpenTestSuite={() => setIsTestSuiteOpen(true)}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                />

                {/* Dashboard Analytics Embedded in Workbench */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Live Test Run Metrics & History
                    </h3>
                  </div>
                  <DashboardAnalytics
                    history={historyList}
                    onClearHistory={handleClearHistory}
                    onRerunHistorical={handleRerunHistorical}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        THE OUTLIERS ^-^
      </footer>

      {/* Modals */}
      <CameraOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onApplyExtractedApi={handleApplyExtractedApi}
      />

      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
        targetEndpoint={activeRequest?.url || 'https://api.demo.iqoo-dev.net/api/v1/auth/login'}
        method={activeRequest?.method || 'POST'}
      />

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                API Test History & Analytics
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DashboardAnalytics
                history={historyList}
                onClearHistory={handleClearHistory}
                onRerunHistorical={handleRerunHistorical}
              />
            </div>
          </div>
        </div>
      )}

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
