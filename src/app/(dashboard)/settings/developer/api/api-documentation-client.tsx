"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

interface ApiDocumentationClientProps {
  baseUrl: string;
}

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  scope: "read" | "write";
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  bodyParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: string;
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  Galleries: [
    {
      method: "GET",
      path: "/api/v1/galleries",
      description: "List all galleries for your organization",
      scope: "read",
      parameters: [
        { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "integer", required: false, description: "Items per page (default: 20, max: 100)" },
        { name: "status", type: "string", required: false, description: "Filter by status: draft, active, delivered, archived" },
        { name: "client_id", type: "string", required: false, description: "Filter by client ID" },
        { name: "search", type: "string", required: false, description: "Search by name or description" },
      ],
      response: `{
  "data": [
    {
      "id": "gal_123",
      "name": "Smith Wedding Gallery",
      "description": "Wedding photos from June 15th",
      "slug": "smith-wedding-2024",
      "status": "active",
      "photo_count": 45,
      "price_cents": 15000,
      "currency": "USD",
      "view_count": 128,
      "download_count": 12,
      "is_password_protected": true,
      "allow_downloads": true,
      "expires_at": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T09:00:00Z",
      "client": {
        "id": "cli_456",
        "name": "John Smith",
        "email": "john@example.com",
        "company": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}`,
    },
    {
      method: "POST",
      path: "/api/v1/galleries",
      description: "Create a new gallery",
      scope: "write",
      bodyParams: [
        { name: "name", type: "string", required: true, description: "Gallery name" },
        { name: "description", type: "string", required: false, description: "Gallery description" },
        { name: "client_id", type: "string", required: false, description: "Associated client ID" },
        { name: "price_cents", type: "integer", required: false, description: "Price in cents (e.g., 15000 = $150.00)" },
        { name: "currency", type: "string", required: false, description: "Currency code (default: USD)" },
      ],
      response: `{
  "id": "gal_456",
  "name": "Johnson Family Portrait",
  "description": "Family portrait session",
  "status": "draft",
  "price_cents": 7500,
  "currency": "USD",
  "created_at": "2024-01-20T14:00:00Z"
}`,
    },
    {
      method: "GET",
      path: "/api/v1/galleries/:id",
      description: "Get a specific gallery with photos",
      scope: "read",
      response: `{
  "id": "gal_123",
  "name": "Smith Wedding Gallery",
  "description": "Wedding photos from June 15th",
  "slug": "smith-wedding-2024",
  "status": "active",
  "photo_count": 45,
  "price_cents": 15000,
  "currency": "USD",
  "view_count": 128,
  "download_count": 12,
  "is_password_protected": true,
  "allow_downloads": true,
  "allow_favorites": true,
  "allow_comments": false,
  "show_watermark": true,
  "expires_at": "2024-12-31T23:59:59Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T09:00:00Z",
  "client": {
    "id": "cli_456",
    "name": "John Smith",
    "email": "john@example.com",
    "company": null
  },
  "photos": [
    {
      "id": "pho_789",
      "filename": "ceremony-01.jpg",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "width": 4000,
      "height": 3000,
      "position": 0
    }
  ]
}`,
    },
    {
      method: "PATCH",
      path: "/api/v1/galleries/:id",
      description: "Update a gallery",
      scope: "write",
      bodyParams: [
        { name: "name", type: "string", required: false, description: "Gallery name" },
        { name: "description", type: "string", required: false, description: "Gallery description" },
        { name: "status", type: "string", required: false, description: "Status: draft, active, delivered, archived" },
        { name: "client_id", type: "string", required: false, description: "Associated client ID" },
        { name: "expires_at", type: "string", required: false, description: "Expiration date (ISO 8601)" },
        { name: "price_cents", type: "integer", required: false, description: "Price in cents" },
        { name: "allow_downloads", type: "boolean", required: false, description: "Allow photo downloads" },
        { name: "allow_favorites", type: "boolean", required: false, description: "Allow favoriting photos" },
        { name: "allow_comments", type: "boolean", required: false, description: "Allow comments on photos" },
        { name: "show_watermark", type: "boolean", required: false, description: "Show watermark on photos" },
      ],
      response: `{
  "id": "gal_123",
  "name": "Smith Wedding Gallery - Updated",
  "description": "Wedding photos from June 15th",
  "status": "active",
  "price_cents": 15000,
  "currency": "USD",
  "allow_downloads": true,
  "updated_at": "2024-01-20T15:00:00Z"
}`,
    },
    {
      method: "DELETE",
      path: "/api/v1/galleries/:id",
      description: "Delete a gallery",
      scope: "write",
      response: `{
  "deleted": true,
  "id": "gal_123"
}`,
    },
  ],
  Clients: [
    {
      method: "GET",
      path: "/api/v1/clients",
      description: "List all clients",
      scope: "read",
      parameters: [
        { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "integer", required: false, description: "Items per page (default: 20, max: 100)" },
        { name: "email", type: "string", required: false, description: "Filter by exact email" },
        { name: "search", type: "string", required: false, description: "Search by name, email, or company" },
      ],
      response: `{
  "data": [
    {
      "id": "cli_123",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Smith Realty",
      "gallery_count": 12,
      "invoice_count": 5,
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}`,
    },
    {
      method: "POST",
      path: "/api/v1/clients",
      description: "Create a new client",
      scope: "write",
      bodyParams: [
        { name: "email", type: "string", required: true, description: "Client email address" },
        { name: "name", type: "string", required: false, description: "Full name" },
        { name: "phone", type: "string", required: false, description: "Phone number" },
        { name: "company", type: "string", required: false, description: "Company name" },
        { name: "notes", type: "string", required: false, description: "Internal notes" },
      ],
      response: `{
  "id": "cli_456",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "company": "Doe Properties",
  "created_at": "2024-01-20T14:30:00Z"
}`,
    },
  ],
};

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function ApiDocumentationClient({ baseUrl }: ApiDocumentationClientProps) {
  const [expandedEndpoints, setExpandedEndpoints] = React.useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<"curl" | "javascript" | "python">("curl");

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateExample = (endpoint: Endpoint, language: "curl" | "javascript" | "python") => {
    const url = `${baseUrl}${endpoint.path.replace(":id", "gal_123")}`;
    const hasBody = endpoint.bodyParams && endpoint.bodyParams.length > 0;
    const bodyExample = hasBody
      ? JSON.stringify(
          Object.fromEntries(
            endpoint.bodyParams!
              .filter((p) => p.required)
              .map((p) => [p.name, p.type === "string" ? "example" : 0])
          ),
          null,
          2
        )
      : null;

    switch (language) {
      case "curl":
        let cmd = `curl -X ${endpoint.method} "${url}"`;
        cmd += ` \\\n  -H "Authorization: Bearer sk_live_YOUR_API_KEY"`;
        if (hasBody) {
          cmd += ` \\\n  -H "Content-Type: application/json"`;
          cmd += ` \\\n  -d '${bodyExample}'`;
        }
        return cmd;

      case "javascript":
        return `const response = await fetch("${url}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Content-Type": "application/json",
  },${hasBody ? `\n  body: JSON.stringify(${bodyExample}),` : ""}
});

const data = await response.json();
console.log(data);`;

      case "python":
        return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    "${url}",
    headers={
        "Authorization": "Bearer sk_live_YOUR_API_KEY",
        "Content-Type": "application/json",
    },${hasBody ? `\n    json=${bodyExample},` : ""}
)

data = response.json()
print(data)`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Authentication */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Authentication</h2>
        <p className="text-sm text-foreground-muted mb-4">
          All API requests require authentication using an API key. Include your key in the{" "}
          <code className="rounded bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs">Authorization</code>{" "}
          header:
        </p>
        <div className="relative rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
          <pre className="text-sm text-foreground-secondary overflow-x-auto">
            <code>Authorization: Bearer sk_live_YOUR_API_KEY</code>
          </pre>
          <button
            onClick={() => copyToClipboard("Authorization: Bearer sk_live_YOUR_API_KEY", "auth-header")}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
          >
            {copiedCode === "auth-header" ? (
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <h3 className="font-medium text-foreground mb-2">API Scopes</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  read
                </span>
                <span className="text-foreground-muted">View galleries, clients, invoices</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                  write
                </span>
                <span className="text-foreground-muted">Create, update, delete resources</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <h3 className="font-medium text-foreground mb-2">Rate Limits</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>100 requests per minute per API key</li>
              <li>Rate limit headers included in responses</li>
              <li>429 status code when exceeded</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Base URL */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Base URL</h2>
        <div className="relative rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
          <pre className="text-sm text-foreground-secondary">
            <code>{baseUrl}/api/v1</code>
          </pre>
          <button
            onClick={() => copyToClipboard(`${baseUrl}/api/v1`, "base-url")}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
          >
            {copiedCode === "base-url" ? (
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </section>

      {/* Endpoints */}
      {Object.entries(ENDPOINTS).map(([category, endpoints]) => (
        <section key={category} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="border-b border-[var(--card-border)] px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{category}</h2>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {endpoints.map((endpoint, idx) => {
              const key = `${category}-${idx}`;
              const isExpanded = expandedEndpoints[key];

              return (
                <div key={key}>
                  <button
                    onClick={() => toggleEndpoint(key)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium",
                        METHOD_COLORS[endpoint.method]
                      )}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-foreground font-mono">{endpoint.path}</code>
                    <span className="flex-1 text-sm text-foreground-muted truncate">
                      {endpoint.description}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        endpoint.scope === "read"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-400"
                      )}
                    >
                      {endpoint.scope}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "h-4 w-4 text-foreground-muted transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4">
                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Query Parameters</h4>
                          <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--background)]">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Name</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Type</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Required</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--card-border)]">
                                {endpoint.parameters.map((param) => (
                                  <tr key={param.name}>
                                    <td className="px-4 py-2 font-mono text-foreground">{param.name}</td>
                                    <td className="px-4 py-2 text-foreground-muted">{param.type}</td>
                                    <td className="px-4 py-2">
                                      {param.required ? (
                                        <span className="text-amber-400">Required</span>
                                      ) : (
                                        <span className="text-foreground-muted">Optional</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-foreground-muted">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Body Parameters */}
                      {endpoint.bodyParams && endpoint.bodyParams.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Request Body</h4>
                          <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--background)]">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Name</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Type</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Required</th>
                                  <th className="px-4 py-2 text-left font-medium text-foreground-muted">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--card-border)]">
                                {endpoint.bodyParams.map((param) => (
                                  <tr key={param.name}>
                                    <td className="px-4 py-2 font-mono text-foreground">{param.name}</td>
                                    <td className="px-4 py-2 text-foreground-muted">{param.type}</td>
                                    <td className="px-4 py-2">
                                      {param.required ? (
                                        <span className="text-amber-400">Required</span>
                                      ) : (
                                        <span className="text-foreground-muted">Optional</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-foreground-muted">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Example Request */}
                      <div>
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                          <h4 className="text-sm font-medium text-foreground">Example Request</h4>
                          <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] p-0.5">
                            {(["curl", "javascript", "python"] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={cn(
                                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                                  selectedLanguage === lang
                                    ? "bg-[var(--primary)] text-white"
                                    : "text-foreground-muted hover:text-foreground"
                                )}
                              >
                                {lang === "curl" ? "cURL" : lang === "javascript" ? "JavaScript" : "Python"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="relative rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
                          <pre className="text-sm text-foreground-secondary overflow-x-auto">
                            <code>{generateExample(endpoint, selectedLanguage)}</code>
                          </pre>
                          <button
                            onClick={() =>
                              copyToClipboard(generateExample(endpoint, selectedLanguage), `${key}-example`)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
                          >
                            {copiedCode === `${key}-example` ? (
                              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                            ) : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Example Response */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Example Response</h4>
                        <div className="relative rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
                          <pre className="text-sm text-foreground-secondary overflow-x-auto">
                            <code>{endpoint.response}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(endpoint.response, `${key}-response`)}
                            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
                          >
                            {copiedCode === `${key}-response` ? (
                              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                            ) : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Error Codes */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Error Codes</h2>
        <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-foreground-muted">Status</th>
                <th className="px-4 py-2 text-left font-medium text-foreground-muted">Code</th>
                <th className="px-4 py-2 text-left font-medium text-foreground-muted">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">400</td>
                <td className="px-4 py-2 font-mono text-amber-400">bad_request</td>
                <td className="px-4 py-2 text-foreground-muted">Invalid request parameters</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">401</td>
                <td className="px-4 py-2 font-mono text-red-400">unauthorized</td>
                <td className="px-4 py-2 text-foreground-muted">Missing or invalid API key</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">403</td>
                <td className="px-4 py-2 font-mono text-red-400">forbidden</td>
                <td className="px-4 py-2 text-foreground-muted">API key lacks required scope</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">404</td>
                <td className="px-4 py-2 font-mono text-foreground-muted">not_found</td>
                <td className="px-4 py-2 text-foreground-muted">Resource not found</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">429</td>
                <td className="px-4 py-2 font-mono text-amber-400">rate_limited</td>
                <td className="px-4 py-2 text-foreground-muted">Too many requests</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-foreground">500</td>
                <td className="px-4 py-2 font-mono text-red-400">internal_error</td>
                <td className="px-4 py-2 text-foreground-muted">Server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
