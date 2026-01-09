"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface CalculatorInputs {
  sessionsPerMonth: number;
  avgPhotosPerSession: number;
  hourlyRate: number;
  hoursOnAdmin: number;
}

const defaultInputs: CalculatorInputs = {
  sessionsPerMonth: 12,
  avgPhotosPerSession: 50,
  hourlyRate: 75,
  hoursOnAdmin: 10,
};

export function ROICalculatorSection() {
  const [inputs, setInputs] = React.useState<CalculatorInputs>(defaultInputs);
  const { ref, isVisible } = useScrollAnimation();

  // Calculate savings
  const calculations = React.useMemo(() => {
    const { sessionsPerMonth, avgPhotosPerSession, hourlyRate, hoursOnAdmin } = inputs;

    // Time savings (assume 60% reduction in admin time with PhotoProOS)
    const adminTimeSaved = hoursOnAdmin * 0.6;
    const monthlyTimeSaved = adminTimeSaved;
    const yearlyTimeSaved = monthlyTimeSaved * 12;

    // Money saved from time
    const monthlyMoneySaved = adminTimeSaved * hourlyRate;
    const yearlyMoneySaved = monthlyMoneySaved * 12;

    // Revenue increase (faster delivery = more referrals, 15% estimated increase)
    const currentMonthlyRevenue = sessionsPerMonth * avgPhotosPerSession * (hourlyRate / 50); // rough estimate
    const additionalRevenuePercent = 0.15;
    const additionalMonthlyRevenue = currentMonthlyRevenue * additionalRevenuePercent;
    const additionalYearlyRevenue = additionalMonthlyRevenue * 12;

    // Payment speed improvement (2x faster payments)
    const fasterPaymentDays = 7; // Typically reduces from 14 days to 7 days

    return {
      monthlyTimeSaved: Math.round(monthlyTimeSaved),
      yearlyTimeSaved: Math.round(yearlyTimeSaved),
      monthlyMoneySaved: Math.round(monthlyMoneySaved),
      yearlyMoneySaved: Math.round(yearlyMoneySaved),
      additionalYearlyRevenue: Math.round(additionalYearlyRevenue),
      totalYearlySavings: Math.round(yearlyMoneySaved + additionalYearlyRevenue),
      fasterPaymentDays,
    };
  }, [inputs]);

  const handleSliderChange = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section
      id="roi-calculator"
      ref={ref}
      className="relative z-10 py-20 lg:py-32"
      aria-labelledby="roi-calculator-heading"
    >
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <CalculatorIcon className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm text-foreground-secondary">
              <span className="font-medium text-[var(--primary)]">Calculate</span> your savings
            </span>
          </div>
          <h2
            id="roi-calculator-heading"
            className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-[-1px] lg:text-5xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground">See how much you could</span>{" "}
            <span className="bg-gradient-to-r from-[var(--success)] via-[var(--primary)] to-[var(--success)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">
              save with PhotoProOS.
            </span>
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            Adjust the sliders to match your current workflow and see your potential time and money savings.
          </p>
        </div>

        {/* Calculator Grid */}
        <div
          className="grid gap-8 lg:grid-cols-2"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(40px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "300ms",
          }}
        >
          {/* Input Panel */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8">
            <h3 className="mb-6 text-lg font-medium text-foreground">Your Current Workflow</h3>

            <div className="space-y-8">
              {/* Sessions per month */}
              <SliderInput
                label="Photo sessions per month"
                value={inputs.sessionsPerMonth}
                min={1}
                max={50}
                step={1}
                unit="sessions"
                onChange={(v) => handleSliderChange("sessionsPerMonth", v)}
              />

              {/* Photos per session */}
              <SliderInput
                label="Average photos per session"
                value={inputs.avgPhotosPerSession}
                min={10}
                max={500}
                step={10}
                unit="photos"
                onChange={(v) => handleSliderChange("avgPhotosPerSession", v)}
              />

              {/* Hourly rate */}
              <SliderInput
                label="Your effective hourly rate"
                value={inputs.hourlyRate}
                min={25}
                max={250}
                step={5}
                unit="/hr"
                prefix="$"
                onChange={(v) => handleSliderChange("hourlyRate", v)}
              />

              {/* Admin hours */}
              <SliderInput
                label="Hours on admin work weekly"
                value={inputs.hoursOnAdmin}
                min={1}
                max={40}
                step={1}
                unit="hours"
                onChange={(v) => handleSliderChange("hoursOnAdmin", v)}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] to-[var(--background-secondary)] p-6 lg:p-8">
            <h3 className="mb-6 text-lg font-medium text-foreground">Your Potential Savings</h3>

            <div className="space-y-6">
              {/* Time saved */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-elevated)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                    <ClockIcon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Time saved per year</p>
                    <p className="text-2xl font-bold text-foreground">{calculations.yearlyTimeSaved} hours</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">
                  That's {Math.round(calculations.yearlyTimeSaved / 8)} extra days to shoot or relax.
                </p>
              </div>

              {/* Money saved */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-elevated)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10">
                    <DollarIcon className="h-5 w-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Value of time saved</p>
                    <p className="text-2xl font-bold text-foreground">${calculations.yearlyMoneySaved.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">
                  Based on your ${inputs.hourlyRate}/hr rate.
                </p>
              </div>

              {/* Faster payments */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-elevated)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10">
                    <ZapIcon className="h-5 w-5 text-[var(--ai)]" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Faster payments</p>
                    <p className="text-2xl font-bold text-foreground">2x faster</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">
                  Get paid in {calculations.fasterPaymentDays} days instead of 14+.
                </p>
              </div>

              {/* Total value */}
              <div className="rounded-xl border-2 border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5">
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--primary)] mb-1">Total yearly value</p>
                  <p className="text-4xl font-bold text-foreground mb-2">
                    ${calculations.totalYearlySavings.toLocaleString()}+
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Compared to PhotoProOS Pro at $29/month ($348/year)
                  </p>
                </div>
              </div>

              {/* ROI badge */}
              <div className="flex items-center justify-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                <span className="text-sm font-medium text-[var(--success)]">
                  {Math.round(calculations.totalYearlySavings / 348)}x return on investment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  prefix?: string;
  onChange: (value: number) => void;
}

function SliderInput({ label, value, min, max, step, unit, prefix = "", onChange }: SliderInputProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const inputId = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>
        <span className="rounded-lg bg-[var(--background-elevated)] px-3 py-1 text-sm font-medium text-foreground">
          {prefix}{value} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--background-elevated) ${percentage}%, var(--background-elevated) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// Icons
function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37ZM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 0 1 3 13.179Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10.75 6.75a.75.75 0 0 0-1.5 0v.01c-1.318.187-2.5.996-2.5 2.49 0 1.632 1.474 2.25 2.75 2.635v2.844c-.658-.136-1.155-.46-1.397-.813a.75.75 0 1 0-1.206.892c.57.77 1.527 1.23 2.603 1.317v.625a.75.75 0 0 0 1.5 0v-.635c1.465-.183 2.75-1.09 2.75-2.615 0-1.631-1.474-2.25-2.75-2.634V7.23c.49.109.861.343 1.067.566a.75.75 0 0 0 1.094-1.025c-.524-.558-1.322-.933-2.161-1.013V6.75Zm-1.5 2.244c0-.479.453-.878 1-.99v1.952c-.596-.201-1-.497-1-.962Zm2.5 3.258c0 .463-.44.853-1 .979V11.24c.599.201 1 .497 1 1.012Z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
