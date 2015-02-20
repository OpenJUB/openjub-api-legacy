# Contribute to OpenJUB API

## Coding style

see .jshintrc

## Folder Structure

`lib/`
  : Contains main code base

`lib/config/`
  : Files configuring components such as `express`

`lib/controllers/`
  : All files that handle requests from `express`. If you add a new controller
  don't forget to add it to the `index.js` file in order to be used.

`lib/models/`
  : All database models used by `mongoose` and `MongoDB`. For options how to use
  these models refer to the `mongoose` documentation. Don't forget to add new
  files to the `index.js`.

`lib/utils/`
  : All kinds of utilities, try to separate them in different files according to
  their usage.

`lib/errors.js`
  : Defines all possible errors as an array of HTTP code and response JSON. For
  new errors don't forget to define the ErrorStructure according to the APIDocs
  example

`lib/routes.js`
  : Defines all API routes and links them to the respective controller. No
    real logic in here. **Don't forget to create proper APIDocs comment blocks**

`tasks/`
  : Place for command-line scripts

`tasks/developerToken`
  : Script to generate a developer token as well as the respective App ID for
  the developer

`tasks/sync`
  : Script used to get/update the database

`_settings.json`
  : Example settings JSON that needs to be copied to `settings.json` in order
  to work. **Don't put any sensitive content into `_settings.json` as it will
  be committed to GitHub.

`_apidoc.js`
  : Copy old versions of the APIDocs comment blocks in here if a new version is
  created.

`Gruntfile.js`
  : Task Runner file that defines all possible tasks.

`server.js`
  : Main script that will be executed in order to start the server.

## How To

### Step 1:
Check for open issues in the [issue tracker](https://github.com/OpenJUB/openjub-api/issues)

### Step 2:
Check if the issue was already solved by trying to replicate it by cloning the master branch

### Step 3:
Fork repository and solve issue

### Step 4:
Submit a pull request

### Step 5:
Earn eternal glory in the Jacobs developer community :)
