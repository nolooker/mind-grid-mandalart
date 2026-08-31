export const PASSCODE_HEADER = "x-mandalart-passcode";

export function authorizePasscode(request: Request, configuredPasscode: string | undefined): boolean {
  if (!configuredPasscode) return false;
  return request.headers.get(PASSCODE_HEADER) === configuredPasscode;
}
