import { readFileSync } from 'fs';

const content = readFileSync('src/views/Setting/Team.vue', 'utf8');
const start = content.indexOf('<template>');
const end = content.indexOf('</template>', start) + '</template>'.length;
const template = content.slice(start, end);

const selfClosing = new Set([
  'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr',
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'symbol', 'defs', 'use', 'stop', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'linearGradient', 'radialGradient', 'mask', 'clipPath', 'g', 'svg', 'line', 'text', 'tspan'
]);

const stack = [];
let errors = [];
let line = 1;

for (let i = 0; i < template.length; i++) {
  if (template[i] === '\n') line++;
  if (template[i] !== '<') continue;
  if (template[i+1] === '!') continue;

  let tagEnd = template.indexOf('>', i);
  if (tagEnd === -1) continue;

  let inner = template.slice(i+1, tagEnd).trim();

  if (inner === '--') { continue; }

  let isClosing = inner.startsWith('/');
  let tagName = (isClosing ? inner.slice(1) : inner).split(/\s/)[0].toLowerCase();

  if (isClosing) {
    if (stack.length === 0) {
      errors.push(`line ${line}: unexpected </${tagName}>`);
    } else if (stack[stack.length-1] !== tagName) {
      errors.push(`line ${line}: expected </${stack[stack.length-1]}> but got </${tagName}>`);
    } else {
      stack.pop();
    }
  } else if (inner.endsWith('/')) {
    // self-closing - don't push
  } else {
    stack.push(tagName);
  }

  i = tagEnd;
}

if (stack.length > 0) errors.push(`unclosed tags: ${stack.join(', ')}`);
console.log(`Errors: ${errors.length}`);
errors.slice(0, 10).forEach(e => console.log(e));
if (errors.length === 0) console.log('Template structure is VALID!');
