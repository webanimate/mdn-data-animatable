# mdn-data-animatable

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/mdn-data-animatable.svg)](https://www.npmjs.com/package/mdn-data-animatable)
[![Depfu](https://badges.depfu.com/badges/e5e73601108cbe09d727f0139e201f23/count.svg)](https://depfu.com/github/webanimate/mdn-data-animatable?project_id=12846)

This is a fork of [mdn-data](https://www.npmjs.com/package/mdn-data) with all but animatable CSS properties removed.

# Development

Patch files removing unnecessary properties and syntaxes:

```shell script
yarn gen
```

Lint:

```shell script
yarn lint
```

Patch files and then fix linting and style errors:

```shell script
yarn fix
```

Update dependencies:

```shell script
yarn up
```
