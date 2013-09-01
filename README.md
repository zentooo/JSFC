JSFC
===

### JSFC (JSON Schema Form Constraints) is ...
a JavaScript library that converts JSON Schema to HTML5 Form constraints.

Note: This library does not validate form values. It just applies JSON Schema to input/select/textarea elements in your form. Validataion itself will be done by Browser native support or polyfill library like [H5F](https://github.com/ryanseddon/H5F).


### Supported JSON Schema drafts

- [draft4](http://tools.ietf.org/html/draft-zyp-json-schema-04)


### Supported JSON Schema keywords

Not supported keywords are just ignored. (e.g. oneOf, allOf, anyOf, etc...)

#### properties

#### patternProperties

#### required
Interpret as "required" attribute of input, select and textarea

#### pattern
Interpret as "pattern" attribute of input, select and textarea

#### maximum
Interpret as "max" attribute of input, select and textarea

#### minimum
Interpret as "min" attribute of input, select and textarea

#### maxlength
Interpret as "maxlength" attribute of input, select and textarea

#### default (not enabled as default)
Interpret as "value" attribute of input, select and textarea

#### title (not enabled as default)
Interpret as "placeholder" attribute of input, select and textarea

#### description (not enabled as default)
Interpret as "placeholder" attribute of input, select and textarea


### Usage

#### apply schema to the form element

Given HTML below...

```
<form id="funny-form" action="http://example.com" method="GET">
    <input type="text" name="nickname" />
    <input type="number" name="age" />
    <select name="sex" >
        <option value="M">male</option>
        <option value="F">female</option>
    </select>
</form>
```

and code is...

```
var form = document.getElementById("funny-form");
var schema = {
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "id": "http://example.schema.com/funny/form.json",
    "title": "Funny form validation schema",
    "properties": {
        "nickname": {
            type: "string",
            pattern: "[a-z0-9]{1,12}"
        },
        "age": {
            type: "number",
            maximum: "100"
        },
        "sex": {
            type: "string"
        }
    },
    required: ["nickname"]
};

JSFC.apply(schema, form);
```

then, result HTML would be:

```
<form id="funny-form" action="http://example.com" method="GET">
    <input type="text" name="nickname" pattern="[a-z0-9]{1,12}" required />
    <input type="number" name="age" max="100" />
    <select name="sex" >
        <option value="M">male</option>
        <option value="F">female</option>
    </select>
</form>
```

#### register schema and reference it

You can register schema with JSFC.registerSchema(schemaId, schema);

```
JSFC.registerSchema("http://example.schema.com/funny/form.json", {
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "id": "http://example.schema.com/funny/form.json",
    "title": "Funny form validation schema",
    "definitions": {
        "FunnyFormRequestParameters": {
            "properties": {
                "nickname": {
                    type: "string",
                    pattern: "[a-z0-9]{1,12}"
                },
                "age": {
                    type: "number",
                    maximum: "100"
                },
                "sex": {
                    type: "string"
                }
            },
            required: ["nickname"]
        }
    }
});
```

and reference it.

```
JSFC.apply({ "$ref": "http://example.schema.com/funny/form.json#/definitions/FunnyFormRequestParameters" }, form);
```
