# Todos

## Issues

### Background sync

- [ ] [Refactor useEffect](src/providers/background-sync.tsx#L51)
- [ ] Use cached results for search when offline.
- [ ] Clearing cache in settings does not work.

### Filters

- [ ] Archived filter broken, API does not return archived from normal endpoint. Use `/api/bookmarks/archived/`.
- [ ] Tag search should support multiple space-separated tags with autocomplete.

---

## New features

### API token

- [ ] Move token handling to Go server.

### Bulk edit

- [ ] Add ability to remove/add tags for selected bookmarks.
- [ ] Make floating action dialog moveable and closable if pulled down and dropped in x.

### Upload assets

- [ ] Support uploading bookmark assets.

---

## New pages

### Stats

- [ ] Stats page (like karakeep).

### Tags

- [ ] Table view only.
- [ ] Show total count.
- [ ] Show bookmark count per tag.
- [ ] Editing/removing should cascade to bookmarks. Check Linkding UI/API for support.

### Folders

- [ ] Table view only.
- [ ] Show total count.
- [ ] Show bookmark count per folder.
- [ ] Support drag-and-drop reordering.
