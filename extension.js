const vscode = require('vscode');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const phpKeywords = [
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch',
  'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do',
  'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach',
  'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final',
  'finally', 'fn', 'for', 'foreach', 'function', 'global', 'goto', 'if',
  'implements', 'include', 'include_once', 'instanceof', 'insteadof',
  'interface', 'isset', 'list', 'match', 'namespace', 'new', 'or', 'print',
  'private', 'protected', 'public', 'readonly', 'require', 'require_once',
  'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use',
  'var', 'while', 'xor', 'yield', 'enum'
];

const phpFunctions = {
  'Array Functions': ['array_change_key_case', 'array_chunk', 'array_column', 'array_combine', 'array_count_values', 'array_diff', 'array_diff_assoc', 'array_diff_key', 'array_diff_uassoc', 'array_diff_ukey', 'array_fill', 'array_fill_keys', 'array_filter', 'array_flip', 'array_intersect', 'array_intersect_assoc', 'array_intersect_key', 'array_intersect_uassoc', 'array_intersect_ukey', 'array_key_exists', 'array_key_first', 'array_key_last', 'array_keys', 'array_map', 'array_merge', 'array_merge_recursive', 'array_multisort', 'array_pad', 'array_pop', 'array_product', 'array_push', 'array_rand', 'array_reduce', 'array_replace', 'array_replace_recursive', 'array_reverse', 'array_search', 'array_shift', 'array_slice', 'array_splice', 'array_sum', 'array_udiff', 'array_udiff_assoc', 'array_udiff_uassoc', 'array_uintersect', 'array_uintersect_assoc', 'array_uintersect_uassoc', 'array_unique', 'array_unshift', 'array_values', 'array_walk', 'array_walk_recursive', 'arsort', 'asort', 'compact', 'count', 'current', 'end', 'extract', 'in_array', 'key', 'krsort', 'ksort', 'natcasesort', 'natsort', 'next', 'prev', 'range', 'reset', 'rsort', 'shuffle', 'sizeof', 'sort', 'uasort', 'uksort', 'usort'],
  'String Functions': ['addcslashes', 'addslashes', 'bin2hex', 'chop', 'chr', 'chunk_split', 'convert_uudecode', 'convert_uuencode', 'crc32', 'explode', 'get_html_translation_table', 'hebrev', 'hebrevc', 'hex2bin', 'html_entity_decode', 'htmlentities', 'htmlspecialchars', 'htmlspecialchars_decode', 'implode', 'join', 'lcfirst', 'levenshtein', 'localeconv', 'ltrim', 'md5', 'md5_file', 'metaphone', 'nl2br', 'number_format', 'ord', 'parse_str', 'print', 'printf', 'quoted_printable_decode', 'quoted_printable_encode', 'rtrim', 'sha1', 'sha1_file', 'similar_text', 'soundex', 'sprintf', 'sscanf', 'str_contains', 'str_ends_with', 'str_getcsv', 'str_ireplace', 'str_pad', 'str_repeat', 'str_replace', 'str_rot13', 'str_shuffle', 'str_split', 'str_starts_with', 'str_word_count', 'strcasecmp', 'strchr', 'strcmp', 'strcspn', 'strip_tags', 'stripcslashes', 'stripos', 'stripslashes', 'stristr', 'strlen', 'strnatcasecmp', 'strnatcmp', 'strncasecmp', 'strncmp', 'strpbrk', 'strpos', 'strrchr', 'strrev', 'strripos', 'strrpos', 'strspn', 'strstr', 'strtok', 'strtolower', 'strtoupper', 'strtr', 'substr', 'substr_compare', 'substr_count', 'substr_replace', 'trim', 'ucfirst', 'ucwords', 'wordwrap'],
  'File System': ['basename', 'chgrp', 'chmod', 'chown', 'clearstatcache', 'copy', 'dirname', 'disk_free_space', 'disk_total_space', 'fclose', 'feof', 'fflush', 'fgetc', 'fgetcsv', 'fgets', 'file', 'file_exists', 'file_get_contents', 'file_put_contents', 'fileatime', 'filectime', 'filegroup', 'fileinode', 'filemtime', 'fileowner', 'fileperms', 'filesize', 'filetype', 'flock', 'fnmatch', 'fopen', 'fpassthru', 'fread', 'fseek', 'ftell', 'ftruncate', 'fwrite', 'glob', 'is_dir', 'is_executable', 'is_file', 'is_link', 'is_readable', 'is_uploaded_file', 'is_writable', 'link', 'linkinfo', 'lstat', 'mkdir', 'move_uploaded_file', 'opendir', 'pathinfo', 'pclose', 'popen', 'readfile', 'readdir', 'readlink', 'realpath', 'realpath_cache_get', 'realpath_cache_size', 'rename', 'rewind', 'rewinddir', 'rmdir', 'scandir', 'stat', 'symlink', 'sys_get_temp_dir', 'tempnam', 'tmpfile', 'touch', 'umask', 'unlink'],
  'Date/Time': ['checkdate', 'date', 'date_add', 'date_create', 'date_create_from_format', 'date_default_timezone_get', 'date_default_timezone_set', 'date_diff', 'date_format', 'date_get_last_errors', 'date_parse', 'date_parse_from_format', 'date_sub', 'date_sun_info', 'date_sunrise', 'date_sunset', 'date_timestamp_get', 'date_timestamp_set', 'getdate', 'gettimeofday', 'gmdate', 'gmmktime', 'hrtime', 'idate', 'microtime', 'mktime', 'strftime', 'strtotime', 'time', 'timezone_identifiers_list', 'timezone_location_get', 'timezone_name_get', 'timezone_offset_get', 'timezone_open', 'timezone_transitions_get', 'timezone_version_get'],
  'JSON': ['json_decode', 'json_encode', 'json_last_error', 'json_last_error_msg'],
  'Session': ['session_abort', 'session_cache_expire', 'session_cache_limiter', 'session_commit', 'session_create_id', 'session_decode', 'session_destroy', 'session_encode', 'session_get_cookie_params', 'session_id', 'session_name', 'session_regenerate_id', 'session_reset', 'session_save_path', 'session_set_cookie_params', 'session_set_save_handler', 'session_start', 'session_status', 'session_unset', 'session_write_close'],
  'Database (MySQLi)': ['mysqli_affected_rows', 'mysqli_autocommit', 'mysqli_begin_transaction', 'mysqli_change_user', 'mysqli_close', 'mysqli_commit', 'mysqli_connect', 'mysqli_connect_errno', 'mysqli_connect_error', 'mysqli_data_seek', 'mysqli_dump_debug_info', 'mysqli_errno', 'mysqli_error', 'mysqli_fetch_all', 'mysqli_fetch_array', 'mysqli_fetch_assoc', 'mysqli_fetch_field', 'mysqli_fetch_field_direct', 'mysqli_fetch_fields', 'mysqli_fetch_lengths', 'mysqli_fetch_object', 'mysqli_fetch_row', 'mysqli_field_count', 'mysqli_field_seek', 'mysqli_free_result', 'mysqli_get_client_info', 'mysqli_get_connection_stats', 'mysqli_get_host_info', 'mysqli_get_proto_info', 'mysqli_get_server_info', 'mysqli_info', 'mysqli_init', 'mysqli_insert_id', 'mysqli_more_results', 'mysqli_multi_query', 'mysqli_next_result', 'mysqli_num_fields', 'mysqli_num_rows', 'mysqli_options', 'mysqli_ping', 'mysqli_prepare', 'mysqli_query', 'mysqli_real_escape_string', 'mysqli_real_query', 'mysqli_rollback', 'mysqli_select_db', 'mysqli_set_charset', 'mysqli_sqlstate', 'mysqli_stat', 'mysqli_stmt_affected_rows', 'mysqli_stmt_bind_param', 'mysqli_stmt_bind_result', 'mysqli_stmt_close', 'mysqli_stmt_error', 'mysqli_stmt_errno', 'mysqli_stmt_execute', 'mysqli_stmt_fetch', 'mysqli_stmt_get_result', 'mysqli_stmt_init', 'mysqli_stmt_num_rows', 'mysqli_stmt_result_metadata', 'mysqli_stmt_store_result', 'mysqli_store_result', 'mysqli_thread_id', 'mysqli_use_result', 'mysqli_warning_count'],
  'Password': ['password_algos', 'password_get_info', 'password_hash', 'password_needs_rehash', 'password_verify'],
  'Math': ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'base_convert', 'bindec', 'ceil', 'cos', 'cosh', 'decbin', 'dechex', 'decoct', 'deg2rad', 'exp', 'expm1', 'floor', 'fmod', 'fdiv', 'hexdec', 'hypot', 'intdiv', 'is_finite', 'is_infinite', 'is_nan', 'lcg_value', 'log', 'log10', 'log1p', 'max', 'min', 'octdec', 'pi', 'pow', 'rad2deg', 'rand', 'random_bytes', 'random_int', 'round', 'sin', 'sinh', 'sqrt', 'tan', 'tanh'],
  'Variable/Type': ['boolval', 'class_alias', 'class_exists', 'class_implements', 'class_parents', 'constant', 'defined', 'doubleval', 'floatval', 'function_exists', 'get_called_class', 'get_class', 'get_class_methods', 'get_class_vars', 'get_declared_classes', 'get_declared_interfaces', 'get_declared_traits', 'get_defined_constants', 'get_defined_functions', 'get_defined_vars', 'get_object_vars', 'get_parent_class', 'get_resource_id', 'get_resource_type', 'gettype', 'intval', 'interface_exists', 'is_array', 'is_bool', 'is_callable', 'is_countable', 'is_double', 'is_float', 'is_int', 'is_integer', 'is_iterable', 'is_long', 'is_null', 'is_numeric', 'is_object', 'is_resource', 'is_scalar', 'is_string', 'method_exists', 'property_exists', 'settype', 'strval', 'trait_exists'],
  'Environment': ['connection_aborted', 'connection_status', 'connection_timeout', 'constant', 'define', 'defined', 'get_cfg_var', 'get_current_user', 'getcwd', 'getenv', 'gethostname', 'getmypid', 'getmyuid', 'getmygid', 'getmyinode', 'getlastmod', 'getopt', 'getrusage', 'ini_get', 'ini_get_all', 'ini_restore', 'ini_set', 'memory_get_peak_usage', 'memory_get_usage', 'php_sapi_name', 'php_uname', 'phpversion', 'putenv', 'set_time_limit', 'sleep', 'sys_getloadavg', 'usleep', 'uniqid'],
  'URL/HTTP': ['base64_decode', 'base64_encode', 'get_headers', 'header', 'header_remove', 'headers_list', 'headers_sent', 'http_build_query', 'parse_url', 'rawurldecode', 'rawurlencode', 'setcookie', 'urldecode', 'urlencode'],
  'cURL': ['curl_close', 'curl_copy_handle', 'curl_errno', 'curl_error', 'curl_escape', 'curl_exec', 'curl_getinfo', 'curl_init', 'curl_multi_add_handle', 'curl_multi_close', 'curl_multi_exec', 'curl_multi_getcontent', 'curl_multi_init', 'curl_multi_remove_handle', 'curl_multi_select', 'curl_pause', 'curl_reset', 'curl_setopt', 'curl_setopt_array', 'curl_share_close', 'curl_share_init', 'curl_share_setopt', 'curl_strerror', 'curl_unescape', 'curl_version'],
  'Hashing/Crypto': ['crypt', 'hash', 'hash_algos', 'hash_copy', 'hash_file', 'hash_final', 'hash_hkdf', 'hash_hmac', 'hash_hmac_file', 'hash_init', 'hash_pbkdf2', 'hash_update', 'hash_update_file', 'hash_update_stream', 'md5', 'md5_file', 'sha1', 'sha1_file'],
  'OpenSSL': ['openssl_cipher_iv_length', 'openssl_decrypt', 'openssl_digest', 'openssl_encrypt', 'openssl_error_string', 'openssl_get_cert_locations', 'openssl_open', 'openssl_pkcs7_decrypt', 'openssl_pkcs7_encrypt', 'openssl_pkcs7_read', 'openssl_pkcs7_sign', 'openssl_pkcs7_verify', 'openssl_pkey_export', 'openssl_pkey_export_to_file', 'openssl_pkey_free', 'openssl_pkey_get_private', 'openssl_pkey_get_public', 'openssl_pkey_new', 'openssl_private_decrypt', 'openssl_private_encrypt', 'openssl_public_decrypt', 'openssl_public_encrypt', 'openssl_random_pseudo_bytes', 'openssl_seal', 'openssl_sign', 'openssl_verify', 'openssl_x509_checkpurpose', 'openssl_x509_fingerprint', 'openssl_x509_free', 'openssl_x509_parse', 'openssl_x509_read'],
  'Multibyte (mbstring)': ['mb_check_encoding', 'mb_chr', 'mb_convert_case', 'mb_convert_encoding', 'mb_convert_kana', 'mb_convert_variables', 'mb_decode_mimeheader', 'mb_decode_numericentity', 'mb_detect_encoding', 'mb_detect_order', 'mb_encode_mimeheader', 'mb_encode_numericentity', 'mb_ereg', 'mb_ereg_match', 'mb_ereg_replace', 'mb_ereg_search', 'mb_ereg_search_getpos', 'mb_ereg_search_getregs', 'mb_ereg_search_init', 'mb_ereg_search_pos', 'mb_ereg_search_regs', 'mb_ereg_search_setpos', 'mb_get_info', 'mb_http_input', 'mb_http_output', 'mb_internal_encoding', 'mb_language', 'mb_list_encodings', 'mb_ord', 'mb_output_handler', 'mb_parse_str', 'mb_regex_encoding', 'mb_send_mail', 'mb_split', 'mb_strcut', 'mb_strimwidth', 'mb_strlen', 'mb_strpos', 'mb_strrpos', 'mb_strtolower', 'mb_strtoupper', 'mb_strwidth', 'mb_substitute_character', 'mb_substr', 'mb_substr_count'],
  'Filter': ['filter_has_var', 'filter_id', 'filter_input', 'filter_input_array', 'filter_list', 'filter_var', 'filter_var_array'],
  'Streams': ['stream_bucket_append', 'stream_bucket_make_writeable', 'stream_bucket_new', 'stream_bucket_prepend', 'stream_context_create', 'stream_context_get_default', 'stream_context_get_options', 'stream_context_get_params', 'stream_context_set_default', 'stream_context_set_option', 'stream_context_set_params', 'stream_copy_to_stream', 'stream_filter_append', 'stream_filter_prepend', 'stream_filter_register', 'stream_get_contents', 'stream_get_filters', 'stream_get_line', 'stream_get_meta_data', 'stream_get_transports', 'stream_get_wrappers', 'stream_is_local', 'stream_notification_callback', 'stream_resolve_include_path', 'stream_select', 'stream_set_blocking', 'stream_set_chunk_size', 'stream_set_read_buffer', 'stream_set_timeout', 'stream_set_write_buffer', 'stream_socket_accept', 'stream_socket_client', 'stream_socket_get_name', 'stream_socket_pair', 'stream_socket_recvfrom', 'stream_socket_sendto', 'stream_socket_server', 'stream_socket_shutdown'],
  'SPL': ['class_uses', 'iterator_apply', 'iterator_count', 'iterator_to_array', 'spl_autoload', 'spl_autoload_call', 'spl_autoload_extensions', 'spl_autoload_functions', 'spl_autoload_register', 'spl_autoload_unregister', 'spl_classes', 'spl_object_hash', 'spl_object_id'],
  'Serialization': ['serialize', 'unserialize'],
  'Tokenizer': ['token_get_all', 'token_name'],
  'Regular Expressions': ['preg_filter', 'preg_grep', 'preg_last_error', 'preg_last_error_msg', 'preg_match', 'preg_match_all', 'preg_quote', 'preg_replace', 'preg_replace_callback', 'preg_replace_callback_array', 'preg_split'],
  'Output Control': ['flush', 'ob_clean', 'ob_end_clean', 'ob_end_flush', 'ob_flush', 'ob_get_clean', 'ob_get_contents', 'ob_get_flush', 'ob_get_length', 'ob_get_level', 'ob_get_status', 'ob_gzhandler', 'ob_implicit_flush', 'ob_list_handlers', 'ob_start', 'output_add_rewrite_var', 'output_reset_rewrite_vars'],
  'Error/Debug': ['assert', 'assert_options', 'debug_backtrace', 'debug_print_backtrace', 'error_clear_last', 'error_get_last', 'error_log', 'error_reporting', 'restore_error_handler', 'restore_exception_handler', 'set_error_handler', 'set_exception_handler', 'trigger_error', 'var_dump', 'var_export', 'print_r']
};

