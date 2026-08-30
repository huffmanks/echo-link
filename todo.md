# Todos

## Fixes

- [x] Make links in notes markdown open in new tab.
- [ ] Sort filter, default is created at but toggle date sorts by updated at. Card view should mention updated at in front of time. Should add sort for both options. Or looks like initial is not getting user preferences if updated at the default data is still coming back created at.
- [ ] Don't show archived by default. Only if filter is archived.

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
