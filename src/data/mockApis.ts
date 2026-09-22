import { DemoPresetScenario, OcrSpecSnippet, GeneratedTestCase } from '../types';

export const DEMO_PRESET_SCENARIOS: DemoPresetScenario[] = [
  {
    id: 'login-invalid-pwd',
    voicePrompt: 'Test login with an invalid password',
    badge: 'Auth Scenario',
    targetEndpoint: 'https://api.demo.iqoo-dev.net/api/v1/auth/login',
    method: 'POST',
    description: 'Attempts user authentication with an incorrect password to trigger credential validation failure.',
    brokenRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/auth/login',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'iQOO-Debugger-Client/v1.0 (Android 14)',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.chen@innovate.dev',
        password: 'wrong_password_999'
      }, null, 2),
      scenarioTitle: 'User Login Verification',
      commandPrompt: 'Test login with an invalid password'
    },
    brokenResponse: {
      status: 401,
      statusText: 'Unauthorized',
      body: {
        timestamp: '2026-09-22T09:31:04.120Z',
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials provided. Password hash does not match stored hash for user alex.chen@innovate.dev.',
        code: 'AUTH_CREDENTIALS_MISMATCH',
        attemptsRemaining: 2,
        path: '/api/v1/auth/login'
      }
    },
    diagnosis: {
      failureType: 'HTTP 401 — Authentication Failure',
      rootCause: 'Incorrect password supplied in payload. The authentication provider rejected the hash comparison.',
      explanation: 'The backend Identity Provider failed to authenticate the user. Two attempts remain before temporary IP rate limiting kicks in.',
      rfcReference: 'RFC 7235 Section 3.1: 401 Unauthorized indicates the request has not been applied because it lacks valid authentication credentials.',
      severity: 'medium',
      confidence: 98,
      affectedField: 'password',
      suggestedAction: 'Update test payload with verified test user password token `TestEnv#SecretPass2026`.',
      fixDiffExplanation: 'Replaced `wrong_password_999` with authorized sandbox password token and appended active client device fingerprint.'
    },
    correctedRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/auth/login',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'iQOO-Debugger-Client/v1.0 (Android 14)',
        'X-Device-Id': 'iQOO-NEO9-PRO-8812',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.chen@innovate.dev',
        password: 'TestEnv#SecretPass2026'
      }, null, 2),
      scenarioTitle: 'User Login Verification [AI Corrected]',
      commandPrompt: 'Retest login with validated sandbox credentials'
    },
    correctedResponse: {
      status: 200,
      statusText: 'OK',
      body: {
        status: 200,
        message: 'Authentication successful',
        tokenType: 'Bearer',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWxleCBDaGVuIiwiZW1haWwiOiJhbGV4LmNoZW5AaW5ub3ZhdGUuZGV2Iiwicm9sZXMiOlsic3R1ZGlvX2RldmVsb3BlciJdfQ.7Yx89_DemoSignedToken',
        expiresIn: 3600,
        user: {
          id: 'usr_882041',
          name: 'Alex Chen',
          email: 'alex.chen@innovate.dev',
          role: 'SENIOR_ENGINEER',
          mfaEnabled: false
        }
      }
    }
  },
  {
    id: 'payment-amount-zero',
    voicePrompt: 'Test payment API with amount zero',
    badge: 'Fintech / Gateway',
    targetEndpoint: 'https://api.demo.iqoo-dev.net/api/v1/payments/charge',
    method: 'POST',
    description: 'Submits payment charge with amount=0 and missing currency to trigger business rule validation violations.',
    brokenRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/payments/charge',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_pk_sandbox_live_8910'
      },
      body: JSON.stringify({
        amount: 0,
        currency: '',
        customerId: 'cust_99812',
        idempotencyKey: 'idem_f09230'
      }, null, 2),
      scenarioTitle: 'Payment Gateway Charge',
      commandPrompt: 'Test payment API with amount zero'
    },
    brokenResponse: {
      status: 400,
      statusText: 'Bad Request',
      body: {
        timestamp: '2026-09-22T09:32:15.004Z',
        status: 400,
        error: 'Bad Request',
        type: 'PAYMENT_VALIDATION_ERROR',
        violations: [
          {
            field: 'amount',
            rejectedValue: 0,
            rule: 'min(0.50)',
            message: 'Charge amount must be at least 0.50 currency units.'
          },
          {
            field: 'currency',
            rejectedValue: '',
            rule: 'Pattern("^[A-Z]{3}$")',
            message: 'Currency must be a 3-letter ISO-4217 uppercase code.'
          }
        ],
        documentationUrl: 'https://docs.demo.iqoo-dev.net/errors/PAYMENT_VALIDATION_ERROR'
      }
    },
    diagnosis: {
      failureType: 'HTTP 400 — Schema & Constraint Violation',
      rootCause: 'Two mandatory fields violated constraints: `amount` cannot be zero or negative, and `currency` cannot be empty.',
      explanation: 'The gateway processor rejects zero-value charges as invalid transactions to protect payment networks.',
      rfcReference: 'RFC 9110 Section 15.5.1: 400 Bad Request indicates server cannot or will not process request due to client error.',
      severity: 'high',
      confidence: 99,
      affectedField: 'amount, currency',
      suggestedAction: 'Set valid amount (e.g. 49.99) and compliant currency code (USD), plus specify a mock payment method.',
      fixDiffExplanation: 'Changed amount from `0` to `49.99`, populated `currency: "USD"`, and added payment method `pm_card_visa_sandbox`.'
    },
    correctedRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/payments/charge',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_pk_sandbox_live_8910',
        'Idempotency-Key': 'idem_f09230_fixed'
      },
      body: JSON.stringify({
        amount: 49.99,
        currency: 'USD',
        customerId: 'cust_99812',
        paymentMethod: 'pm_card_visa_sandbox',
        idempotencyKey: 'idem_f09230_fixed'
      }, null, 2),
      scenarioTitle: 'Payment Gateway Charge [AI Corrected]',
      commandPrompt: 'Retest payment charge with compliant amount and currency'
    },
    correctedResponse: {
      status: 200,
      statusText: 'OK',
      body: {
        chargeId: 'ch_3N84x92LkjqA01',
        status: 'succeeded',
        amount: 49.99,
        currency: 'USD',
        paid: true,
        receiptUrl: 'https://receipts.demo.iqoo-dev.net/view/rcpt_9921',
        fee: 1.75,
        created: '2026-09-22T09:32:16.890Z'
      }
    }
  },
  {
    id: 'profile-missing-token',
    voicePrompt: 'Check user profile with missing auth token',
    badge: 'Security / Headers',
    targetEndpoint: 'https://api.demo.iqoo-dev.net/api/v1/users/me',
    method: 'GET',
    description: 'Calls protected user profile resource without providing the required HTTP Authorization Bearer header.',
    brokenRequest: {
      method: 'GET',
      url: 'https://api.demo.iqoo-dev.net/api/v1/users/me',
      headers: {
        'Accept': 'application/json',
        'X-Client-Platform': 'Android'
      },
      scenarioTitle: 'Protected Profile Retrieval',
      commandPrompt: 'Check user profile with missing auth token'
    },
    brokenResponse: {
      status: 401,
      statusText: 'Unauthorized',
      body: {
        timestamp: '2026-09-22T09:33:02.311Z',
        status: 401,
        error: 'Unauthorized',
        message: 'Full authentication is required to access this resource. Missing Authorization header.',
        wwwAuthenticate: 'Bearer realm="iqoo-debugger-api", error="invalid_token"'
      }
    },
    diagnosis: {
      failureType: 'HTTP 401 — Missing Bearer Token',
      rootCause: 'Header `Authorization` was omitted in the HTTP request.',
      explanation: 'The `/api/v1/users/me` endpoint enforces Spring Security filter chains requiring a valid JWT bearer token.',
      rfcReference: 'RFC 6750 Section 3.1: When the protected resource receives an unauthenticated request, it must return 401 with WWW-Authenticate header.',
      severity: 'medium',
      confidence: 100,
      affectedField: 'Authorization Header',
      suggestedAction: 'Inject active OAuth2 Bearer token into HTTP headers.',
      fixDiffExplanation: 'Appended header `Authorization: Bearer eyJhbGciOi...` using active authenticated dev session.'
    },
    correctedRequest: {
      method: 'GET',
      url: 'https://api.demo.iqoo-dev.net/api/v1/users/me',
      headers: {
        'Accept': 'application/json',
        'X-Client-Platform': 'Android',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_user_token_valid'
      },
      scenarioTitle: 'Protected Profile Retrieval [AI Corrected]',
      commandPrompt: 'Retest user profile with injected Bearer token'
    },
    correctedResponse: {
      status: 200,
      statusText: 'OK',
      body: {
        id: 'usr_882041',
        username: 'alex_chen_dev',
        displayName: 'Alex Chen',
        email: 'alex.chen@innovate.dev',
        tier: 'PRO_ENTERPRISE',
        activeDevices: ['iQOO Neo 9 Pro (Current)', 'MacBook Pro 16"'],
        lastLogin: '2026-09-22T09:31:05Z'
      }
    }
  },
  {
    id: 'orders-empty-cart',
    voicePrompt: 'Create order without inventory item',
    badge: 'CRUD / Business Logic',
    targetEndpoint: 'https://api.demo.iqoo-dev.net/api/v1/orders/checkout',
    method: 'POST',
    description: 'Attempts to checkout an order with an empty items array and missing fulfillment postal code.',
    brokenRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/orders/checkout',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer session_token_8821'
      },
      body: JSON.stringify({
        customerId: 'cust_99812',
        items: [],
        shippingAddress: {
          line1: '120 Technology Way',
          city: 'San Jose',
          state: 'CA'
        }
      }, null, 2),
      scenarioTitle: 'Order Checkout Creation',
      commandPrompt: 'Create order without inventory item'
    },
    brokenResponse: {
      status: 422,
      statusText: 'Unprocessable Entity',
      body: {
        status: 422,
        error: 'Unprocessable Entity',
        message: 'Order payload cannot be processed due to semantic business validation rules.',
        details: [
          'items: Collection must contain at least 1 line item (Size: 0)',
          'shippingAddress.postalCode: Mandatory parameter missing'
        ]
      }
    },
    diagnosis: {
      failureType: 'HTTP 422 — Unprocessable Entity',
      rootCause: 'Semantic validation failed: empty line items array and missing shipping postal code.',
      explanation: 'While the JSON syntax is well-formed, order fulfillment business rules disallow zero-item orders and require postal code for tax calculation.',
      rfcReference: 'RFC 4918 Section 11.2: 422 Unprocessable Entity means the server understands content type and syntax, but cannot process contained instructions.',
      severity: 'medium',
      confidence: 96,
      affectedField: 'items, shippingAddress.postalCode',
      suggestedAction: 'Inject standard catalog SKU with quantity=1 and fill postalCode "95110".',
      fixDiffExplanation: 'Added item `{ sku: "DEV-KIT-PRO-01", qty: 1, unitPrice: 199.00 }` and filled `postalCode: "95110"`.'
    },
    correctedRequest: {
      method: 'POST',
      url: 'https://api.demo.iqoo-dev.net/api/v1/orders/checkout',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer session_token_8821'
      },
      body: JSON.stringify({
        customerId: 'cust_99812',
        items: [
          {
            sku: 'DEV-KIT-PRO-01',
            name: 'iQOO AI Developer Testing Kit',
            qty: 1,
            unitPrice: 199.00
          }
        ],
        shippingAddress: {
          line1: '120 Technology Way',
          city: 'San Jose',
          state: 'CA',
          postalCode: '95110'
        }
      }, null, 2),
      scenarioTitle: 'Order Checkout Creation [AI Corrected]',
      commandPrompt: 'Retest checkout with populated line items and shipping postal code'
    },
    correctedResponse: {
      status: 201,
      statusText: 'Created',
      body: {
        orderId: 'ord_2026_98841',
        status: 'CONFIRMED',
        total: 199.00,
        tax: 17.91,
        grandTotal: 216.91,
        fulfillmentStatus: 'AWAITING_PACKING',
        estimatedDelivery: '2026-09-24T18:00:00Z'
      }
    }
  }
];

