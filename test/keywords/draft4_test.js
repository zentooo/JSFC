buster.spec.expose();

describe("keywords.draft4.maximum", function() {
    it("applies 'max' constraint", function() {
        /*:DOC elem = <input type="range"></input> */
        JSFC.keywords.draft4.maximum({}, { maximum: 10 }, { elem: this.elem, type: "range" });
        expect(this.elem.getAttribute("max")).toEqual(10);
    });
    it("does not apply 'max' constraint to not-supported-typed element", function() {
        /*:DOC elem = <input type="text"></input> */
        JSFC.keywords.draft4.maximum({}, { maximum: 10 }, { elem: this.elem, type: "text" });
        expect(this.elem.getAttribute("max")).toEqual(null);
    });
});

describe("keywords.draft4.minimum", function() {
    it("applies 'max' constraint", function() {
        /*:DOC elem = <input type="range"></input> */
        JSFC.keywords.draft4.minimum({}, { minimum: 10 }, { elem: this.elem, type: "range" });
        expect(this.elem.getAttribute("min")).toEqual(10);
    });
    it("does not apply 'max' constraint to not-supported-typed element", function() {
        /*:DOC elem = <input type="text"></input> */
        JSFC.keywords.draft4.minimum({}, { minimum: 10 }, { elem: this.elem, type: "text" });
        expect(this.elem.getAttribute("min")).toEqual(null);
    });
});

describe("keywords.draft4.maxlength", function() {
    it("applies 'maxlength' constraint", function() {
        /*:DOC elem = <input type="text"></input> */
        JSFC.keywords.draft4.maxlength({}, { maxlength: 10 }, { elem: this.elem, type: "text" });
        expect(this.elem.getAttribute("maxlength")).toEqual(10);
    });
    it("does not apply 'maxlength' constraint to not-supported-typed element", function() {
        /*:DOC elem = <input type="range"></input> */
        JSFC.keywords.draft4.maxlength({}, { maxlength: 10 }, { elem: this.elem, type: "range" });
        expect(this.elem.getAttribute("maxlength")).toEqual(null);
    });
});

describe("keywords.draft4.pattern", function() {
    it("applies 'pattern' constraint", function() {
        /*:DOC elem = <input type="text"></input> */
        JSFC.keywords.draft4.pattern({}, { pattern: "^\\d{1,10}$" }, { elem: this.elem, type: "text" });
        expect(this.elem.getAttribute("pattern")).toEqual("^\\d{1,10}$");
    });
    it("does not apply 'pattern' constraint to not-supported-typed element", function() {
        /*:DOC elem = <input type="range"></input> */
        JSFC.keywords.draft4.pattern({}, { pattern: "^\\d{1,10}$" }, { elem: this.elem, type: "range" });
        expect(this.elem.getAttribute("pattern")).toEqual(null);
    });
});

describe("keywords.draft4.required", function() {
    it("applies 'required' constraint", function() {
        /*:DOC foo = <input name="foo" type="text"></input> */
        /*:DOC bar = <input name="bar" type="text"></input> */
        JSFC.keywords.draft4.required({}, { required: ["foo"] }, {
            foo: { elem: this.foo, type: "text" },
            bar: { elem: this.bar, type: "text" },
        });
        console.log(this.foo.outerHTML);
        expect(this.foo.required).toBe(true);
        expect(this.bar.required).toBe(false);
    });
});

describe("keywords.draft4.properties", function() {
    it("applies property constraints", function() {
        /*:DOC foo = <input name="foo" type="text"></input> */
        /*:DOC bar = <input name="bar" type="text"></input> */
        JSFC.keywords.draft4.properties({
            environment: "draft4",
            keywords: {
                pattern: JSFC.keywords.draft4.pattern,
                maxlength: JSFC.keywords.draft4.maxlength
            }
        }, {
            properties: {
                foo: {
                    pattern: "\\d+",
                    format: "email"
                },
                bar: {
                    maxlength: 10,
                    oneOf: {}
                },
                baz: {
                    maxlength: 10
                }
            }
        },
        {
            foo: { elem: this.foo, type: "text" },
            bar: { elem: this.bar, type: "text" },
        });
        console.log(this.foo.outerHTML);
        console.log(this.bar.outerHTML);
        expect(this.foo.getAttribute("pattern")).toEqual("\\d+");
        expect(this.bar.getAttribute("maxlength")).toEqual(10);
    });

    it("applies patternProperty constraints", function() {
        /*:DOC foo = <input name="foo" type="text"></input> */
        /*:DOC bar = <input name="bar" type="text"></input> */
        JSFC.keywords.draft4.properties({
            environment: "draft4",
            keywords: {
                pattern: JSFC.keywords.draft4.pattern,
                maxlength: JSFC.keywords.draft4.maxlength
            }
        }, {
            patternProperties: {
                "foo|bar": {
                    pattern: "\\d+",
                    format: "email"
                }
            }
        },
        {
            foo: { elem: this.foo, type: "text" },
            bar: { elem: this.bar, type: "text" },
        });
        console.log(this.foo.outerHTML);
        console.log(this.bar.outerHTML);
        expect(this.foo.getAttribute("pattern")).toEqual("\\d+");
        expect(this.bar.getAttribute("pattern")).toEqual("\\d+");
    });
});
