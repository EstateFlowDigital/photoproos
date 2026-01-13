export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { WeatherClient } from "./weather-client";
import { getTodaysBookings } from "@/lib/actions/field-operations";

export const metadata: Metadata = {
  title: "Weather | Field App",
  description: "Weather conditions and golden hour times",
};

export default async function WeatherPage() {
  const bookingsResult = await getTodaysBookings();
  const todaysBookings = bookingsResult.success ? bookingsResult.data : [];

  return (
    <div data-element="field-weather-page">
      <WeatherClient todaysBookings={todaysBookings || []} />
    </div>
  );
}
