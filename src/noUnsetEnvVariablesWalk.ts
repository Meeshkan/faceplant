import * as envfile from "envfile";
import * as fs from "fs";
import * as Lint from "tslint";
import * as ts from "typescript";

export const REAL_ENV_FAILURE = (n) => `The variable ${n} is not defined in the real environment.`;
export const FAKE_ENV_FAILURE = (n, f) => `The variable ${n} is not defined in the environment file(s): ${f}.`;
export const NO_ENV_FILE = (f) => `The env file ${f} does not exist.`;
export const SHOULD_BE_DEFINED = (n) => `The environmental variable ${n} should be defined but is not.`;

const getVars = (arr) => arr
    .filter((file) => fs.existsSync(file))
    .map((path) => envfile.parseFileSync(path))
    .reduce((a, b) => ({...a, ...b}), {});

export default class Walk extends Lint.RuleWalker {

    public walk(node: ts.Node) {
        const options = this.getOptions();
        if (options[0]
            && options[0].envFilePaths) {
            options[0].envFilePaths.forEach((file) => {
                if (!fs.existsSync(file)) {
                    this.addFailureAt(
                        node.getStart(),
                        node.getEnd() - node.getStart(),
                        NO_ENV_FILE(file));
                }
            });
        }
        if (options[0]
            && options[0].shouldBeDefined) {
            options[0].shouldBeDefined.forEach((envvar) => {
                if ((options[0] && options[0].useRealEnv && !process.env[envvar])
                    || (options[0]
                        && options[0].envFilePaths
                        && Object.keys(getVars(options[0].envFilePaths)).indexOf(envvar) === -1)) {
                    this.addFailureAt(
                        node.getStart(),
                        node.getEnd() - node.getStart(),
                        SHOULD_BE_DEFINED(envvar));
                }
            });
        }
        this.visitNode(node);
    }

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        if (ts.isPropertyAccessExpression(node.expression)
            && node.expression.name.escapedText === "env"
            && ts.isIdentifier(node.expression.expression)
            && node.expression.expression.escapedText === "process") {
                const name = node.name.escapedText;
                const options = this.getOptions();
                if (options[0] && options[0].useRealEnv && !process.env[name.toString()]) {
                    this.addFailureAt(
                        node.getStart(),
                        node.getEnd() - node.getStart(),
                        REAL_ENV_FAILURE(name));
                }
                if (options[0]
                        && options[0].envFilePaths
                        && Object.keys(getVars(options[0].envFilePaths)).indexOf(name.toString()) === -1) {
                        this.addFailureAt(
                            node.getStart(),
                            node.getEnd() - node.getStart(),
                            FAKE_ENV_FAILURE(name, options[0].envFilePaths.join(" ")));
                }
        }
        super.visitPropertyAccessExpression(node);
    }

}
