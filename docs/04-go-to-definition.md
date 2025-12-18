# Go To Definition

Definition provider for `php` supports:

- Local symbol resolution inside the current file
- Workspace symbol resolution via the extension’s workspace index
- Laravel route name navigation from:
  - `route('name')`
  - `to_route('name')`
  - `->route('name')`

Blade route navigation is supported for `blade` files.

Entry points:

- PHP definition provider: `extension.js:292`
- Blade definition provider: `extension.js:314`

