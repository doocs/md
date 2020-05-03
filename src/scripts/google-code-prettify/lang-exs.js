/*

 Copyright (C) 2017 Jacek Kr??likowski

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
PR.registerLangHandler(PR.createSimpleLexer([["pln",/^[\t\n\r \xA0]+/,null,"\t\n\r \u00a0"],["com",/^#.*/,null,"#"],["lit",/^'(?:[^'\\]|\\(?:.|\n|\r))*'?/,null,"'"],["atn",/^@\w+/,null,"@"],["pun",/^[!%&()*+,\-;<=>?\[\\\]^{|}]+/,null,"!%&()*+,-;<=>?[\\]^{|}"],["lit",/^(?:0o[0-7](?:[0-7]|_[0-7])*|0x[\da-fA-F](?:[\da-fA-F]|_[\da-fA-F])*|\d(?:\d|_\d)*(?:\.\d(?:\d|_\d)*)?(?:[eE][+\-]?\d(?:\d|_\d)*)?)/,null,"0123456789"]],[["atn",/^iex(?:\(\d+\))?> /],
["pun",/^::/],["lit",/^:(?:\w+[\!\?\@]?|"(?:[^"\\]|\\.)*"?)/],["atn",/^(?:__(?:CALLER|ENV|MODULE|DIR)__)/],["kwd",/^(?:alias|case|catch|def(?:delegate|exception|impl|macrop?|module|overridable|p?|protocol|struct)|do|else|end|fn|for|if|in|import|quote|raise|require|rescue|super|throw|try|unless|unquote(?:_splicing)?|use|when|with|yield)\b/],["lit",/^(?:true|false|nil)\b/],["lit",/^(?:\w+[\!\?\@]?|"(?:[^"\\]|\\.)*"):(?!:)/],["str",/^"""\s*(\r|\n)+(?:""?(?!")|[^\\"]|\\(?:.|\n|\r))*"{0,3}/],
["str",/^"(?:[^"\\]|\\(?:.|\n|\r))*"?(?!")/],["typ",/^[A-Z]\w*/],["com",/^_\w*/],["pln",/^[$a-z]\w*[\!\?]?/],["atv",/^~[A-Z](?:\/(?:[^\/\r\n\\]|\\.)+\/|\|(?:[^\|\r\n\\]|\\.)+\||"(?:[^"\r\n\\]|\\.)+"|'(?:[^'\r\n\\]|\\.)+')[A-Z]*/i],["atv",/^~[A-Z](?:\((?:[^\)\r\n\\]|\\.)+\)|\[(?:[^\]\r\n\\]|\\.)+\]|\{(?:[^\}\r\n\\]|\\.)+\}|\<(?:[^\>\r\n\\]|\\.)+\>)[A-Z]*/i],["pun",/^(?:\.+|\/|[:~])/]]),["ex","exs"]);
