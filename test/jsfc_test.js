buster.spec.expose();

describe("JSFC.targetTypes", function() {
    it("sets targetTypes", function() {
        var orig = JSFC.targetTypes;

        JSFC.targetTypes = ["text", "range"];
        expect(JSFC.targetTypes).toEqual(["text", "range"]);

        JSFC.targetTypes = orig;
        console.log(JSFC.targetTypes);
    });
});

describe("JSFC._supported", function() {
    it("judges that attribute supported with the element", function() {
        expect(JSFC._supported("text", "maxlength")).toBe(true);
        expect(JSFC._supported("text", "max")).toBe(false);
    });
});

describe("JSFC._retrieveInputElements", function() {
    /*:DOC form = <form>
        <input name="text" type="text" id="text"/>
        <input name="range" type="range" id="range" />
        <select name="select" id="select" />
        <textarea name="textarea" id="textarea" />
      </form>
    */
    it("find all input-like elements", function() {
        var inputElements = JSFC._retrieveInputElements(this.form);
        expect(inputElements["text"].elem.getAttribute("id")).toEqual("text");
        expect(inputElements["range"].elem.getAttribute("id")).toEqual("range");
        expect(inputElements["select"].elem.getAttribute("id")).toEqual("select");
        expect(inputElements["textarea"].elem.getAttribute("id")).toEqual("textarea");
    });
});

describe("JSFC._resolvePointer", function() {
    it("resolves JSON pointer", function() {
        var p = JSFC._resolvePointer({ foo: 1 }, "/foo");
        expect(p).toEqual(1);

        p = JSFC._resolvePointer([1, 2], "/1");
        expect(p).toEqual(2);

        p = JSFC._resolvePointer({ foo: { bar: [1, 2] } }, "/foo/bar");
        expect(p).toEqual([1, 2]);

        p = JSFC._resolvePointer({ foo: { bar: [1, 2] } }, "/foo/bar/0");
        expect(p).toEqual(1);

        p = JSFC._resolvePointer({ foo: { bar: [1, 2] } }, "/foo/baz/0");
        expect(p).toEqual(null);
    });
});

describe("JSFC._resolveReference", function() {
    it("resolves reference which starts with hash", function() {
        var schema = JSFC._resolveReference({
            currentSchema: {
                definitions: {
                    LoginRequestPayload: {
                        properties: {
                            id: {},
                            password: {},
                        }
                    }
                }
            },
        }, "#/definitions/LoginRequestPayload");
        expect(schema).toEqual({ properties: { id: {}, password: {} } });
    });

    it("resolves reference which is URL (absolute ref)", function() {
        JSFC.registerSchema("http://example.schema.org/schema.json", {
            definitions: {
                LoginRequestPayload: {
                    properties: {
                        id: {},
                        password: {},
                    }
                }
            }
        });
        var schema = JSFC._resolveReference({}, "http://example.schema.org/schema.json#/definitions/LoginRequestPayload");
        expect(schema).toEqual({ properties: { id: {}, password: {} } });
    });

    it("resolves reference which is URL (relative ref)", function() {
        JSFC.registerSchema("http://example.schema.org/schema.json", {
            definitions: {
                LoginRequestPayload: {
                    properties: {
                        id: {},
                        password: {},
                    }
                }
            },
            links: [
                {
                    schema: { "$ref": "#/definitions/LoginRequestPayload" }
                }
            ]
        });
        var context = {};
        var link = JSFC._resolveReference(context, "http://example.schema.org/schema.json#/links/0/schema");
        var schema = JSFC._resolveReference(context, link["$ref"]);
        expect(schema).toEqual({ properties: { id: {}, password: {} } });
    });
});

//describe("JSFC.loadSchema", function() {
    //before(function() {
        //this.server = sinon.fakeServer.create();
    //});

    //it("loads schema from remote", function() {
        //this.server.respondWith(
            //"GET",
            //"http://example.schema.org/schema.json",
            //[
                //200, { "Content-Type": "application/json" }, JSON.stringify('{"id":"sample"}')
            //]
        //);
        //var callback = sinon.spy();

        //JSFC.loadSchema("http://example.schema.org/schema.json", callback);
        //this.server.respond();

        //sinon.assert.calledOnce(callback);
        //sinon.assert.calledWith(callback, { "id": "sample" });
    //});
//});

describe("JSFC.apply", function() {
    /*:DOC form = <form>
        <input name="text" type="text" id="text"/>
        <input name="range" type="range" id="range" />
        <select name="select" id="select" />
        <textarea name="textarea" id="textarea" />
      </form>
    */
    it("apply constraints to form", function() {
        JSFC.registerSchema("http://example.schema.org/schema.json", {
            definitions: {
                LoginRequestPayload: {
                    properties: {
                        text: {
                            maxLength: 10
                        },
                        range: {
                            maximum: 10
                        },
                        select: {
                            maximum: 10
                        },
                        textarea: {
                            pattern: "\\d+"
                        }
                    },
                    required: ["select", "textarea"]
                }
            }
        });
        JSFC.apply(this.form, { "$ref": "http://example.schema.org/schema.json#/definitions/LoginRequestPayload" });
        var inputElements = JSFC._retrieveInputElements(this.form);
        console.log(inputElements["select"].elem.outerHTML);
        expect(inputElements["text"].elem.getAttribute("maxlength")).toEqual("10");
        expect(inputElements["range"].elem.getAttribute("max")).toEqual("10");
        expect(inputElements["select"].elem.required).toBeTrue();
        expect(inputElements["textarea"].elem.required).toBeTrue();
    });
});
