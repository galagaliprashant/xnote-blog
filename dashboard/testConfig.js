/**
 * Data-driven module/testcase catalog for the dashboard.
 *
 * This is a PLACEHOLDER catalog shaped for an API test suite (Consumption
 * Service API). Replace it with real data once your automation suite exists —
 * either edit this array by hand, or generate it from your test framework
 * (e.g. a build step that scans your test files and emits this JSON shape).
 *
 * Required shape per module:
 *   {
 *     id: string            — stable, unique, used as the DOM/report key
 *     name: string          — display name
 *     description: string   — one-line summary shown under the name
 *     testCases: [
 *       { id: string, name: string }
 *     ]
 *   }
 */
const TEST_MODULES = [
  {
    id: "auth",
    name: "Authentication",
    description: "Login, token issuance, refresh, and access control",
    testCases: [
      { id: "auth-001", name: "Valid credentials return an access token" },
      { id: "auth-002", name: "Invalid credentials are rejected with 401" },
      { id: "auth-003", name: "Expired token is refused on protected routes" },
      { id: "auth-004", name: "Refresh token issues a new access token" },
      { id: "auth-005", name: "Revoked token cannot be reused" },
    ],
  },
  {
    id: "consumption-data",
    name: "Consumption Data",
    description: "Retrieval and filtering of consumption records",
    testCases: [
      { id: "cons-001", name: "GET consumption returns records for a valid account" },
      { id: "cons-002", name: "Date range filter returns only matching records" },
      { id: "cons-003", name: "Pagination returns consistent page sizes" },
      { id: "cons-004", name: "Unknown account id returns 404" },
      { id: "cons-005", name: "Malformed query params return 400 with details" },
      { id: "cons-006", name: "Response payload matches consumption schema" },
    ],
  },
  {
    id: "metering",
    name: "Metering",
    description: "Meter reading ingestion and aggregation",
    testCases: [
      { id: "meter-001", name: "New meter reading is accepted and stored" },
      { id: "meter-002", name: "Duplicate reading for same interval is rejected" },
      { id: "meter-003", name: "Out-of-order reading is flagged for review" },
      { id: "meter-004", name: "Aggregated totals match sum of raw readings" },
    ],
  },
  {
    id: "billing",
    name: "Billing",
    description: "Bill generation and charge calculation",
    testCases: [
      { id: "bill-001", name: "Bill is generated for a closed billing cycle" },
      { id: "bill-002", name: "Tiered rate calculation matches expected charge" },
      { id: "bill-003", name: "Credit/adjustment is applied to the correct cycle" },
      { id: "bill-004", name: "Bill cannot be generated for an open cycle" },
    ],
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Usage alerts and billing notifications",
    testCases: [
      { id: "notif-001", name: "Threshold breach triggers a usage alert" },
      { id: "notif-002", name: "Bill-ready event triggers a notification" },
      { id: "notif-003", name: "Opted-out account receives no notifications" },
    ],
  },
  {
    id: "error-handling",
    name: "Error Handling & Resilience",
    description: "Timeouts, malformed input, and downstream failures",
    testCases: [
      { id: "err-001", name: "Downstream timeout returns a 503 with retry hint" },
      { id: "err-002", name: "Malformed JSON body returns 400" },
      { id: "err-003", name: "Rate limit returns 429 with Retry-After header" },
      { id: "err-004", name: "Partial downstream failure degrades gracefully" },
    ],
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TEST_MODULES };
}
