<?php

// Test file for PHP Enhanced Pro extension

class TestClass {
    private $property;

    public function __construct($param) {
        $this->property = $param;
    }

    public function testMethod() {
        // Test autocompletion for:
        // 1. Built-in functions
        str_replace();
        array_map();
        json_encode();
        
        // 2. Magic methods
        __construct();
        __toString();
        
        // 3. Snippets - type these prefixes to see suggestions:
        // class
        // function
        // foreach
        // if
        // trycatch
        
        // 4. Class members
        $obj = new TestClass('test');
        $obj->testMethod();
        
        // 5. Class completion after 'new'
    }
}

// Test function for unit test generation
function testFunction($param) {
    return $param;
}

?>