const phpFunctionCategoryOrder = [
  'Array Functions',
  'String Functions',
  'Regular Expressions',
  'Math',
  'Date/Time',
  'File System',
  'Streams',
  'URL/HTTP',
  'JSON',
  'Session',
  'Database (MySQLi)',
  'Password',
  'Hashing/Crypto',
  'OpenSSL',
  'Multibyte (mbstring)',
  'Filter',
  'Serialization',
  'Tokenizer',
  'SPL',
  'Variable/Type',
  'Environment',
  'Output Control',
  'Error/Debug'
];

function normalizePhpFunctionsByCategory(source, preferredOrder) {
  const seen = new Set();
  const normalized = Object.create(null);
  const categories = [];
  const pushed = new Set();
  for (const category of preferredOrder) {
    if (!pushed.has(category)) {
      categories.push(category);
      pushed.add(category);
    }
  }
  for (const category of Object.keys(source).sort((a, b) => a.localeCompare(b))) {
    if (!pushed.has(category)) {
      categories.push(category);
      pushed.add(category);
    }
  }

  for (const category of categories) {
    const funcs = source[category];
    if (!Array.isArray(funcs) || funcs.length === 0) continue;
    const sortedUnique = Array.from(new Set(funcs)).sort((a, b) => a.localeCompare(b));
    const filtered = sortedUnique.filter((fn) => {
      if (seen.has(fn)) return false;
      seen.add(fn);
      return true;
    });
    if (filtered.length > 0) normalized[category] = filtered;
  }

  return normalized;
}

const phpFunctionsByCategory = normalizePhpFunctionsByCategory(phpFunctions, phpFunctionCategoryOrder);
const phpFunctionCategoryByName = (() => {
  const map = Object.create(null);
  for (const [category, functions] of Object.entries(phpFunctionsByCategory)) {
    for (const fn of functions) map[fn] = category;
  }
  return map;
})();

const phpSnippets = {
  'class': { prefix: ['class', 'cl', 'cls'], body: ['class ${1:ClassName}', '{', '\tprivate ${2:\\$property};', '', '\tpublic function __construct(${3:\\$param})', '\t{', '\t\t\\$this->${2:property} = ${3:\\$param};', '\t}', '', '\tpublic function ${4:methodName}()', '\t{', '\t\t${5:// method body}', '\t}', '}'], description: 'Create a PHP class' },
  'function': { prefix: ['function', 'func', 'fn', 'fun'], body: ['function ${1:functionName}(${2:\\$params}): ${3:void}', '{', '\t${4:// function body}', '}'], description: 'Create a PHP function' },
  'foreach': { prefix: ['foreach', 'fe', 'fore', 'each'], body: ['foreach (${1:\\$array} as ${2:\\$key} => ${3:\\$value}) {', '\t${4:// code}', '}'], description: 'Foreach loop' },
  'if': { prefix: ['if', 'iff'], body: ['if (${1:condition}) {', '\t${2:// code}', '}'], description: 'If statement' },
  'ifelse': { prefix: ['ifelse', 'ife', 'ifelsee'], body: ['if (${1:condition}) {', '\t${2:// code}', '} else {', '\t${3:// code}', '}'], description: 'If-else statement' },
  'switch': { prefix: ['switch', 'sw'], body: ['switch (${1:expression}) {', '\tcase ${2:value}:', '\t\t${3:// code}', '\t\tbreak;', '\tdefault:', '\t\t${4:// code}', '}'], description: 'Switch statement' },
  'trycatch': { prefix: ['try', 'trycatch', 'tc'], body: ['try {', '\t${1:// code}', '} catch (${2:Exception} ${3:\\$e}) {', '\t${4:// handle exception}', '}'], description: 'Try-catch block' },
  'prop': { prefix: ['prop', 'property', 'priv'], body: ['private ${1:type} \\$${2:name};'], description: 'Private property' },
  'pubfn': { prefix: ['pubfn', 'publicfn', 'pubf'], body: ['public function ${1:methodName}(${2:\\$params}): ${3:void}', '{', '\t${4:// code}', '}'], description: 'Public method' },
  'prifn': { prefix: ['prifn', 'privatefn', 'prif'], body: ['private function ${1:methodName}(${2:\\$params}): ${3:void}', '{', '\t${4:// code}', '}'], description: 'Private method' },
  'namespace': { prefix: ['namespace', 'ns'], body: ['namespace ${1:Vendor\\\\Package};'], description: 'Namespace declaration' },
  'use': { prefix: ['use', 'import'], body: ['use ${1:Vendor\\\\Package\\\\ClassName};'], description: 'Use/import statement' }
};

const phpMagicMethods = ['__construct', '__destruct', '__call', '__callStatic', '__get', '__set', '__isset', '__unset', '__sleep', '__wakeup', '__serialize', '__unserialize', '__toString', '__invoke', '__set_state', '__clone', '__debugInfo'];

const phpConstants = ['PHP_VERSION', 'PHP_OS', 'PHP_EOL', 'PHP_INT_MAX', 'PHP_INT_MIN', 'true', 'false', 'null', 'TRUE', 'FALSE', 'NULL', '__LINE__', '__FILE__', '__DIR__', '__FUNCTION__', '__CLASS__', '__TRAIT__', '__METHOD__', '__NAMESPACE__'];

let diagnosticCollection;
let lastPhpExecutableErrorAt = 0;
let phpWorkspaceIndexBuilding = null;
const phpWorkspaceIndex = new Map();
const phpWorkspaceIndexKeysByUri = new Map();
let phpWorkspaceIndexVersion = 0;
const phpWorkspaceMembersCache = new Map();
const phpWorkspaceSymbolInfo = new Map();
const phpWorkspaceClassInfoByFqn = new Map();
const phpWorkspaceClassFqnsByShortName = new Map();
const phpWorkspaceFunctionInfoByKey = new Map();
const phpBuiltInFunctionSignatureCache = new Map();
let laravelRouteIndexBuilding = null;
const laravelRouteIndex = new Map();
const laravelRouteIndexKeysByUri = new Map();
let laravelRouteIndexVersion = 0;

