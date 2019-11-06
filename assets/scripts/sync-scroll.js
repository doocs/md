// 左右栏同步滚动

$(document).ready(function () {

  let timeout;

  $('div.CodeMirror-scroll, #preview').on("scroll", function callback() {
    clearTimeout(timeout);

    let source = $(this),
      target = $(source.is("#preview") ? 'div.CodeMirror-scroll' : '#preview');

    target.off("scroll");

    let source0 = source[0];
    let target0 = target[0];

    let percentage = source0.scrollTop / (source0.scrollHeight - source0.offsetHeight);
    let height = percentage * (target0.scrollHeight - target0.offsetHeight);
    target0.scrollTo(0, height);

    timeout = setTimeout(function () {
      target.on("scroll", callback);
    }, 100);
  });

});
