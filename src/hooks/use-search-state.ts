import {
  type RegisteredRouter,
  type RouteIds,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import type { SearchParams } from "@/lib/search";

export type AppRouteId = RouteIds<RegisteredRouter["routeTree"]>;

export function useSearchState<TID extends AppRouteId>(routeId: TID) {
  const navigate = useNavigate();
  const search = useSearch({ from: routeId }) as SearchParams;

  const setParams = (updater: (prev: SearchParams) => Partial<SearchParams>) => {
    navigate({
      search: (prev: any) => {
        const next = updater(prev as SearchParams);
        return {
          ...prev,
          ...next,
          page: next.page ?? 1,
        };
      },
      replace: true,
    } as any);
  };

  const toggleArrayValue = (key: keyof SearchParams, value: string) => {
    const current = (search[key] as Array<string>) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

    setParams((prev) => ({ ...prev, [key]: next, page: 1 }));
  };

  return { search, setParams, toggleArrayValue };
}