function activate(context) {
  console.log('PHP Enhanced Pro extension activated');
  diagnosticCollection = vscode.languages.createDiagnosticCollection('php');
  context.subscriptions.push(diagnosticCollection);
  const validationTimersByUri = new Map();
  const phpIndexTimersByUri = new Map();
  const laravelIndexTimersByUri = new Map();

  ensurePhpWorkspaceIndex();
  ensureLaravelRouteIndex();

  const completionProvider = vscode.languages.registerCompletionItemProvider('php', {
    async provideCompletionItems(document, position, token, context) {
      const ctx = getPhpCompletionContext(document, position);
      if (ctx.inComment) return [];
      if (ctx.inString && !ctx.isInterpolatedString) return [];

      const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
      const triggerChar = context && context.triggerCharacter ? context.triggerCharacter : '';

      const memberMatch = linePrefix.match(/->\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)?$/);
      if (memberMatch) {
        await ensurePhpWorkspaceIndex();
        const className = findEnclosingPhpClassName(document, position);
        if (!className) return [];
        return createPhpMemberCompletionItems(className, { includeInstance: true, includeStatic: false });
      }

      const staticMatch = linePrefix.match(/([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*|self|static|parent)\s*::\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)?$/);
      if (staticMatch) {
        await ensurePhpWorkspaceIndex();
        const classToken = staticMatch[1];
        const text = document.getText();
        let classNameOrFqn = classToken;
        if (classToken === 'self' || classToken === 'static' || classToken === 'parent') {
          const enclosing = findEnclosingPhpClassName(document, position);
          if (enclosing) classNameOrFqn = enclosing;
        } else {
          classNameOrFqn = resolvePhpClassTokenInDocument(text, classToken) || classToken;
        }
        return createPhpMemberCompletionItems(classNameOrFqn, { includeInstance: false, includeStatic: true });
      }

      const variableMatch = linePrefix.match(/\$[A-Za-z_\x80-\xff][\w\x80-\xff]*$/) || triggerChar === '$';
      if (variableMatch) return createPhpVariableCompletionItems(document);

      const classCtx = getPhpClassCompletionContext(linePrefix);
      if (classCtx) {
        await ensurePhpWorkspaceIndex();
        return createPhpClassCompletionItems(document, position, classCtx);
      }

      const items = [];

      if (!ctx.inString) {
        phpKeywords.forEach(keyword => {
          const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
          item.detail = 'PHP Keyword';
          item.sortText = '0' + keyword;
          items.push(item);
        });
      }

      Object.entries(phpFunctionsByCategory).forEach(([category, functions], categoryIndex) => {
        functions.forEach(func => {
          const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
          item.detail = `${category} - PHP Function`;
          item.insertText = new vscode.SnippetString(`${func}($1)$0`);
          item.sortText = `1${String(categoryIndex).padStart(2, '0')}${func}`;
          items.push(item);
        });
      });

      phpConstants.forEach(constant => {
        const item = new vscode.CompletionItem(constant, vscode.CompletionItemKind.Constant);
        item.detail = 'PHP Constant';
        item.sortText = `2${constant}`;
        items.push(item);
      });

      if (!ctx.inString) {
        phpMagicMethods.forEach(method => {
          const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
          item.detail = 'PHP Magic Method';
          item.sortText = `3${method}`;
          items.push(item);
        });
        Object.keys(phpSnippets).forEach(key => {
          const snippet = phpSnippets[key];
          const prefixes = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
          prefixes.forEach(prefix => {
            const item = new vscode.CompletionItem(prefix, vscode.CompletionItemKind.Snippet);
            item.insertText = new vscode.SnippetString(Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body);
            item.detail = snippet.description;
            item.sortText = `4${prefix}`;
            items.push(item);
          });
        });
      }

      return items;
    }
  }, '.', '>', ':', '$', '\\');

  const hoverProvider = vscode.languages.registerHoverProvider('php', {
    async provideHover(document, position) {
      const varRange = document.getWordRangeAtPosition(position, /\$[A-Za-z_\x80-\xff][\w\x80-\xff]*/);
      if (varRange) {
        const name = document.getText(varRange);
        const inferred = inferPhpVariableTypes(document, position);
        const type = inferred.get(name);
        if (type) return new vscode.Hover(new vscode.MarkdownString(`\`${name}\`: \`${type}\``));
      }

      const range = document.getWordRangeAtPosition(position, /[\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*/);
      if (!range) return;
      const word = document.getText(range);
      if (!word) return;

      const plain = word.replace(/^\\+/, '');
      if (phpKeywords.includes(plain)) {
        return new vscode.Hover(new vscode.MarkdownString(`**PHP Keyword**: \`${plain}\``));
      }

      await ensurePhpWorkspaceIndex();
      const sigs = resolvePhpSignatureForReference(document, position, plain);
      if (sigs && sigs.length > 0) {
        const md = new vscode.MarkdownString();
        md.appendCodeblock(sigs[0].label, 'php');
        return new vscode.Hover(md);
      }

      const category = phpFunctionCategoryByName[plain];
      if (category) return new vscode.Hover(new vscode.MarkdownString(`**PHP Function**: \`${plain}()\`\n\nCategory: ${category}`));
    }
  });

  const definitionProvider = vscode.languages.registerDefinitionProvider('php', {
    async provideDefinition(document, position) {
      const routeName = getLaravelRouteNameAtPosition(document, position);
      if (routeName) {
        await ensureLaravelRouteIndex();
        const locs = laravelRouteIndex.get(routeName);
        if (locs && locs.length > 0) return locs;
      }

      const reference = getPhpReferenceAtPosition(document, position);
      if (!reference) return;

      const local = findLocalPhpDefinition(document, position, reference);
      if (local) return local;

      await ensurePhpWorkspaceIndex();

      const resolved = resolvePhpReferenceFromIndex(document, position, reference);
      if (resolved && resolved.length > 0) return resolved;
    }
  });

  const bladeDefinitionProvider = vscode.languages.registerDefinitionProvider('blade', {
    async provideDefinition(document, position) {
      const routeName = getLaravelRouteNameAtPosition(document, position);
      if (!routeName) return;
      await ensureLaravelRouteIndex();
      const locs = laravelRouteIndex.get(routeName);
      if (locs && locs.length > 0) return locs;
    }
  });

  const symbolProvider = vscode.languages.registerDocumentSymbolProvider('php', {
    provideDocumentSymbols(document) {
      return buildPhpDocumentSymbols(document);
    }
  });

  const workspaceSymbolProvider = vscode.languages.registerWorkspaceSymbolProvider({
    async provideWorkspaceSymbols(query) {
      await ensurePhpWorkspaceIndex();
      const normalizedQuery = String(query || '').trim().toLowerCase();
      const results = [];
      for (const [key, locs] of phpWorkspaceIndex.entries()) {
        if (!locs || locs.length === 0) continue;
        const label = String(key);
        if (normalizedQuery && !label.toLowerCase().includes(normalizedQuery)) continue;
        const infoList = phpWorkspaceSymbolInfo.get(key);
        const kind = infoList && infoList.length > 0 ? infoList[0].kind : vscode.SymbolKind.Variable;
        const location = locs[0];
        const containerName = infoList && infoList.length > 0 ? (infoList[0].containerName || '') : '';
        results.push(new vscode.SymbolInformation(label, kind, containerName, location));
        if (results.length >= 250) break;
      }
      return results;
    }
  });

  const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider('php', {
    async provideSignatureHelp(document, position) {
      const call = getPhpCallExpressionAtPosition(document, position);
      if (!call) return;

      await ensurePhpWorkspaceIndex();

      const signatureCandidates = await resolvePhpSignatureForCall(document, position, call);
      if (!signatureCandidates || signatureCandidates.length === 0) return;

      const help = new vscode.SignatureHelp();
      help.activeSignature = 0;
      help.activeParameter = Math.max(0, call.activeParameter || 0);
      help.signatures = signatureCandidates.map((sig) => {
        const s = new vscode.SignatureInformation(sig.label, sig.documentation || undefined);
        s.parameters = (sig.parameters || []).map((p) => new vscode.ParameterInformation(p.label, p.documentation || undefined));
        return s;
      });
      return help;
    }
  }, '(', ',');

  const semanticTokensProvider = createPhpSemanticTokensProvider();

  const callHierarchyProvider = vscode.languages.registerCallHierarchyProvider('php', {
    async prepareCallHierarchy(document, position) {
      await ensurePhpWorkspaceIndex();
      const item = getPhpCallHierarchyItemAtPosition(document, position);
      if (!item) return;
      return [item];
    },
    async provideCallHierarchyIncomingCalls(item) {
      await ensurePhpWorkspaceIndex();
      return providePhpIncomingCalls(item);
    },
    async provideCallHierarchyOutgoingCalls(item) {
      await ensurePhpWorkspaceIndex();
      return providePhpOutgoingCalls(item);
    }
  });

  const typeHierarchyProvider = vscode.languages.registerTypeHierarchyProvider('php', {
    async prepareTypeHierarchy(document, position) {
      await ensurePhpWorkspaceIndex();
      const item = getPhpTypeHierarchyItemAtPosition(document, position);
      if (!item) return;
      return [item];
    },
    async provideTypeHierarchySupertypes(item) {
      await ensurePhpWorkspaceIndex();
      return providePhpSupertypes(item);
    },
    async provideTypeHierarchySubtypes(item) {
      await ensurePhpWorkspaceIndex();
      return providePhpSubtypes(item);
    }
  });

  const importCodeActionProvider = vscode.languages.registerCodeActionsProvider('php', {
    async provideCodeActions(document, range, context) {
      await ensurePhpWorkspaceIndex();
      return providePhpImportCodeActions(document, range, context);
    }
  }, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.SourceOrganizeImports] });

  const unitTestCodeActionProvider = vscode.languages.registerCodeActionsProvider('php', {
    async provideCodeActions(document, range, context) {
      const actions = [];
      const symbol = getPhpTestTargetAtPosition(document, range.start);
      if (!symbol) return actions;
      const action = new vscode.CodeAction('Generate PHPUnit test', vscode.CodeActionKind.QuickFix);
      action.command = { command: 'php.generateUnitTest', title: 'Generate PHPUnit test', arguments: [document.uri.toString(), range.start] };
      action.isPreferred = true;
      actions.push(action);
      return actions;
    }
  }, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] });

  const runFileCommand = vscode.commands.registerCommand('php.runFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'php') {
      vscode.window.showErrorMessage('No PHP file is currently open');
      return;
    }
    const filePath = editor.document.uri.fsPath;
    const config = vscode.workspace.getConfiguration('php');
    const phpPath = config.get('executablePath', 'php');
    const terminal = vscode.window.createTerminal('PHP');
    terminal.show();
    terminal.sendText(`${phpPath} "${filePath}"`);
  });

  const validateCommand = vscode.commands.registerCommand('php.validateFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'php') {
      validatePhpFile(editor.document, { showMessages: true });
    }
  });

  const scheduleValidation = (document, delayMs = 500) => {
    if (!document || document.languageId !== 'php') return;
    const config = vscode.workspace.getConfiguration('php');
    if (!config.get('validate.enable')) return;
    const key = document.uri.toString();
    const existingTimer = validationTimersByUri.get(key);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      validationTimersByUri.delete(key);
      validatePhpFile(document, { showMessages: false });
    }, delayMs);
    validationTimersByUri.set(key, timer);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => scheduleValidation(document, 0)),
    vscode.workspace.onDidSaveTextDocument((document) => scheduleValidation(document, 0)),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleValidation(event.document, 500)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      const existingTimer = validationTimersByUri.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      validationTimersByUri.delete(key);
      if (document.languageId === 'php') diagnosticCollection.delete(document.uri);
    })
  );

  vscode.workspace.textDocuments.forEach((doc) => scheduleValidation(doc, 0));

  const scheduleIndexUpdate = (document, delayMs = 750) => {
    if (!document || document.languageId !== 'php') return;
    const key = document.uri.toString();
    const existingTimer = phpIndexTimersByUri.get(key);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      phpIndexTimersByUri.delete(key);
      updatePhpIndexForDocument(document);
    }, delayMs);
    phpIndexTimersByUri.set(key, timer);
  };

  const scheduleLaravelIndexUpdate = (document, delayMs = 750) => {
    if (!document || document.languageId !== 'php') return;
    if (!isLaravelRouteDocument(document)) return;
    const key = document.uri.toString();
    const existingTimer = laravelIndexTimersByUri.get(key);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      laravelIndexTimersByUri.delete(key);
      updateLaravelRouteIndexForDocument(document);
    }, delayMs);
    laravelIndexTimersByUri.set(key, timer);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => scheduleIndexUpdate(document, 0)),
    vscode.workspace.onDidSaveTextDocument((document) => scheduleIndexUpdate(document, 0)),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleIndexUpdate(event.document, 1250)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      const existingTimer = phpIndexTimersByUri.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      phpIndexTimersByUri.delete(key);
      deletePhpIndexForUri(document.uri);
    })
  );

  vscode.workspace.textDocuments.forEach((doc) => scheduleIndexUpdate(doc, 0));

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => scheduleLaravelIndexUpdate(document, 0)),
    vscode.workspace.onDidSaveTextDocument((document) => scheduleLaravelIndexUpdate(document, 0)),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleLaravelIndexUpdate(event.document, 1250)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      const existingTimer = laravelIndexTimersByUri.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      laravelIndexTimersByUri.delete(key);
      deleteLaravelRouteIndexForUri(document.uri);
    })
  );

  vscode.workspace.textDocuments.forEach((doc) => scheduleLaravelIndexUpdate(doc, 0));

  const laravelArtisanCommand = vscode.commands.registerCommand('laravel.artisan', async () => {
    const root = getWorkspaceRootPath();
    if (!root) return;
    const artisanPath = path.join(root, 'artisan');
    if (!fs.existsSync(artisanPath)) {
      vscode.window.showErrorMessage('Laravel artisan not found in workspace root');
      return;
    }
    const quick = await vscode.window.showQuickPick(
      [
        { label: 'route:list', description: 'List all registered routes' },
        { label: 'cache:clear', description: 'Clear application cache' },
        { label: 'config:clear', description: 'Remove configuration cache' },
        { label: 'route:clear', description: 'Remove route cache' },
        { label: 'view:clear', description: 'Clear compiled view files' },
        { label: 'migrate', description: 'Run database migrations' },
        { label: 'tinker', description: 'Interact with the application' },
        { label: 'Custom...', description: 'Enter any artisan command' }
      ],
      { placeHolder: 'Select an artisan command' }
    );
    if (!quick) return;
    let commandText = quick.label;
    if (commandText === 'Custom...') {
      const input = await vscode.window.showInputBox({ placeHolder: 'artisan command (e.g. make:model User -m)' });
      if (!input) return;
      commandText = input.trim();
      if (!commandText) return;
    }

    const config = vscode.workspace.getConfiguration('php');
    const phpPath = config.get('executablePath', 'php');
    const terminal = vscode.window.createTerminal({ name: 'Laravel Artisan', cwd: root });
    terminal.show();
    terminal.sendText(`${phpPath} "${artisanPath}" ${commandText}`);
  });

  const laravelRouteListCommand = vscode.commands.registerCommand('laravel.routeList', async () => {
    const root = getWorkspaceRootPath();
    if (!root) return;
    await ensureLaravelRouteIndex();
    const names = Array.from(laravelRouteIndex.keys()).sort((a, b) => a.localeCompare(b));
    if (names.length === 0) {
      const artisanPath = path.join(root, 'artisan');
      if (!fs.existsSync(artisanPath)) {
        vscode.window.showErrorMessage('No Laravel routes found');
        return;
      }
      const config = vscode.workspace.getConfiguration('php');
      const phpPath = config.get('executablePath', 'php');
      const terminal = vscode.window.createTerminal({ name: 'Laravel Routes', cwd: root });
      terminal.show();
      terminal.sendText(`${phpPath} "${artisanPath}" route:list`);
      return;
    }
    const picked = await vscode.window.showQuickPick(names, { placeHolder: 'Select a route name' });
    if (!picked) return;
    const locs = laravelRouteIndex.get(picked);
    if (!locs || locs.length === 0) return;
    const loc = locs[0];
    const doc = await vscode.workspace.openTextDocument(loc.uri);
    await vscode.window.showTextDocument(doc, { selection: loc.range, preview: true });
  });

  const generateUnitTestCommand = vscode.commands.registerCommand('php.generateUnitTest', async (documentUriString, pos) => {
    let document = null;
    if (documentUriString) {
      try {
        document = await vscode.workspace.openTextDocument(vscode.Uri.parse(documentUriString));
      } catch {}
    }
    if (!document) {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'php') return;
      document = editor.document;
    }
    const position = pos && typeof pos.line === 'number' ? new vscode.Position(pos.line, pos.character || 0) : (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.selection.active : new vscode.Position(0, 0));
    const target = getPhpTestTargetAtPosition(document, position);
    if (!target) {
      vscode.window.showErrorMessage('No PHP class or function found to generate a test for');
      return;
    }

    const root = getWorkspaceRootPath();
    if (!root) return;
    const isLaravel = fs.existsSync(path.join(root, 'artisan')) && fs.existsSync(path.join(root, 'tests', 'TestCase.php'));
    const baseDir = isLaravel ? path.join(root, 'tests', 'Unit') : path.join(root, 'tests');
    const testFileName = `${target.testClassName}Test.php`;
    const testFilePath = path.join(baseDir, testFileName);

    await vscode.workspace.fs.createDirectory(vscode.Uri.file(baseDir));
    const exists = await fileExists(vscode.Uri.file(testFilePath));
    if (exists) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(testFilePath));
      await vscode.window.showTextDocument(doc, { preview: false });
      return;
    }

    const contents = buildPhpUnitTestTemplate(target, { isLaravel });
    await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), Buffer.from(contents, 'utf8'));

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(testFilePath));
    await vscode.window.showTextDocument(doc, { preview: false });

    const picked = await vscode.window.showInformationMessage('Test generated. Run tests now?', 'Run Tests');
    if (picked === 'Run Tests') {
      const terminal = vscode.window.createTerminal({ name: 'PHP Tests', cwd: root });
      terminal.show();
      const config = vscode.workspace.getConfiguration('php');
      const phpPath = config.get('executablePath', 'php');
      if (isLaravel) {
        terminal.sendText(`${phpPath} "${path.join(root, 'artisan')}" test`);
      } else {
        const vendorPhpUnit = path.join(root, 'vendor', 'bin', 'phpunit');
        if (fs.existsSync(vendorPhpUnit)) terminal.sendText(`"${vendorPhpUnit}"`);
        else terminal.sendText('phpunit');
      }
    }
  });

  context.subscriptions.push(
    completionProvider,
    hoverProvider,
    definitionProvider,
    bladeDefinitionProvider,
    symbolProvider,
    workspaceSymbolProvider,
    signatureHelpProvider,
    semanticTokensProvider.registration,
    callHierarchyProvider,
    typeHierarchyProvider,
    importCodeActionProvider,
    unitTestCodeActionProvider,
    runFileCommand,
    validateCommand,
    laravelArtisanCommand,
    laravelRouteListCommand,
    generateUnitTestCommand
  );
}

function getWorkspaceRootPath() {
  const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0] : null;
  return folder ? folder.uri.fsPath : '';
}

