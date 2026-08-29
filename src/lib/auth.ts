import { type Url, useSettingsStore } from "@/lib/store/settings";
import { getErrorMessage } from "@/lib/utils";

export function handleSetup({ username, linkdingUrl }: { username: string; linkdingUrl: Url }) {
  const { setUsername, setLinkdingUrl, setIsSetupComplete } = useSettingsStore.getState();

  setUsername(username);
  setLinkdingUrl(linkdingUrl);
  setIsSetupComplete(true);
}

export function logout() {
  const { setIsSetupComplete } = useSettingsStore.getState();
  setIsSetupComplete(false);
}

export async function validate() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { isValid: true, errorMessage: null, isOffline: true };
  }

  try {
    const res = await fetch("/api/user/profile/", {
      signal: AbortSignal.timeout(5000),
      headers: {
        ...(import.meta.env.DEV && {
          Authorization: `Token ${import.meta.env.VITE_LINKDING_API_TOKEN}`,
        }),
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      logout();
      return { isValid: false, errorMessage: "Invalid API token or credentials." };
    }

    if (!res.ok) {
      return { isValid: true, errorMessage: `Server error (${res.status})` };
    }

    return {
      isValid: true,
      errorMessage: null,
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);

    const { isSetupComplete } = useSettingsStore.getState();

    if (isSetupComplete) {
      return { isValid: true, isOffline: true, errorMessage };
    }

    return {
      isValid: true,
      errorMessage,
    };
  }
}
