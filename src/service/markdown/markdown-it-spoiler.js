module.exports = function spoiler_plugin(md) {
	function tokenize(state, silent) {
		const startPos = state.pos;
		const max = state.posMax;

		if (state.src.charCodeAt(startPos) !== 0x5B /* [ */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 1) !== 0x73 /* s */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 2) !== 0x70 /* p */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 3) !== 0x6F /* o */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 4) !== 0x69 /* i */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 5) !== 0x6C /* l */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 6) !== 0x65 /* e */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 7) !== 0x72 /* r */) {
			return false;
		}
		if (state.src.charCodeAt(startPos + 8) !== 0x5D /* ] */) {
			return false;
		}

		const endMarker = '[/spoiler]';
		const endPos = state.src.indexOf(endMarker, startPos);

		if (endPos === -1) {
			return false;
		}

		const content = state.src.slice(startPos + 9, endPos);

		if (!silent) {
			const token = state.push('spoiler_open', 'details', 1);
			token.markup = '[spoiler]';

			const summary = state.push('spoiler_summary', 'summary', 0);
			summary.markup = 'summary';
			summary.content = 'Spoiler';

			// Use markdown-it's internal tokenizer to process the content
			state.md.inline.parse(content.trim(), state.md, state.env, state.tokens);

			const tokenClose = state.push('spoiler_close', 'details', -1);
			tokenClose.markup = '[/spoiler]';
		}

		state.pos = endPos + endMarker.length;
		state.posMax = max;
		return true;
	}

	md.inline.ruler.before('emphasis', 'spoiler', tokenize);

	md.renderer.rules.spoiler_open = function () {
		return '<details><summary>Spoiler</summary>\n';
	};
	md.renderer.rules.spoiler_close = function () {
		return '</details>\n';
	};
	md.renderer.rules.spoiler_summary = function () {
		return '';
	};
};