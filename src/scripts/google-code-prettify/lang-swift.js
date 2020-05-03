/*

 Copyright (C) 2015 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
PR.registerLangHandler(PR.createSimpleLexer([["pln",/^[ \n\r\t\v\f\0]+/,null," \n\r\t\v\f\x00"],["str",/^"(?:[^"\\]|(?:\\.)|(?:\\\((?:[^"\\)]|\\.)*\)))*"/,null,'"']],[["lit",/^(?:(?:0x[\da-fA-F][\da-fA-F_]*\.[\da-fA-F][\da-fA-F_]*[pP]?)|(?:\d[\d_]*\.\d[\d_]*[eE]?))[+-]?\d[\d_]*/,null],["lit",/^-?(?:(?:0(?:(?:b[01][01_]*)|(?:o[0-7][0-7_]*)|(?:x[\da-fA-F][\da-fA-F_]*)))|(?:\d[\d_]*))/,null],["lit",/^(?:_|Any|true|false|nil)\b/,null],["kwd",/^\b(?:__COLUMN__|__FILE__|__FUNCTION__|__LINE__|#available|#colorLiteral|#column|#else|#elseif|#endif|#file|#fileLiteral|#function|#if|#imageLiteral|#line|#selector|#sourceLocation|arch|arm|arm64|associatedtype|associativity|as|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|dynamicType|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|import|indirect|infix|init|inout|internal|i386|if|in|iOS|iOSApplicationExtension|is|lazy|left|let|mutating|none|nonmutating|open|operator|optional|OSX|OSXApplicationExtension|override|postfix|precedence|prefix|private|protocol|Protocol|public|repeat|required|rethrows|return|right|safe|Self|self|set|static|struct|subscript|super|switch|throw|throws|try|Type|typealias|unowned|unsafe|var|weak|watchOS|where|while|willSet|x86_64)\b/,
null],["com",/^\/\/.*?[\n\r]/,null],["com",/^\/\*[\s\S]*?(?:\*\/|$)/,null],["pun",/^<<=|<=|<<|>>=|>=|>>|===|==|\.\.\.|&&=|\.\.<|!==|!=|&=|~=|~|\(|\)|\[|\]|{|}|@|#|;|\.|,|:|\|\|=|\?\?|\|\||&&|&\*|&\+|&-|&=|\+=|-=|\/=|\*=|\^=|%=|\|=|->|`|==|\+\+|--|\/|\+|!|\*|%|<|>|&|\||\^|\?|=|-|_/,null],["typ",/^\b(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/,null]]),["swift"]);
