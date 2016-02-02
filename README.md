# office-addin-base
An opinionated base project for building Office Add-ins.

TODO

## Setup
### Prerequisites
#### 1. Install Node.js
Download a suitable package from the [official page](https://nodejs.org/en/) and follow the instructions.
#### 2. Open a Node-enabled console
**Windows**: Node.js command prompt

**OSX/Linux**: Terminal
#### 3. Install Global Dependencies
In your console, enter the following command:
```
npm install -g bower gulp yo generator-office
```
This will install the global project dependencies [Bower](http://bower.io/), [Gulp](http://gulpjs.com/), [Yeoman](http://yeoman.io/), and [generator-office](https://github.com/officedev/generator-office).

### Install Project Dependencies
In your console, change the current working directory to the `office-addin-base` project folder, and enter the following commands in your console:
```
npm install
bower install
```
This will install the local project dependencies as configured in `package.json` (npm) and `bower.json` (bower).

## Create a Manifest
Enter the following command in your console:
```
yo office
```
Follow the instructions, and enter the following values when prompted:

_Technology to use_
```
Manifest.xml only (no application source files)
```

_Add-in start URL_
```
https://localhost:8443/dist/index.html
```
This will create a manifest that can be loaded in all Office products.

## Build
`gulp`

## Run Your Add-In
TODO