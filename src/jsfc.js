(function(global) {
    "use strict";

    var JSFC = {
        environment: "draft4",
        references: {},
    };
    var urlParser = document.createElement("a");
    var config = {
        targetTypes: {
            text: true, search: true, url: true, email: true, password: true,
            range: true, number: true,
            date: true, month: true, week: true,
            datetime: true, "datetime-local": true, time: true,
            select: true, textarea: true
        }
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

    Object.defineProperty(JSFC, "targetTypes", {
        set: function(targetTypes) {
            config.targetTypes = {};
            targetTypes.forEach(function(targetType) {
                config.targetTypes[targetType] = true;
            });
        },
        get: function() {
            return Object.keys(config.targetTypes).filter(function(k) {
                return config.targetTypes[k];
            });
        }
    });

    JSFC.references = {};
    JSFC.registerSchema = function(id, schema) {
        this.references[id] = schema;
    };

    JSFC.loadSchema = function(id, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", id, true);
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
    };

    JSFC.apply = function(schema, form) {
        var inputElements = this._retrieveInputElements(form);
        var context = {
            environment: JSFC.environment,
        };
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
            if ( ! config.targetTypes[type] ) return;

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
            var a = urlParser;
            a.href = ref;
            var url = a.protocol + "//" + a.host + a.pathname + a.search;

            schema = JSFC.references[url];
            context.currentSchema = schema;
            if ( a.hash ) {
                schema = JSFC._resolvePointer(schema, a.hash);
            }
        }
        else {
            schema = JSFC._resolvePointer(context.currentSchema, ref.substr(1));
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

    keywords.draft4.ref = function(context, schema, instance) {
        var ref = schema["$ref"];
        var resolvedSchema = JSFC._resolveReference(context, ref);
        JSFC.apply(instance, resolvedSchema);
    };

    keywords.draft4.properties = function(context, schema, instance) {
        var properties = schema.properties;
        if ( ! properties ) return;

        Object.keys(properties).forEach(function(key) {
            if ( instance[key] ) {
                var propertySchema = properties[key];
                Object.keys(propertySchema).forEach(function(k) {
                    var p = keywords[context.environment][k];
                    if ( p ) p(context, propertySchema, instance[key]);
                });
            }
        });
    };

    keywords.draft4.default = function(context, schema, instance) {
        instance.elem.setAttribute("value", schema.default);
    };

    keywords.draft4.maximum = function(context, schema, instance) {
        if ( ! JSFC._supported(instance.type, "max") ) return;
        // exclusiveMaximum is not supported
        instance.elem.setAttribute("max", schema.maximum);
    };

    keywords.draft4.minimum = function(context, schema, instance) {
        if ( ! JSFC._supported(instance.type, "min") ) return;
        // exclusiveMinimum is not supported
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
