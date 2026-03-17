import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";

interface TagCloudProps {
  tags: Array<string>;
  handleOpenChange: (open: boolean) => void;
}

export default function TagCloud({ tags, handleOpenChange }: TagCloudProps) {
  return (
    <div className="border-input bg-accent/14 rounded-lg border border-dashed p-3 transition-colors outline-none select-none">
      <div className="flex flex-wrap items-center gap-1">
        {tags.length ? (
          tags.map((tag) => (
            <Badge
              key={tag}
              render={
                <Link
                  to="/dashboard/tags/$tagName"
                  params={{ tagName: tag }}
                  onClick={() => handleOpenChange(false)}>
                  {tag}
                </Link>
              }
            />
          ))
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            No tags
          </Badge>
        )}
      </div>
    </div>
  );
}
