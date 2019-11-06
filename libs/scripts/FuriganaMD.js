// 注音功能来自于
// https://github.com/amclees/furigana-markdown
// 详见上述文档

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.FuriganaMD = factory());
}(this, (function () {
  'use strict';

// This function escapes special characters for use in a regex constructor.
  function escapeForRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function emptyStringFilter(block) {
    return block !== '';
  }

  const kanjiRange = '\\u4e00-\\u9faf';
  const kanjiBlockRegex = new RegExp(`[${kanjiRange}]+`, 'g');
  const nonKanjiBlockRegex = new RegExp(`[^${kanjiRange}]+`, 'g');
  const kanaWithAnnotations = '\\u3041-\\u3095\\u3099-\\u309c\\u3081-\\u30fa\\u30fc';
  const furiganaSeperators = '.．。・';
  const seperatorRegex = new RegExp(`[${furiganaSeperators}]`, 'g');

  const singleKanjiRegex = new RegExp(`^[${kanjiRange}]$`);

  function isKanji(character) {
    return character.match(singleKanjiRegex);
  }

  const innerRegexString = '(?:[^\\u0000-\\u007F]|\\w)+';

  let regexList = [];
  let previousFuriganaForms = '';

  function updateRegexList(furiganaForms) {
    previousFuriganaForms = furiganaForms;
    let formArray = furiganaForms.split('|');
    if (formArray.length === 0) {
      formArray = ['[]:^:()'];
    }
    regexList = formArray.map(form => {
      let furiganaComponents = form.split(':');
      if (furiganaComponents.length !== 3) {
        furiganaComponents = ['[]', '^', '()'];
      }
      const mainBrackets = furiganaComponents[0];
      const seperator = furiganaComponents[1];
      const furiganaBrackets = furiganaComponents[2];
      return new RegExp(
        escapeForRegex(mainBrackets[0]) +
        '(' + innerRegexString + ')' +
        escapeForRegex(mainBrackets[1]) +
        escapeForRegex(seperator) +
        escapeForRegex(furiganaBrackets[0]) +
        '(' + innerRegexString + ')' +
        escapeForRegex(furiganaBrackets[1]),
        'g'
      );
    });
  }

  let autoRegexList = [];
  let previousAutoBracketSets = '';

  function updateAutoRegexList(autoBracketSets) {
    previousAutoBracketSets = autoBracketSets;
    autoRegexList = autoBracketSets.split('|').map(brackets => {
      /*
        Sample built regex:
        /(^|[^\u4e00-\u9faf]|)([\u4e00-\u9faf]+)([\u3041-\u3095\u3099-\u309c\u3081-\u30fa\u30fc]*)【((?:[^【】\u4e00-\u9faf]|w)+)】/g
      */
      return new RegExp(
        `(^|[^${kanjiRange}]|)` +
        `([${kanjiRange}]+)` +
        `([${kanaWithAnnotations}]*)` +
        escapeForRegex(brackets[0]) +
        `((?:[^${escapeForRegex(brackets)}\\u0000-\\u007F]|\\w|[${furiganaSeperators}])+)` +
        escapeForRegex(brackets[1]),
        'g'
      );
    });
  }

  let replacementTemplate = '';
  let replacementBrackets = '';

  function updateReplacementTemplate(furiganaFallbackBrackets) {
    if (furiganaFallbackBrackets.length !== 2) {
      furiganaFallbackBrackets = '【】';
    }
    replacementBrackets = furiganaFallbackBrackets;
    replacementTemplate = `<ruby>$1<rp>${furiganaFallbackBrackets[0]}</rp><rt style="line-height:1;font-size:10px;">$2</rt><rp>${furiganaFallbackBrackets[1]}</rp></ruby>`;
  }

  updateReplacementTemplate('【】');

  function addFurigana(text, options) {
    if (options.furiganaForms !== previousFuriganaForms) {
      updateRegexList(options.furiganaForms);
    }
    if (options.furiganaFallbackBrackets !== replacementBrackets) {
      updateReplacementTemplate(options.furiganaFallbackBrackets);
    }
    regexList.forEach(regex => {
      text = text.replace(regex, (match, wordText, furiganaText, offset, mainText) => {
        if (match.indexOf('\\') === -1 && mainText[offset - 1] !== '\\') {
          if ((!options.furiganaPatternMatching) || wordText.search(kanjiBlockRegex) === -1 || wordText[0].search(kanjiBlockRegex) === -1) {
            return replacementTemplate.replace('$1', wordText).replace('$2', furiganaText);
          } else {
            let originalFuriganaText = (' ' + furiganaText).slice(1);
            let nonKanji = wordText.split(kanjiBlockRegex).filter(emptyStringFilter);
            let kanji = wordText.split(nonKanjiBlockRegex).filter(emptyStringFilter);
            let replacementText = '';
            let lastUsedKanjiIndex = 0;
            if (nonKanji.length === 0) {
              return replacementTemplate.replace('$1', wordText).replace('$2', furiganaText);
            }

            nonKanji.forEach((currentNonKanji, index) => {
              if (furiganaText === undefined) {
                if (index < kanji.length) {
                  replacementText += kanji[index];
                }

                replacementText += currentNonKanji;
                return;
              }
              let splitFurigana = furiganaText.split(new RegExp(escapeForRegex(currentNonKanji) + '(.*)')).filter(emptyStringFilter);

              lastUsedKanjiIndex = index;
              replacementText += replacementTemplate.replace('$1', kanji[index]).replace('$2', splitFurigana[0]);
              replacementText += currentNonKanji;

              furiganaText = splitFurigana[1];
            });
            if (furiganaText !== undefined && lastUsedKanjiIndex + 1 < kanji.length) {
              replacementText += replacementTemplate.replace('$1', kanji[lastUsedKanjiIndex + 1]).replace('$2', furiganaText);
            } else if (furiganaText !== undefined) {
              return replacementTemplate.replace('$1', wordText).replace('$2', originalFuriganaText);
            } else if (lastUsedKanjiIndex + 1 < kanji.length) {
              replacementText += kanji[lastUsedKanjiIndex + 1];
            }
            return replacementText;
          }
        } else {
          return match;
        }
      });
    });

    if (!options.furiganaStrictMode) {
      if (options.furiganaAutoBracketSets !== previousAutoBracketSets) {
        updateAutoRegexList(options.furiganaAutoBracketSets);
      }
      autoRegexList.forEach(regex => {
        text = text.replace(regex, (match, preWordTerminator, wordKanji, wordKanaSuffix, furiganaText, offset, mainText) => {
          if (match.indexOf('\\') === -1) {
            if (options.furiganaPatternMatching) {
              let rubies = [];

              let furigana = furiganaText;

              let stem = (' ' + wordKanaSuffix).slice(1);
              for (let i = furiganaText.length - 1; i >= 0; i--) {
                if (wordKanaSuffix.length === 0) {
                  furigana = furiganaText.substring(0, i + 1);
                  break;
                }
                if (furiganaText[i] !== wordKanaSuffix.slice(-1)) {
                  furigana = furiganaText.substring(0, i + 1);
                  break;
                }
                wordKanaSuffix = wordKanaSuffix.slice(0, -1);
              }

              if (furiganaSeperators.split('').reduce(
                (noSeperator, seperator) => {
                  return noSeperator && (furigana.indexOf(seperator) === -1);
                },
                true
              )) {
                rubies = [replacementTemplate.replace('$1', wordKanji).replace('$2', furigana)];
              } else {
                let kanaParts = furigana.split(seperatorRegex);
                let kanji = wordKanji.split('');
                if (kanaParts.length === 0 || kanaParts.length > kanji.length) {
                  rubies = [replacementTemplate.replace('$1', wordKanji).replace('$2', furigana)];
                } else {
                  for (let i = 0; i < kanaParts.length - 1; i++) {
                    if (kanji.length === 0) {
                      break;
                    }
                    rubies.push(replacementTemplate.replace('$1', kanji.shift()).replace('$2', kanaParts[i]));
                  }
                  let lastKanaPart = kanaParts.pop();
                  rubies.push(replacementTemplate.replace('$1', kanji.join('')).replace('$2', lastKanaPart));
                }
              }

              return preWordTerminator + rubies.join('') + stem;
            } else {
              return preWordTerminator + replacementTemplate.replace('$1', wordKanji).replace('$2', furiganaText) + wordKanaSuffix;
            }
          } else {
            return match;
          }
        });
      });
    }
    return text;
  }

  function handleEscapedSpecialBrackets(text) {
    // By default 【 and 】 cannot be escaped in markdown, this will remove backslashes from in front of them to give that effect.
    return text.replace(/\\([【】])/g, '$1');
  }

  let FuriganaMD = {};
  FuriganaMD.register = function (renderer) {
    renderer.text = function (text) {
      let options = {
        furigana: true,
        furiganaForms: "()::{}",
        furiganaFallbackBrackets: "{}",
        furiganaStrictMode: false,
        furiganaAutoBracketSets: "{}",
        furiganaPatternMatching: true,
      };
      // console.log('override text render',text);
      // console.log('after add',addFurigana(text, options));
      return handleEscapedSpecialBrackets(addFurigana(text, options));
    };
  };

  return FuriganaMD;

})));
