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
