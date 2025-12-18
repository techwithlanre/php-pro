# Unit Test Generator (PHPUnit)

Generates a basic PHPUnit test file for the class/function/method at the cursor.

Command:

- `PHP: Generate PHPUnit Test` (`php.generateUnitTest`)

Quick Fix:

- `Generate PHPUnit test` (appears when the cursor is on a class/function/method)

Output:

- Laravel projects: `tests/Unit/<Name>Test.php` using `Tests\\TestCase`
- Other projects: `tests/<Name>Test.php` using `PHPUnit\\Framework\\TestCase`

After generation, the extension offers to run tests:

- Laravel: `php artisan test`
- Non-Laravel: `vendor/bin/phpunit` if present, otherwise `phpunit`

Entry point: `php.generateUnitTest` implementation in `extension.js`.

