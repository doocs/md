// 设置自定义颜色
function setColorWithTemplate(template) {
    return function (color) {
        let custom_theme = JSON.parse(JSON.stringify(template));
        custom_theme.block.h1['border-bottom'] = `2px solid ${color}`;
        custom_theme.block.h2['background'] = color;
        custom_theme.block.h3['border-left'] = `3px solid ${color}`;
        custom_theme.block.h4['color'] = color;
        custom_theme.inline.strong['color'] = color;
        return custom_theme
    };
}

let setColor = setColorWithTemplate(default_theme);

function customCssWithTemplate(template) {
    return function (jsonString) {
        let custom_theme = JSON.parse(JSON.stringify(template));
        custom_theme.block.h1 = jsonString.h1;
        custom_theme.block.h2 = jsonString.h2;
        custom_theme.block.h3 = jsonString.h3;
        custom_theme.block.h4 = jsonString.h4;
        custom_theme.block.p = jsonString.p;
        return custom_theme;
    };
}

let customCss = customCssWithTemplate(default_theme);

// css转json
function css2json(css) {

    // Remove all comments from the css-file
    while ((open = css.indexOf("/*")) !== -1 &&
        (close = css.indexOf("*/")) !== -1) {
        css = css.substring(0, open) + css.substring(close + 2);
    }

    // Initialize the return value _json_.
    let json = {};

    // Each rule gets parsed and then removed from _css_ until all rules have been
    // parsed.
    while (css.length > 0) {
        // Save the index of the first left bracket and first right bracket.
        const lbracket = css.indexOf('{');
        const rbracket = css.indexOf('}');

        // ## Part 1: The declarations
        //
        // Transform the declarations to an object. For example, the declarations<br/>
        //  `font: 'Times New Roman' 1em; color: #ff0000; margin-top: 1em;`<br/>
        // result in the object<br/>
        // `{"font": "'Times New Roman' 1em", "color": "#ff0000", "margin-top": "1em"}`.

        // Helper method that transform an array to a object, by splitting each
        // declaration (_font: Arial_) into key (_font_) and value(_Arial_).
        function toObject(array) {
            let ret = {};
            array.forEach(e => {
                const index = e.indexOf(':');
                const property = e.substring(0, index).trim();
                const value = e.substring(index + 1).trim();
                ret[property] = value;
            });
            return ret;
        }

        // Split the declaration block of the first rule into an array and remove
        // whitespace from each declaration.
        let declarations = css.substring(lbracket + 1, rbracket)
            .split(";")
            .map(e => e.trim())
            .filter(e => e.length > 0); // Remove any empty ("") values from the array

        // _declaration_ is now an array reado to be transformed into an object.
        declarations = toObject(declarations);

        // ## Part 2: The selectors
        //
        // Each selector in the selectors block will be associated with the
        // declarations defined above. For example, `h1, p#bar {color: red}`<br/>
        // result in the object<br/>
        // {"h1": {color: red}, "p#bar": {color: red}}

        // Split the selectors block of the first rule into an array and remove
        // whitespace, e.g. `"h1, p#bar, span.foo"` get parsed to
        // `["h1", "p#bar", "span.foo"]`.
        let selectors = css.substring(0, lbracket)
            .split(",")
            .map(selector => selector.trim());

        // Iterate through each selector from _selectors_.
        selectors.forEach(selector => {
            // Initialize the json-object representing the declaration block of
            // _selector_.
            if (!json[selector]) json[selector] = {};
            // Save the declarations to the right selector
            Object.keys(declarations).forEach(key => {
                json[selector][key] = declarations[key];
            });
        });
        // Continue to next instance
        css = css.slice(rbracket + 1).trim()
    }
    // return the json data
    return json;
}
