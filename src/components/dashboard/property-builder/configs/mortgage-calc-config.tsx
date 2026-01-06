"use client";

interface MortgageCalcConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function MortgageCalcConfig({ config, updateConfig }: MortgageCalcConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Default Down Payment (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={(config.defaultDownPayment as number) || 20}
          onChange={(e) => updateConfig("defaultDownPayment", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Default Interest Rate (%)
        </label>
        <input
          type="number"
          min="0"
          max="20"
          step="0.1"
          value={(config.defaultInterestRate as number) || 6.5}
          onChange={(e) => updateConfig("defaultInterestRate", parseFloat(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Default Loan Term (years)
        </label>
        <select
          value={(config.defaultTerm as number) || 30}
          onChange={(e) => updateConfig("defaultTerm", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value={15}>15 years</option>
          <option value={20}>20 years</option>
          <option value={30}>30 years</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showTaxes as boolean) ?? true}
            onChange={(e) => updateConfig("showTaxes", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Include Property Taxes</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showInsurance as boolean) ?? true}
            onChange={(e) => updateConfig("showInsurance", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Include Home Insurance</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showAmortization as boolean) ?? false}
            onChange={(e) => updateConfig("showAmortization", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Amortization Schedule</span>
        </label>
      </div>

      {(config.showTaxes as boolean) !== false && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Property Tax Rate (% per year)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={(config.taxRate as number) || 1.25}
            onChange={(e) => updateConfig("taxRate", parseFloat(e.target.value))}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>
      )}

      {(config.showInsurance as boolean) !== false && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Insurance Rate (% per year)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={(config.insuranceRate as number) || 0.5}
            onChange={(e) => updateConfig("insuranceRate", parseFloat(e.target.value))}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>
      )}

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Home price is populated from your property listing price.
        </p>
      </div>
    </div>
  );
}
