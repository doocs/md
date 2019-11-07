// 设置自定义颜色
function setColorWithTemplate(template) {
    return function(color) {
        let custom_theme = JSON.parse(JSON.stringify(template));
        custom_theme.block.h1['border-bottom'] = `2px solid ${color}`;
        custom_theme.block.h2['background'] = color;
        custom_theme.block.h3['border-left'] = `3px solid ${color}`;
        custom_theme.inline.strong['color'] = color;
        return custom_theme
    };
}

let setColor = setColorWithTemplate(default_theme);
