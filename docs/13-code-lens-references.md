# CodeLens (References)

Shows `N references` above PHP function and method declarations.

Clicking the lens opens the standard references peek UI.

Implementation notes:

- Uses a workspace-wide reference index built from PHP files
- Tracks function calls, method calls, and static calls (best-effort)

Entry points:

- CodeLens provider: `extension.js:428`
- Reference index: `ensurePhpWorkspaceReferenceIndex(...)` in `extension.js`

