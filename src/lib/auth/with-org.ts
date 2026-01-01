import { NextResponse, type NextRequest } from "next/server";
import { getAuthContext, type AuthContext } from "./clerk";

/**
 * Higher-order function to wrap API routes with organization authentication.
 * Ensures the user is authenticated and has an organization context.
 */
export function withOrganization<T>(
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await getAuthContext();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    return handler(request, auth);
  };
}

/**
 * Require admin or owner role
 */
export function withAdmin<T>(
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await getAuthContext();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    if (auth.role !== "owner" && auth.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", code: "forbidden" },
        { status: 403 }
      );
    }

    return handler(request, auth);
  };
}

/**
 * Require owner role only
 */
export function withOwner<T>(
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await getAuthContext();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    if (auth.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden", code: "forbidden" },
        { status: 403 }
      );
    }

    return handler(request, auth);
  };
}
