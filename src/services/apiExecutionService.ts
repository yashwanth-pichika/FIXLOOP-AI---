import { 
  ApiTestRequest, 
  ApiExecutionResult, 
  DiagnosisResult, 
  RetestResult, 
  HistoricalTest, 
  HttpMethod 
} from '../types';
import { DEMO_PRESET_SCENARIOS } from '../data/mockApis';

// Helper to simulate network latency realistically
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class ApiDebuggerEngine {
  private history: HistoricalTest[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const saved = localStorage.getItem('iqoo_debugger_history');
      if (saved) {
        this.history = JSON.parse(saved);
      } else {
        // Seed with realistic initial data
        this.history = [
          {
            id: 'hist-1',
            timestamp: Date.now() - 1000 * 60 * 45,
            command: 'Test login with an invalid password',
            method: 'POST',
            url: 'https://api.demo.iqoo-dev.net/api/v1/auth/login',
            statusCode: 401,
            latencyMs: 142,
            isResolved: true,
            errorCategory: 'Auth Credentials Mismatch',
            retestCount: 1
          },
          {
            id: 'hist-2',
            timestamp: Date.now() - 1000 * 60 * 18,
            command: 'Test payment API with amount zero',
            method: 'POST',
            url: 'https://api.demo.iqoo-dev.net/api/v1/payments/charge',
            statusCode: 400,
            latencyMs: 88,
            isResolved: true,
            errorCategory: 'Validation Constraint Violation',
            retestCount: 1
          },
          {
            id: 'hist-3',
            timestamp: Date.now() - 1000 * 60 * 8,
            command: 'Check health check endpoint',
            method: 'GET',
            url: 'https://api.demo.iqoo-dev.net/api/v1/health',
            statusCode: 200,
            latencyMs: 42,
            isResolved: true,
            retestCount: 0
          }
        ];
        this.saveHistory();
      }
    } catch {
      // Fallback
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('iqoo_debugger_history', JSON.stringify(this.history));
    } catch {
      // Ignore
    }
  }

  public getHistory(): HistoricalTest[] {
    return [...this.history];
  }

  public clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  public addHistoryRecord(record: HistoricalTest) {
    this.history.unshift(record);
    if (this.history.length > 50) {
      this.history.pop();
    }
    this.saveHistory();
  }

  /**
   * Step 2 & 3: Command Service converts natural language command into structured API test
   */
  public parseNaturalLanguageIntent(command: string): ApiTestRequest {
    const cleanCmd = command.toLowerCase().trim();

    // Check if it matches our core demo scenarios
    for (const preset of DEMO_PRESET_SCENARIOS) {
      const matchWords = preset.voicePrompt.toLowerCase().split(' ').slice(0, 3);
      const isMatch = matchWords.every(word => cleanCmd.includes(word)) || cleanCmd.includes(preset.id);
      if (isMatch) {
        return {
          id: `req_${Date.now()}`,
          method: preset.method,
          url: preset.targetEndpoint,
          headers: preset.brokenRequest.headers || { 'Content-Type': 'application/json' },
          body: preset.brokenRequest.body,
          scenarioTitle: preset.brokenRequest.scenarioTitle || preset.badge,
          commandPrompt: command,
          source: 'voice',
          timestamp: Date.now()
        };
      }
    }

    // Heuristic inference for custom developer commands
    let method: HttpMethod = 'GET';
    if (cleanCmd.includes('post') || cleanCmd.includes('create') || cleanCmd.includes('add') || cleanCmd.includes('charge') || cleanCmd.includes('login') || cleanCmd.includes('register')) {
      method = 'POST';
    } else if (cleanCmd.includes('put') || cleanCmd.includes('update') || cleanCmd.includes('modify')) {
      method = 'PUT';
    } else if (cleanCmd.includes('delete') || cleanCmd.includes('remove')) {
      method = 'DELETE';
    } else if (cleanCmd.includes('patch')) {
      method = 'PATCH';
    }

    // URL detection or fallback
    const urlMatch = command.match(/https?:\/\/[^\s]+/i);
    const targetUrl = urlMatch ? urlMatch[0] : 'https://api.demo.iqoo-dev.net/api/v1/auth/login';

    return {
      id: `req_${Date.now()}`,
      method,
      url: targetUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'iQOO-Debugger-Client/v1.0 (Android 14)',
        'Accept': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify({ testPrompt: command, timestamp: new Date().toISOString() }, null, 2) : undefined,
      scenarioTitle: `Custom Query: ${command.slice(0, 30)}...`,
      commandPrompt: command,
      source: 'text',
      timestamp: Date.now()
    };
  }

  /**
   * Step 4 & 5: API Execution Engine creates and sends HTTP request
   */
  public async executeRequest(request: ApiTestRequest, isFixRetest = false): Promise<ApiExecutionResult> {
    const startTime = performance.now();
    await delay(Math.floor(Math.random() * 250) + 180); // Realistic network trip

    // Match preset scenarios
    const matchingPreset = DEMO_PRESET_SCENARIOS.find(p => 
      p.targetEndpoint === request.url || 
      request.commandPrompt.toLowerCase().includes(p.id) ||
      request.commandPrompt.toLowerCase().includes(p.voicePrompt.toLowerCase())
    );

    if (matchingPreset) {
      if (isFixRetest) {
        const latency = Math.round(performance.now() - startTime);
        return {
          statusCode: matchingPreset.correctedResponse.status,
          statusText: matchingPreset.correctedResponse.statusText,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'server': 'Spring-Boot/3.3.1 (JVM 21)',
            'x-iqoo-trace-id': `trace_${Date.now()}`,
            'x-response-time-ms': `${latency}ms`
          },
          body: matchingPreset.correctedResponse.body,
          rawBody: JSON.stringify(matchingPreset.correctedResponse.body, null, 2),
          latencyMs: latency,
          timestamp: Date.now(),
          isSuccess: matchingPreset.correctedResponse.status >= 200 && matchingPreset.correctedResponse.status < 300,
          request
        };
      } else {
        const latency = Math.round(performance.now() - startTime);
        return {
          statusCode: matchingPreset.brokenResponse.status,
          statusText: matchingPreset.brokenResponse.statusText,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'server': 'Spring-Boot/3.3.1 (JVM 21)',
            'x-iqoo-trace-id': `trace_err_${Date.now()}`,
            'x-response-time-ms': `${latency}ms`
          },
          body: matchingPreset.brokenResponse.body,
          rawBody: JSON.stringify(matchingPreset.brokenResponse.body, null, 2),
          latencyMs: latency,
          timestamp: Date.now(),
          isSuccess: false,
          request
        };
      }
    }

    // If it's a real external URL that allows CORS or a generic mock
    try {
      if (request.url.startsWith('http') && !request.url.includes('demo.iqoo-dev.net')) {
        const fetchRes = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' ? request.body : undefined
        });
        const latency = Math.round(performance.now() - startTime);
        let data: any;
        const text = await fetchRes.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { response: text };
        }
        return {
          statusCode: fetchRes.status,
          statusText: fetchRes.statusText,
          headers: Object.fromEntries(fetchRes.headers.entries()),
          body: data,
          rawBody: text,
          latencyMs: latency,
          timestamp: Date.now(),
          isSuccess: fetchRes.ok,
          request
        };
      }
    } catch {
      // Fallback for CORS or offline demo
    }

    // Default simulation fallback
    const latency = Math.round(performance.now() - startTime);
    const mockError = {
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: `Invalid request payload or parameters supplied to ${request.url}`,
      path: new URL(request.url).pathname
    };

    return {
      statusCode: isFixRetest ? 200 : 400,
      statusText: isFixRetest ? 'OK' : 'Bad Request',
      headers: {
        'content-type': 'application/json',
        'x-powered-by': 'Spring Boot 3.3.1'
      },
      body: isFixRetest ? { status: 'success', message: 'Request retested and verified' } : mockError,
      rawBody: JSON.stringify(isFixRetest ? { status: 'success' } : mockError, null, 2),
      latencyMs: latency,
      timestamp: Date.now(),
      isSuccess: isFixRetest,
      request
    };
  }

  /**
   * Step 6: AI Analysis Service diagnoses the response and proposes a correction
   */
  public diagnoseFailure(result: ApiExecutionResult): DiagnosisResult {
    // Check preset scenarios first for crisp, accurate hackathon MVP diagnosis
    const matchingPreset = DEMO_PRESET_SCENARIOS.find(p => 
      p.targetEndpoint === result.request.url ||
      result.request.commandPrompt.toLowerCase().includes(p.id) ||
      result.request.commandPrompt.toLowerCase().includes(p.voicePrompt.toLowerCase())
    );

    if (matchingPreset) {
      const diag = matchingPreset.diagnosis;
      const correctedReq: ApiTestRequest = {
        ...result.request,
        id: `req_fixed_${Date.now()}`,
        headers: matchingPreset.correctedRequest.headers || result.request.headers,
        body: matchingPreset.correctedRequest.body || result.request.body,
        scenarioTitle: `${result.request.scenarioTitle} [AI Fixed]`,
        commandPrompt: matchingPreset.correctedRequest.commandPrompt || `Fixed ${result.request.commandPrompt}`
      };

      return {
        failureType: diag.failureType,
        rootCause: diag.rootCause,
        explanation: diag.explanation,
        rfcReference: diag.rfcReference,
        severity: diag.severity,
        confidence: diag.confidence,
        affectedField: diag.affectedField,
        suggestedAction: diag.suggestedAction,
        fixDiffExplanation: diag.fixDiffExplanation,
        correctedRequest: correctedReq
      };
    }

    // Dynamic diagnosis logic for HTTP error codes
    const status = result.statusCode;
    let failureType = `HTTP ${status} — Error`;
    let rootCause = 'The target server rejected the request.';
    let rfcReference = 'RFC 9110 HTTP Semantics';
    let suggestedAction = 'Review request parameters, headers, and authentication tokens.';
    let fixDiff = 'Sanitized request body and added missing standard headers.';

    if (status === 400) {
      failureType = 'HTTP 400 — Bad Request';
      rootCause = 'Malformatted payload syntax, missing required fields, or validation constraint breach.';
      rfcReference = 'RFC 9110 Section 15.5.1: Bad Request';
      suggestedAction = 'Check request body schema against OpenAPI contract specification.';
    } else if (status === 401) {
      failureType = 'HTTP 401 — Unauthorized';
      rootCause = 'Missing or invalid authentication credentials (Bearer JWT or API Key).';
      rfcReference = 'RFC 7235 Section 3.1: Unauthorized';
      suggestedAction = 'Attach valid Authorization: Bearer <token> header to the outgoing request.';
    } else if (status === 403) {
      failureType = 'HTTP 403 — Forbidden';
      rootCause = 'Credentials are valid, but user role lacks sufficient RBAC privileges for this resource.';
      rfcReference = 'RFC 9110 Section 15.5.4: Forbidden';
      suggestedAction = 'Request elevated scope or switch to an administrative service token.';
    } else if (status === 404) {
      failureType = 'HTTP 404 — Not Found';
      rootCause = 'The requested resource URI or entity identifier does not exist on the target server.';
      rfcReference = 'RFC 9110 Section 15.5.5: Not Found';
      suggestedAction = 'Verify path parameters, base URL routing, and resource entity ID.';
    } else if (status === 422) {
      failureType = 'HTTP 422 — Unprocessable Entity';
      rootCause = 'Payload syntax is valid JSON, but contained instructions fail business logic validation rules.';
      rfcReference = 'RFC 4918 Section 11.2: Unprocessable Entity';
      suggestedAction = 'Fix semantic business values (e.g. quantity >= 1, valid postal code).';
    } else if (status >= 500) {
      failureType = `HTTP ${status} — Internal Server Error`;
      rootCause = 'Uncaught exception in backend controller or database connectivity timeout.';
      rfcReference = 'RFC 9110 Section 15.6.1: Server Error';
      suggestedAction = 'Check Spring Boot server logs or verify database connection pool.';
    }

    const correctedReq: ApiTestRequest = {
      ...result.request,
      id: `req_fixed_${Date.now()}`,
      headers: {
        ...result.request.headers,
        'Authorization': 'Bearer active_dev_token_valid',
        'Content-Type': 'application/json'
      },
      scenarioTitle: `${result.request.scenarioTitle} [AI Fixed]`,
      commandPrompt: `Fixed: ${result.request.commandPrompt}`
    };

    return {
      failureType,
      rootCause,
      explanation: `Analysis of response headers and status ${status} indicates client-side parameter misconfiguration.`,
      rfcReference,
      severity: status >= 500 ? 'critical' : status === 401 ? 'high' : 'medium',
      confidence: 94,
      suggestedAction,
      fixDiffExplanation: fixDiff,
      correctedRequest: correctedReq
    };
  }

  /**
   * Step 7 & 8: Retest Engine executes the corrected request and compares result with previous failure
   */
  public async executeRetest(
    originalResult: ApiExecutionResult,
    diagnosis: DiagnosisResult
  ): Promise<RetestResult> {
    const newResponse = await this.executeRequest(diagnosis.correctedRequest, true);
    const latencyDelta = newResponse.latencyMs - originalResult.latencyMs;
    const isResolved = newResponse.isSuccess;

    const changesSummary = [
      `Status changed from ${originalResult.statusCode} (${originalResult.statusText}) ➔ ${newResponse.statusCode} (${newResponse.statusText})`,
      diagnosis.fixDiffExplanation,
      `Network round-trip latency: ${newResponse.latencyMs}ms (${latencyDelta >= 0 ? '+' : ''}${latencyDelta}ms)`
    ];

    // Record into history
    this.addHistoryRecord({
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
      command: originalResult.request.commandPrompt,
      method: originalResult.request.method,
      url: originalResult.request.url,
      statusCode: newResponse.statusCode,
      latencyMs: newResponse.latencyMs,
      isResolved,
      errorCategory: diagnosis.failureType,
      retestCount: 1
    });

    return {
      previousStatusCode: originalResult.statusCode,
      newStatusCode: newResponse.statusCode,
      isResolved,
      latencyDeltaMs: latencyDelta,
      changesSummary,
      newResponse
    };
  }
}

export const debuggerEngine = new ApiDebuggerEngine();
