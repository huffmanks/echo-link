import { useEffect, useRef, useState } from "react";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { getAllQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePositioner,
} from "@/components/ui/autocomplete";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";

interface TagAutocompleteItem {
  id: number;
  value: string;
}

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState(search?.q ?? "");
  const [searchResults, setSearchResults] = useState<Array<TagAutocompleteItem>>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: allTags } = useSuspenseQuery(getAllQueryOptions.tags);
  const { contains } = AutocompletePrimitive.useFilter({ sensitivity: "base" });

  useKeyboardShortcut("k", toggleFocus, { mod: true });

  function toggleFocus() {
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  function handleInputChange(value: string) {
    if (value === "") {
      clearSearch();
      return;
    }

    setSearchValue(value);

    if (value.startsWith("#")) {
      const cleanQuery = value.slice(1);

      const tags = allTags.results
        .filter((tag) => contains(tag.name, cleanQuery))
        .map((tag: Tag) => ({
          id: tag.id,
          value: tag.name,
        }));
      setSearchResults(tags);
      setIsOpen(value.length > 0);
    } else {
      setIsOpen(false);
    }
  }

  function clearSearch() {
    setSearchValue("");
    navigate({
      to: "/dashboard",
      search: (prev) => {
        return {
          ...prev,
          q: undefined,
        };
      },
      replace: true,
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!inputRef.current) return;

    const newSearchValue = inputRef.current.value;

    navigate({
      to: "/dashboard",
      search: (prev) => {
        return {
          ...prev,
          q: newSearchValue || undefined,
        };
      },
    });
  }

  useEffect(() => {
    setSearchValue(search?.q ?? "");
  }, [search?.q]);

  return (
    <form {...props} autoComplete="off" onSubmit={handleSubmit}>
      <InputGroup
        ref={containerRef}
        className="focus-within:border-ring focus-within:ring-ring/50 max-w-sm focus-within:ring-[3px]">
        <InputGroupAddon>
          <InputGroupButton type="submit" size="icon-xs" disabled={!searchValue}>
            <SearchIcon className="text-muted-foreground" />
          </InputGroupButton>
        </InputGroupAddon>

        <Autocomplete
          autoHighlight
          mode="both"
          open={isOpen && searchValue.startsWith("#")}
          onOpenChange={setIsOpen}
          items={searchResults}
          value={searchValue}
          itemToStringValue={(item: TagAutocompleteItem) => (item ? `#${item.value}` : searchValue)}
          onValueChange={handleInputChange}>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <AutocompleteInput
            ref={inputRef}
            id="search"
            autoComplete="off"
            placeholder="Search..."
            className="h-8 w-full border-none bg-transparent! p-0! ring-0!"
            onFocus={() => inputRef.current?.select()}
          />

          <AutocompletePositioner sideOffset={6} anchor={containerRef}>
            <AutocompletePopup>
              <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
              <AutocompleteList>
                {(tag) => (
                  <AutocompleteItem key={tag.id} value={tag}>
                    {tag.value}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompletePopup>
          </AutocompletePositioner>
        </Autocomplete>

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            className={cn(searchValue === "" ? "invisible opacity-0" : "visible opacity-100")}
            onClick={clearSearch}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
