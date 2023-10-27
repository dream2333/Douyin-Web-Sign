const fs = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;


//js混淆代码读取
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = "./webmsdk.js";  //默认的js文件
process.argv.length > 3 ? decodeFile = process.argv[3] : decodeFile = encodeFile.replace(".js", "") + "_ok.js";

//将源代码解析为AST
let sourceCode = fs.readFileSync(encodeFile, { encoding: "utf-8" });
let ast = parser.parse(sourceCode);
console.time("处理完毕，耗时");


const keyToLiteral = {
	MemberExpression:
	{
		exit({ node }) {
			const prop = node.property;
			if (!node.computed && types.isIdentifier(prop)) {
				node.property = types.StringLiteral(prop.name);
				node.computed = true;
			}
		}
	},
	ObjectProperty:
	{
		exit({ node }) {
			const key = node.key;
			if (!node.computed && types.isIdentifier(key)) {
				node.key = types.StringLiteral(key.name);
				return;
			}
			if (node.computed && types.isStringLiteral(key)) {
				node.computed = false;
			}
		}
	},
}

traverse(ast, keyToLiteral);


const standardLoop =
{
	"ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
		if (!types.isBlockStatement(node.body)) {
			node.body = types.BlockStatement([node.body]);
		}
	},
	IfStatement(path) {
		const consequent = path.get("consequent");
		const alternate = path.get("alternate");
		if (!consequent.isBlockStatement()) {
			consequent.replaceWith(types.BlockStatement([consequent.node]));
		}
		if (alternate.node !== null && !alternate.isBlockStatement()) {
			alternate.replaceWith(types.BlockStatement([alternate.node]));
		}
	},
}

traverse(ast, standardLoop);


const DeclaratorToDeclaration =
{
	VariableDeclaration(path) {
		let { parentPath, node } = path;
		if (!parentPath.isBlock()) {
			return;
		}
		let { declarations, kind } = node;

		if (declarations.length == 1) {
			return;
		}

		let newNodes = [];

		for (const varNode of declarations) {
			let newDeclartionNode = types.VariableDeclaration(kind, [varNode]);
			newNodes.push(newDeclartionNode);
		}

		path.replaceWithMultiple(newNodes);

	},
}

traverse(ast, DeclaratorToDeclaration);



function SequenceOfStatement(path) {
	let { scope, parentPath, node } = path;
	if (parentPath.parentPath.isLabeledStatement()) {//标签节点无法往前插入。
		return;
	}
	let expressions = node.expressions;
	if (parentPath.isReturnStatement({ "argument": node }) ||
		parentPath.isThrowStatement({ "argument": node })) {
		parentPath.node.argument = expressions.pop();
	}
	else if (parentPath.isIfStatement({ "test": node }) ||
		parentPath.isWhileStatement({ "test": node })) {
		parentPath.node.test = expressions.pop();
	}
	else if (parentPath.isForStatement({ "init": node })) {
		parentPath.node.init = expressions.pop();
	}
	else if (parentPath.isForInStatement({ "right": node }) ||
		parentPath.isForOfStatement({ "right": node })) {
		parentPath.node.right = expressions.pop();
	}
	else if (parentPath.isSwitchStatement({ "discriminant": node })) {
		parentPath.node.discriminant = expressions.pop();
	}

	else if (parentPath.isExpressionStatement({ "expression": node })) {
		parentPath.node.expression = expressions.pop();
	}
	else {
		return;
	}

	for (let expression of expressions) {
		parentPath.insertBefore(types.ExpressionStatement(expression = expression));
	}
}


function SequenceOfExpression(path) {
	let { scope, parentPath, node, parent } = path;
	let ancestorPath = parentPath.parentPath;
	let expressions = node.expressions;
	if (parentPath.isConditionalExpression({ "test": node }) &&
		ancestorPath.isExpressionStatement({ "expression": parent })) {
		parentPath.node.test = expressions.pop();
	}
	else if (parentPath.isVariableDeclarator({ "init": node }) &&
		ancestorPath.parentPath.isBlock()) {
		parentPath.node.init = expressions.pop();
	}
	else if (parentPath.isAssignmentExpression({ "right": node }) &&
		ancestorPath.isExpressionStatement({ "expression": parent })) {
		parentPath.node.right = expressions.pop();
	}
	else if ((parentPath.isCallExpression({ "callee": node }) ||
		parentPath.isNewExpression({ "callee": node })) &&
		ancestorPath.isExpressionStatement({ "expression": parent })) {
		parentPath.node.callee = expressions.pop();
	}
	else {
		return;
	}

	for (let expression of expressions) {
		ancestorPath.insertBefore(types.ExpressionStatement(expression = expression));
	}
}



