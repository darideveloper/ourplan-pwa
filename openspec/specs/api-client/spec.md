# api-client

## Requirements

### Requirement: FetchError class
The system SHALL provide a typed `FetchError` class for structured API error handling.

#### Scenario: FetchError is created
- **WHEN** a `FetchError` is instantiated
- **THEN** it SHALL have `type` ("network" | "timeout" | "http" | "parse" | "abort"), `message` (string), and optional `status` (number) properties

### Requirement: safeFetch function
The system SHALL provide a `safeFetch<T>` function that wraps `fetch` with timeout, retry, and typed error handling.

#### Scenario: Successful request
- **WHEN** a `safeFetch` call succeeds
- **THEN** it SHALL return the parsed JSON response typed as `T`

#### Scenario: Network error with retry
- **WHEN** a `safeFetch` call encounters a network or timeout error
- **THEN** it SHALL retry up to 2 times with exponential backoff before throwing a `FetchError`

#### Scenario: HTTP error (no retry)
- **WHEN** a `safeFetch` call receives a non-2xx HTTP response
- **THEN** it SHALL throw a `FetchError` with type "http" and the response status, without retrying

### Requirement: validateCode API function
The system SHALL provide a `validateCode` function in `src/lib/api/validate-code.ts` that calls the n8n validation webhook.

#### Scenario: Code validation call
- **WHEN** `validateCode(code)` is called
- **THEN** it SHALL POST `{ code }` to `${import.meta.env.PUBLIC_N8N_BASE_URL}/validate` and return `{ valid: boolean }`

#### Scenario: API type exports
- **WHEN** API types are imported
- **THEN** `ValidateCodeResponse` (with `valid: boolean`) SHALL be exported from `src/lib/api/types.ts`

### Requirement: env declaration
The system SHALL declare the required environment variable for type safety.

#### Scenario: env.d.ts declaration
- **WHEN** `src/env.d.ts` is checked
- **THEN** it SHALL declare `interface ImportMetaEnv { readonly PUBLIC_N8N_BASE_URL: string }`
