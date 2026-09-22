import { useState } from 'react';
import { Camera, FileText, Sparkles, Check, ArrowRight, X, ScanLine, Copy } from 'lucide-react';
import { OCR_SAMPLE_SNIPPETS } from '../data/mockApis';
import { OcrSpecSnippet, ApiTestRequest } from '../types';

interface CameraOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedApi: (req: ApiTestRequest) => void;
}

export function CameraOcrModal({ isOpen, onClose, onApplyExtractedApi }: CameraOcrModalProps) {
  const [selectedSnippet, setSelectedSnippet] = useState<OcrSpecSnippet>(OCR_SAMPLE_SNIPPETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [customText, setCustomText] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'camera_sim' | 'paste'>('presets');

  if (!isOpen) return null;

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  const handleApply = () => {
    const newReq: ApiTestRequest = {
      id: `req_ocr_${Date.now()}`,
      method: selectedSnippet.extractedMethod,
      url: selectedSnippet.extractedUrl,
      headers: selectedSnippet.extractedHeaders,
      body: selectedSnippet.extractedBody,
      scenarioTitle: `OCR Extracted: ${selectedSnippet.title}`,
      commandPrompt: `Execute OCR scanned ${selectedSnippet.extractedMethod} API from documentation`,
      source: 'ocr',
      timestamp: Date.now()
    };
    onApplyExtractedApi(newReq);
    onClose();
  };

  return (
    <div id="camera-ocr-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Camera & OCR API Doc Scanner
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  iQOO Vision AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scan printed documentation, Swagger spec, or cURL code to generate instant API tests
              </p>
            </div>
          </div>
          <button
            id="close-ocr-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Documentation Specs
          </button>
          <button
            onClick={() => {
              setActiveTab('camera_sim');
              handleTriggerScan();
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'camera_sim'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            Camera Viewfinder Sim
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom cURL Snippet
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Select Documentation Snippet to Recognize:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {OCR_SAMPLE_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      setSelectedSnippet(snippet);
                      setScanComplete(true);
                    }}
                    className={`p-3 text-left rounded-xl border transition flex flex-col justify-between ${
                      selectedSnippet.id === snippet.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-slate-100 ring-1 ring-amber-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {snippet.category}
                        </span>
                        {selectedSnippet.id === snippet.id && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="text-xs font-semibold truncate">{snippet.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {snippet.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Raw Code Preview */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Recognized Document Text (OCR Feed)
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">Confidence: 99.4%</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto max-h-40 leading-relaxed text-[11px]">
                  {selectedSnippet.rawSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'camera_sim' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                {/* Simulated Camera Feed overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
                
                {/* Viewfinder Target Reticle */}
                <div className="relative w-4/5 h-4/5 border border-dashed border-amber-400/50 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 bg-slate-950/70 px-2 py-1 rounded">
                    <span>iQOO V3 CHIP • OCR ACTIVE</span>
                    <span>1080P 60FPS</span>
                  </div>

                  {/* Laser Scanning Animation */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
                  )}

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 font-mono text-[11px] text-slate-200">
                    <p className="text-amber-300 font-bold mb-1">Target Identified: REST Endpoint</p>
                    <p className="truncate text-slate-300">POST https://api.demo.iqoo-dev.net/api/v1/payments/charge</p>
                    <p className="text-[10px] text-slate-400">Header: Authorization Bearer ...</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Align API snippet inside frame</span>
                    <span>Auto-Focus Lock</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <ScanLine className="w-4 h-4" />
                  {isScanning ? 'Processing OCR Stream...' : 'Retrigger Camera Scan'}
                </button>
                <span className="text-xs text-slate-400">
                  {isScanning ? 'Extracting parameters via AI vision...' : 'Spec parsed in 180ms'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Paste cURL or OpenAPI Endpoint:
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="curl -X POST https://api.example.com/v1/items -H 'Content-Type: application/json' -d '{ name: widget }'"
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => {
                  setSelectedSnippet({
                    id: 'custom-paste',
                    title: 'Pasted Custom cURL',
                    category: 'cURL',
                    description: 'Developer pasted manual terminal command',
                    rawSnippet: customText,
                    extractedMethod: 'POST',
                    extractedUrl: 'https://api.demo.iqoo-dev.net/api/v1/orders/checkout',
                    extractedHeaders: { 'Content-Type': 'application/json' },
                    extractedBody: JSON.stringify({ name: 'Custom Widget', qty: 1 }, null, 2)
                  });
                  setScanComplete(true);
                }}
                disabled={!customText.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition disabled:opacity-40"
              >
                Parse Extracted Command
              </button>
            </div>
          )}

          {/* Extracted Structured API Test Preview */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Extracted Test Instructions
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Ready to Test
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Target Endpoint:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedSnippet.extractedMethod}
                  </span>
                  <span className="font-mono text-slate-200 truncate text-[11px]">
                    {selectedSnippet.extractedUrl}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Headers Extracted:</span>
                <span className="font-mono text-slate-300 text-[11px] truncate block mt-0.5">
                  {Object.keys(selectedSnippet.extractedHeaders).length} headers (Content-Type, Auth)
                </span>
              </div>
            </div>

            {selectedSnippet.extractedBody && (
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">Payload Extracted:</span>
                <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto max-h-24">
                  {selectedSnippet.extractedBody}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Converts paper/screen specs into live Spring Boot test requests
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              id="load-ocr-test-btn"
              onClick={handleApply}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              Load into API Debugger
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
