# serverless-package
An alternative approach to packaging for Serverless

# Usage

1. Add "serverless-packages" to your plugins list.

1. Specify an artifact in your existing package config

   This disables the built in packager, and enables this one.

1. Add a custom.package section

   This is a map of root paths to lists of glob-all terms.
   
# Example

```
plugins:
  - serverless-package

package:
  artifact: .serverless/package.zip

custom:
  package:
    sources:
      "./src/":
        - "*.py"
        - "templates/**"
      "./dist/":
        - "**/**/*.py"
```

# Command

Additionally, this adds the "package" command.

```
sls package
```

This will only run the `serverless-package` command, not the built in packaging.
