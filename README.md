# Brewlogger User Interface

This repository contains the user interface for brewlogger, see: https://github.com/mp-se/brewlogger 

# Usage

## Building the package

```
npm install
npm run build
```

## Development

Run these in separate terminal windows.

```
npm run serve
```

## Git commands

Add a new tag
```
git tag -a [tag_name] HEAD -m "Tag message"
git push origin tag [tag_name]
```

Show the latest tag

```
git tag --sort=creatordate | tail -1
```
