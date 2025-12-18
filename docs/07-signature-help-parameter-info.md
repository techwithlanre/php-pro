# Signature Help (Parameter Info)

Signature help for `php` displays function/method signatures while typing:

- Triggered on `(` and `,`
- Resolves user code signatures from workspace parsing
- Falls back to PHP Reflection for built-in functions (when available)

Entry point: `extension.js:350`.

