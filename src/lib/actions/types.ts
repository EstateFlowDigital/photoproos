/**
 * Re-export action result types from the canonical source.
 * Import from this file for action-specific code,
 * or directly from @/lib/types/action-result for broader usage.
 */
export {
  type ActionResult,
  type VoidActionResult,
  type IdActionResult,
  type UrlActionResult,
  type MessageActionResult,
  type CountActionResult,
  success,
  ok,
  fail,
  isSuccess,
  isError,
  unwrap,
  getOrDefault,
  mapResult,
} from "@/lib/types/action-result";
