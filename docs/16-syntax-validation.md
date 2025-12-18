# Syntax Validation

Syntax validation runs PHP linting (`php -l`) on open PHP documents (configurable).

Configuration:

- `php.executablePath`: PHP binary path
- `php.validate.enable`: enable/disable validation

Command:

- `PHP: Validate Syntax` (`php.validateFile`)

Entry point: validation logic in `validatePhpFile(...)` in `extension.js`.

