export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiTestRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  scenarioTitle: string;
  commandPrompt: string;
  source: 'voice' | 'text' | 'ocr' | 'preset' | 'test_generator';
  timestamp: number;
}

export interface ApiExecutionResult {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  rawBody: string;
  latencyMs: number;
  timestamp: number;
  isSuccess: boolean;
  request: ApiTestRequest;
}

export interface DiagnosisResult {
  failureType: string;
  rootCause: string;
  explanation: string;
  rfcReference: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0 - 100
  affectedField?: string;
  suggestedAction: string;
  fixDiffExplanation: string;
  correctedRequest: ApiTestRequest;
}

export interface RetestResult {
  previousStatusCode: number;
  newStatusCode: number;
  isResolved: boolean;
  latencyDeltaMs: number;
  changesSummary: string[];
  newResponse: ApiExecutionResult;
}

export interface HistoricalTest {
  id: string;
  timestamp: number;
  command: string;
  method: HttpMethod;
  url: string;
  statusCode: number;
  latencyMs: number;
  isResolved: boolean;
  errorCategory?: string;
  retestCount: number;
}

export interface OcrSpecSnippet {
  id: string;
  title: string;
  category: 'cURL' | 'Swagger/OpenAPI' | 'Code' | 'Postman';
  rawSnippet: string;
  extractedMethod: HttpMethod;
  extractedUrl: string;
  extractedHeaders: Record<string, string>;
  extractedBody: string;
  description: string;
}

export interface GeneratedTestCase {
  id: string;
  category: 'positive' | 'boundary' | 'missing_field' | 'auth_security' | 'invalid_type';
  categoryLabel: string;
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  payload?: any;
  expectedStatus: number;
  status: 'idle' | 'running' | 'passed' | 'failed';
  actualStatus?: number;
  latencyMs?: number;
}

export type PipelineStage = 
  | 'idle' 
  | 'intent' 
  | 'request' 
  | 'execute' 
  | 'analyze' 
  | 'diagnose' 
  | 'fix' 
  | 'retest' 
  | 'verify';

export interface DemoPresetScenario {
  id: string;
  voicePrompt: string;
  badge: string;
  targetEndpoint: string;
  method: HttpMethod;
  description: string;
  brokenRequest: Partial<ApiTestRequest>;
  brokenResponse: {
    status: number;
    statusText: string;
    body: any;
  };
  diagnosis: {
    failureType: string;
    rootCause: string;
    explanation: string;
    rfcReference: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    affectedField: string;
    suggestedAction: string;
    fixDiffExplanation: string;
  };
  correctedRequest: Partial<ApiTestRequest>;
  correctedResponse: {
    status: number;
    statusText: string;
    body: any;
  };
}
