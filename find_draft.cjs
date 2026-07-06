const fs = require('fs');
const ts = require('typescript');

const sourceFile = ts.createSourceFile(
  'App.tsx',
  fs.readFileSync('src/App.tsx', 'utf8'),
  ts.ScriptTarget.Latest,
  true
);

function visit(node) {
  if (ts.isPropertyAccessExpression(node)) {
    if (node.expression.getText() === 'draftOptions') {
      console.log(`Line ${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${node.getText()}`);
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
