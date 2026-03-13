import * as React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { HashIcon, Loader2 } from "lucide-react";

import { getAllQueryOptions } from "@/lib/queries";
import type { Tag } from "@/types";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
  useFilter,
} from "@/components/ui/autocomplete";

export default function SearchAutocomplete() {
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Tag[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [isPending, startTransition] = React.useTransition();

  const { data: allTags } = useSuspenseQuery(getAllQueryOptions.tags);

  const { contains } = useFilter();

  const abortControllerRef = React.useRef<AbortController | null>(null);

  function getStatusText(): React.ReactNode | null {
    if (isPending) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="size-3 animate-spin" />
          <span>Searching...</span>
        </div>
      );
    }

    if (!searchValue.startsWith("#")) return null;

    if (error) return error;
    if (searchValue === "#") return "Start typing a tag name...";
    return null;
  }

  const status = getStatusText();

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Autocomplete
        items={searchResults}
        value={searchValue}
        onValueChange={(nextSearchValue) => {
          setSearchValue(nextSearchValue);

          const controller = new AbortController();
          abortControllerRef.current?.abort();
          abortControllerRef.current = controller;

          if (!nextSearchValue.startsWith("#") || nextSearchValue === "#") {
            setSearchResults([]);
            setError(null);
            return;
          }

          startTransition(async () => {
            setError(null);
            const result = await searchTags(allTags.results, nextSearchValue, contains);

            if (controller.signal.aborted) return;

            setSearchResults(result.tags);
            setError(result.error);
          });
        }}
        itemToStringValue={(item) => `#${item.name}`}
        filter={null}>
        <AutocompleteInput placeholder="e.g. #my-tag" showTrigger={false} />

        <AutocompleteContent>
          {status && (
            <AutocompleteStatus className="text-muted-foreground border-b px-3 py-2 text-xs">
              {status}
            </AutocompleteStatus>
          )}

          <AutocompleteList>
            {(tag: Tag) => (
              <AutocompleteItem key={tag.id} value={tag}>
                <div className="flex items-center gap-2">
                  <HashIcon className="text-muted-foreground size-3" />
                  <span className="font-medium">{tag.name}</span>
                </div>
              </AutocompleteItem>
            )}
          </AutocompleteList>

          {searchValue.startsWith("#") && (
            <AutocompleteEmpty className="py-3 text-center text-sm">
              No matching tags.
            </AutocompleteEmpty>
          )}
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}

async function searchTags(
  allTags: Tag[],
  query: string,
  filter: (item: string, query: string) => boolean
): Promise<{ tags: Tag[]; error: string | null }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

  const tags = allTags.filter((tag) => filter(tag.name, cleanQuery));

  return {
    tags,
    error: null,
  };
}
