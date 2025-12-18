# Laravel Support

## Blade

Blade syntax is supported via the `blade` language id and grammar.

## Artisan

Command: `Laravel: Run Artisan Command` (`laravel.artisan`)

Runs the selected artisan command in an integrated terminal.

## Route Navigation

- Indexes route names from `routes/**/*.php` by scanning `->name('...')` patterns
- Go-to-definition works from `route('name')` usages in PHP and Blade files

Entry points:

- Route index: `ensureLaravelRouteIndex(...)` in `extension.js`
- Commands: `laravel.artisan` and `laravel.routeList` in `extension.js`

