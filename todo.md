# Todos

## Settings & preferences

- [ ] Show stats page (like karakeep).
- [ ] Add default sorting option for date. Allow user to select created_at or modified_at.
- [ ] Add option to when bulk editing after executing to keep in editing mode or not.
- [ ] Split up setting sections in their own tab.

## Background sync

- [ ] If offline, hard refresh crashes.
- [ ] If offline, make search query the cache.

## Bulk edit

- [ ] Add ability to remove/add tags to bookmarks.

## Upload assets

- [ ] Add support to upload bookmark assets.

## Filters

- [ ] Archived doesn't work because API doesn't return archived. Have to use this endpoint `/api/bookmarks/archived/`.
- [ ] When searching using tags, should allow multiple comma separated tags and show auto complete on those.

## API token

- [ ] Switch to using on go server instead.

## Tags and folder manager pages

- [ ] Show all items and count of each bookmark in each one.
- [ ] Folders page, allow drag to reorder.
- [ ] Tags page, edit/remove should cascade updates to all bookmarks. Check Linkding web ui for API call to see if there is a way to target that.
