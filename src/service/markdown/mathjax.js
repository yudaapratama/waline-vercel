const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { mathjax } = require('mathjax-full/js/mathjax');
const { SVG } = require('mathjax-full/js/output/svg.js');

const { inlineTeX, blockTeX } = require('./mathCommon');
const { escapeHtml } = require('./utils');

// set MathJax as the renderer
class MathToSvg {
  constructor() {
    const adaptor = liteAdaptor();

    RegisterHTMLHandler(adaptor);

    const packages = AllPackages.sort();
    const tex = new TeX({ packages });
    const svg = new SVG({ fontCache: 'none' });

    this.adaptor = adaptor;
    this.texToNode = mathjax.document('', { InputJax: tex, OutputJax: svg });

    this.inline = function (tex) {
      const node = this.texToNode.convert(tex, { display: false });
      let svg = this.adaptor.innerHTML(node);

      if (svg.includes('data-mml-node="merror"')) {
        const errorTitle = svg.match(/<title>(.*?)<\/title>/)[1];

        svg = `<span class='mathjax-error' title='${escapeHtml(
          errorTitle,
        )}'>${escapeHtml(tex)}</span>`;
      }

      return svg;
    };

    this.block = function (tex) {
      const node = this.texToNode.convert(tex, { display: true });
      let svg = this.adaptor.innerHTML(node);

      if (svg.includes('data-mml-node="merror"')) {
        const errorTitle = svg.match(/<title>(.*?)<\/title>/)[1];

        svg = `<p class='mathjax-block mathjax-error' title='${escapeHtml(
          errorTitle,
        )}'>${escapeHtml(tex)}</p>`;
      } else {
        svg = svg.replace(/(width=".*?")/, 'width="100%"');
      }

      return svg;
    };
  }
}

const mathjaxPlugin = (md) => {
  const mathToSvg = new MathToSvg();

  md.inline.ruler.after('escape', 'inlineTeX', inlineTeX);

  // It’s a workaround here because types issue
  md.block.ruler.after('blockquote', 'blockTeX', blockTeX, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });

  md.renderer.rules.inlineTeX = (tokens, idx) =>
    mathToSvg.inline(tokens[idx].content);

  md.renderer.rules.blockTeX = (tokens, idx) =>
    `${mathToSvg.block(tokens[idx].content)}\n`;
};

module.exports = {
  mathjaxPlugin,
};
