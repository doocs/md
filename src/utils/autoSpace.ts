const unicode: Record<string, string[]> = {
  latin: ['[A-Za-z0-9\u00C0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]'],
  punc: ['[@&=_,\.\?!$%^*\-+\/]', '[\(\[\'"<‘“]', '[\)\]\'">”’]'],
  hanzi: [
      '[\u4E00-\u9FFF]',
      '[\u3400-\u4DB5\u9FA6-\u9FBB\uFA70-\uFAD9\u9FBC-\u9FC3\u3007\u3040-\u309E\u30A1-\u30FA\u30FD\u30FE\uFA0E-\uFA0F\uFA11\uFA13-\uFA14\uFA1F\uFA21\uFA23-\uFA24\uFA27-\uFA29]',
      '[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF]',
      '\uD86D[\uDC00-\uDF3F]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD869[\uDF00-\uDFFF]',
      '\uD86D[\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1F]',
      '[\u31C0-\u31E3]'
  ]
};

const unicodeSet = (set: string): string => {
  return Array.isArray(unicode[set]) ? unicode[set].join('|') : unicode[set];
};

const autoSpace = (text: string): string => {
  const hanzi = unicodeSet('hanzi');
  const latin = unicodeSet('latin') + '|' + unicode.punc[0];
  const punc = unicode.punc;
  const patterns: RegExp[] = [
      new RegExp(`(${hanzi})(${latin}|${punc[1]})`, 'ig'),
      new RegExp(`(${latin}|${punc[2]})(${hanzi})`, 'ig')
  ];

  patterns.forEach(exp => {
      text = text.replace(exp, '$1 $2');
  });

  return text;
};

export { autoSpace };
