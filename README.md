## Crucible Common Modules

#### Description

Crucible Common modules are a set of angular modules that are common between Crucible apps.

#### Modules

- [Settings Module](projects/@crucible-common/src/lib/comn-settings/README.md)
- [Auth Module](projects/@crucible-common/src/lib/comn-auth/README.md)

### **Running the sample application.**

The Crucible Common library is packaged with a simple sample application for limited testing. The application is linked to the library through the library's `public-api.ts` file to allow debugging of the library.

To run the application start the `json-server`

`npm run json-server`

Run the application as normal.

## **External Testing.**

In some cases it may be necessary to test the library in an external application with an installed npm package. There can be slight differences in the compiled npm package and the library code.

We use `npm link` to map our local instance to npm. An npm script has been created to make this easier `npm run build:link` to compile and link the library then in your external application run `npm link @cmusei/crucible-common` to link the library. After you have linked the library, if you update any library code it will automatically be avaiable in the external application

## Debugging from an external application

Debugging is possible from an external application this is sometimes neccessary to debug complex issues in a specific application. The @cmusei/crucible-common library is set up to be debugged from external applications. The specific setting in a library that needs to be updated to enable debugging of the library is in

tsconfig.json

```
"angularCompilerOptions": {
    "enableIvy": false
  }
```

In your external application some settings need to be changed

angular.json

```diff
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "s3.vm.ngconsole": {
      "root": "",
      "sourceRoot": "src",
      "projectType": "application",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
+           "preserveSymlinks": true,
            "outputPath": "dist",
            "index": "src/index.html",
            "main": "src/main.ts",
            "tsConfig": "src/tsconfig.app.json",
            "polyfills": "src/polyfills.ts",
            "assets": ["src/assets", "src/favicon.ico"],
            "styles": ["src/styles/styles.scss"],
            "scripts": [
              "node_modules/jquery/dist/jquery.js",
              "node_modules/jquery-ui-dist/jquery-ui.js",
              "src/assets/vmware-wmks/js/wmks.min.js"
            ]
          },
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "extractCss": true,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "s3.vm.ngconsole:build",
            "port": 4305,
+           "sourceMap": {
+             "vendor": true
+           }
          },
          "configurations": {
            "production": {
              "browserTarget": "s3.vm.ngconsole:build:production"
            }
          }
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "browserTarget": "s3.vm.ngconsole:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "main": "src/test.ts",
            "karmaConfig": "./karma.conf.js",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.spec.json",
            "scripts": [
              "node_modules/jquery/dist/jquery.js",
              "node_modules/jquery-ui-dist/jquery-ui.js",
              "src/assets/vmware-wmks/js/wmks.min.js"
            ],
            "styles": ["src/styles.css"],
            "assets": ["src/assets", "src/favicon.ico"]
          }
        },
        "lint": {
          "builder": "@angular-devkit/build-angular:tslint",
          "options": {
            "tsConfig": ["src/tsconfig.app.json", "src/tsconfig.spec.json"],
            "exclude": ["**/node_modules/**"]
          }
        }
      }
    },
```

tsconfig.json

```diff
+   "angularCompilerOptions": {
+     "enableIvy": false
+   }
```

Finally for vscode to recognize the changes you need to override the sourcemaps for the library

.vscode/launch.json

```diff
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serv",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4305/vm/4204c65c-6829-4f5c-f6f5-e98e5961fbf5/console",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:/*": "${webRoot}/_",
        "/./_": "${webRoot}/*",
        "/src/*": "${webRoot}/_",
        "/_": "_",
        "/./~/_": "\${webRoot}/node_modules/\*",
+       "webpack:///ng://@cmusei/crucible-common/lib/*": "${workspaceFolder}/../common.ui/projects/@crucible-common/src/lib/*"
      }
    }
  ]
}

```

You can then place breakpoints in the library typescript files and they will be hit with the debugger. Debugging will work with two instances of vscode open however it may be more practical to create a workspace in vscode and add the library and external application to the workspace. [Multi-root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)

## Reporting bugs and requesting features

Think you found a bug? Please report all Crucible bugs - including bugs for the individual Crucible apps - in the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues). 

Include as much detail as possible including steps to reproduce, specific app involved, and any error messages you may have received.

Have a good idea for a new feature? Submit all new feature requests through the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues). 

Include the reasons why you're requesting the new feature and how it might benefit other Crucible users.
