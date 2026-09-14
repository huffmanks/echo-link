import { linkdingFetch } from "@/lib/api";
import { VALIDATION_STALE_TIME } from "@/lib/constants";
import { type Url, useSettingsStore } from "@/lib/store/settings";
import { getErrorMessage, isHttpError } from "@/lib/utils";

export function handleSetup({
  username,
  linkdingExternalUrl,
}: {
  username: string;
  linkdingExternalUrl: Url;
}) {
  const { setUsername, setLinkdingExternalUrl, setIsSetupComplete } = useSettingsStore.getState();

  setUsername(username);
  setLinkdingExternalUrl(linkdingExternalUrl);
  setIsSetupComplete(true);
}

export function logout() {
  const { setIsSetupComplete, setLastValidatedAt } = useSettingsStore.getState();
  setLastValidatedAt(0);
  setIsSetupComplete(false);
}

export async function validate(options: { force?: boolean } = {}) {
  const { isSetupComplete, lastValidatedAt, setLastValidatedAt } = useSettingsStore.getState();

  const isStale = Date.now() - lastValidatedAt > VALIDATION_STALE_TIME;
  if (!options.force && lastValidatedAt > 0 && !isStale) {
    return { isValid: true, errorMessage: null };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (isSetupComplete) setLastValidatedAt(Date.now());
    return { isValid: true, errorMessage: null, isOffline: true };
  }

  try {
    await linkdingFetch("user/profile/");

    setLastValidatedAt(Date.now());

    return {
      isValid: true,
      errorMessage: null,
    };
  } catch (error: unknown) {
    if (isHttpError(error) && (error.status === 401 || error.status === 403)) {
      return {
        isValid: false,
        errorMessage: "Invalid API token or credentials.",
        status: error.status,
      };
    }

    const errorMessage = getErrorMessage(error);

    if (typeof navigator !== "undefined" && !navigator.onLine && isSetupComplete) {
      setLastValidatedAt(Date.now());
      return { isValid: true, isOffline: true, errorMessage };
    }

    return {
      isValid: false,
      errorMessage,
      status: isHttpError(error) ? error.status : undefined,
    };
  }
}
