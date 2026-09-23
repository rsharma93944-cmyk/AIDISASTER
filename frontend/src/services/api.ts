/**
 * ResQAI Landslide Vision API Service
 * Handles communication with the backend YOLO11 Deep Learning model.
 * Architecture: Frontend -> predictImage(file) -> POST /predict -> YOLO11 Backend
 */

export interface DetectionBox {
  class: string;
  confidence: number; // 0 to 1
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface PredictResult {
  status: 'SUCCESS' | 'NO_DETECTIONS' | 'UNAVAILABLE' | 'ERROR';
  model: string;
  detectionStatus: string;
  detectionCount: number;
  detections: DetectionBox[];
  confidence?: number;
  riskIndicator?: 'Low' | 'Moderate' | 'High' | 'Critical';
  annotatedImageUrl?: string;
  message?: string;
  explanation?: string;
  timestamp?: string;
  inferenceTimeMs?: number;
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Checks if the YOLO11 backend is reachable and healthy
 */
export async function checkBackendHealth(): Promise<{ online: boolean; message: string; classes?: Record<string, string> }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { online: true, message: 'Backend connected', classes: data.classes };
    }
    return { online: false, message: `Backend responded with HTTP ${response.status}` };
  } catch (_e) {
    return { online: false, message: `Backend unreachable at ${API_BASE_URL}` };
  }
}

/**
 * Sends a mountain/terrain image file to the YOLO11 model endpoint.
 * Uses VITE_API_BASE_URL from environment variables (e.g. http://localhost:8000).
 */
export async function predictImage(file: File, confidenceThreshold: number = 0.10): Promise<PredictResult> {
  const endpoint = `${API_BASE_URL}/predict?confidence_threshold=${confidenceThreshold}`;

  try {
    const formData = new FormData();
    formData.append('image', file);

    // Create abort controller with 30-second timeout for model execution
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      return {
        status: 'ERROR',
        model: 'YOLO11',
        detectionStatus: 'Inference Error',
        detectionCount: 0,
        detections: [],
        message: errorData.detail || `Server returned HTTP ${response.status}`,
        explanation: `Backend error: ${errorData.detail || 'Failed to process image.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    const data = await response.json();
    const detections: DetectionBox[] = (data.detections || []).map((d: any) => ({
      class: d.class || 'landslide',
      confidence: typeof d.confidence === 'number' ? d.confidence : 0,
      bbox: d.bbox || [0, 0, 0, 0]
    }));

    const maxConfidence = typeof data.confidence === 'number' && data.confidence > 0
      ? data.confidence
      : (detections.length > 0 ? Math.max(...detections.map(d => d.confidence)) : 0);

    const isSuccess = detections.length > 0;

    return {
      status: isSuccess ? 'SUCCESS' : 'NO_DETECTIONS',
      model: data.model || 'YOLO11',
      detectionStatus: data.detection_status || data.detectionStatus || (isSuccess ? 'Landslide Detected' : 'No Landslide Detected'),
      detectionCount: typeof data.detection_count === 'number' ? data.detection_count : detections.length,
      detections,
      confidence: maxConfidence,
      riskIndicator: data.risk_indicator || data.riskIndicator || (isSuccess ? 'High' : 'Low'),
      annotatedImageUrl: data.annotated_image_url || data.annotatedImageUrl,
      explanation: data.explanation || (isSuccess ? 'YOLO11 identified visible landslide scarps and debris displacement.' : 'No active landslide detected.'),
      inferenceTimeMs: data.inference_time_ms,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    return {
      status: 'UNAVAILABLE',
      model: 'YOLO11',
      detectionStatus: isTimeout ? 'Request Timed Out' : 'Backend Unavailable',
      detectionCount: 0,
      detections: [],
      message: isTimeout 
        ? 'Inference request timed out after 30 seconds.' 
        : `Cannot connect to YOLO11 backend at ${API_BASE_URL}. Ensure the backend service is running.`,
      explanation: isTimeout
        ? 'The server took too long to complete model inference.'
        : `Backend server at ${API_BASE_URL} is unreachable. Make sure the FastAPI server is started via 'python -m uvicorn backend.main:app --port 8000'.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}
