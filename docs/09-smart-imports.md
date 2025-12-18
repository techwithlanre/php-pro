# Smart Import Suggestions

Provides import assistance via:

- Class name completion in `new`, `extends`, `implements`, `catch`
  - Can auto-insert `use Vendor\\Package\\ClassName;` using `additionalTextEdits`
- Quick Fix: `Import ...` when a class is used without a matching `use`
- Source action: `Organize Imports` to sort and deduplicate `use` statements

Entry points:

- Completion: `createPhpClassCompletionItems(...)`
- Code actions: `providePhpImportCodeActions(...)`

