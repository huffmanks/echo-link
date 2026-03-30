import { Link } from "@tanstack/react-router";
import { BookmarkIcon } from "lucide-react";

import { useSettingsStore } from "@/lib/store";
import { useGlobalModal } from "@/providers/global-modal-context";

import CodeSpan from "@/components/code-span";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyTag({ name }: { name: string }) {
  const limit = useSettingsStore((state) => state.limit);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookmarkIcon />
        </EmptyMedia>
        <EmptyTitle>
          No bookmarks in <CodeSpan text={`#${name}`} />
        </EmptyTitle>
        <EmptyDescription>
          You haven’t added any bookmarks to the <CodeSpan text={`#${name}`} /> tag yet. Browse your
          bookmarks or create a new bookmark.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link to="/dashboard" search={{ limit }}>
                Go to bookmarks
              </Link>
            }></Button>

          <Button
            nativeButton={false}
            render={<Link to="/dashboard/add/bookmark">Create bookmark</Link>}></Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyTags() {
  const { setActiveGlobalDialog } = useGlobalModal();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookmarkIcon />
        </EmptyMedia>
        <EmptyTitle>No tags yet</EmptyTitle>
        <EmptyDescription>You haven’t created any tags yet. Create a new tag.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="cursor-pointer" onClick={() => setActiveGlobalDialog("tag-form")}>
            Create tag
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
