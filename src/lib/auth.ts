import { type Token, type Url, useSettingsStore } from "@/lib/store";
import { getErrorMessage } from "@/lib/utils";

export async function login({
  username,
  linkdingUrl,
  token,
}: {
  username: string;
  linkdingUrl: Url;
  token: Token;
}) {
  const { setUsername, setLinkdingUrl, setToken, setIsAuthenticated } = useSettingsStore.getState();

  try {
    if (!token) throw new Error("Missing API token.");

    const { isValid, errorMessage } = await validate({ token });

    if (!isValid && errorMessage) throw new Error(errorMessage);

    setUsername(username);
    setLinkdingUrl(linkdingUrl);
    setToken(token);
    setIsAuthenticated(true);
    return {
      isValid,
      errorMessage,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      isValid: false,
      errorMessage,
    };
  }
}

export function logout() {
  const { setToken, setIsAuthenticated } = useSettingsStore.getState();

  setIsAuthenticated(false);
  setToken(null);
}

export async function checkAuth() {
  const { token, isAuthenticated, setIsAuthenticated } = useSettingsStore.getState();

  try {
    if (!token) {
      if (isAuthenticated) setIsAuthenticated(false);
      return { isValid: false, errorMessage: "Missing credentials." };
    }

    if (!navigator.onLine) {
      return {
        isValid: isAuthenticated,
        errorMessage: null,
      };
    }

    return await validate({ token });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      isValid: false,
      errorMessage,
    };
  }
}

async function validate({ token }: { token: string }) {
  try {
    const res = await fetch("/api/user/profile/", {
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Token ${token}`,
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
    const errorMessage = getErrorMessage(error);

    return {
      isValid: false,
      errorMessage,
    };
  }
}
