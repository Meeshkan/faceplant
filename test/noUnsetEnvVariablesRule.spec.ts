import * as randomstring from "randomstring";
import {
    FAKE_ENV_FAILURE,
    NO_ENV_FILE,
    REAL_ENV_FAILURE,
} from "../src/noUnsetEnvVariablesWalk";
import {helper} from "./lintRunner";

const rule = "no-unset-env-variables";
const rs = () => randomstring.generate({
    capitalization: "uppercase",
    charset: "alphabetic",
});

describe("no-unset-env-variables test with real env", () => {
    it(`has no errors`, () => {
        const rs0 = rs();
        const rs1 = rs();
        const src = `
            const a = process.env.${rs0};
            console.log(1);
            if (process.env.${rs1} == 1) { return true; }
        `;
        process.env[rs0] = "1";
        process.env[rs1] = "1";
        const result = helper({
            rule: {
                name: rule,
                options: {
                    useRealEnv: true,
                },
            },
            src,
        });
        expect(result.errorCount).toBe(0);
        delete process.env[rs0];
        delete process.env[rs1];
    });

    it(`has one error`, () => {
        const rs0 = rs();
        const rs1 = rs();
        process.env[rs0] = "1";
        const src = `
            const a = process.env.${rs0};
            console.log(1);
            if (process.env.${rs1} == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    useRealEnv: true,
                },
            },
            src,
        });
        expect(result.errorCount).toBe(1);
        delete process.env[rs0];
    });

    it(`has two errors`, () => {
        const rs0 = rs();
        const rs1 = rs();
        const src = `
            const a = process.env.${rs0};
            console.log(1);
            if (process.env.${rs1} == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    useRealEnv: true,
                },
            },
            src,
        });
        expect(result.errorCount).toBe(2);
        const failure = result.failures[0];
        expect(failure.getFailure()).toBe(REAL_ENV_FAILURE(rs0));
    });

});

describe("no-unset-env-variables test with fake env", () => {
    it(`has no errors`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.HOW == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0"],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(0);
    });
    it(`has one error`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.WRONG == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0"],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(1);
    });
    it(`has two errors`, () => {
        const src = `
            const a = process.env.TOTALLY;
            console.log(1);
            if (process.env.WRONG == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0"],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(2);
        const failure = result.failures[0];
        expect(failure.getFailure()).toBe(FAKE_ENV_FAILURE("TOTALLY", ".env0"));
    });
    it(`has two errors`, () => {
        const src = `
            const a = process.env.TOTALLY;
            console.log(process.env.DOING);
            if (process.env.WRONG == 1) { return true; }
        `;
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0", ".env1"],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(2);
        const failure = result.failures[0];
        expect(failure.getFailure()).toBe(FAKE_ENV_FAILURE("TOTALLY", ".env0 .env1"));
    });
    it(`has an incorrect env file, which results in an additional error`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.HOW == 1) { return true; }
        `;

        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".vne"],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(3);
        const failure = result.failures[0];
        expect(failure.getFailure()).toBe(NO_ENV_FILE(".vne"));
    });
});

describe("no-unset-env-variables should be defined", () => {
    it(`has one error in real env`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.HOW == 1) { return true; }
        `;
        process.env.HELLO = "1";
        process.env.HOW = "1";
        process.env.FOO = "1";
        const result = helper({
            rule: {
                name: rule,
                options: {
                    shouldBeDefined: ["FOO", "BAR" /* bar not defined */],
                    useRealEnv: true,
                },
            },
            src,
        });
        expect(result.errorCount).toBe(1);
    });
    it(`has two errors in fake env`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.HOW == 1) { return true; }
        `;
        process.env.FOO = "1";
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0"],
                    shouldBeDefined: ["FOO", "BAR" /* foo and bar not defined because we are not looking at real env*/],
                },
            },
            src,
        });
        expect(result.errorCount).toBe(2);
    });
    it(`has one error in real+fake env`, () => {
        const src = `
            const a = process.env.HELLO;
            console.log(1);
            if (process.env.HOW == 1) { return true; }
        `;
        process.env.FOO = "1";
        const result = helper({
            rule: {
                name: rule,
                options: {
                    envFilePaths: [".env0"],
                    shouldBeDefined: ["FOO", "BAR" /* bar not defined */],
                    useRealEnv: true,
                },
            },
            src,
        });
        expect(result.errorCount).toBe(2);
    });
});
