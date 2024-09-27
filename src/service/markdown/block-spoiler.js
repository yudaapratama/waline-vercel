module.exports = function block_sp(md) {
  function tokenize(state, silent) {
    const startPos = state.pos;
    const max = state.posMax;

    // Check for [spoiler]
    if (state.src.slice(startPos, startPos + 9) !== '[spoiler]') {
      return false;
    }

    const endMarker = '[/spoiler]';
    const endPos = state.src.indexOf(endMarker, startPos);

    if (endPos === -1) {
      return false;
    }

    const content = state.src.slice(startPos + 9, endPos);

    if (!silent) {
      const token = state.push('spoiler_block_open', 'details', 1);
      token.markup = '[spoiler]';

      const summary = state.push('spoiler_block_summary', 'summary', 0);
      summary.markup = 'summary';
      summary.content = 'Spoiler';

      // Use markdown-it's internal tokenizer to process the content
      state.md.inline.parse(content.trim(), state.md, state.env, state.tokens);

      const tokenClose = state.push('spoiler_block_close', 'details', -1);
      tokenClose.markup = '[/spoiler]';
    }

    state.pos = endPos + endMarker.length;
    state.posMax = max;
    return true;
  }

  md.inline.ruler.before('emphasis', 'spoiler_block', tokenize);

  md.renderer.rules.spoiler_block_open = function () {
    return '<details><summary>Spoiler</summary>\n';
  };
  md.renderer.rules.spoiler_block_close = function () {
    return '</details>\n';
  };
  md.renderer.rules.spoiler_block_summary = function () {
    return '';
  };
};