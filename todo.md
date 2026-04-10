# Todos

## Issues

### Data/Background sync

- [ ] [Refactor useEffect](src/providers/background-sync.tsx#L60).
- [ ] Use cached results for search when offline.
- [ ] UI flash when visiting (Bookmarks, Folders, Tags pages)

---

## New features

### Bulk edit

- [ ] Add ability to remove/add tags for selected bookmarks.
  - [ ] [BookmarkWrapper](src/components/blocks/bookmark/index.tsx)
  - [ ] [SelectGroups](src/components/blocks/bookmark/select-groups.tsx)
  - [ ] [Tags page](<src/routes/(protected)/dashboard/tags/index.tsx>)

### Upload assets

- [ ] Support uploading bookmark assets.

### Settings form

- [ ] Hide Id/order column, (optional preference) use settingsStore from:
  - [ ] [folder-table](<src/routes/(protected)/dashboard/folders/-components/folder-table.tsx>)
  - [ ] [tag-table](<src/routes/(protected)/dashboard/tags/-components/tag-table.tsx>)
  - [ ] [bookmark-table](src/components/blocks/bookmark/views/table.tsx)

---

## New pages

### Stats

- [ ] Stats page (like karakeep).
