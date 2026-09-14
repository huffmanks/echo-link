# Todos

## Fixes

- [ ] If show archived false in settings still get an API hit and error in console. Should skip the call.
- [ ] Uncaught non-precached-url: createHandlerBoundToURL('/index.html') was called, but that URL is not precached. Please pass in a URL that is precached instead.

  ```txt
  at PrecacheController.createHandlerBoundToURL (workbox-precaching.js?v=39e75c36:586:13)
  at createHandlerBoundToURL (workbox-precaching.js?v=39e75c36:718:30)
  at sw.ts:33:45
  ```

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