export const OCR_SAMPLE_SNIPPETS: OcrSpecSnippet[] = [
  {
    id: 'ocr-curl-payment',
    title: 'Payment Charge cURL snippet',
    category: 'cURL',
    description: 'Documentation snippet for processing credit card charges via REST API',
    rawSnippet: `curl -X POST https://api.demo.iqoo-dev.net/api/v1/payments/charge \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer test_pk_sandbox_live_8910" \\
  -d '{
    "amount": 75.00,
    "currency": "USD",
    "customerId": "cust_44120",
    "paymentMethod": "pm_card_visa"
  }'`,
    extractedMethod: 'POST',
    extractedUrl: 'https://api.demo.iqoo-dev.net/api/v1/payments/charge',
    extractedHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_pk_sandbox_live_8910'
    },
    extractedBody: JSON.stringify({
      amount: 75.00,
      currency: 'USD',
      customerId: 'cust_44120',
      paymentMethod: 'pm_card_visa'
    }, null, 2)
  },
  {
    id: 'ocr-swagger-auth',
    title: 'OpenAPI / Swagger Auth Spec',
    category: 'Swagger/OpenAPI',
    description: 'Extracted endpoint spec for JWT session issue',
    rawSnippet: `paths:
  /api/v1/auth/login:
    post:
      summary: Authenticate User
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8`,
    extractedMethod: 'POST',
    extractedUrl: 'https://api.demo.iqoo-dev.net/api/v1/auth/login',
    extractedHeaders: {
      'Content-Type': 'application/json'
    },
    extractedBody: JSON.stringify({
      email: 'alex.chen@innovate.dev',
      password: 'TestEnv#SecretPass2026'
    }, null, 2)
  },
  {
    id: 'ocr-code-products',
    title: 'Spring Controller / Kotlin Code snippet',
    category: 'Code',
    description: 'Android Retrofit / Spring Boot REST endpoint signature snippet',
    rawSnippet: `@RestController
@RequestMapping("/api/v1/products")
class ProductController {
  @GetMapping("/{productId}")
  fun getProduct(@PathVariable productId: String): ResponseEntity<ProductDTO> {
    // Requires header: X-Client-Tenant
    return productService.findById(productId)
  }
}`,
    extractedMethod: 'GET',
    extractedUrl: 'https://api.demo.iqoo-dev.net/api/v1/products/prod_1009',
    extractedHeaders: {
      'Accept': 'application/json',
      'X-Client-Tenant': 'tenant_mobile_iqoo'
    },
    extractedBody: ''
  }
];

