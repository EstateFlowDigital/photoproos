"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignServiceCapability,
  removeServiceCapability,
} from "@/lib/actions/team-capabilities";
import {
  assignEquipmentToUser,
  unassignEquipmentFromUser,
} from "@/lib/actions/equipment";

type CapabilityLevel = "learning" | "capable" | "expert";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  priceCents: number;
}

interface Capability {
  id: string;
  name: string;
  category: string;
  level: CapabilityLevel;
  notes: string | null;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  assignedAt?: Date;
  notes?: string | null;
}

interface Location {
  id: string;
  formattedAddress: string;
  city: string | null;
  state: string | null;
}

interface CapabilitiesFormProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
  services: Service[];
  capabilities: Capability[];
  userEquipment: Equipment[];
  allEquipment: Equipment[];
  homeBaseLocation: Location | null;
}

const LEVEL_LABELS: Record<CapabilityLevel, string> = {
  learning: "Learning",
  capable: "Capable",
  expert: "Expert",
};

const LEVEL_COLORS: Record<CapabilityLevel, string> = {
  learning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  capable: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  expert: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export function CapabilitiesForm({
  userId,
  userName,
  userAvatar,
  services,
  capabilities,
  userEquipment,
  allEquipment,
}: CapabilitiesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"skills" | "equipment">("skills");

  // Track current capabilities as a map for easy lookup
  const capabilityMap = new Map(capabilities.map((c) => [c.id, c]));
  const equipmentSet = new Set(userEquipment.map((e) => e.id));

  const handleCapabilityChange = async (serviceId: string, level: CapabilityLevel | null) => {
    startTransition(async () => {
      if (level === null) {
        await removeServiceCapability(userId, serviceId);
      } else {
        await assignServiceCapability({
          userId,
          serviceId,
          level,
        });
      }
      router.refresh();
    });
  };

  const handleEquipmentToggle = async (equipmentId: string, isAssigned: boolean) => {
    startTransition(async () => {
      if (isAssigned) {
        await unassignEquipmentFromUser(userId, equipmentId);
      } else {
        await assignEquipmentToUser(userId, equipmentId);
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-2xl font-semibold text-foreground-muted overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-foreground-muted">
              <span>{capabilities.length} services</span>
              <span>•</span>
              <span>{userEquipment.length} equipment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "skills"
              ? "bg-[var(--background)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Service Skills
        </button>
        <button
          onClick={() => setActiveTab("equipment")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "equipment"
              ? "bg-[var(--background)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Equipment
        </button>
      </div>

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--background)]">
            <h3 className="font-semibold text-foreground">Service Capabilities</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Assign skill levels for each service this team member can perform
            </p>
          </div>

          <div className="divide-y divide-[var(--card-border)]">
            {services.map((service) => {
              const capability = capabilityMap.get(service.id);
              const currentLevel = capability?.level || null;

              return (
                <div key={service.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      <p className="text-sm text-foreground-muted mt-0.5">
                        {service.category} • ${(service.priceCents / 100).toFixed(0)}
                      </p>
                      {service.description && (
                        <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(["learning", "capable", "expert"] as CapabilityLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            handleCapabilityChange(service.id, currentLevel === level ? null : level)
                          }
                          disabled={isPending}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${
                            currentLevel === level
                              ? LEVEL_COLORS[level]
                              : "bg-transparent text-foreground-muted border-[var(--card-border)] hover:bg-[var(--background-hover)]"
                          }`}
                        >
                          {LEVEL_LABELS[level]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {services.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-foreground-muted">No services configured yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === "equipment" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--background)]">
            <h3 className="font-semibold text-foreground">Assigned Equipment</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Select equipment this team member has access to
            </p>
          </div>

          <div className="divide-y divide-[var(--card-border)]">
            {allEquipment.map((equipment) => {
              const isAssigned = equipmentSet.has(equipment.id);

              return (
                <div key={equipment.id} className="px-6 py-4">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => handleEquipmentToggle(equipment.id, isAssigned)}
                      disabled={isPending}
                      className="h-5 w-5 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)] disabled:opacity-50"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{equipment.name}</h4>
                      <p className="text-sm text-foreground-muted capitalize">{equipment.category}</p>
                    </div>
                    {isAssigned && (
                      <span className="text-xs font-medium text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-full">
                        Assigned
                      </span>
                    )}
                  </label>
                </div>
              );
            })}

            {allEquipment.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-foreground-muted">No equipment in inventory</p>
                <a
                  href="/settings/equipment"
                  className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
                >
                  Add equipment →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {activeTab === "skills" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Skill Level Guide</h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LEVEL_COLORS.learning}`}>
                Learning
              </span>
              <p className="text-xs text-foreground-muted">Training or shadowing</p>
            </div>
            <div className="flex items-start gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LEVEL_COLORS.capable}`}>
                Capable
              </span>
              <p className="text-xs text-foreground-muted">Can perform independently</p>
            </div>
            <div className="flex items-start gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LEVEL_COLORS.expert}`}>
                Expert
              </span>
              <p className="text-xs text-foreground-muted">Highly skilled, can train others</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
