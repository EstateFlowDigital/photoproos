export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather | Field App",
  description: "Weather conditions and golden hour times",
};

export default async function WeatherPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Weather & Light</h1>
        <p className="text-foreground-muted mb-8">Weather conditions and optimal lighting times</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted mb-8">
            Weather forecasts, golden hour calculator, and lighting conditions for your shoots.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Location-based weather forecasts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Golden hour and blue hour times</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Sun position and direction tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Weather alerts for scheduled shoots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Best shooting conditions recommendations</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/field" className="btn btn-secondary text-sm">Field Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
