# Todos

## Fixes

- [ ] On setup form dont show toast for disconnected or connected to API.
- [ ] If show archived false in settings still get an API hit and error in console. Should skip the call.
- [ ] Fix verifyUrlHealth for prod not getting valid localhost url to pass on go server if docker doesnt use extra_hosts. This is expected but need to test and cleanup up error messages. [src/lib/api.ts](src/lib/api.ts), [src/components/forms/settings/user-settings-form.tsx](src/components/forms/settings/user-settings-form.tsx), [src/components/forms/setup-form.tsx](src/components/forms/setup-form.tsx), [handleCheckURL](server.go)

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
