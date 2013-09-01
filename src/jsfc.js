(function(global) {
    "use strict";

    var JSFC = {
        environment: "draft4",
        targetKeywords: [
            "required", "pattern",
            "max", "min", "maxlength"
        ],
        _references: {},
    };
    var targetTypes = {
        text: true, search: true, url: true, email: true, password: true,
        range: true, number: true,
        date: true, month: true, week: true,
        datetime: true, "datetime-local": true, time: true,
        select: true, textarea: true
    };
    var supportedAttributes = {
        pattern: {
            text: true, search: true, url: true, email: true, password: true
        },
        min: {
            range: true, number: true,
            date: true, month: true, week: true,
            datetime: true, "datetime-local": true, time: true
        },
        max: {
            range: true, number: true,
            date: true, month: true, week: true,
            datetime: true, "datetime-local": true, time: true
        },
        required: {
            text: true, search: true, url: true, email: true, password: true,
            range: true, number: true,
            date: true, month: true, week: true,
            datetime: true, "datetime-local": true, time: true,
            select: true, textarea: true
        },
        maxlength: {
            text: true, search: true, url: true, email: true, password: true,
            textarea: true
        }
    };

    var urlParser = document.createElement("a");
    var patternCache = {};

    Object.defineProperty(JSFC, "targetTypes", {
        set: function(types) {
            targetTypes = {};
            types.forEach(function(targetType) {
                targetTypes[targetType] = true;
            });
        },
        get: function() {
            return Object.keys(targetTypes).filter(function(k) {
                return targetTypes[k];
            });
        }
    });

    JSFC.registerSchema = function(schemaId, schema) {
        this._references[schemaId] = schema;
    };

    JSFC.loadSchema = function(schemaId, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", schemaId, true);

        xhr.onload = function() {
            if ( xhr.status === 200 ) {
                var schema;
                try {
                    schema = JSON.parse(xhr.responseText);
                }
                catch (e) {
                }
                JSFC.registerSchema(id, schema);
                cb(JSFC);
            }
        };

        xhr.send();
    };

    JSFC.apply = function(schema, form) {
        var inputElements = this._retrieveInputElements(form);
        var context = {
            environment: JSFC.environment,
            keywords: {},
            currentSchema: schema
        };

        JSFC.targetKeywords.forEach(function(targetKeyword) {
            if ( keywords[context.environment][targetKeyword] ) {
                context.keywords[targetKeyword] = keywords[context.environment][targetKeyword];
            }
        });

        while ( schema["$ref"] ) {
            schema = JSFC._resolveReference(context, schema["$ref"]);
        }

        if ( schema.properties || schema.patternProperties ) {
            context.keywords.properties(context, schema, inputElements);
        }

        if ( schema.required && context.keywords["required"] ) {
            context.keywords.required(context, schema, inputElements);
        }
    };

    JSFC._retrieveInputElements = function(form) {
        var inputElements = {};
        Array.prototype.forEach.call(form.querySelectorAll("input,select,textarea"), function(elem) {
            var type;

            if ( elem.tagName === "INPUT" ) {
                type = elem.getAttribute("type");
            }
            else if ( elem.tagName === "SELECT" ) {
                type = "select";
            }
            else if ( elem.tagName === "TEXTAREA" ) {
                type = "textarea";
            }
            if ( ! targetTypes[type] ) return;

            inputElements[elem.getAttribute("name")] = {
                type: type,
                elem: elem
            };
        });
        return inputElements;
    };

    JSFC._supported = function(type, attribute) {
        return !!supportedAttributes[attribute][type];
    };

    JSFC._resolveReference = function(context, ref) {
        var schema;
        if ( ref.indexOf("http") === 0 ) {
            urlParser.href = ref;
            var schemaId = urlParser.protocol + "//" + urlParser.host + urlParser.pathname + urlParser.search;

            schema = JSFC._references[schemaId];
            context.currentSchema = schema;
            if ( urlParser.hash.length > 0 ) {
                schema = JSFC._resolvePointer(schema, urlParser.hash.substr(1));
            }
        }
        else {
            schema = JSFC._resolvePointer(context.currentSchema, ref.substr(1));
        }

        if ( ! schema ) {
            throw new Error("hoge");
        }

        return schema;
    };

    JSFC._resolvePointer = function(current, pointer) {
        var p = pointer.split("/");
        for ( var i = 1, j = p.length; i < j; i++ ) {
            if ( ! current[p[i]] ) return null;
            current = current[p[i]];
        }
        return current;
    };


    // keywords

    var keywords = {
        draft4: {}
    };

    //keywords.draft4.ref = function(context, schema, instance) {
        //var ref = schema["$ref"];
        //var resolvedSchema = JSFC._resolveReference(context, ref);
        //JSFC.apply(instance, resolvedSchema);
    //};

    keywords.draft4.properties = function(context, schema, instance) {
        // additionalProperties, maxProperties and minProperties are not supported
        var properties = schema.properties;
        var patternProperties = schema.patternProperties;

        if ( properties ) {
            Object.keys(properties).forEach(function(key) {
                if ( instance[key] ) {
                    var propertySchema = properties[key];
                    Object.keys(propertySchema).forEach(function(k) {
                        var p = context.keywords[k];
                        if ( p ) p(context, propertySchema, instance[key]);
                    });
                }
            });
        }

        if ( patternProperties ) {
            Object.keys(patternProperties).forEach(function(pattern) {
                var regexp = (patternCache[pattern] || (patternCache[pattern] = new RegExp(pattern)));
                Object.keys(instance).forEach(function(name) {
                    if ( name.match(regexp) ) {
                        var propertySchema = patternProperties[pattern];
                        Object.keys(propertySchema).forEach(function(k) {
                            var p = context.keywords[k];
                            if ( p ) p(context, propertySchema, instance[name]);
                        });
                    }
                });
            });
        }
    };

    keywords.draft4.default = function(context, schema, instance) {
        instance.elem.setAttribute("value", schema.default);
    };

    keywords.draft4.title = function(context, schema, instance) {
        instance.elem.setAttribute("placeholder", schema.title);
    };

    keywords.draft4.description = function(context, schema, instance) {
        instance.elem.setAttribute("placeholder", schema.description);
    };

    keywords.draft4.maximum = function(context, schema, instance) {
        // exclusiveMaximum is not supported
        if ( ! JSFC._supported(instance.type, "max") ) return;
        instance.elem.setAttribute("max", schema.maximum);
    };

    keywords.draft4.minimum = function(context, schema, instance) {
        // exclusiveMinimum is not supported
        if ( ! JSFC._supported(instance.type, "min") ) return;
        instance.elem.setAttribute("min", schema.minimum);
    };

    keywords.draft4.maxlength = function(context, schema, instance) {
        if ( ! JSFC._supported(instance.type, "maxlength") ) return;
        instance.elem.setAttribute("maxlength", schema.maxlength);
    };

    keywords.draft4.pattern = function(context, schema, instance) {
        if ( ! JSFC._supported(instance.type, "pattern") ) return;
        instance.elem.setAttribute("pattern", schema.pattern);
    };

    keywords.draft4.required = function(context, schema, instance) {
        schema.required.forEach(function(name) {
            if ( ! JSFC._supported(instance[name].type, "required") ) return;
            instance[name].elem.required = true;
        });
    };

    Object.defineProperty(JSFC, "keywords", {
        value: keywords,
        writable: false,
        enumerable: false,
        configurable: false
    });

    global.JSFC = JSFC;
})(this.self || global);
