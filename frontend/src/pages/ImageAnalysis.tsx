import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { 
  UploadCloud, Sparkles, AlertTriangle, 
  MapPin, Activity, X, RefreshCw, 
  Cpu, History, Layers, FileText, CheckCircle2, Sliders
} from 'lucide-react';
import { predictImage, checkBackendHealth, PredictResult, API_BASE_URL } from '../services/api';
import { PROTOTYPE_ANALYSIS_HISTORY } from '../data/analysisHistory';

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictResult | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.10);
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string; checking: boolean }>({
    online: false,
    message: 'Checking backend connection...',
    checking: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend health on component mount
  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      setBackendStatus(prev => ({ ...prev, checking: true }));
      const health = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus({
          online: health.online,
          message: health.online ? 'YOLO11 Backend Online' : health.message,
          checking: false,
        });
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // File Validation: Max 10MB, JPG/PNG/WEBP
  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setViewMode('annotated');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      setErrorMessage('File too large. Maximum supported image size is 10 MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Load dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setViewMode('annotated');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze State & Real Backend API Call
  const handleAnalyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await predictImage(selectedFile, confidenceThreshold);
      setAnalysisResult(result);
      if (result.status === 'UNAVAILABLE' || result.status === 'ERROR') {
        setErrorMessage(result.message || 'Model service encountered an error.');
      }
    } catch (_err) {
      setErrorMessage(`Failed to connect to backend at ${API_BASE_URL}. Ensure the server is running.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Determine which image to show in preview
  const displayImageSrc = (viewMode === 'annotated' && analysisResult?.annotatedImageUrl)
    ? analysisResult.annotatedImageUrl
    : previewUrl;

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">
      
      {/* ========================================================================= */}
      {/* PAGE HEADER                                                               */}
      {/* ========================================================================= */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#244A36]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C87941]/10 border border-[#C87941]/25 mb-3 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C87941] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#C87941]">
              YOLO11 Vision Pipeline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2826] tracking-tight">
            AI Landslide Image Analysis
          </h1>
          <p className="text-sm sm:text-base text-[#5E7E67] font-medium mt-1 max-w-2xl">
            Upload a terrain image and analyze it for visible landslide indicators using deep learning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Backend Connection Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-glass border border-white/70 shadow-sm text-xs font-medium">
            <span 
              className={`w-2 h-2 rounded-full ${
                backendStatus.online 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                  : backendStatus.checking 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-rose-500'
              }`} 
            />
            <span className="text-[#5E7E67]">
              API: <strong className="text-[#1C2826]">{backendStatus.online ? 'Connected (Port 8000)' : 'Offline'}</strong>
            </span>
          </div>

          <span className="text-xs text-[#5E7E67] font-medium liquid-glass px-4 py-2 rounded-full border border-white/70 shadow-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#244A36]" /> Model: <strong className="text-[#1C2826]">YOLO11</strong>
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 bg-[#7A2E2E]/10 border border-[#7A2E2E]/25 text-[#7A2E2E] px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-[#7A2E2E]/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        
        {/* LEFT COLUMN: UPLOAD & PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. UPLOAD & PREVIEW CARD */}
          <div className="liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1C2826] flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#244A36]" />
                  <span>Upload Landslide Image</span>
                </h2>
                <p className="text-xs text-[#5E7E67] font-medium mt-0.5">
                  Select high-resolution aerial, drone, or ground mountain photography for optical feature inference.
                </p>
              </div>

              {/* Confidence Threshold Selector */}
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-white/80 shadow-sm text-xs">
                <Sliders className="w-3.5 h-3.5 text-[#244A36]" />
                <span className="text-[11px] font-semibold text-[#5E7E67]">Conf:</span>
                <select
                  aria-label="Confidence threshold"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  disabled={isAnalyzing}
                  className="bg-transparent text-[#1C2826] font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="0.05">5% (High Sensitivity)</option>
                  <option value="0.10">10% (Recommended)</option>
                  <option value="0.25">25% (Standard)</option>
                  <option value="0.50">50% (High Confidence)</option>
                </select>
              </div>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />

            {!previewUrl ? (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px] ${
                  isDragging
                    ? 'border-[#244A36] bg-[#244A36]/10 scale-[0.99] backdrop-blur-md'
                    : 'border-[#244A36]/25 bg-white/40 hover:bg-white/70 hover:border-[#244A36]/50 backdrop-blur-md shadow-sm'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/90 border border-white/80 text-[#244A36] flex items-center justify-center mb-4 shadow-md shadow-[#244A36]/5 transition-transform group-hover:scale-105">
                  <UploadCloud className="w-8 h-8 text-[#244A36]" />
                </div>
                <h3 className="text-base font-bold text-[#1C2826] mb-1">
                  Drag & drop an image here or browse from your device
                </h3>
                <p className="text-xs text-[#5E7E67] mb-4 font-medium">
                  Supported: JPG, JPEG, PNG, WEBP (Max: 10 MB)
                </p>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-6 py-2.5 rounded-full bg-[#244A36] text-[#FAF7F2] text-xs font-bold hover:bg-[#1B3828] transition-all shadow-md shadow-[#244A36]/20 hover:scale-[1.03]"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              /* 2. IMAGE PREVIEW */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-[#1C2826] max-h-[420px] flex items-center justify-center border border-white/30 shadow-inner">
                  {displayImageSrc && (
                    <img
                      src={displayImageSrc}
                      alt="Uploaded terrain preview"
                      className="w-full h-auto max-h-[420px] object-contain rounded-2xl transition-all"
                    />
                  )}

                  {/* View Mode Toggle when annotated image exists */}
                  {analysisResult?.annotatedImageUrl && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#1C2826]/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setViewMode('annotated')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          viewMode === 'annotated'
                            ? 'bg-[#244A36] text-white shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        YOLO Bounding Boxes
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('original')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          viewMode === 'original'
                            ? 'bg-[#244A36] text-white shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Original Photo
                      </button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#1C2826]/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="w-12 h-12 rounded-full border-3 border-white border-t-transparent animate-spin mb-4" />
                      <span className="text-base font-bold tracking-tight mb-1">Running YOLO11 Model...</span>
                      <span className="text-xs text-white/70">Performing deep learning feature detection</span>
                    </div>
                  )}
                </div>

                {/* File Metadata Bar */}
                <div className="p-4 glass-card rounded-2xl border border-white/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#244A36]" />
                    <div>
                      <span className="font-bold text-[#1C2826] block truncate max-w-[200px] sm:max-w-xs">
                        {selectedFile?.name}
                      </span>
                      <span className="text-[11px] text-[#5E7E67] font-medium">
                        {selectedFile && formatFileSize(selectedFile.size)} • {imageDimensions ? `${imageDimensions.width}×${imageDimensions.height}px` : 'Loading size...'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={handleRemoveImage}
                      className="px-3.5 py-2 bg-white/80 hover:bg-white text-[#7A2E2E] border border-[#7A2E2E]/20 rounded-xl font-bold transition-all disabled:opacity-50 hover:scale-[1.02] shadow-sm"
                    >
                      Remove Image
                    </button>

                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={handleAnalyzeImage}
                      className="px-5 py-2 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl font-bold transition-all shadow-md shadow-[#244A36]/20 flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#A3C7AD]" />
                          <span>Analyze Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 9. MODEL INFORMATION CARD */}
          <div className="glass-card rounded-3xl border border-white/60 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white/80 flex items-center justify-center text-[#244A36] shadow-sm">
                <Cpu className="w-5 h-5 text-[#244A36]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">Computer Vision Backbone</span>
                <h4 className="text-sm font-bold text-[#1C2826]">Model: YOLO11 (Landslide Detection)</h4>
              </div>
            </div>
            <p className="text-xs text-[#5E7E67] sm:max-w-xs leading-relaxed font-medium">
              <strong>Trained Classes:</strong> <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#244A36] font-semibold">landslide</code>, <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#244A36] font-semibold">normal</code>. Detecting slope rupture, scarp lines, and debris flows.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: 4. RESULT PANEL & 7. SUMMARY (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 4. RESULT PANEL */}
          <div className="liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#244A36]/10">
              <h3 className="text-base font-bold text-[#1C2826] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#244A36]" /> Analysis Result
              </h3>
              <span className="text-[10px] font-bold text-[#C87941] bg-[#C87941]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#C87941]/20">
                YOLO11 Output
              </span>
            </div>

            {isAnalyzing ? (
              /* Loading UI */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-3 border-[#244A36] border-t-transparent animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-[#1C2826]">Running Inference Pipeline</h4>
                  <p className="text-xs text-[#5E7E67] mt-1">Passing terrain tensor to YOLO11 feature extractor...</p>
                </div>
              </div>
            ) : analysisResult ? (
              /* Result Content */
              <div className="space-y-4">
                {analysisResult.status === 'UNAVAILABLE' || analysisResult.status === 'ERROR' ? (
                  /* ERROR / UNAVAILABLE STATE */
                  <div className="space-y-4">
                    <div className="p-4 bg-[#7A2E2E]/10 rounded-2xl border border-[#7A2E2E]/25 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E]">Service Status</span>
                        <span className="text-[10px] font-bold text-[#7A2E2E] bg-white/90 px-2 py-0.5 rounded-full border border-[#7A2E2E]/20">Unavailable</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#1C2826]">
                        {analysisResult.detectionStatus}
                      </h4>
                      <p className="text-xs text-[#3A4D43] mt-2 leading-relaxed font-medium">
                        {analysisResult.explanation}
                      </p>
                    </div>

                    <div className="p-4 glass-card rounded-2xl border border-white/60 text-xs space-y-2 text-[#5E7E67]">
                      <p className="font-semibold text-[#1C2826]">To start the backend server:</p>
                      <code className="block bg-[#1C2826] text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                        python -m uvicorn backend.main:app --port 8000
                      </code>
                    </div>
                  </div>
                ) : (
                  /* Real Model Result (When Connected) */
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border backdrop-blur-md ${
                      analysisResult.riskIndicator === 'Critical' || analysisResult.riskIndicator === 'High'
                        ? 'bg-[#7A2E2E]/10 border-[#7A2E2E]/25 text-[#7A2E2E]'
                        : analysisResult.riskIndicator === 'Moderate'
                          ? 'bg-[#C87941]/10 border-[#C87941]/25 text-[#C87941]'
                          : 'bg-[#244A36]/10 border-[#244A36]/20 text-[#244A36]'
                    }`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Detection Status</span>
                        {analysisResult.inferenceTimeMs && (
                          <span className="text-[10px] font-mono opacity-80">{analysisResult.inferenceTimeMs}ms</span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-[#1C2826]">{analysisResult.detectionStatus}</h4>
                      <p className="text-xs text-[#3A4D43] mt-1 font-medium">{analysisResult.explanation}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2 border-b border-[#244A36]/10">
                        <span className="text-[#5E7E67] font-medium">Detected Objects</span>
                        <span className="font-bold text-[#1C2826]">{analysisResult.detectionCount} region{analysisResult.detectionCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#244A36]/10">
                        <span className="text-[#5E7E67] font-medium">Confidence</span>
                        <span className="font-bold text-[#244A36]">
                          {analysisResult.confidence ? `${(analysisResult.confidence * 100).toFixed(1)}%` : '0.0%'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#244A36]/10">
                        <span className="text-[#5E7E67] font-medium">Risk Indicator</span>
                        <span className={`font-bold ${
                          analysisResult.riskIndicator === 'Critical' || analysisResult.riskIndicator === 'High'
                            ? 'text-[#7A2E2E]'
                            : analysisResult.riskIndicator === 'Moderate'
                              ? 'text-[#C87941]'
                              : 'text-[#244A36]'
                        }`}>
                          {analysisResult.riskIndicator || 'Low'}
                        </span>
                      </div>
                    </div>

                    {/* Detections List */}
                    {analysisResult.detections.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                          Identified Bounding Boxes ({analysisResult.detections.length})
                        </span>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {analysisResult.detections.map((d, i) => (
                            <div key={i} className="p-2.5 glass-card rounded-xl border border-white/50 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold text-[#1C2826] capitalize">{d.class} #{i + 1}</span>
                                <span className="block text-[10px] text-[#5E7E67] font-mono">
                                  [{d.bbox.join(', ')}]
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[#244A36] bg-white/80 px-2 py-0.5 rounded-md shadow-xs">
                                {(d.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 glass-card rounded-2xl border border-white/60 text-center space-y-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                        <p className="text-xs text-[#1C2826] font-semibold">Slope Appears Stable</p>
                        <p className="text-[11px] text-[#5E7E67]">No active landslide rupture detected above {confidenceThreshold * 100}% threshold.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Default Standby State */
              <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-[#5E7E67]">
                  <Layers className="w-6 h-6 text-[#244A36]/70" />
                </div>
                <h4 className="text-sm font-bold text-[#1C2826]">Awaiting Input Image</h4>
                <p className="text-xs text-[#5E7E67] max-w-xs leading-relaxed font-medium">
                  Upload a mountain slope photo on the left and click "Analyze Image" to run YOLO11 computer-vision analysis.
                </p>
              </div>
            )}

            {/* 7. AI ANALYSIS SUMMARY */}
            <div className="p-4 glass-card rounded-2xl border border-white/60 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block">
                AI Analysis Summary
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#5E7E67] block">Image</span>
                  <span className="font-semibold text-[#1C2826] truncate block">{selectedFile ? selectedFile.name : '--'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7E67] block">Model</span>
                  <span className="font-semibold text-[#1C2826]">YOLO11</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7E67] block">Detection</span>
                  <span className="font-semibold text-[#1C2826]">
                    {analysisResult?.status === 'SUCCESS' ? analysisResult.detectionStatus : 'Pending Inference'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7E67] block">Analysis Status</span>
                  <span className={`font-semibold ${
                    analysisResult?.status === 'SUCCESS' 
                      ? 'text-[#244A36]' 
                      : analysisResult?.status === 'NO_DETECTIONS' 
                        ? 'text-emerald-600'
                        : 'text-[#C87941]'
                  }`}>
                    {analysisResult ? analysisResult.detectionStatus : (backendStatus.online ? 'Ready for Image' : 'Backend Offline')}
                  </span>
                </div>
              </div>
            </div>

            {/* 11. ACTIONS */}
            <div className="pt-2 border-t border-[#244A36]/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full py-2.5 glass-button text-[#1C2826] rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              >
                Analyze Another Image
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('/risk-monitoring')}
                  className="py-2.5 px-2 bg-[#244A36] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#1B3828] transition-all shadow-md shadow-[#244A36]/20 hover:scale-[1.02]"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Risk Monitoring</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/live-map')}
                  className="py-2.5 px-2 glass-button text-[#1C2826] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
                  <span>View Live Map</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 10. ANALYSIS HISTORY SECTION                                             */}
      {/* ========================================================================= */}
      <div className="liquid-glass rounded-3xl border border-white/60 p-6 sm:p-7 shadow-lg shadow-[#244A36]/5">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#244A36]/10">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#244A36]" />
            <div>
              <h3 className="text-lg font-bold text-[#1C2826]">Recent Analyses</h3>
              <p className="text-xs text-[#5E7E67] font-medium">Sample historical vision inferences across Northeast hill sectors</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#C87941] bg-[#C87941]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#C87941]/20">
            Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROTOTYPE_ANALYSIS_HISTORY.map((item) => (
            <div 
              key={item.id} 
              className="p-3.5 glass-card rounded-2xl border border-white/60 flex items-center gap-3.5 transition-all hover:scale-[1.02]"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.imageName}
                className="w-14 h-14 rounded-xl object-cover border border-white/60 shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-[#5E7E67] block">{item.id} • {item.date}</span>
                <h4 className="text-xs font-bold text-[#1C2826] truncate">{item.imageName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-[#244A36] bg-[#244A36]/10 px-1.5 py-0.2 rounded-md border border-[#244A36]/15">
                    {item.detection}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#5E7E67]">
                    {item.confidenceLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
