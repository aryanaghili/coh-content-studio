import fs from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;

const code = fs.readFileSync('src/App.tsx', 'utf8');

const ast = parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  MemberExpression(path) {
    if (path.node.object.type === 'Identifier' && path.node.object.name === 'activeWorkItem') {
      console.log(`Line ${path.node.loc.start.line}: activeWorkItem.${path.node.property.name}`);
      // Check if it's optionally chained
      let isOptional = false;
      let curr = path;
      while (curr && curr.type !== 'ExpressionStatement') {
        if (curr.node.type === 'OptionalMemberExpression') {
          isOptional = true;
          break;
        }
        curr = curr.parentPath;
      }
      if (!isOptional && path.node.type !== 'OptionalMemberExpression') {
         console.log(`  --> NOT OPTIONAL!`);
      }
    }
  }
});
