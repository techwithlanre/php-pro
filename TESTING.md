# Testing Guide for PHP Enhanced Pro

This guide outlines the steps to set up your environment, run the extension in debug mode, and manually verify all features. Currently, there are no automated tests configured for this project, so this guide focuses on manual verification.

## 1. Prerequisites

Before testing, ensure you have the following installed:

*   **Node.js**: (Version 14.x or higher recommended)
*   **VS Code**: Latest version.
*   **PHP**: A valid PHP executable.
    *   **For Laravel Herd users**: Your PHP is likely at `C:\Users\muhja\.config\herd\bin\php83\php.exe`. You will need to configure the extension to use this path (see Troubleshooting section).

## 2. Setting Up the Project

1.  **Clone/Open the repository** in VS Code.
2.  **Install Dependencies**:
    Open the terminal in VS Code (`Ctrl+``) and run:
    ```bash
    npm install
    ```

## 3. Running the Extension (Debug Mode)

To test the extension, we run it in a special "Extension Development Host" window.

1.  Open the **Run and Debug** view in VS Code (click the Play icon on the left sidebar or press `Ctrl+Shift+D`).
2.  Select **"Run Extension"** from the dropdown configuration (if available, otherwise just press F5).
3.  Press **F5**.
4.  A new VS Code window will open. This window has the extension loaded and active. Use this window for all testing steps below.

## 4. Feature Verification Checklist

Open a PHP project or a single PHP file in the **Extension Development Host** window to perform these tests.

### Core PHP Features

- [ ] **Syntax Highlighting** (`docs/01-syntax-highlighting.md`)
    - Open a `.php` file.
    - Verify that keywords (`function`, `class`), variables (`$var`), and strings are colored correctly.

- [ ] **Intellisense / Completions** (`docs/02-intellisense-completions.md`)
    - Type `array_` and verify that a list of array functions appears.
    - Type `php` and check for keyword suggestions.
    - Verify standard PHP constants (e.g., `PHP_VERSION`) are suggested.

- [ ] **Hover Documentation** (`docs/03-hover.md`)
    - Hover over a standard PHP function like `strpos`.
    - **Expected**: You should see a markdown tooltip showing the function signature and category.
    - Hover over a variable to see its inferred type (if likely to be inferred).

- [ ] **Go to Definition** (`docs/04-go-to-definition.md`)
    - Create a class `RefTest` and a function `test()`.
    - Call `test()` in another place.
    - `Ctrl+Click` (or F12) on the call to `test()`.
    - **Expected**: Cursor moves to the function definition.

- [ ] **Document Outline** (`docs/05-document-outline.md`)
    - Open the **Outline** view in the sidebar.
    - **Expected**: It should list all classes, methods, and functions in the current file.

- [ ] **Workspace Symbol Search** (`docs/06-workspace-symbol-search.md`)
    - Press `Ctrl+T` (or `Cmd+T` on Mac).
    - Type the name of a class defined in your workspace.
    - **Expected**: The symbol should appear in the list.

- [ ] **Signature Help** (`docs/07-signature-help-parameter-info.md`)
    - Type `json_encode(`.
    - **Expected**: A popup should appear showing the parameters for `json_encode`.

- [ ] **Smart Imports** (`docs/09-smart-imports.md`)
    - Use a class that hasn't been imported yet (e.g., `use App\Models\User;` is missing).
    - Click the lightbulb icon (Code Action) or press `Ctrl+.`.
    - **Expected**: Modify/Import code action is suggested. _(Note: This depends on the indexing state)_.

- [ ] **Call Hierarchy** (`docs/11-call-hierarchy.md`)
    - Right-click a function definition -> **Peek Call Hierarchy**.
    - **Expected**: See where the function is called.

- [ ] **Code Lens** (`docs/13-code-lens-references.md`)
    - Look above a function or class definition.
    - **Expected**: You should see a small gray text saying "X references" (if used elsewhere).

### Laravel Features

- [ ] **Blade Support** (`docs/14-laravel-support.md`)
    - Open a `.blade.php` file.
    - Verify syntax highlighting works for `@if`, `{{ $var }}`.

- [ ] **Artisan Commands**
    - Open the Command Palette (`Ctrl+Shift+P`).
    - Run `Laravel: Run Artisan Command`.
    - **Expected**: A list of artisan commands (e.g., `route:list`, `migrate`) appears.
    - Select one (e.g., `route:list`) and verify it runs in the terminal.

- [ ] **Route Listing**
    - Run `Laravel: Show Routes`.
    - **Expected**: A quick-pick list of routes appears (requires `php artisan` to work in the workspace).

### Commands & Tools

- [ ] **Run PHP File** (`docs/17-run-php-file.md`)
    - Open a simple PHP script (e.g., `<?php echo "Hello"; ?>`).
    - Run command `PHP: Run Current File`.
    - **Expected**: Output "Hello" appears in the terminal.

- [ ] **Syntax Validation** (`docs/16-syntax-validation.md`)
    - Introduce a syntax error (e.g., missing semicolon).
    - Save the file.
    - **Expected**: Red squiggly line appears under the error.

- [ ] **Unit Test Generation** (`docs/18-unit-test-generator.md`)
    - clear cursor on a class or function.
    - Run `PHP: Generate PHPUnit Test` (or use Code Action).
    - **Expected**: A new test file (e.g., `tests/Unit/ClassNameTest.php`) is created.

## 5. Troubleshooting Reference

*   **"No PHP file is currently open"**: Ensure your active tab is a `.php` file.
*   **"Laravel artisan not found"**: Ensure you opened the *root* of a Laravel project in VS Code.
*   **"php" is not recognized / "PHP executable not found"**:
    *   This means the extension cannot find the `php` command.
    *   **Solution**: Go to **File > Preferences > Settings** (or `Ctrl+,`), search for `php.executablePath`, and set it to your PHP path.
    *   **For Laravel Herd**: Set it to:
        `C:\\Users\\muhja\\.config\\herd\\bin\\php83\\php.exe`
        (or whichever version you prefer).

