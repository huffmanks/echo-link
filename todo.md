# Todos

## Issues

### Data/Background sync

- [ ] [Refactor useEffect](src/providers/background-sync.tsx#L51). Works but needs to be cleaned up.
- [ ] Use cached results for search when offline.
- [ ] Uploaded assets from API have a cold start, initially start with 404.

---

## New features

### Bulk edit

- [ ] Add ability to remove/add tags for selected bookmarks.
- [ ] Make floating action dialog moveable and closable if pulled down and dropped in x. Maybe switch to toggle switch it to go to to/bottom.

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