export function generateTestCasesForEndpoint(endpoint: string, method: string): GeneratedTestCase[] {
  return [
    {
      id: 'tc-pos-1',
      category: 'positive',
      categoryLabel: 'Happy Path',
      name: 'Valid Payload Execution',
      description: 'Executes standard request with all required fields present and well-formed.',
      method: method as any,
      url: endpoint,
      expectedStatus: method === 'POST' ? 200 : 200,
      status: 'idle'
    },
    {
      id: 'tc-bound-2',
      category: 'boundary',
      categoryLabel: 'Boundary Values',
      name: 'Extreme Limits / Zero Values',
      description: 'Tests zero values, max string lengths, and boundary conditions.',
      method: method as any,
      url: endpoint,
      expectedStatus: 400,
      status: 'idle'
    },
    {
      id: 'tc-miss-3',
      category: 'missing_field',
      categoryLabel: 'Missing Fields',
      name: 'Omit Required Attributes',
      description: 'Sends payload with mandatory JSON keys stripped out.',
      method: method as any,
      url: endpoint,
      expectedStatus: 400,
      status: 'idle'
    },
    {
      id: 'tc-sec-4',
      category: 'auth_security',
      categoryLabel: 'Auth & Security',
      name: 'Invalid / Expired Bearer Token',
      description: 'Tests endpoint behavior when authorization headers are invalid or tampered.',
      method: method as any,
      url: endpoint,
      expectedStatus: 401,
      status: 'idle'
    },
    {
      id: 'tc-type-5',
      category: 'invalid_type',
      categoryLabel: 'Type Mismatch',
      name: 'Pass String for Numeric Field',
      description: 'Tests serialization resilience when types do not match DTO definitions.',
      method: method as any,
      url: endpoint,
      expectedStatus: 422,
      status: 'idle'
    }
  ];
}
