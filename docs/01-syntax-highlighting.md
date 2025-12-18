# Syntax Highlighting

## PHP

- Grammar: `syntaxes/php.tmLanguage.json`
- Language id: `php`

Includes PHPDoc highlighting (including Doctrine annotations/attributes).

## Blade (Laravel)

- Grammar: `syntaxes/blade.tmLanguage.json`
- Language id: `blade`

Highlights:

- Blade directives like `@if`, `@foreach`, `@extends`
- Echo blocks `{{ ... }}` and `{!! ... !!}` with embedded PHP highlighting
- Blade comments `{{-- ... --}}`
- Blade component tags like `<x-alert>` and attributes

## Doctrine DQL

- Grammar: `syntaxes/dql.tmLanguage.json`
- Language id: `dql`

Highlights DQL keywords, parameters (`:name`, `?1`), strings, numbers, and identifiers.

