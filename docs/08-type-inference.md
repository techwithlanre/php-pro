# Type Inference

The extension performs lightweight type inference from nearby code:

- Simple assignments like `$x = new Foo();`
- Scalar literals (`int`, `float`, `string`, `bool`, `null`)
- Arrays
- Simple function/static-call return types when a signature is known

Used by:

- Hover type display
- Method signature resolution for `$var->method(...)`

Entry point: inference helpers around `inferPhpVariableTypes(...)` in `extension.js`.

