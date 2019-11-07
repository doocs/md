let WxRenderer = function (opts) {
  this.opts = opts;
  let ENV_USE_REFERENCES = true;
  let ENV_STRETCH_IMAGE = true;

  let footnotes = [];
  let footnoteIndex = 0;
  let styleMapping = null;

  let CODE_FONT_FAMILY = "Menlo, Operator Mono, Consolas, Monaco, monospace";

  let merge = function (base, extend) {
    return Object.assign({}, base, extend)
  };

  this.buildTheme = function (themeTpl) {
    let mapping = {};
    let base = merge(themeTpl.BASE, {
      'font-family': this.opts.fonts,
      'font-size': this.opts.size
    });
    let base_block = merge(base, {});
    for (let ele in themeTpl.inline) {
      if (themeTpl.inline.hasOwnProperty(ele)) {
        let style = themeTpl.inline[ele];
        if (ele === 'codespan') {
          style['font-family'] = CODE_FONT_FAMILY;
          style['white-space'] = 'normal';
        }
        mapping[ele] = merge(base, style)
      }
    }
    for (let ele in themeTpl.block) {
      if (themeTpl.block.hasOwnProperty(ele)) {
        let style = themeTpl.block[ele];
        if (ele === 'code') {
          style['font-family'] = CODE_FONT_FAMILY
        }
        mapping[ele] = merge(base_block, style)
      }
    }
    return mapping
  };

  let getStyles = function (tokenName, addition) {
    let arr = [];
    let dict = styleMapping[tokenName];
    if (!dict) return '';
    for (const key in dict) {
      arr.push(key + ':' + dict[key])
    }
    return `style="${arr.join(';') + (addition || '')}"`
  };

  let addFootnote = function (title, link) {
    footnoteIndex += 1;
    footnotes.push([footnoteIndex, title, link]);
    return footnoteIndex
  };

  this.buildFootnotes = function () {
    let footnoteArray = footnotes.map(function (x) {
      if (x[1] === x[2]) {
        return `<code style="font-size: 90%; opacity: 0.6;">[${x[0]}]</code>: <i>${x[1]}</i><br/>`
      }
      return `<code style="font-size: 90%; opacity: 0.6;">[${x[0]}]</code> ${x[1]}: <i>${x[2]}</i><br/>`
    });
    return `<h3 ${getStyles('h3')}>引用链接</h3><p ${getStyles('footnotes')}>${footnoteArray.join('\n')}</p>`
  };

  this.buildAddition = function () {
    return '<style>.preview-wrapper pre::before{' +
      'font-family:"SourceSansPro","HelveticaNeue",Arial,sans-serif;' +
      'position:absolute;' +
      'top:0;' +
      'right:0;' +
      'color:#ccc;' +
      'text-align:right;' +
      'font-size:0.8em;' +
      'padding:5px10px0;' +
      'line-height:15px;' +
      'height:15px;' +
      'font-weight:600;' +
      '}</style>'
  };

  this.setOptions = function (newOpts) {
    this.opts = merge(this.opts, newOpts)
  };

  this.hasFootnotes = function () {
    return footnotes.length !== 0
  };

  this.getRenderer = function () {
    footnotes = [];
    footnoteIndex = 0;

    styleMapping = this.buildTheme(this.opts.theme);
    let renderer = new marked.Renderer();
    FuriganaMD.register(renderer);

    renderer.heading = function (text, level) {
      switch (level) {
        case 1:
          return `<h1 ${getStyles('h1')}>${text}</h1>`;
        case 2:
          return `<h2 ${getStyles('h2')}>${text}</h2>`;
        case 3:
          return `<h3 ${getStyles('h3')}>${text}</h3>`;
        default:
          return `<h4 ${getStyles('h4')}>${text}</h4>`;
      }
    };
    renderer.paragraph = function (text) {
      return `<p ${getStyles('p')}>${text}</p>`
    };
    renderer.blockquote = function (text) {
      text = text.replace(/<p.*?>/, `<p ${getStyles('blockquote_p')}>`);
      return `<blockquote ${getStyles('blockquote')}>${text}</blockquote>`
    };
    renderer.code = function (text, infoString) {
      text = text.replace(/</g, "&lt;");
      text = text.replace(/>/g, "&gt;");

      let lines = text.split('\n');
      let codeLines = [];
      let numbers = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        codeLines.push(`<code class="prettyprint"><span class="code-snippet_outer">${(line || '<br>')}</span></code>`);
        numbers.push('<li></li>')
      }
      let lang = infoString || '';
      return `<section class="code-snippet__fix code-snippet__js">`
        + `<ul class="code-snippet__line-index code-snippet__js">${numbers.join('')}</ul>`
        + `<pre class="code-snippet__js" data-lang="${lang}">`
        + codeLines.join('')
        + `</pre></section>`
    };
    renderer.codespan = function (text, infoString) {
      return `<code ${getStyles('codespan')}>${text}</code>`
    };
    renderer.listitem = function (text) {
      return `<span ${getStyles('listitem')}><span style="margin-right: 10px;"><%s/></span>${text}</span>`;
    };
    renderer.list = function (text, ordered, start) {
      text = text.replace(/<\/*p.*?>/g, '');
      let segments = text.split(`<%s/>`);
      if (!ordered) {
        text = segments.join('•');
        return `<p ${getStyles('ul')}>${text}</p>`;
      }
      text = segments[0];
      for (let i = 1; i < segments.length; i++) {
        text = text + i + '.' + segments[i];
      }
      return `<p ${getStyles('ol')}>${text}</p>`;
    };
    renderer.image = function (href, title, text) {
      let subText = '';
      if (text) {
        subText = `<figcaption ${getStyles('figcaption')}>${text}</figcaption>`
      }
      let figureStyles = getStyles('figure');
      let imgStyles = getStyles(ENV_STRETCH_IMAGE ? 'image' : 'image_org');
      return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`
    };
    renderer.link = function (href, title, text) {
      if (href.indexOf('https://mp.weixin.qq.com') === 0) {
        return `<a href="${href}" title="${(title || text)}" ${getStyles('wx_link')}>${text}</a>`;
      } else if (href === text) {
        return text;
      } else {
        if (ENV_USE_REFERENCES) {
          let ref = addFootnote(title || text, href);
          return `<span ${getStyles('link')}>${text}<sup>[${ref}]</sup></span>`;
        } else {
          return `<a href="${href}" title="${(title || text)}" ${getStyles('link')}>${text}</a>`;
        }
      }
    };
    renderer.strong = function (text) {
      return `<strong ${getStyles('strong')}>${text}</strong>`;
    };
    renderer.em = function (text) {
      return `<p ${getStyles('p', ';font-style: italic;')}>${text}</p>`
    };
    renderer.table = function (header, body) {
      return `<table class="preview-table"><thead ${getStyles('thead')}>${header}</thead><tbody>${body}</tbody></table>`;
    };
    renderer.tablecell = function (text, flags) {
      return `<td ${getStyles('td')}>${text}</td>`;
    };
    renderer.hr = function () {
      return `<hr style="border-style: solid;border-width: 1px 0 0;border-color: rgba(0,0,0,0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);">`;
    };
    return renderer
  }
};
