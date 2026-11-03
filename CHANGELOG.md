# Changelog

## [1.1.0] - 2026-11-01

### Fixed
- XD no longer silently reverts the changes. The plugin now follows XD's edit-context rules and only edits layers reached through plain groups and artboards.

### Added
- The results popup lists masked groups, components, repeat grids, boolean groups and scroll groups whose contents need a manual step.
- New **Check what is still unmarked** command.
- The results popup shows a whole-document marked count.
- Locked layers are reported as skipped.

### Removed
- The **Mark only layers inside current selection** command. **Mark all layers for export** now works on whatever container you're inside.

## [1.0.0] - 2026-11-01

### Added
- First version: recursively marked every layer for export.

### Known issue
- In files with masked groups, components or repeat grids, XD reverted every change.
