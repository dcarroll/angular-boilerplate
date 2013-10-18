angular-boilerplate
===================

Boiler plate generator for mobile packs.

This only works currently for the AngularHerokuBootstrapNode mobile pack.

Installation

git clone https://github.com/dcarroll/angular-boilerplate.git

npm install
npm link

You should now be able to type modgen without an error.



Usage - you need to run this from the terminal from within the public folder that was installed with the mobile pack. There is little error checking so please be sure to make the public for your current directory in terminal.

modgen make_model <object name> [<field name>]

Example
modgen make_modeal Account Name, Id, Industry, Website

This will create three html files in the partials folder, view, edit and list templates. These will likely not be perfect but should provide a good starting point for further development.  It will also create a <object name>.js angular module in the js folder. 

This will also modify the init.js file to add routes to the html files as well as add the module to the app. 

IMPORTANT: It does not currently modify the index.ejs file to include the <object name>.js module. You will need to do that yourself at the bottom of the index.ejs file.

You can run this multiple times as it is (mostly) aware of the changes that it is making. It WILL stomp all over any changes you made to the generated html. I will later include a command to just recreate the model.

