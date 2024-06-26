# OneDoc API Documentation

This repo contains the configuration files for the OneDoc's API documentation. 
The documentation is built using Fern. 

Click [here](https://fileforge.docs.buildwithfern.com) to see the generated website. 

## What does this repo contain?

- [OpenAPI Specs](./fern/openapi.yml)
- [Docs Configuration](./fern/docs.yml)
- [GitHub Workflows](./.github/workflows)

## How to update documentation?

To update your documentation, run 

```sh
# npm install -g fern-api 
fern generate --docs
```

To preview your documentation, run 
```sh
# npm install -g fern-api
fern generate --docs --preview
```

The repository contains GitHub workflows that will automatically run 
these commands for you. For example, when you make a PR a preview link 
will be auto-generated and when you merge to main the docs site
will update. 
