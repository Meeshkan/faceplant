# faceplant
Failure as a service.

This repository contains various scripts that help prevent deploying bad code to production using TSLint.

## Install

Install the package using NPM:

    yarn add --dev faceplant

Update your `tslint.json` file to extend this package:

```json
{
  "extends": [
    "faceplant"
  ],
  "rules": {
    "no-unset-env-variables": {
        "options": { "useRealEnv": true },
        "severity": "error"
    },
  }
}
```

## no-unset-env-variables

Makes sure that environmental variables are set as they should be.

### Options

#### useRealEnv (default false)

Use the real environment.

#### envFilePaths (default [])

Paths to files where the environmental variables are defined. They should be defined in a normal-ish way, like
```
FOO=1
BAR=2
```

#### shouldBeDefined (default [])

Checks that these environmental variables are defined in the real env or the env file paths.
