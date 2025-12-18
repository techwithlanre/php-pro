# PHP Enhanced Pro

Professional VS Code extension for PHP development with advanced features.

## Features

- 🎨 **Syntax Highlighting** - PHP, Laravel Blade, Doctrine DQL, PHPDoc (Doctrine annotations/attributes)
- 🧠 **IntelliSense** - Keyword/function completions, class/member suggestions, smart class imports
- 🧾 **Signature Help** - Parameter info + function signatures while typing
- 🔎 **Type Inference** - Best-effort variable type detection from local context
- 🔍 **Go to Definition** - Jump to classes/functions/methods and Laravel route names
- 🧭 **Workspace Symbol Search** - Search all classes/functions across the project
- 🧩 **Document Outline** - View namespaces, classes, methods, properties, constants
- 🌈 **Semantic Highlighting** - Semantic token coloring for key PHP constructs (+ DQL in `createQuery(...)`)
- 🔗 **Call/Type Hierarchy** - Explore call graph and inheritance relationships (best-effort)
- 🧷 **CodeLens (References)** - See reference counts on functions/methods
- ✅ **Syntax Validation** - Real-time PHP linting (`php -l`)
- 🧪 **Unit Test Generator** - Generate PHPUnit tests (Laravel-aware)
- ⚡ **Run PHP Files** - Execute the current PHP file from VS Code

## Installation

1. Install the extension from VSIX file
2. Reload VS Code
3. Open a PHP file and enjoy!

## Configuration

```json
{
  "php.executablePath": "php",
  "php.validate.enable": true,
  "php.suggest.basic": true
}
```

## Usage

### Snippets

Type these prefixes and press Tab:

- `class` - Create a PHP class
- `function` - Create a function
- `foreach` - Foreach loop
- `try` - Try-catch block
- `if` - If statement

### Commands

- **PHP: Run Current File** - Execute the current PHP file
- **PHP: Validate Syntax** - Check for syntax errors
- **PHP: Format Document** - Format your code
- **PHP: Generate PHPUnit Test** - Generate a test file for the symbol at cursor
- **Laravel: Run Artisan Command** - Run artisan commands in an integrated terminal
- **Laravel: Show Routes** - Pick a route name and jump to its definition

## Languages

- `php` - `.php`, `.phtml`, `.php3`, `.php4`, `.php5`, `.phps`
- `blade` - `.blade.php`
- `dql` - `.dql`

## Docs

Feature docs live in `docs/`:

- `docs/01-syntax-highlighting.md`
- `docs/04-go-to-definition.md`
- `docs/07-signature-help-parameter-info.md`
- `docs/09-smart-imports.md`
- `docs/13-code-lens-references.md`
- `docs/14-laravel-support.md`
- `docs/15-doctrine-support.md`
- `docs/18-unit-test-generator.md`

## Requirements

- PHP must be installed and accessible in your PATH (or configured via `php.executablePath`)
- Laravel features require a Laravel workspace (presence of `artisan`)
- Test generation expects PHPUnit (Laravel: `php artisan test`; non-Laravel: `vendor/bin/phpunit` or `phpunit`)
- VS Code 1.60.0 or higher

## Support

For issues and feature requests, please visit the GitHub repository.

## License

MIT
