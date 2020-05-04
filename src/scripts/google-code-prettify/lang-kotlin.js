/*

 Copyright (C) 2017 Micha?? B??czkowski

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
PR.registerLangHandler(PR.createSimpleLexer([["pln",/^[\t\n\r \xA0]+/,null,"\t\n\r \u00a0"],["pun",/^[.!%&()*+,\-;<=>?\[\\\]^{|}:]+/,null,".!%&()*+,-;<=>?[\\]^{|}:"]],[["kwd",/^\b(package|public|protected|private|open|abstract|constructor|final|override|import|for|while|as|typealias|get|set|((data|enum|annotation|sealed) )?class|this|super|val|var|fun|is|in|throw|return|break|continue|(companion )?object|if|try|else|do|when|init|interface|typeof)\b/],["lit",/^(?:true|false|null)\b/],
["lit",/^(0[xX][0-9a-fA-F_]+L?|0[bB][0-1]+L?|[0-9_.]+([eE]-?[0-9]+)?[fFL]?)/],["typ",/^(\b[A-Z]+[a-z][a-zA-Z0-9_$@]*|`.*`)/,null],["com",/^\/\/.*/],["com",/^\/\*[\s\S]*?(?:\*\/|$)/],["str",/'.'/],["str",/^"([^"\\]|\\[\s\S])*"/],["str",/^"{3}[\s\S]*?[^\\]"{3}/],["lit",/^@([a-zA-Z0-9_$@]*|`.*`)/],["lit",/^[a-zA-Z0-9_]+@/]]),["kotlin"]);