async function fileExists(uri) {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

function getPhpTestTargetAtPosition(document, position) {
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const line = document.lineAt(position.line).text;
  const classLineMatch = line.match(/\b(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/);
  if (classLineMatch) {
    const className = classLineMatch[2];
    return { kind: 'class', name: className, fqn: namespace ? `${namespace}\\${className}` : className, testClassName: className, method: '' };
  }

  const functionLineMatch = line.match(/\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/);
  if (functionLineMatch) {
    const fn = functionLineMatch[1];
    const enclosingClass = findEnclosingPhpClassName(document, position);
    if (enclosingClass) return { kind: 'method', name: enclosingClass, fqn: namespace ? `${namespace}\\${enclosingClass}` : enclosingClass, testClassName: enclosingClass, method: fn };
    return { kind: 'function', name: fn, fqn: namespace ? `${namespace}\\${fn}` : fn, testClassName: fn, method: '' };
  }

  const offset = document.offsetAt(position);
  const fn = findEnclosingPhpFunctionAtOffset(document, text, offset);
  if (fn) {
    const enclosingClass = findEnclosingPhpClassName(document, fn.selectionRange.start);
    if (enclosingClass) return { kind: 'method', name: enclosingClass, fqn: namespace ? `${namespace}\\${enclosingClass}` : enclosingClass, testClassName: enclosingClass, method: fn.name };
    return { kind: 'function', name: fn.name, fqn: namespace ? `${namespace}\\${fn.name}` : fn.name, testClassName: fn.name, method: '' };
  }

  const enclosingClass = findEnclosingPhpClassName(document, position);
  if (enclosingClass) return { kind: 'class', name: enclosingClass, fqn: namespace ? `${namespace}\\${enclosingClass}` : enclosingClass, testClassName: enclosingClass, method: '' };
  return null;
}

function buildPhpUnitTestTemplate(target, options) {
  const isLaravel = !!(options && options.isLaravel);
  const testNamespace = isLaravel ? 'Tests\\Unit' : '';
  const extendsClause = isLaravel ? 'TestCase' : 'TestCase';
  const useLine = isLaravel ? 'use Tests\\TestCase;' : 'use PHPUnit\\Framework\\TestCase;';
  const methodSuffix = target && target.method ? target.method : '';
  const testMethodName = methodSuffix ? `test${methodSuffix[0].toUpperCase()}${methodSuffix.slice(1)}` : 'testExample';

  const nsBlock = testNamespace ? `namespace ${testNamespace};\n\n` : '';
  return `<?php

declare(strict_types=1);

${nsBlock}${useLine}

final class ${target.testClassName}Test extends ${extendsClause}
{
    public function ${testMethodName}(): void
    {
        $this->assertTrue(true);
    }
}
`;
}

function isLaravelRouteDocument(document) {
  const filePath = document && document.uri ? document.uri.fsPath : '';
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  return /\/routes\/.*\.php$/i.test(normalized);
}

function deleteLaravelRouteIndexForUri(uri) {
  const uriKey = uri.toString();
  const keys = laravelRouteIndexKeysByUri.get(uriKey);
  if (!keys) return;
  for (const key of keys) {
    const locs = laravelRouteIndex.get(key);
    if (!locs) continue;
    const filtered = locs.filter((loc) => loc.uri.toString() !== uriKey);
    if (filtered.length === 0) laravelRouteIndex.delete(key);
    else laravelRouteIndex.set(key, filtered);
  }
  laravelRouteIndexKeysByUri.delete(uriKey);
  laravelRouteIndexVersion++;
}

function updateLaravelRouteIndexForDocument(document) {
  if (!document || document.languageId !== 'php') return;
  if (!isLaravelRouteDocument(document)) return;
  deleteLaravelRouteIndexForUri(document.uri);

  const keys = new Set();
  const extracted = extractLaravelRouteNamesFromDocument(document);
  for (const { name, location } of extracted) {
    keys.add(name);
    const current = laravelRouteIndex.get(name) || [];
    current.push(location);
    laravelRouteIndex.set(name, current);
  }
  if (keys.size > 0) laravelRouteIndexKeysByUri.set(document.uri.toString(), keys);
  laravelRouteIndexVersion++;
}

async function ensureLaravelRouteIndex() {
  if (laravelRouteIndexBuilding) return laravelRouteIndexBuilding;
  laravelRouteIndexBuilding = (async () => {
    const include = 'routes/**/*.php';
    const exclude = '{**/node_modules/**,**/vendor/**,**/.git/**,**/.vscode/**,**/dist/**,**/out/**}';
    const uris = await vscode.workspace.findFiles(include, exclude);
    for (const uri of uris) {
      try {
        const doc = await vscode.workspace.openTextDocument(uri);
        updateLaravelRouteIndexForDocument(doc);
      } catch {}
    }
  })().finally(() => {
    laravelRouteIndexBuilding = null;
  });
  return laravelRouteIndexBuilding;
}

function extractLaravelRouteNamesFromDocument(document) {
  const text = document.getText();
  const results = [];
  const patterns = [
    /->\s*name\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
    /\bRoute::\s*name\s*\(\s*(['"])([^'"]+)\1\s*\)/g
  ];
  for (const re of patterns) {
    let match;
    while ((match = re.exec(text))) {
      const name = match[2];
      if (!name) continue;
      const nameIndex = match.index + match[0].indexOf(name);
      const pos = document.positionAt(nameIndex);
      const range = new vscode.Range(pos, new vscode.Position(pos.line, pos.character + name.length));
      results.push({ name, location: new vscode.Location(document.uri, range) });
      if (results.length >= 800) break;
    }
  }
  return results;
}

function getLaravelRouteNameAtPosition(document, position) {
  const line = document.lineAt(position.line).text;
  const offsetInLine = position.character;
  const patterns = [
    /\broute\s*\(\s*(['"])([^'"]+)\1/g,
    /\bto_route\s*\(\s*(['"])([^'"]+)\1/g,
    /->\s*route\s*\(\s*(['"])([^'"]+)\1/g
  ];
  for (const re of patterns) {
    let match;
    while ((match = re.exec(line))) {
      const quote = match[1];
      const name = match[2];
      const nameStart = match.index + match[0].lastIndexOf(quote) + 1;
      const nameEnd = nameStart + name.length;
      if (offsetInLine >= nameStart && offsetInLine <= nameEnd) return name;
    }
  }
  return '';
}

function buildPhpDocumentSymbols(document) {
  const text = document.getText();
  const symbols = [];

  const namespaceDeclRe = /^\s*namespace\s+([^;{]+)\s*([;{])/m;
  const namespaceMatch = namespaceDeclRe.exec(text);
  if (namespaceMatch) {
    const nsName = namespaceMatch[1].trim();
    const nsNameIndex = namespaceMatch.index + namespaceMatch[0].indexOf(nsName);
    const nsStart = document.positionAt(namespaceMatch.index);
    const nsEnd = document.positionAt(namespaceMatch.index + namespaceMatch[0].length);
    const selStart = document.positionAt(nsNameIndex);
    const selEnd = document.positionAt(nsNameIndex + nsName.length);
    symbols.push(new vscode.DocumentSymbol(nsName, 'Namespace', vscode.SymbolKind.Namespace, new vscode.Range(nsStart, nsEnd), new vscode.Range(selStart, selEnd)));
  }

  const classRanges = [];
  const classDeclRe = /\b(?:abstract\s+|final\s+)?(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
  let match;
  while ((match = classDeclRe.exec(text))) {
    const typeKeyword = match[1];
    const className = match[2];
    const nameIndex = match.index + match[0].lastIndexOf(className);
    const braceStart = text.indexOf('{', match.index);
    const braceEnd = braceStart === -1 ? -1 : findMatchingBrace(text, braceStart);
    const rangeStart = document.positionAt(match.index);
    const rangeEnd = document.positionAt(braceEnd !== -1 ? braceEnd + 1 : match.index + match[0].length);
    const selStart = document.positionAt(nameIndex);
    const selEnd = document.positionAt(nameIndex + className.length);
    const kind =
      typeKeyword === 'interface' ? vscode.SymbolKind.Interface :
      typeKeyword === 'trait' ? vscode.SymbolKind.Class :
      typeKeyword === 'enum' ? vscode.SymbolKind.Enum :
      vscode.SymbolKind.Class;
    const classSymbol = new vscode.DocumentSymbol(className, typeKeyword, kind, new vscode.Range(rangeStart, rangeEnd), new vscode.Range(selStart, selEnd));

    if (braceStart !== -1 && braceEnd !== -1) {
      classRanges.push({ name: className, start: braceStart, end: braceEnd, symbol: classSymbol });
      const body = text.slice(braceStart, braceEnd + 1);

      const constRe = /\bconst\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
      let m;
      while ((m = constRe.exec(body))) {
        const constName = m[1];
        const nameIdx = braceStart + m.index + m[0].lastIndexOf(constName);
        const startPos = document.positionAt(braceStart + m.index);
        const endPos = document.positionAt(braceStart + m.index + m[0].length);
        const selS = document.positionAt(nameIdx);
        const selE = document.positionAt(nameIdx + constName.length);
        classSymbol.children.push(new vscode.DocumentSymbol(constName, 'Const', vscode.SymbolKind.Constant, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
      }

      const propRe = /\b(?:public|protected|private|var)\s+(?:static\s+)?\$(\w+)\b/g;
      while ((m = propRe.exec(body))) {
        const propName = m[1];
        const nameIdx = braceStart + m.index + m[0].lastIndexOf(propName);
        const startPos = document.positionAt(braceStart + m.index);
        const endPos = document.positionAt(braceStart + m.index + m[0].length);
        const selS = document.positionAt(nameIdx);
        const selE = document.positionAt(nameIdx + propName.length);
        classSymbol.children.push(new vscode.DocumentSymbol(`$${propName}`, 'Property', vscode.SymbolKind.Property, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
      }

      const methodRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
      while ((m = methodRe.exec(body))) {
        const methodName = m[1];
        const nameIdx = braceStart + m.index + m[0].lastIndexOf(methodName);
        const startPos = document.positionAt(braceStart + m.index);
        const endPos = document.positionAt(braceStart + m.index + m[0].length);
        const selS = document.positionAt(nameIdx);
        const selE = document.positionAt(nameIdx + methodName.length);
        classSymbol.children.push(new vscode.DocumentSymbol(methodName, 'Method', vscode.SymbolKind.Method, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
      }
    }

    symbols.push(classSymbol);
  }

  const isInsideClass = (index) => classRanges.some((r) => index >= r.start && index <= r.end);

  const functionRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  while ((match = functionRe.exec(text))) {
    if (isInsideClass(match.index)) continue;
    const fnName = match[1];
    const nameIdx = match.index + match[0].lastIndexOf(fnName);
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const selS = document.positionAt(nameIdx);
    const selE = document.positionAt(nameIdx + fnName.length);
    symbols.push(new vscode.DocumentSymbol(fnName, 'Function', vscode.SymbolKind.Function, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
  }

  const globalConstRe = /\bconst\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*=/g;
  while ((match = globalConstRe.exec(text))) {
    if (isInsideClass(match.index)) continue;
    const constName = match[1];
    const nameIdx = match.index + match[0].lastIndexOf(constName);
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const selS = document.positionAt(nameIdx);
    const selE = document.positionAt(nameIdx + constName.length);
    symbols.push(new vscode.DocumentSymbol(constName, 'Const', vscode.SymbolKind.Constant, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
  }

  const defineRe = /\bdefine\s*\(\s*['"]([A-Za-z0-9_]+)['"]/g;
  while ((match = defineRe.exec(text))) {
    const constName = match[1];
    const nameIdx = match.index + match[0].lastIndexOf(constName);
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const selS = document.positionAt(nameIdx);
    const selE = document.positionAt(nameIdx + constName.length);
    symbols.push(new vscode.DocumentSymbol(constName, 'Define', vscode.SymbolKind.Constant, new vscode.Range(startPos, endPos), new vscode.Range(selS, selE)));
  }

  return symbols;
}

function getPhpCompletionContext(document, position) {
  const offset = document.offsetAt(position);
  const startOffset = Math.max(0, offset - 8000);
  const text = document.getText(new vscode.Range(document.positionAt(startOffset), position));

  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let blockDepth = 0;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (blockDepth > 0) {
      if (ch === '*' && next === '/') {
        blockDepth--;
        i++;
      } else if (ch === '/' && next === '*') {
        blockDepth++;
        i++;
      }
      continue;
    }

    if (inSingle) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '\'') inSingle = false;
      continue;
    }

    if (inDouble || inBacktick) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (inDouble && ch === '"') inDouble = false;
      if (inBacktick && ch === '`') inBacktick = false;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '#') {
      inLineComment = true;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockDepth++;
      i++;
      continue;
    }
    if (ch === '\'') {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inBacktick = true;
      continue;
    }
  }

  return {
    inComment: inLineComment || blockDepth > 0,
    inString: inSingle || inDouble || inBacktick,
    isInterpolatedString: inDouble || inBacktick
  };
}

function createPhpVariableCompletionItems(document) {
  const items = [];
  const seen = new Set();

  const push = (name, kind, detail, sortText) => {
    if (seen.has(name)) return;
    seen.add(name);
    const item = new vscode.CompletionItem(name, kind);
    item.detail = detail;
    item.sortText = sortText;
    items.push(item);
  };

  push('$this', vscode.CompletionItemKind.Variable, 'PHP Variable', '0$this');
  ['$GLOBALS', '$_SERVER', '$_GET', '$_POST', '$_FILES', '$_COOKIE', '$_SESSION', '$_REQUEST', '$_ENV'].forEach((sg, i) => {
    push(sg, vscode.CompletionItemKind.Variable, 'PHP Superglobal', `1${String(i).padStart(2, '0')}${sg}`);
  });

  const offset = document.offsetAt(document.lineAt(document.lineCount - 1).range.end);
  const startOffset = Math.max(0, offset - 20000);
  const text = document.getText(new vscode.Range(document.positionAt(startOffset), document.lineAt(document.lineCount - 1).range.end));
  const varRe = /\$[A-Za-z_\x80-\xff][\w\x80-\xff]*/g;
  let match;
  while ((match = varRe.exec(text))) {
    push(match[0], vscode.CompletionItemKind.Variable, 'PHP Variable', `2${match[0]}`);
    if (items.length > 200) break;
  }

  return items;
}

function getPhpMembersForClass(classNameOrFqn) {
  const classKey = String(classNameOrFqn || '').replace(/^\\+/, '');
  if (!classKey) return { methods: [], properties: [], constants: [] };

  const cacheKey = classKey;
  const cached = phpWorkspaceMembersCache.get(cacheKey);
  if (cached && cached.version === phpWorkspaceIndexVersion) return cached.value;

  const className = classKey.split('\\').pop();
  const methods = new Set();
  const properties = new Set();
  const constants = new Set();
  for (const key of phpWorkspaceIndex.keys()) {
    const normalizedKey = String(key);
    if (normalizedKey.startsWith(`${classKey}::`) || normalizedKey.startsWith(`${className}::`)) {
      const member = normalizedKey.split('::').pop();
      if (member) {
        if (/^[A-Z_][A-Z0-9_]*$/.test(member)) constants.add(member);
        else methods.add(member);
      }
    }
    if (normalizedKey.startsWith(`${classKey}->$`) || normalizedKey.startsWith(`${className}->$`) || normalizedKey.startsWith(`${classKey}->`) || normalizedKey.startsWith(`${className}->`)) {
      const member = normalizedKey.includes('->$') ? normalizedKey.split('->$').pop() : normalizedKey.split('->').pop();
      if (member) properties.add(member.replace(/^\$/, ''));
    }
  }

  const value = {
    methods: Array.from(methods).sort((a, b) => a.localeCompare(b)),
    properties: Array.from(properties).sort((a, b) => a.localeCompare(b)),
    constants: Array.from(constants).sort((a, b) => a.localeCompare(b))
  };
  phpWorkspaceMembersCache.set(cacheKey, { version: phpWorkspaceIndexVersion, value });
  return value;
}

function createPhpMemberCompletionItems(classNameOrFqn, options) {
  const { methods, properties, constants } = getPhpMembersForClass(classNameOrFqn);
  const items = [];

  if (options.includeInstance) {
    properties.forEach((prop, i) => {
      const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
      item.detail = 'PHP Property';
      item.sortText = `0${String(i).padStart(3, '0')}${prop}`;
      items.push(item);
    });
  }

  if (options.includeStatic) {
    constants.forEach((c, i) => {
      const item = new vscode.CompletionItem(c, vscode.CompletionItemKind.Constant);
      item.detail = 'PHP Class Constant';
      item.sortText = `0${String(i).padStart(3, '0')}${c}`;
      items.push(item);
    });
  }

  methods.forEach((method, i) => {
    const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
    item.detail = 'PHP Method';
    item.sortText = `1${String(i).padStart(3, '0')}${method}`;
    items.push(item);
  });

  return items;
}

function getPhpReferenceAtPosition(document, position) {
  const range = document.getWordRangeAtPosition(position, /[\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*/);
  if (!range) return;
  const raw = document.getText(range);
  if (!raw) return;
  const word = raw.replace(/^\\+/, '');
  const line = document.lineAt(position.line).text;
  const offsetInLine = position.character;

  const staticRe = /([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)\s*::\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)/g;
  let match;
  while ((match = staticRe.exec(line))) {
    const member = match[2];
    const memberStart = match.index + match[0].lastIndexOf(member);
    const memberEnd = memberStart + member.length;
    if (offsetInLine >= memberStart && offsetInLine <= memberEnd) {
      return { kind: 'static', word, classToken: match[1].replace(/^\\+/, ''), member };
    }
  }

  const objectRe = /(\$this|\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*->\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)/g;
  while ((match = objectRe.exec(line))) {
    const member = match[2];
    const memberStart = match.index + match[0].lastIndexOf(member);
    const memberEnd = memberStart + member.length;
    if (offsetInLine >= memberStart && offsetInLine <= memberEnd) {
      return { kind: match[1] === '$this' ? 'this' : 'object', word, member };
    }
  }

  return { kind: 'plain', word };
}

function findLocalPhpDefinition(document, position, reference) {
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const word = reference.word;
  if (!word) return;
  const wordEscaped = escapeRegExp(word.split('\\').pop());

  if (reference.kind === 'this') {
    const className = findEnclosingPhpClassName(document, position);
    if (!className) return;
    const member = reference.member;
    const memberEscaped = escapeRegExp(member);
    const range = findPhpClassMemberRange(text, className);
    if (range) {
      const classBody = text.slice(range.start, range.end);
      const methodMatch = new RegExp(`\\bfunction\\s+&?\\s*${memberEscaped}\\s*\\(`, 'g').exec(classBody);
      if (methodMatch) return new vscode.Location(document.uri, document.positionAt(range.start + methodMatch.index));
      const propertyMatch = new RegExp(`\\b(?:public|protected|private|var)\\s+(?:static\\s+)?\\$${memberEscaped}\\b`, 'g').exec(classBody);
      if (propertyMatch) return new vscode.Location(document.uri, document.positionAt(range.start + propertyMatch.index));
      const constMatch = new RegExp(`\\bconst\\s+${memberEscaped}\\b`, 'g').exec(classBody);
      if (constMatch) return new vscode.Location(document.uri, document.positionAt(range.start + constMatch.index));
    }
    return;
  }

  if (reference.kind === 'static') {
    const member = reference.member;
    const memberEscaped = escapeRegExp(member);
    const classToken = reference.classToken;
    const resolvedClass = resolvePhpClassTokenInDocument(text, classToken) || classToken;
    const className = resolvedClass.split('\\').pop();
    if (!className) return;
    const range = findPhpClassMemberRange(text, className);
    if (range) {
      const classBody = text.slice(range.start, range.end);
      const methodMatch = new RegExp(`\\bfunction\\s+&?\\s*${memberEscaped}\\s*\\(`, 'g').exec(classBody);
      if (methodMatch) return new vscode.Location(document.uri, document.positionAt(range.start + methodMatch.index));
      const constMatch = new RegExp(`\\bconst\\s+${memberEscaped}\\b`, 'g').exec(classBody);
      if (constMatch) return new vscode.Location(document.uri, document.positionAt(range.start + constMatch.index));
    }
  }

  const classMatch = new RegExp(`\\b(class|interface|trait|enum)\\s+${wordEscaped}\\b`, 'g').exec(text);
  if (classMatch) return new vscode.Location(document.uri, document.positionAt(classMatch.index));

  const funcMatch = new RegExp(`\\bfunction\\s+&?\\s*${wordEscaped}\\s*\\(`, 'g').exec(text);
  if (funcMatch) return new vscode.Location(document.uri, document.positionAt(funcMatch.index));

  const constMatch = new RegExp(`\\bconst\\s+${wordEscaped}\\b`, 'g').exec(text);
  if (constMatch) return new vscode.Location(document.uri, document.positionAt(constMatch.index));

  const fqnCandidate = namespace ? `${namespace}\\${word}` : word;
  const fqnEscaped = escapeRegExp(fqnCandidate.split('\\').pop());
  const fqnClassMatch = new RegExp(`\\b(class|interface|trait|enum)\\s+${fqnEscaped}\\b`, 'g').exec(text);
  if (fqnClassMatch) return new vscode.Location(document.uri, document.positionAt(fqnClassMatch.index));
}

function resolvePhpReferenceFromIndex(document, position, reference) {
  if (reference.kind === 'static') {
    const text = document.getText();
    const resolvedClass = resolvePhpClassTokenInDocument(text, reference.classToken) || reference.classToken;
    const candidates = [
      `${resolvedClass}::${reference.member}`,
      `${resolvedClass.split('\\').pop()}::${reference.member}`
    ];
    for (const key of candidates) {
      const locs = phpWorkspaceIndex.get(key);
      if (locs && locs.length > 0) return locs;
    }
  }

  if (reference.kind === 'this') {
    const className = findEnclosingPhpClassName(document, position);
    if (className) {
      const candidates = [
        `${className}::${reference.member}`,
        `${className}->$${reference.member}`,
        `${className}->${reference.member}`,
        `${className}::${reference.member.toUpperCase()}`
      ];
      for (const key of candidates) {
        const locs = phpWorkspaceIndex.get(key);
        if (locs && locs.length > 0) return locs;
      }
    }
  }

  const word = reference.word;
  const candidates = [word, word.split('\\').pop()];
  for (const key of candidates) {
    const locs = phpWorkspaceIndex.get(key);
    if (locs && locs.length > 0) return locs;
  }
}

async function ensurePhpWorkspaceIndex() {
  if (phpWorkspaceIndexBuilding) return phpWorkspaceIndexBuilding;
  phpWorkspaceIndexBuilding = (async () => {
    const include = '**/*.{php,phtml,php3,php4,php5,phps}';
    const exclude = '{**/node_modules/**,**/vendor/**,**/.git/**,**/.vscode/**,**/dist/**,**/out/**}';
    const uris = await vscode.workspace.findFiles(include, exclude);
    for (const uri of uris) {
      try {
        const doc = await vscode.workspace.openTextDocument(uri);
        updatePhpIndexForDocument(doc);
      } catch {}
    }
  })().finally(() => {
    phpWorkspaceIndexBuilding = null;
  });
  return phpWorkspaceIndexBuilding;
}

function deletePhpIndexForUri(uri) {
  const uriKey = uri.toString();
  const keys = phpWorkspaceIndexKeysByUri.get(uriKey);
  if (!keys) return;
  for (const key of keys) {
    const locs = phpWorkspaceIndex.get(key);
    if (!locs) continue;
    const filtered = locs.filter((loc) => loc.uri.toString() !== uriKey);
    if (filtered.length === 0) phpWorkspaceIndex.delete(key);
    else phpWorkspaceIndex.set(key, filtered);

    const infoList = phpWorkspaceSymbolInfo.get(key);
    if (infoList) {
      const filteredInfo = infoList.filter((info) => info.uriKey !== uriKey);
      if (filteredInfo.length === 0) phpWorkspaceSymbolInfo.delete(key);
      else phpWorkspaceSymbolInfo.set(key, filteredInfo);
    }

    const sigList = phpWorkspaceFunctionInfoByKey.get(key);
    if (sigList) {
      const filteredSigs = sigList.filter((info) => info.uriKey !== uriKey);
      if (filteredSigs.length === 0) phpWorkspaceFunctionInfoByKey.delete(key);
      else phpWorkspaceFunctionInfoByKey.set(key, filteredSigs);
    }
  }
  phpWorkspaceIndexKeysByUri.delete(uriKey);
  for (const [fqn, info] of phpWorkspaceClassInfoByFqn.entries()) {
    if (info && info.uri && info.uri.toString && info.uri.toString() === uriKey) phpWorkspaceClassInfoByFqn.delete(fqn);
  }
  rebuildPhpClassFqnMaps();
  phpWorkspaceIndexVersion++;
}

function updatePhpIndexForDocument(document) {
  if (!document || document.languageId !== 'php') return;
  deletePhpIndexForUri(document.uri);
  const uriKey = document.uri.toString();
  const keys = new Set();
  const symbols = extractPhpSymbolsFromDocument(document);
  for (const { key, location, kind, signature, classInfo } of symbols) {
    if (!key || !location) continue;
    keys.add(key);
    const current = phpWorkspaceIndex.get(key) || [];
    current.push(location);
    phpWorkspaceIndex.set(key, current);

    if (kind) {
      const infoList = phpWorkspaceSymbolInfo.get(key) || [];
      infoList.push({ uriKey, kind, containerName: classInfo && classInfo.containerName ? classInfo.containerName : '' });
      phpWorkspaceSymbolInfo.set(key, infoList);
    }

    if (signature) {
      const sigList = phpWorkspaceFunctionInfoByKey.get(key) || [];
      sigList.push({ uriKey, ...signature });
      phpWorkspaceFunctionInfoByKey.set(key, sigList);
    }

    if (classInfo && classInfo.fqn) {
      phpWorkspaceClassInfoByFqn.set(classInfo.fqn, classInfo);
    }
  }
  if (keys.size > 0) phpWorkspaceIndexKeysByUri.set(uriKey, keys);
  rebuildPhpClassFqnMaps();
  phpWorkspaceIndexVersion++;
}

function extractPhpSymbolsFromDocument(document) {
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const classRanges = [];
  const symbols = [];

  const classDeclRe = /\b(?:abstract\s+|final\s+)?(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
  let match;
  while ((match = classDeclRe.exec(text))) {
    const className = match[2];
    const classKeyword = match[1];
    const nameIndex = match.index + match[0].lastIndexOf(className);
    const classPos = document.positionAt(nameIndex);
    const classLoc = new vscode.Location(document.uri, classPos);

    const classFqn = namespace ? `${namespace}\\${className}` : className;
    const kind =
      classKeyword === 'interface' ? vscode.SymbolKind.Interface :
      classKeyword === 'enum' ? vscode.SymbolKind.Enum :
      vscode.SymbolKind.Class;

    const braceStart = text.indexOf('{', match.index);
    if (braceStart === -1) continue;
    const braceEnd = findMatchingBrace(text, braceStart);
    if (braceEnd === -1) continue;
    classRanges.push({ name: className, start: braceStart, end: braceEnd });

    const header = text.slice(match.index, braceStart);
    const useAliases = parsePhpUseAliases(text);
    const classExt = parsePhpClassExtendsImplements(header);
    const extendsFqns = (classExt.extends || []).map((t) => resolvePhpTypeTokenToFqn(t, namespace, useAliases));
    const implementsFqns = (classExt.implements || []).map((t) => resolvePhpTypeTokenToFqn(t, namespace, useAliases));
    const classInfo = { fqn: classFqn, shortName: className, kind, uri: document.uri, containerName: '', extends: extendsFqns, implements: implementsFqns };
    symbols.push({ key: className, location: classLoc, kind, classInfo });
    if (namespace) symbols.push({ key: classFqn, location: classLoc, kind, classInfo });

    const classBody = text.slice(braceStart, braceEnd + 1);

    const methodRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
    let m;
    while ((m = methodRe.exec(classBody))) {
      const methodName = m[1];
      const methodIndex = braceStart + m.index + m[0].lastIndexOf(methodName);
      const methodLoc = new vscode.Location(document.uri, document.positionAt(methodIndex));
      const signature = extractPhpFunctionSignatureNearOffset(text, methodIndex);
      symbols.push({ key: `${className}::${methodName}`, location: methodLoc, kind: vscode.SymbolKind.Method, signature, classInfo: { containerName: className } });
      if (namespace) symbols.push({ key: `${classFqn}::${methodName}`, location: methodLoc, kind: vscode.SymbolKind.Method, signature, classInfo: { containerName: classFqn } });
    }

    const propRe = /\b(?:public|protected|private|var)\s+(?:static\s+)?\$(\w+)\b/g;
    while ((m = propRe.exec(classBody))) {
      const propName = m[1];
      const propIndex = braceStart + m.index + m[0].lastIndexOf(propName);
      const propLoc = new vscode.Location(document.uri, document.positionAt(propIndex));
      symbols.push({ key: `${className}->$${propName}`, location: propLoc, kind: vscode.SymbolKind.Property, classInfo: { containerName: className } });
      symbols.push({ key: `${className}->${propName}`, location: propLoc, kind: vscode.SymbolKind.Property, classInfo: { containerName: className } });
      if (namespace) {
        symbols.push({ key: `${classFqn}->$${propName}`, location: propLoc, kind: vscode.SymbolKind.Property, classInfo: { containerName: classFqn } });
        symbols.push({ key: `${classFqn}->${propName}`, location: propLoc, kind: vscode.SymbolKind.Property, classInfo: { containerName: classFqn } });
      }
    }

    const constRe = /\bconst\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
    while ((m = constRe.exec(classBody))) {
      const constName = m[1];
      const constIndex = braceStart + m.index + m[0].lastIndexOf(constName);
      const constLoc = new vscode.Location(document.uri, document.positionAt(constIndex));
      symbols.push({ key: `${className}::${constName}`, location: constLoc, kind: vscode.SymbolKind.Constant, classInfo: { containerName: className } });
      if (namespace) symbols.push({ key: `${classFqn}::${constName}`, location: constLoc, kind: vscode.SymbolKind.Constant, classInfo: { containerName: classFqn } });
    }
  }

  const functionRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  while ((match = functionRe.exec(text))) {
    if (classRanges.some((r) => match.index >= r.start && match.index <= r.end)) continue;
    const fnName = match[1];
    const fnIndex = match.index + match[0].lastIndexOf(fnName);
    const fnLoc = new vscode.Location(document.uri, document.positionAt(fnIndex));
    const signature = extractPhpFunctionSignatureNearOffset(text, fnIndex);
    symbols.push({ key: fnName, location: fnLoc, kind: vscode.SymbolKind.Function, signature });
    if (namespace) symbols.push({ key: `${namespace}\\${fnName}`, location: fnLoc, kind: vscode.SymbolKind.Function, signature });
  }

  const globalConstRe = /\bconst\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*=/g;
  while ((match = globalConstRe.exec(text))) {
    if (classRanges.some((r) => match.index >= r.start && match.index <= r.end)) continue;
    const constName = match[1];
    const constIndex = match.index + match[0].lastIndexOf(constName);
    const constLoc = new vscode.Location(document.uri, document.positionAt(constIndex));
    symbols.push({ key: constName, location: constLoc, kind: vscode.SymbolKind.Constant });
    if (namespace) symbols.push({ key: `${namespace}\\${constName}`, location: constLoc, kind: vscode.SymbolKind.Constant });
  }

  const defineRe = /\bdefine\s*\(\s*['"]([A-Za-z0-9_]+)['"]/g;
  while ((match = defineRe.exec(text))) {
    const constName = match[1];
    const constIndex = match.index + match[0].lastIndexOf(constName);
    const constLoc = new vscode.Location(document.uri, document.positionAt(constIndex));
    symbols.push({ key: constName, location: constLoc, kind: vscode.SymbolKind.Constant });
    if (namespace) symbols.push({ key: `${namespace}\\${constName}`, location: constLoc, kind: vscode.SymbolKind.Constant });
  }

  return symbols;
}

function findMatchingBrace(text, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPhpNamespace(text) {
  const match = text.match(/^\s*namespace\s+([^;{]+)\s*[;{]/m);
  if (!match) return '';
  return match[1].trim();
}

function findEnclosingPhpClassName(document, position) {
  const offset = document.offsetAt(position);
  const head = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const classRe = /\b(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
  let match;
  let last = null;
  while ((match = classRe.exec(head))) last = match[2];
  if (!last) return;
  const idx = head.lastIndexOf(last, offset);
  if (idx === -1) return last;
  return last;
}

function findPhpClassMemberRange(text, className) {
  const classRe = new RegExp(`\\b(class|interface|trait|enum)\\s+${escapeRegExp(className)}\\b`, 'g');
  const match = classRe.exec(text);
  if (!match) return;
  const braceStart = text.indexOf('{', match.index);
  if (braceStart === -1) return;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return;
  return { start: braceStart, end: braceEnd + 1 };
}

function resolvePhpClassTokenInDocument(text, classToken) {
  if (!classToken || classToken.includes('\\')) return classToken;
  const uses = parsePhpUseAliases(text);
  return uses[classToken] || classToken;
}

function parsePhpUseAliases(text) {
  const map = Object.create(null);
  const useRe = /^\s*use\s+([^;]+);/gm;
  let match;
  while ((match = useRe.exec(text))) {
    const clause = match[1].trim();
    if (!clause) continue;
    if (clause.startsWith('function ') || clause.startsWith('const ')) continue;
    const parts = clause.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const asMatch = part.match(/^(.*)\s+as\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)$/i);
      const fqn = (asMatch ? asMatch[1] : part).trim().replace(/^\\+/, '');
      const alias = (asMatch ? asMatch[2] : fqn.split('\\').pop()).trim();
      if (alias && fqn) map[alias] = fqn;
    }
  }
  return map;
}

function parsePhpClassExtendsImplements(header) {
  const extendsMatch = header.match(/\bextends\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)/i);
  const implementsMatch = header.match(/\bimplements\s+([^{]+)$/i);
  const extendsList = extendsMatch ? [extendsMatch[1].trim()] : [];
  const implementsList = implementsMatch
    ? implementsMatch[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\s*\{.*$/, '').trim())
    : [];
  return { extends: extendsList, implements: implementsList };
}

function resolvePhpTypeTokenToFqn(token, namespace, useAliases) {
  const raw = String(token || '').trim();
  if (!raw) return '';
  const cleaned = raw.replace(/^\?/, '').replace(/^\\+/, '');
  if (cleaned.includes('\\')) return cleaned;
  const aliased = useAliases && useAliases[cleaned] ? useAliases[cleaned] : cleaned;
  if (aliased.includes('\\')) return aliased.replace(/^\\+/, '');
  if (namespace) return `${namespace}\\${aliased}`;
  return aliased;
}

function rebuildPhpClassFqnMaps() {
  phpWorkspaceClassFqnsByShortName.clear();
  for (const [fqn, info] of phpWorkspaceClassInfoByFqn.entries()) {
    if (!info || !info.shortName) continue;
    const shortName = info.shortName;
    const list = phpWorkspaceClassFqnsByShortName.get(shortName) || [];
    if (!list.includes(fqn)) list.push(fqn);
    phpWorkspaceClassFqnsByShortName.set(shortName, list);
  }
}

function findPhpDocblockBeforeOffset(text, offset) {
  const head = text.slice(0, Math.max(0, offset));
  const end = head.lastIndexOf('*/');
  if (end === -1) return '';
  const start = head.lastIndexOf('/**', end);
  if (start === -1) return '';
  const between = head.slice(end + 2);
  if (/[^\s]/.test(between)) return '';
  return head.slice(start, end + 2);
}

function parsePhpDocblock(docblock) {
  const result = { params: Object.create(null), returns: '' };
  if (!docblock) return result;
  const lines = String(docblock).split(/\r?\n/);
  for (const line of lines) {
    const paramMatch = line.match(/@\s*(?:param|phpstan-param|psalm-param)\s+([^\s]+)\s+(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)/i);
    if (paramMatch) result.params[paramMatch[2]] = paramMatch[1];
    const returnMatch = line.match(/@\s*(?:return|phpstan-return|psalm-return)\s+([^\s]+)/i);
    if (returnMatch && !result.returns) result.returns = returnMatch[1];
  }
  return result;
}

function splitPhpParameters(paramList) {
  const parts = [];
  let current = '';
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  for (let i = 0; i < paramList.length; i++) {
    const ch = paramList[i];
    if (inSingle || inDouble) {
      current += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && ch === '\'') inSingle = false;
      if (inDouble && ch === '"') inDouble = false;
      continue;
    }
    if (ch === '\'') {
      inSingle = true;
      current += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      current += ch;
      continue;
    }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = '';
      continue;
    }
    current += ch;
  }
  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);
  return parts;
}

function parsePhpParameter(paramText, docParams) {
  const text = String(paramText || '').trim();
  if (!text) return null;
  const nameMatch = text.match(/(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)/);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const before = text.slice(0, nameMatch.index).trim();
  const hasVariadic = /\.\.\./.test(before);
  const cleanBefore = before.replace(/\.\.\./g, '').replace(/\s*&\s*/g, ' ').trim();
  const typeText = cleanBefore ? cleanBefore.split(/\s+/)[0] : '';
  const docType = docParams && docParams[name] ? docParams[name] : '';
  const type = typeText || docType || 'mixed';
  return { name, type, variadic: hasVariadic, raw: text };
}

function extractPhpFunctionSignatureNearOffset(text, nameIndex) {
  const sliceStart = Math.max(0, nameIndex - 800);
  const sliceEnd = Math.min(text.length, nameIndex + 800);
  const window = text.slice(sliceStart, sliceEnd);
  const localIndex = nameIndex - sliceStart;
  const head = window.slice(0, localIndex + 200);
  const declMatch = head.match(/\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(([\s\S]*?)\)\s*(?::\s*([\\A-Za-z_\x80-\xff][\\\w\x80-\xff|?]+))?/);
  if (!declMatch) return null;
  const fnName = declMatch[1];
  const paramList = declMatch[2] || '';
  const returnTypeHint = (declMatch[3] || '').trim();
  const docblock = findPhpDocblockBeforeOffset(text, nameIndex);
  const doc = parsePhpDocblock(docblock);
  const params = splitPhpParameters(paramList).map((p) => parsePhpParameter(p, doc.params)).filter(Boolean);
  const returnType = returnTypeHint || doc.returns || 'mixed';
  const formattedParams = params.map((p) => `${p.type} ${p.variadic ? '...' : ''}${p.name}`.replace(/\s+/g, ' ').trim());
  const label = `${fnName}(${formattedParams.join(', ')}): ${returnType}`;
  return {
    label,
    documentation: docblock ? new vscode.MarkdownString(docblock) : undefined,
    parameters: params.map((p) => ({ label: `${p.type} ${p.variadic ? '...' : ''}${p.name}`.replace(/\s+/g, ' ').trim() }))
  };
}

function getPhpCallExpressionAtPosition(document, position) {
  const offset = document.offsetAt(position);
  const startOffset = Math.max(0, offset - 5000);
  const text = document.getText(new vscode.Range(document.positionAt(startOffset), position));
  let depth = 0;
  let callParenIndex = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) {
        callParenIndex = i;
        break;
      }
      depth--;
    }
  }
  if (callParenIndex === -1) return null;
  const before = text.slice(0, callParenIndex).replace(/\s+$/, '');
  const activeParameter = countPhpActiveParameter(text.slice(callParenIndex + 1));

  const staticMatch = before.match(/([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)\s*::\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)$/);
  if (staticMatch) return { kind: 'static', classToken: staticMatch[1], name: staticMatch[2], activeParameter };

  const methodMatch = before.match(/(\$this|\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*->\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)$/);
  if (methodMatch) return { kind: 'method', receiver: methodMatch[1], name: methodMatch[2], activeParameter };

  const newMatch = before.match(/\bnew\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)$/);
  if (newMatch) return { kind: 'new', classToken: newMatch[1], activeParameter };

  const fnMatch = before.match(/([A-Za-z_\x80-\xff][\w\x80-\xff]*)$/);
  if (fnMatch) return { kind: 'function', name: fnMatch[1], activeParameter };
  return null;
}

function countPhpActiveParameter(argText) {
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  let commas = 0;
  for (let i = 0; i < argText.length; i++) {
    const ch = argText[i];
    if (inSingle || inDouble) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && ch === '\'') inSingle = false;
      if (inDouble && ch === '"') inDouble = false;
      continue;
    }
    if (ch === '\'') { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) commas++;
  }
  return commas;
}

async function resolvePhpSignatureForCall(document, position, call) {
  if (!call) return [];
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);

  if (call.kind === 'function') {
    const candidates = [];
    if (namespace) candidates.push(`${namespace}\\${call.name}`);
    candidates.push(call.name);
    for (const key of candidates) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) return sigs;
    }
    if (phpFunctionCategoryByName[call.name]) {
      const builtIn = await getBuiltInPhpFunctionSignature(call.name);
      if (builtIn) return [builtIn];
    }
    return [];
  }

  if (call.kind === 'static') {
    const resolvedClass = resolvePhpTypeTokenToFqn(call.classToken, namespace, useAliases);
    const classShort = resolvedClass.split('\\').pop();
    const keys = [
      `${resolvedClass}::${call.name}`,
      `${classShort}::${call.name}`
    ];
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) return sigs;
    }
    return [];
  }

  if (call.kind === 'new') {
    const resolvedClass = resolvePhpTypeTokenToFqn(call.classToken, namespace, useAliases);
    const classShort = resolvedClass.split('\\').pop();
    const keys = [
      `${resolvedClass}::__construct`,
      `${classShort}::__construct`
    ];
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) return sigs;
    }
    return [];
  }

  if (call.kind === 'method') {
    const receiver = call.receiver;
    let receiverType = '';
    if (receiver === '$this') receiverType = findEnclosingPhpClassName(document, position) || '';
    if (!receiverType && receiver.startsWith('$')) {
      const inferred = inferPhpVariableTypes(document, position);
      receiverType = inferred.get(receiver) || '';
    }
    const resolvedType = resolvePhpTypeTokenToFqn(receiverType, namespace, useAliases);
    const classShort = resolvedType.split('\\').pop();
    const keys = [
      `${resolvedType}::${call.name}`,
      `${classShort}::${call.name}`
    ];
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) return sigs;
    }
  }
  return [];
}

function resolvePhpSignatureForReference(document, position, word) {
  const reference = getPhpReferenceAtPosition(document, position);
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);
  const name = String(word || '').replace(/^\\+/, '');
  if (!name) return [];

  if (reference && reference.kind === 'static') {
    const resolvedClass = resolvePhpTypeTokenToFqn(reference.classToken, namespace, useAliases);
    const classShort = resolvedClass.split('\\').pop();
    const keys = [`${resolvedClass}::${reference.member}`, `${classShort}::${reference.member}`];
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) return sigs;
    }
    return [];
  }

  if (reference && reference.kind === 'this') {
    const className = findEnclosingPhpClassName(document, position);
    if (className) {
      const keys = [`${className}::${reference.member}`];
      for (const key of keys) {
        const sigs = phpWorkspaceFunctionInfoByKey.get(key);
        if (sigs && sigs.length > 0) return sigs;
      }
    }
    return [];
  }

  const candidates = [];
  if (namespace) candidates.push(`${namespace}\\${name}`);
  candidates.push(name);
  for (const key of candidates) {
    const sigs = phpWorkspaceFunctionInfoByKey.get(key);
    if (sigs && sigs.length > 0) return sigs;
  }
  return [];
}

function getPhpClassCompletionContext(linePrefix) {
  const prefix = String(linePrefix || '');
  const mNew = prefix.match(/\bnew\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)?$/);
  if (mNew) return { kind: 'new', typed: mNew[1] || '' };
  const mExt = prefix.match(/\bextends\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)?$/);
  if (mExt) return { kind: 'extends', typed: mExt[1] || '' };
  const mImpl = prefix.match(/\bimplements\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)?$/);
  if (mImpl) return { kind: 'implements', typed: mImpl[1] || '' };
  const mCatch = prefix.match(/\bcatch\s*\(\s*([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)?$/);
  if (mCatch) return { kind: 'catch', typed: mCatch[1] || '' };
  return null;
}

function createPhpClassCompletionItems(document, position, classCtx) {
  const typed = String(classCtx && classCtx.typed ? classCtx.typed : '');
  const typedTrim = typed.replace(/^\\+/, '');
  const wantsFqn = typed.startsWith('\\');
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);
  const importedFqns = new Set(Object.values(useAliases || {}));

  const items = [];
  for (const [shortName, fqns] of phpWorkspaceClassFqnsByShortName.entries()) {
    if (typedTrim && !shortName.toLowerCase().startsWith(typedTrim.toLowerCase())) continue;
    for (const fqn of fqns) {
      const label = wantsFqn ? `\\${fqn}` : shortName;
      const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Class);
      item.detail = fqn;
      item.sortText = `0${shortName}`;
      if (!wantsFqn) {
        const shouldImport = fqn.includes('\\') && !importedFqns.has(fqn) && !(namespace && fqn.startsWith(`${namespace}\\`));
        if (shouldImport) {
          const insertPos = findPhpUseInsertPosition(document);
          item.additionalTextEdits = [vscode.TextEdit.insert(insertPos, `use ${fqn};\n`)];
        }
        item.insertText = shortName;
      } else {
        item.insertText = `\\${fqn}`;
      }
      items.push(item);
      if (items.length >= 120) return items;
    }
  }
  return items;
}

async function getBuiltInPhpFunctionSignature(functionName) {
  const config = vscode.workspace.getConfiguration('php');
  const phpPath = config.get('executablePath', 'php');
  const cacheKey = `${phpPath}::${functionName}`;
  const cached = phpBuiltInFunctionSignatureCache.get(cacheKey);
  if (cached) return cached;

  const payload = await runPhpReflectionForFunction(phpPath, functionName);
  if (!payload) return null;

  const params = (payload.parameters || []).map((p) => {
    const type = p.type || 'mixed';
    const variadic = p.variadic ? '...' : '';
    const byRef = p.byReference ? '&' : '';
    const label = `${type} ${variadic}${byRef}$${p.name}`.replace(/\s+/g, ' ').trim();
    return { label };
  });
  const returnType = payload.returnType || 'mixed';
  const label = `${functionName}(${params.map((p) => p.label).join(', ')}): ${returnType}`;
  const signature = { label, parameters: params, documentation: undefined };
  phpBuiltInFunctionSignatureCache.set(cacheKey, signature);
  return signature;
}

function runPhpReflectionForFunction(phpPath, functionName) {
  return new Promise((resolve) => {
    const code = `
$name = ${JSON.stringify(functionName)};
try {
  $rf = new ReflectionFunction($name);
  $params = [];
  foreach ($rf->getParameters() as $p) {
    $t = $p->getType();
    $params[] = [
      "name" => $p->getName(),
      "type" => $t ? (string)$t : "",
      "variadic" => $p->isVariadic(),
      "byReference" => $p->isPassedByReference()
    ];
  }
  $rt = $rf->getReturnType();
  echo json_encode([
    "name" => $rf->getName(),
    "returnType" => $rt ? (string)$rt : "",
    "parameters" => $params
  ]);
} catch (Throwable $e) {
  echo "";
}
`.trim();
    const php = spawn(phpPath, ['-r', code]);
    let stdout = '';
    php.stdout.on('data', (d) => { stdout += d.toString(); });
    php.on('close', () => {
      const text = String(stdout || '').trim();
      if (!text) return resolve(null);
      try {
        return resolve(JSON.parse(text));
      } catch {
        return resolve(null);
      }
    });
    php.on('error', () => resolve(null));
    setTimeout(() => {
      try { php.kill(); } catch {}
      resolve(null);
    }, 1500);
  });
}

function inferPhpVariableTypes(document, position) {
  const offset = document.offsetAt(position);
  const startOffset = Math.max(0, offset - 12000);
  const text = document.getText(new vscode.Range(document.positionAt(startOffset), position));
  const namespace = getPhpNamespace(document.getText());
  const useAliases = parsePhpUseAliases(document.getText());
  const map = new Map();

  const docVarRe = /\/\*\*[\s\S]*?\*\/\s*\$([A-Za-z_\x80-\xff][\w\x80-\xff]*)/g;
  let match;
  while ((match = docVarRe.exec(text))) {
    const docblock = findPhpDocblockBeforeOffset(text, match.index + 3);
    const doc = parsePhpDocblock(docblock);
    const name = `$${match[1]}`;
    const type = doc.params[name] || doc.returns || '';
    if (type) map.set(name, resolvePhpTypeTokenToFqn(type, namespace, useAliases));
  }

  const assignRe = /(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*=\s*([^;]+);/g;
  while ((match = assignRe.exec(text))) {
    const name = match[1];
    const rhs = match[2].trim();
    const inferred = inferPhpTypeFromExpression(rhs, namespace, useAliases, map);
    if (inferred) map.set(name, inferred);
  }
  return map;
}

function inferPhpTypeFromExpression(expr, namespace, useAliases, existingVarTypes) {
  const text = String(expr || '').trim();
  if (!text) return '';
  if (text.startsWith('new ')) {
    const m = text.match(/^new\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)/);
    if (m) return resolvePhpTypeTokenToFqn(m[1], namespace, useAliases);
  }
  if (/^\[.*\]$/.test(text) || /^array\s*\(/i.test(text)) return 'array';
  if (/^(true|false)$/i.test(text)) return 'bool';
  if (/^null$/i.test(text)) return 'null';
  if (/^[0-9]+$/.test(text)) return 'int';
  if (/^[0-9]+\.[0-9]+$/.test(text)) return 'float';
  if ((text.startsWith('\'') && text.endsWith('\'')) || (text.startsWith('"') && text.endsWith('"'))) return 'string';
  if (/^function\s*\(/.test(text) || /^fn\s*\(/.test(text)) return 'Closure';
  const varMatch = text.match(/^(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)$/);
  if (varMatch && existingVarTypes && existingVarTypes.get(varMatch[1])) return existingVarTypes.get(varMatch[1]);
  const staticCallMatch = text.match(/^([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)\s*::\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/);
  if (staticCallMatch) {
    const resolvedClass = resolvePhpTypeTokenToFqn(staticCallMatch[1], namespace, useAliases);
    const classShort = resolvedClass.split('\\').pop();
    const keys = [`${resolvedClass}::${staticCallMatch[2]}`, `${classShort}::${staticCallMatch[2]}`];
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) {
        const label = sigs[0].label || '';
        const returnMatch = label.match(/\)\s*:\s*([^\s]+)\s*$/);
        if (returnMatch) return resolvePhpTypeTokenToFqn(returnMatch[1], namespace, useAliases);
      }
    }
  }
  const fnCallMatch = text.match(/^([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/);
  if (fnCallMatch) {
    const name = fnCallMatch[1];
    const keys = [namespace ? `${namespace}\\${name}` : '', name].filter(Boolean);
    for (const key of keys) {
      const sigs = phpWorkspaceFunctionInfoByKey.get(key);
      if (sigs && sigs.length > 0) {
        const label = sigs[0].label || '';
        const returnMatch = label.match(/\)\s*:\s*([^\s]+)\s*$/);
        if (returnMatch) return resolvePhpTypeTokenToFqn(returnMatch[1], namespace, useAliases);
      }
    }
  }
  return '';
}

function providePhpImportCodeActions(document, range, context) {
  const actions = [];
  const text = document.getText();
  const wordRange = document.getWordRangeAtPosition(range.start, /[A-Za-z_\x80-\xff][\w\x80-\xff]*/);
  if (!wordRange) return actions;
  const word = document.getText(wordRange);
  if (!word || word.includes('\\')) return actions;
  if (phpKeywords.includes(word)) return actions;

  const uses = parsePhpUseAliases(text);
  if (uses[word]) return actions;

  const candidates = phpWorkspaceClassFqnsByShortName.get(word) || [];
  if (candidates.length === 0) return actions;

  for (const fqn of candidates.slice(0, 6)) {
    const action = new vscode.CodeAction(`Import ${fqn}`, vscode.CodeActionKind.QuickFix);
    action.edit = new vscode.WorkspaceEdit();
    const insertPos = findPhpUseInsertPosition(document);
    action.edit.insert(document.uri, insertPos, `use ${fqn};\n`);
    action.isPreferred = candidates.length === 1;
    actions.push(action);
  }

  if (actions.length > 0) {
    const organize = new vscode.CodeAction('Organize Imports', vscode.CodeActionKind.SourceOrganizeImports);
    organize.edit = new vscode.WorkspaceEdit();
    const organized = organizePhpUseStatements(text);
    if (organized && organized !== text) {
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
      organize.edit.replace(document.uri, fullRange, organized);
      actions.push(organize);
    }
  }

  return actions;
}

function findPhpUseInsertPosition(document) {
  const text = document.getText();
  const namespaceMatch = /^\s*namespace\s+[^;{]+;\s*\r?\n/m.exec(text);
  const useRe = /^\s*use\s+[^;]+;\s*\r?\n/gm;
  let lastUseEnd = -1;
  let match;
  while ((match = useRe.exec(text))) lastUseEnd = match.index + match[0].length;
  if (lastUseEnd !== -1) return document.positionAt(lastUseEnd);
  if (namespaceMatch) return document.positionAt(namespaceMatch.index + namespaceMatch[0].length);
  const phpOpenTag = /<\?(?:php|=)?\s*\r?\n/.exec(text);
  if (phpOpenTag) return document.positionAt(phpOpenTag.index + phpOpenTag[0].length);
  return new vscode.Position(0, 0);
}

function organizePhpUseStatements(text) {
  const lines = String(text).split(/\r?\n/);
  const useLines = [];
  const otherLines = [];
  for (const line of lines) {
    if (/^\s*use\s+[^;]+;\s*$/.test(line)) useLines.push(line.trim());
    else otherLines.push(line);
  }
  if (useLines.length <= 1) return text;
  const sortedUses = Array.from(new Set(useLines)).sort((a, b) => a.localeCompare(b));
  const out = [];
  let inserted = false;
  for (let i = 0; i < otherLines.length; i++) {
    const line = otherLines[i];
    out.push(line);
    if (!inserted && /^\s*namespace\s+[^;{]+;\s*$/.test(line)) {
      out.push(...sortedUses);
      inserted = true;
    }
  }
  if (!inserted) {
    const phpIndex = out.findIndex((l) => /<\?(?:php|=)?/.test(l));
    if (phpIndex !== -1) {
      out.splice(phpIndex + 1, 0, ...sortedUses);
      inserted = true;
    }
  }
  if (!inserted) out.unshift(...sortedUses);
  return out.join('\n');
}

function createPhpSemanticTokensProvider() {
  const tokenTypes = [
    vscode.SemanticTokenTypes.namespace,
    vscode.SemanticTokenTypes.class,
    vscode.SemanticTokenTypes.interface,
    vscode.SemanticTokenTypes.enum,
    vscode.SemanticTokenTypes.function,
    vscode.SemanticTokenTypes.method,
    vscode.SemanticTokenTypes.property,
    vscode.SemanticTokenTypes.variable,
    vscode.SemanticTokenTypes.parameter,
    vscode.SemanticTokenTypes.type,
    vscode.SemanticTokenTypes.constant,
    vscode.SemanticTokenTypes.keyword
  ];
  const legend = new vscode.SemanticTokensLegend(tokenTypes, []);
  const registration = vscode.languages.registerDocumentSemanticTokensProvider('php', {
    provideDocumentSemanticTokens(document) {
      const builder = new vscode.SemanticTokensBuilder(legend);
      const text = document.getText();

      const classDeclRe = /\b(?:abstract\s+|final\s+)?(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)/g;
      let match;
      while ((match = classDeclRe.exec(text))) {
        const kw = match[1];
        const name = match[2];
        const idx = match.index + match[0].lastIndexOf(name);
        const pos = document.positionAt(idx);
        const type =
          kw === 'interface' ? vscode.SemanticTokenTypes.interface :
          kw === 'enum' ? vscode.SemanticTokenTypes.enum :
          vscode.SemanticTokenTypes.class;
        builder.push(pos.line, pos.character, name.length, tokenTypes.indexOf(type), 0);
      }

      const functionDeclRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
      while ((match = functionDeclRe.exec(text))) {
        const name = match[1];
        const idx = match.index + match[0].lastIndexOf(name);
        const pos = document.positionAt(idx);
        builder.push(pos.line, pos.character, name.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.function), 0);
      }

      const variableRe = /\$[A-Za-z_\x80-\xff][\w\x80-\xff]*/g;
      while ((match = variableRe.exec(text))) {
        const name = match[0];
        const pos = document.positionAt(match.index);
        builder.push(pos.line, pos.character, name.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.variable), 0);
      }

      const constRe = /\b[A-Z_][A-Z0-9_]{2,}\b/g;
      while ((match = constRe.exec(text))) {
        const name = match[0];
        const pos = document.positionAt(match.index);
        builder.push(pos.line, pos.character, name.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.constant), 0);
      }

      const dqlCallRe = /\bcreateQuery\s*\(\s*(['"])([\s\S]*?)\1/g;
      while ((match = dqlCallRe.exec(text))) {
        const queryText = match[2] || '';
        if (!queryText) continue;
        const queryStartIndex = match.index + match[0].indexOf(queryText);

        const keywordRe = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|AS|DISTINCT|UPDATE|DELETE|INSERT|INTO|SET|VALUES|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|EXISTS|NEW|INSTANCE|OF|MEMBER)\b/gi;
        let m;
        while ((m = keywordRe.exec(queryText))) {
          const k = m[0];
          const abs = queryStartIndex + m.index;
          const pos = document.positionAt(abs);
          builder.push(pos.line, pos.character, k.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.keyword), 0);
        }

        const namedParamRe = /:[A-Za-z_][A-Za-z0-9_]*/g;
        while ((m = namedParamRe.exec(queryText))) {
          const p = m[0];
          const abs = queryStartIndex + m.index;
          const pos = document.positionAt(abs);
          builder.push(pos.line, pos.character, p.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.parameter), 0);
        }

        const positionalParamRe = /\?[0-9]+/g;
        while ((m = positionalParamRe.exec(queryText))) {
          const p = m[0];
          const abs = queryStartIndex + m.index;
          const pos = document.positionAt(abs);
          builder.push(pos.line, pos.character, p.length, tokenTypes.indexOf(vscode.SemanticTokenTypes.parameter), 0);
        }
      }

      return builder.build();
    }
  }, legend);
  return { legend, registration };
}

function getPhpTypeHierarchyItemAtPosition(document, position) {
  const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z_\x80-\xff][\w\x80-\xff]*/);
  if (!wordRange) return null;
  const name = document.getText(wordRange);
  if (!name) return null;
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);
  const fqn = resolvePhpTypeTokenToFqn(name, namespace, useAliases);
  const info = phpWorkspaceClassInfoByFqn.get(fqn) || phpWorkspaceClassInfoByFqn.get(name) || null;
  if (!info) return null;
  const locs = phpWorkspaceIndex.get(fqn) || phpWorkspaceIndex.get(name) || [];
  const loc = locs.length > 0 ? locs[0] : new vscode.Location(document.uri, wordRange);
  const range = loc.range || wordRange;
  return new vscode.TypeHierarchyItem(info.kind || vscode.SymbolKind.Class, info.shortName || name, '', loc.uri, range, wordRange);
}

function providePhpSupertypes(item) {
  const name = item.name;
  const candidates = phpWorkspaceClassFqnsByShortName.get(name) || [];
  const fqn = candidates.length > 0 ? candidates[0] : name;
  const info = phpWorkspaceClassInfoByFqn.get(fqn);
  if (!info) return [];
  const parents = [...(info.extends || []), ...(info.implements || [])].filter(Boolean);
  return parents.map((p) => {
    const shortName = p.split('\\').pop();
    const locs = phpWorkspaceIndex.get(p) || phpWorkspaceIndex.get(shortName) || [];
    const loc = locs.length > 0 ? locs[0] : item.uri ? new vscode.Location(item.uri, item.range) : null;
    return new vscode.TypeHierarchyItem(vscode.SymbolKind.Class, shortName, '', loc ? loc.uri : item.uri, loc ? loc.range : item.range, item.selectionRange);
  });
}

function providePhpSubtypes(item) {
  const name = item.name;
  const fqnCandidates = phpWorkspaceClassFqnsByShortName.get(name) || [];
  const fqn = fqnCandidates.length > 0 ? fqnCandidates[0] : name;
  const subtypes = [];
  for (const [childFqn, info] of phpWorkspaceClassInfoByFqn.entries()) {
    if (!info) continue;
    const parents = [...(info.extends || []), ...(info.implements || [])];
    if (!parents.includes(fqn) && !parents.includes(name)) continue;
    const shortName = info.shortName || childFqn.split('\\').pop();
    const locs = phpWorkspaceIndex.get(childFqn) || phpWorkspaceIndex.get(shortName) || [];
    const loc = locs.length > 0 ? locs[0] : null;
    if (!loc) continue;
    subtypes.push(new vscode.TypeHierarchyItem(info.kind || vscode.SymbolKind.Class, shortName, '', loc.uri, loc.range, loc.range));
    if (subtypes.length >= 60) break;
  }
  return subtypes;
}

function getPhpCallHierarchyItemAtPosition(document, position) {
  const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z_\x80-\xff][\w\x80-\xff]*/);
  if (!wordRange) return null;
  const name = document.getText(wordRange);
  if (!name) return null;
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);
  const enclosingClass = findEnclosingPhpClassName(document, position);

  const isMethod = enclosingClass && isPositionWithinPhpClassMember(document, position, enclosingClass, name);
  const key = isMethod ? `${enclosingClass}::${name}` : (namespace ? `${namespace}\\${name}` : name);
  const locs = phpWorkspaceIndex.get(key) || phpWorkspaceIndex.get(name) || [];
  if (locs.length === 0) return null;
  const loc = locs[0];
  const kind = isMethod ? vscode.SymbolKind.Method : vscode.SymbolKind.Function;
  const containerName = isMethod ? enclosingClass : namespace;
  return new vscode.CallHierarchyItem(kind, name, '', loc.uri, loc.range, loc.range);
}

function isPositionWithinPhpClassMember(document, position, className, memberName) {
  const text = document.getText();
  const range = findPhpClassMemberRange(text, className);
  if (!range) return false;
  const memberMatch = new RegExp(`\\bfunction\\s+&?\\s*${escapeRegExp(memberName)}\\s*\\(`, 'g').exec(text.slice(range.start, range.end));
  if (!memberMatch) return false;
  const memberIndex = range.start + memberMatch.index;
  return document.offsetAt(position) >= memberIndex;
}

async function providePhpOutgoingCalls(item) {
  const doc = await vscode.workspace.openTextDocument(item.uri);
  const text = doc.getText();
  const offset = doc.offsetAt(item.selectionRange.start);
  const range = findPhpFunctionBodyRangeAtOffset(text, offset);
  if (!range) return [];
  const calls = extractPhpCalls(text.slice(range.start, range.end));
  const results = [];
  for (const call of calls) {
    const callPos = doc.positionAt(range.start + call.offset);
    const target = resolveCallHierarchyTargetFromCall(doc, call, callPos);
    if (!target) continue;
    results.push(new vscode.CallHierarchyOutgoingCall(target, [new vscode.Range(doc.positionAt(range.start + call.offset), doc.positionAt(range.start + call.offset + call.length))]));
    if (results.length >= 60) break;
  }
  return results;
}

async function providePhpIncomingCalls(item) {
  const include = '**/*.{php,phtml,php3,php4,php5,phps}';
  const exclude = '{**/node_modules/**,**/vendor/**,**/.git/**,**/.vscode/**,**/dist/**,**/out/**}';
  const uris = await vscode.workspace.findFiles(include, exclude);
  const results = [];
  const targetName = item.name;
  const callRe = new RegExp(`\\b${escapeRegExp(targetName)}\\s*\\(`, 'g');
  for (const uri of uris) {
    let doc;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch {
      continue;
    }
    const text = doc.getText();
    let match;
    while ((match = callRe.exec(text))) {
      const pre = text.slice(Math.max(0, match.index - 20), match.index);
      if (/\bfunction\s+&?\s*$/.test(pre)) continue;
      const pos = doc.positionAt(match.index);
      const callerItem = getPhpEnclosingCallHierarchyItem(doc, pos);
      if (!callerItem) continue;
      results.push(new vscode.CallHierarchyIncomingCall(callerItem, [new vscode.Range(pos, doc.positionAt(match.index + targetName.length))]));
      if (results.length >= 60) return results;
    }
  }
  return results;
}

function findPhpFunctionBodyRangeAtOffset(text, offset) {
  const head = text.slice(0, offset + 1);
  const fnIndex = head.lastIndexOf('function');
  if (fnIndex === -1) return null;
  const braceStart = text.indexOf('{', fnIndex);
  if (braceStart === -1) return null;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return null;
  return { start: braceStart + 1, end: braceEnd };
}

function extractPhpCalls(bodyText) {
  const calls = [];
  const fnCallRe = /\b([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  let match;
  while ((match = fnCallRe.exec(bodyText))) {
    calls.push({ kind: 'function', name: match[1], offset: match.index, length: match[1].length });
    if (calls.length >= 200) break;
  }
  const staticCallRe = /\b([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)\s*::\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  while ((match = staticCallRe.exec(bodyText))) {
    calls.push({ kind: 'static', classToken: match[1], name: match[2], offset: match.index, length: match[0].length });
    if (calls.length >= 200) break;
  }
  const methodCallRe = /(\$this|\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*->\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  while ((match = methodCallRe.exec(bodyText))) {
    calls.push({ kind: 'method', receiver: match[1], name: match[2], offset: match.index, length: match[0].length });
    if (calls.length >= 200) break;
  }
  return calls;
}

function getPhpEnclosingCallHierarchyItem(document, position) {
  const text = document.getText();
  const offset = document.offsetAt(position);
  const fn = findEnclosingPhpFunctionAtOffset(document, text, offset);
  if (!fn) return null;
  const locs = phpWorkspaceIndex.get(fn.key) || phpWorkspaceIndex.get(fn.name) || [];
  const loc = locs.length > 0 ? locs[0] : new vscode.Location(document.uri, fn.selectionRange);
  return new vscode.CallHierarchyItem(fn.kind, fn.name, '', loc.uri, loc.range, fn.selectionRange);
}

function findEnclosingPhpFunctionAtOffset(document, text, offset) {
  const head = text.slice(0, Math.max(0, offset));
  const fnRe = /\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(/g;
  let match;
  let last = null;
  while ((match = fnRe.exec(head))) last = { name: match[1], index: match.index + match[0].lastIndexOf(match[1]) };
  if (!last) return null;
  const braceStart = text.indexOf('{', last.index);
  if (braceStart === -1) return null;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return null;
  if (offset < braceStart || offset > braceEnd) return null;

  const pos = document.positionAt(last.index);
  const className = findEnclosingPhpClassName(document, pos);
  const isMethod = className && isOffsetWithinClass(text, last.index, className);
  const namespace = getPhpNamespace(text);
  const key = isMethod ? `${className}::${last.name}` : (namespace ? `${namespace}\\${last.name}` : last.name);
  const selectionRange = document.getWordRangeAtPosition(pos, /[A-Za-z_\x80-\xff][\w\x80-\xff]*/) || new vscode.Range(pos, pos);
  return { name: last.name, key, kind: isMethod ? vscode.SymbolKind.Method : vscode.SymbolKind.Function, selectionRange };
}

function isOffsetWithinClass(text, offset, className) {
  const range = findPhpClassMemberRange(text, className);
  if (!range) return false;
  return offset >= range.start && offset <= range.end;
}

function resolveCallHierarchyTargetFromCall(document, call, position) {
  const text = document.getText();
  const namespace = getPhpNamespace(text);
  const useAliases = parsePhpUseAliases(text);
  if (call.kind === 'function') {
    const candidates = [];
    if (namespace) candidates.push(`${namespace}\\${call.name}`);
    candidates.push(call.name);
    for (const key of candidates) {
      const locs = phpWorkspaceIndex.get(key);
      if (locs && locs.length > 0) return new vscode.CallHierarchyItem(vscode.SymbolKind.Function, call.name, '', locs[0].uri, locs[0].range, locs[0].range);
    }
    return null;
  }
  if (call.kind === 'static') {
    const resolvedClass = resolvePhpTypeTokenToFqn(call.classToken, namespace, useAliases);
    const classShort = resolvedClass.split('\\').pop();
    const keys = [`${resolvedClass}::${call.name}`, `${classShort}::${call.name}`];
    for (const key of keys) {
      const locs = phpWorkspaceIndex.get(key);
      if (locs && locs.length > 0) return new vscode.CallHierarchyItem(vscode.SymbolKind.Method, call.name, '', locs[0].uri, locs[0].range, locs[0].range);
    }
    return null;
  }
  if (call.kind === 'method') {
    const inferred = inferPhpVariableTypes(document, position);
    let receiverType = '';
    if (call.receiver === '$this') receiverType = findEnclosingPhpClassName(document, position) || '';
    if (!receiverType && call.receiver && call.receiver.startsWith('$')) receiverType = inferred.get(call.receiver) || '';
    const resolvedType = resolvePhpTypeTokenToFqn(receiverType, namespace, useAliases);
    const classShort = resolvedType.split('\\').pop();
    const keys = resolvedType ? [`${resolvedType}::${call.name}`, `${classShort}::${call.name}`] : [];
    keys.push(call.name);
    for (const key of keys) {
      const locs = phpWorkspaceIndex.get(key);
      if (locs && locs.length > 0) return new vscode.CallHierarchyItem(vscode.SymbolKind.Method, call.name, '', locs[0].uri, locs[0].range, locs[0].range);
    }
  }
  return null;
}

function runPhpLint(phpPath, filePath) {
  return new Promise((resolve, reject) => {
    const php = spawn(phpPath, ['-l', filePath]);
    let stdout = '';
    let stderr = '';
    php.stdout.on('data', (data) => { stdout += data.toString(); });
    php.stderr.on('data', (data) => { stderr += data.toString(); });
    php.on('error', reject);
    php.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function withTempPhpFile(contents, fn) {
  const tempDir = os.tmpdir();
  const name = `php-pro-${crypto.randomBytes(8).toString('hex')}.php`;
  const tempPath = path.join(tempDir, name);
  await fs.promises.writeFile(tempPath, contents, 'utf8');
  try {
    return await fn(tempPath);
  } finally {
    try {
      await fs.promises.unlink(tempPath);
    } catch {}
  }
}

function parsePhpLintOutput(output) {
  const diagnostics = [];
  const lines = String(output || '').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/(?:PHP\s+)?(?:Parse|Fatal)\s+error:\s*(.*?)\s+in\s+.*?\s+on\s+line\s+(\d+)/i);
    if (!match) continue;
    const lineNum = Math.max(0, parseInt(match[2], 10) - 1);
    const message = match[1] || line.trim();
    diagnostics.push({ lineNum, message });
  }
  return diagnostics;
}

async function validatePhpFile(document, options = { showMessages: false }) {
  const config = vscode.workspace.getConfiguration('php');
  if (!config.get('validate.enable')) return;
  const phpPath = config.get('executablePath', 'php');

  const startVersion = document.version;
  const lint = async (pathToLint) => {
    try {
      return await runPhpLint(phpPath, pathToLint);
    } catch (err) {
      const now = Date.now();
      if (now - lastPhpExecutableErrorAt > 15000) {
        lastPhpExecutableErrorAt = now;
        const message = err && err.code === 'ENOENT'
          ? `PHP executable not found: ${phpPath}`
          : `Failed to run PHP for syntax validation: ${phpPath}`;
        vscode.window.showErrorMessage(message);
      }
      throw err;
    }
  };

  let result;
  try {
    if (!document.isDirty && !document.isUntitled && document.uri && document.uri.fsPath) {
      result = await lint(document.uri.fsPath);
    } else {
      const contents = document.getText();
      result = await withTempPhpFile(contents, (tempPath) => lint(tempPath));
    }
  } catch {
    return;
  }

  if (document.version !== startVersion && !options.showMessages) return;

  const parsed = parsePhpLintOutput(`${result.stderr}\n${result.stdout}`);
  const vscodeDiagnostics = parsed.map(({ lineNum, message }) => {
    const range = new vscode.Range(lineNum, 0, lineNum, 1000);
    return new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
  });

  diagnosticCollection.set(document.uri, vscodeDiagnostics);
  if (options.showMessages) {
    if (vscodeDiagnostics.length > 0) {
      vscode.window.showErrorMessage('PHP syntax errors found!');
    } else {
      vscode.window.showInformationMessage('PHP syntax is valid!');
    }
  }
}

function deactivate() {
  if (diagnosticCollection) diagnosticCollection.dispose();
}

module.exports = { activate, deactivate };
