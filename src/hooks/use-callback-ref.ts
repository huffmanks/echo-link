import { useEffect, useMemo, useRef } from "react";

export function useCallbackRef<TCallback extends (...args: Array<any>) => any>(
  callback: TCallback | undefined
): TCallback {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as TCallback, []);
}
