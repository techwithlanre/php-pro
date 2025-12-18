# IntelliSense (Completions)

Completion provider is registered for `php` and includes:

- PHP keywords
- Built-in PHP functions (with snippet-style insertion)
- PHP constants
- Magic methods
- Local variable names (best-effort)
- Member completions for:
  - Instance members after `->`
  - Static members after `::`
- Class-name completion in contexts like `new`, `extends`, `implements`, `catch`

Entry point: completion provider in `extension.js:166`.

