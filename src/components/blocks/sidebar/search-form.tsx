import { useEffect, useRef, useState } from "react";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { getAllQueryOptions } from "@/lib/queries";
import { cn, getActiveHashSegment } from "@/lib/utils";
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
  const [searchResults, setSearchResults] = useState<TagAutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: allTags } = useSuspenseQuery(getAllQueryOptions.tags);
  const { contains } = AutocompletePrimitive.useFilter({ sensitivity: "base" });

  useKeyboardShortcut("k", toggleFocus, { mod: true });

  function toggleFocus() {
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  function handleOnOpenChange(open: boolean) {
    const cursorPos = inputRef.current?.selectionStart ?? searchValue.length;
    const segment = getActiveHashSegment(searchValue, cursorPos);
    if (!segment) return;
    setIsOpen(open);
  }

  function handleValueChange(value: string) {
    setSearchValue(value);

    if (!value) {
      setIsOpen(false);
      clearSearch();
      return;
    }

    const cursorPos = inputRef.current?.selectionStart ?? value.length;
    const segment = getActiveHashSegment(value, cursorPos);

    if (segment) {
      const query = value.slice(segment[0] + 1, segment[1]);
      const alreadyUsed = [...value.matchAll(/#(\S+)/g)].map((m) => m[1]);
      const results = allTags.results
        .filter((tag) => contains(tag.name, query) && !alreadyUsed.includes(tag.name))
        .map((tag: Tag) => ({ id: tag.id, value: tag.name }));
      setSearchResults(results);
      setIsOpen(results.length > 0);
    } else {
      setIsOpen(false);
    }
  }

  function handleItemToStringValue(item: TagAutocompleteItem) {
    const current = inputRef.current?.value ?? searchValue;
    const cursorPos = inputRef.current?.selectionStart ?? current.length;
    const segment = getActiveHashSegment(current, cursorPos);
    if (!segment || !item) return current;
    const [start, end] = segment;
    return current.slice(0, start) + `#${item.value} ` + current.slice(end);
  }

  function clearSearch() {
    setSearchValue("");
    navigate({
      to: "/dashboard",
      search: (prev) => ({ ...prev, q: undefined }),
      replace: true,
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputRef.current) return;
    navigate({
      to: "/dashboard",
      search: (prev) => ({ ...prev, q: inputRef.current!.value || undefined }),
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
          mode="list"
          open={isOpen}
          onOpenChange={handleOnOpenChange}
          items={searchResults}
          value={searchValue}
          itemToStringValue={handleItemToStringValue}
          onValueChange={handleValueChange}>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <AutocompleteInput
            ref={inputRef}
            id="search"
            autoComplete="off"
            placeholder="Search... or #tag"
            className="h-8 w-full border-none bg-transparent! p-0! ring-0!"
            onFocus={() => inputRef.current?.select()}
          />

          <AutocompletePositioner sideOffset={6} anchor={containerRef}>
            <AutocompletePopup>
              <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
              <AutocompleteList>
                {(tag) => (
                  <AutocompleteItem key={tag.id} value={tag}>
                    #{tag.value}
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
        <InputGroupAddon align="inline-end" className="hidden sm:flex">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
