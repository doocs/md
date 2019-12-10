let default_theme = {
    BASE: {
        'text-align': 'left',
        'color': '#3f3f3f',
        'line-height': '1.75',
    },
    BASE_BLOCK: {
        'margin': '1em 8px'
    },
    block: {
        // 一级标题样式
        h1: {
            'font-size': '1.2em',
            'text-align': 'center',
            'font-weight': 'bold',
            'display': 'table',
            'margin': '2em auto 1em',
            'padding': '0 1em',
            'border-bottom': '2px solid rgba(0, 152, 116, 0.9)'
        },

        // 二级标题样式
        h2: {
            'font-size': '1.1em',
            'text-align': 'center',
            'font-weight': 'bold',
            'display': 'table',
            'margin': '4em auto 2em',
            'padding': '0 0.2em',
            'background': 'rgba(0, 152, 116, 0.9)',
            'color': '#fff'
        },

        // 三级标题样式
        h3: {
            'font-weight': 'bold',
            'font-size': '1.1em',
            'margin': '2em 8px 0.75em 0',
            'line-height': '1.2',
            'padding-left': '8px',
            'border-left': '3px solid rgba(0, 152, 116, 0.9)'
        },

        // 四级标题样式
        h4: {
            'font-weight': 'bold',
            'font-size': '1em',
            'margin': '2em 8px 0.5em',
            'color': 'rgba(66, 185, 131, 0.9)'
        },

        // 段落样式
        p: {
            'margin': '1.5em 8px',
            'letter-spacing': '0.1em'
        },

        // 引用样式
        blockquote: {
            'font-style': 'normal',
            'border-left': 'none',
            'padding': '1em',
            'border-radius': '4px',
            'color': '#FEEEED',
            'background': 'rgba(27,31,35,.05)',
            'margin': '2em 8px'
        },

        blockquote_p: {
            'letter-spacing': '0.1em',
            'color': 'rgb(80, 80, 80)',
            'font-family': 'PingFangSC-light, PingFangTC-light, Open Sans, Helvetica Neue, sans-serif',
            'font-size': '1em',
            'display': 'inline',
        },

        code: {
            'font-size': '80%',
            'overflow': 'auto',
            'color': '#333',
            'background': 'rgb(247, 247, 247)',
            'border-radius': '2px',
            'padding': '10px',
            'line-height': '1.5',
            'border': '1px solid rgb(236,236,236)',
            'margin': '20px 0',
        },

        image: {
            'border-radius': '4px',
            'display': 'block',
            'margin': '0.1em auto 0.5em',
            'width': '100% !important',
        },

        image_org: {
            'border-radius': '4px',
            'display': 'block'
        },

        ol: {
            'margin-left': '0',
            'padding-left': '1em'
        },

        ul: {
            'margin-left': '0',
            'padding-left': '1em',
            'list-style': 'circle'
        },

        footnotes: {
            'margin': '0.5em 8px',
            'font-size': '80%'
        },

        figure: {
            'margin': '1.5em 8px',
        }
    },
    inline: {
        listitem: {
            'text-indent': '-1em',
            'display': 'block',
            'margin': '0.2em 8px'
        },

        codespan: {
            'font-size': '90%',
            'color': '#d14',
            'background': 'rgba(27,31,35,.05)',
            'padding': '3px 5px',
            'border-radius': '4px',
        },

        link: {
            'color': '#576b95'
        },

        wx_link: {
            'color': '#576b95',
            'text-decoration': 'none',
        },

        // 字体加粗样式
        strong: {
            'color': 'rgba(15, 76, 129, 0.9)',
            'font-weight': 'bold',
        },

        table: {
            'border-collapse': 'collapse',
            'text-align': 'center',
            'margin': '1em 8px'
        },

        thead: {
            'background': 'rgba(0, 0, 0, 0.05)'
        },

        td: {
            'font-size': '80%',
            'border': '1px solid #dfdfdf',
            'padding': '0.25em 0.5em'
        },

        footnote: {
            'font-size': '12px'
        },
        
        figcaption: {
            'text-align': 'center',
            'color': '#888',
            'font-size': '0.8em'
        }
    }
};