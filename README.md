# office-addin-base
An opinionated base project for building Office Add-ins.

TODO

## Setup
### Prerequisites
#### Node.js
TODO (Install Node)

#### Gulp & Bower
Open Node.js Command Prompt, Git Bash, Terminal, ...

`npm install -g bower gulp`

### Install Dependencies
TODO
```
npm install
bower install
```
#### Trust the Self-Signed Certificate
TODO

`/node_modules/browser-sync/lib/server/certs/server.crt`

## Create a Manifest
TODO
```
npm install -g yo generator-office
yo office
```
Follow the instructions, and enter the following values when prompted:

_Technology to use_

`Manifest.xml only (no application source files)`.

_Add-in start URL_

`https://localhost:8443/dist/index.html`

## Build
`gulp`

## Run Your Add-In
### W/X/P 2016
Right-Click Folder

Share With

Specific People

TODO

### W/X Online
TODO