define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function tokensToLines(tokens) {
        var lines = [];
        var line = [];
        var lineIndex = 0;
        for (var i = 0; i < tokens.length; i++) {
            var element = tokens[i];
            element.error = 0;
            element.index = i;
            if (element.pos.line != lineIndex) {
                lineIndex = element.pos.line;
                lines.push(line);
                line = [element];
            }
            else {
                line.push(element);
            }
        }
        if (line.length) {
            lines.push(line);
        }
        return lines;
    }
    exports.tokensToLines = tokensToLines;
    function astTreeToLines(ast) {
        var lines = [];
        // so i should find a way to flatten ast tree
        return lines;
    }
    exports.astTreeToLines = astTreeToLines;
    ;
    function makeLineInfo(content) {
        var ret = [];
        var index = 0;
        while (index != -1) {
            var nextLineEnd = content.indexOf('\n', index);
            if (nextLineEnd != -1) {
                ret.push({
                    length: nextLineEnd - index,
                    startOffset: index,
                    endOffset: nextLineEnd,
                    highlightRange: undefined
                });
            }
            else {
                ret.push({
                    length: content.length - index,
                    startOffset: index,
                    endOffset: content.length,
                    highlightRange: undefined
                });
                return ret;
            }
            index = nextLineEnd + 1;
        }
        return ret;
    }
    exports.makeLineInfo = makeLineInfo;
});
