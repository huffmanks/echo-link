# Todos

## Fixes

- [x] Offline reload broken.
- [ ] Make online indicator be about `linkding connected` not is `online`.

## Refactors

- [ ] Linkding now supports tag deletion through API. So make more efficient.

## New features

### Bulk edit

- [ ] Add ability to remove/add tags for selected bookmarks.
  - [ ] [BookmarkWrapper](src/components/blocks/bookmark/index.tsx)
  - [ ] [SelectGroups](src/components/blocks/bookmark/select-groups.tsx)
  - [ ] [Tags page](<src/routes/(protected)/dashboard/tags/index.tsx>)

### Upload assets

- [ ] Support uploading bookmark assets.

### Data/Background sync

- [ ] Use cached results when offline for search.
