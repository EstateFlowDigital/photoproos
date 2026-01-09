export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { AppMapClient } from "./app-map-client";
import { PasswordGate } from "./password-gate";

export default async function AppMapPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("app-map-access");

  if (!accessCookie || accessCookie.value !== "granted") {
    return <PasswordGate />;
  }

  return <AppMapClient />;
}
