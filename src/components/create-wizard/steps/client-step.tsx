"use client";

import { useState } from "react";
import { Users, UserPlus, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardData } from "@/app/(dashboard)/create/create-wizard-client";

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
}

interface ClientStepProps {
  formData: WizardData;
  updateFormData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  clients: Client[];
}

export function ClientStep({
  formData,
  updateFormData,
  onNext,
  clients,
}: ClientStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query)
    );
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.clientMode === "existing" && !formData.clientId) {
      newErrors.clientId = "Please select a client";
    }

    if (formData.clientMode === "new") {
      if (!formData.newClient.fullName.trim()) {
        newErrors.fullName = "Name is required";
      }
      if (!formData.newClient.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newClient.email)) {
        newErrors.email = "Invalid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Who is this project for?
        </h2>
        <p className="text-foreground-secondary">
          Select an existing client or add a new one
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-[var(--background-secondary)] rounded-lg">
        <button
          type="button"
          onClick={() => updateFormData({ clientMode: "existing" })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors",
            formData.clientMode === "existing"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-secondary hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          Existing Client
        </button>
        <button
          type="button"
          onClick={() => updateFormData({ clientMode: "new" })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors",
            formData.clientMode === "new"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-secondary hover:text-foreground"
          )}
        >
          <UserPlus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Existing Client Selection */}
      {formData.clientMode === "existing" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Client List */}
          <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border border-[var(--border)] p-2">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                {searchQuery ? "No clients found" : "No clients yet"}
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => updateFormData({ clientId: client.id })}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    formData.clientId === client.id
                      ? "bg-[var(--primary)]/10 border-2 border-[var(--primary)]"
                      : "hover:bg-[var(--background-hover)] border-2 border-transparent"
                  )}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-foreground-muted">
                    {client.fullName?.[0]?.toUpperCase() || client.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {client.fullName || "Unnamed Client"}
                    </div>
                    <div className="text-sm text-foreground-muted truncate">
                      {client.email}
                    </div>
                    {client.company && (
                      <div className="text-xs text-foreground-muted truncate">
                        {client.company}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {errors.clientId && (
            <p className="text-sm text-[var(--error)]">{errors.clientId}</p>
          )}

          {selectedClient && (
            <div className="p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
              <p className="text-sm text-[var(--success)]">
                Selected: {selectedClient.fullName || selectedClient.email}
              </p>
            </div>
          )}
        </div>
      )}

      {/* New Client Form */}
      {formData.clientMode === "new" && (
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Full Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.newClient.fullName}
              onChange={(e) =>
                updateFormData({
                  newClient: { ...formData.newClient, fullName: e.target.value },
                })
              }
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            {errors.fullName && (
              <p className="text-sm text-[var(--error)]">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              value={formData.newClient.email}
              onChange={(e) =>
                updateFormData({
                  newClient: { ...formData.newClient, email: e.target.value },
                })
              }
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            {errors.email && (
              <p className="text-sm text-[var(--error)]">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Phone <span className="text-foreground-muted">(optional)</span>
            </label>
            <input
              type="tel"
              value={formData.newClient.phone}
              onChange={(e) =>
                updateFormData({
                  newClient: { ...formData.newClient, phone: e.target.value },
                })
              }
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Company <span className="text-foreground-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.newClient.company}
              onChange={(e) =>
                updateFormData({
                  newClient: { ...formData.newClient, company: e.target.value },
                })
              }
              placeholder="Acme Real Estate"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-end pt-4">
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
