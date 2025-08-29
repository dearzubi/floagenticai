/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow usage of consoleLog in CI/production environments",
      category: "Best Practices",
      recommended: true,
    },
    schema: [], // no options
    messages: {
      noConsoleLog:
        "consoleLog logger must only be used for temporary testing and must not be present in CI/Production environments.",
    },
  },

  create(context) {
    function reportIfUsage(nodeToReport) {
      context.report({
        node: nodeToReport,
        messageId: "noConsoleLog",
      });
    }

    return {
      'CallExpression[callee.name="consoleLog"]'(node) {
        reportIfUsage(node.callee);
      },
      'MemberExpression[object.name="consoleLog"]'(node) {
        reportIfUsage(node.object);
      },
    };
  },
};
