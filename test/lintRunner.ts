import {Configuration, Linter} from "tslint";

export const helper = ({src, rule}) => {
    const linter = new Linter({fix: false});
    linter.lint("", src, Configuration.parseConfigFile({
        rules: {
            [rule.name]: {
                options: rule.options,
            },
        },
        rulesDirectory: "src",
    }));
    return linter.getResult();
};