const resolveSequence =
{
	SequenceExpression:
	{//对同一节点遍历多个方法
		exit: [SequenceOfStatement, SequenceOfExpression]
	}
}

traverse(ast, resolveSequence);


const removeDeadCode = {
	"IfStatement|ConditionalExpression"(path) {
		let { consequent, alternate } = path.node;
		let testPath = path.get('test');
		const evaluateTest = testPath.evaluateTruthy();
		if (evaluateTest === true) {
			if (types.isBlockStatement(consequent)) {
				consequent = consequent.body;
			}
			path.replaceWithMultiple(consequent);
			return;
		}
		if (evaluateTest === false) {
			if (alternate != null) {
				if (types.isBlockStatement(alternate)) {
					alternate = alternate.body;
				}
				path.replaceWithMultiple(alternate);
			}
			else {
				path.remove();
			}
		}
	},
	"LogicalExpression"(path) {
		let { left, operator, right } = path.node;

		let leftPath = path.get('left');

		const evaluateLeft = leftPath.evaluateTruthy();

		if ((operator == "||" && evaluateLeft == true) ||
			(operator == "&&" && evaluateLeft == false)) {
			path.replaceWith(left);
			return;
		}
		if ((operator == "||" && evaluateLeft == false) ||
			(operator == "&&" && evaluateLeft == true)) {
			path.replaceWith(right);
		}
	},
	"EmptyStatement|DebuggerStatement"(path) {
		path.remove();
	},
}

traverse(ast, removeDeadCode);  //PS：因为有赋值语句和定义语句同时存在，因此该插件可能需要运行多次才能删除干净。


const simplifyLiteral = {
	NumericLiteral({ node }) {
		if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
			node.extra = undefined;
		}
	},
	StringLiteral({ node }) {
		if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
			node.extra = undefined;
		}
	},
}


traverse(ast, simplifyLiteral);


const constantFold = {
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if (path.isUnaryExpression({operator: "-"}) || 
                path.isUnaryExpression({operator: "void"})) 
            {
                return;
            }
            const {confident, value} = path.evaluate();
            if (!confident)
                return;
            if (path.isIdentifier() && typeof value == "object")
            {
            	return;
            }
            if (typeof value == 'number' && (!Number.isFinite(value))) {
                return;
            }
            console.log(value)
            path.replaceWith(types.valueToNode(value));
        }
    },
}

traverse(ast, constantFold);


const ConditionToIf = {
	ConditionalExpression: {
		exit(path){
			let {test, consequent, alternate} = path.node;
			if (types.isSequenceExpression(consequent))
			{
				let expressions = consequent.expressions;
				let retBody = [];
				for(let expression of expressions)
				{
					retBody.push(types.ExpressionStatement(expression));
				}
				consequent = types.BlockStatement(retBody);
			}
			else
			{
				consequent = types.ExpressionStatement(consequent);
				consequent = types.BlockStatement([consequent]);
			}
			if (types.isSequenceExpression(alternate))
			{
				let expressions = alternate.expressions;
				let retBody = [];
				for(let expression of expressions)
				{
					retBody.push(types.ExpressionStatement(expression));
				}
				alternate = types.BlockStatement(retBody);
			}
			else
			{
				alternate = types.ExpressionStatement(alternate);
				alternate = types.BlockStatement([alternate]);
			}
			let ifStateNode = types.IfStatement(test,consequent,alternate);
			path.replaceWithMultiple(ifStateNode);
			path.skip();
  }
 },
}

traverse(ast, ConditionToIf);

console.timeEnd("处理完毕，耗时");
let { code } = generator(ast, opts = {
	"compact": false,  // 是否压缩代码
	"comments": false,  // 是否保留注释
	"jsescOption": { "minimal": true },  //Unicode转义
});

fs.writeFile(decodeFile, code, (err) => { });