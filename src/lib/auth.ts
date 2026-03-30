import { type Url, useSettingsStore } from "@/lib/store";
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

    if (!res.ok) {
      throw new Error("Could not validate the API token.");
    }

    return {
      isValid: true,
      errorMessage: null,
    };
  } catch (error: unknown) {
    logout();
    const errorMessage = getErrorMessage(error);

    return {
      isValid: false,
      errorMessage,
    };
  }
}
