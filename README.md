# PHP Enhanced Pro

Professional VS Code extension for PHP development with advanced features.

## Features

- 🎨 **Advanced Syntax Highlighting** - Beautiful code highlighting with PHPDoc support
- 🧠 **IntelliSense** - Smart auto-completion with 300+ PHP functions
- 📦 **20+ Code Snippets** - Quick templates for classes, functions, loops, and more
- ✅ **Syntax Validation** - Real-time PHP syntax checking
- 🔍 **Go to Definition** - Jump to class and function definitions
- 📋 **Document Outline** - View all classes and functions at a glance
- 🎯 **Hover Documentation** - See function details on hover
- ⚡ **Run PHP Files** - Execute PHP scripts directly from VS Code
- ⌨️ **Keyboard Shortcuts** - Ctrl+Alt+P to run current file

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

## Requirements

- PHP must be installed and accessible in your PATH
- VS Code 1.60.0 or higher

## Support

For issues and feature requests, please visit the GitHub repository.

## License

MIT
