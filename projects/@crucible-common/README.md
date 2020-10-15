## Crucible Common Modules

### Description

Crucible Common modules are a set of angular modules that are common between Crucible apps.

### Modules

#### Settings Module

The Common Settings Module is a module that can load application level settings
from a JSON file and provide a settings service to the entire application. Typically this
file will be served by angular in the `assets` folder.

In most cases a settings file will already exist in your application. however, if you
need a starting point a template json file is provided in `comn-settings/templates`

Find out more on the [Github Page](https://github.com/cmu-sei/Crucible.Common.Ui/tree/main/projects/%40crucible-common/src/lib/comn-settings).

#### Auth Module

The Common Auth module is a module that interacts with the Identity server, providing authentication  
to the application.

Find out more on the [Github Page](https://github.com/cmu-sei/Crucible.Common.Ui/tree/main/projects/%40crucible-common/src/lib/comn-auth).