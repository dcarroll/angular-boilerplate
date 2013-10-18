#! /usr/bin/env node

var fs = require("fs"),
	S = require("string"),
	esprima = require("esprima"),
	templates = require("./templateSource.js").templateSource,
	_ = require("underscore");
//var XRegExp = require('xregexp').XRegExp;

var jsPath = "js/";
var htmlPath = "partials/";

function readFile(fileName) {
	return fs.readFileSync(fileName, 'utf-8');
};

var getFields = function(source) {
	var decs = source.body[0].declarations;
	var dec = decs[0];

	var args = dec.init.arguments;

	var body;

	_.each(args, function(arg) {
		if (arg.type === "FunctionExpression") {
			body = arg.body.body[0];
		};
	});

	var props = body.declarations[0].init.properties;

	var fields;
	_.each(props, function(prop) {
		if (prop.key.name === "fields") {
			fields = prop.value.elements;
		}
	});

	var fieldNames = [];

	_.each(fields, function(field) {
		fieldNames.push(field.value);
	});
	return fieldNames;
};

var getEditComponent = function(objectName, fieldName) {
	return 	'<label>' + S(fieldName).humanize().s + '</label>\n' +
	       	'\t<input type="text" name="' + fieldName + '" ng-model="' + objectName.toLowerCase() + '.' + fieldName + '" />';
};

var getPhoneListComponent = function(objectName, fieldName) {
    return '<td>' +
    			'<b class="fullname">' + 
    				'{{' + objectName.toLowerCase() + "." + fieldName + '}}' +
    			'</b>' +
                /*'<br />' +
                '<small class="metadata">' + 
                contact.Account.Name + 
                '</small>' + */
            '</td>' +
            '<td><i class="icon-chevron-right"></i></td>\n';
};

var getWebListComponent = function(objectName, fieldName, isNavField) {
	if (typeof isNavField != 'undefined' && isNavField === true) {
		return '<td><a href="#/view' + objectName.toLowerCase() + '/{{' + objectName.toLowerCase() + '.Id}}">{{' + objectName.toLowerCase() + '.' + fieldName + '}}</a></td>\n';
	} else {
		return '<td>{{' + objectName.toLowerCase() + '.' + fieldName + '}}</td>\n';
	}
};

var getListHeader = function(objectName, fieldName, className) {
	if (typeof className != 'undefined') {
		return '<th class="' + className + '">' + S(fieldName).humanize().s + '</th>\n';
	} else {
		return '<th>' + S(fieldName).humanize().s + '</th>\n';
	}
};

var getViewComponent = function(objectName, fieldName) {
	return '\t<div class="row">\n' + 
        '\t\t<div class="span3 offset1">\n' +
            '\t\t\t<b>{{' + objectName.toLowerCase() + '.' + fieldName + '}}</b>\n' +
        '\t\t</div>\n' +
    '\t</div>\n';
};

var makeTemplate = function(objectname, template_type) {
	//var sourcecode = esprima.parse(S(readFile(jsPath + objectname.toLowerCase() + ".js")));
	//var fields = getFields(sourcecode);
	var editComponents = "";
	//var template = S("cli_resource/" + readFile("cli_resource/" + template_type + "-template.html"));
	var template = "";

	switch (template_type) {
		case "edit":
			template = templates.getEditTemplate();
			_.each(fields, function(field) {
				editComponents += getEditComponent(objectname, field);
			});
				template = S(template).replaceAll("{{{body}}}", editComponents).s;
				template = S(template).replaceAll("{{{object-type}}}", objectname.toLowerCase()).s;
			break;
		case "list":
			template = templates.getListTemplate();
			var phoneListComponents = "";
			var listHeaders = "";
			var webListComponents = "";
			_.each(fields, function(field) {
				listHeaders += getListHeader(objectname, field);
				phoneListComponents += getPhoneListComponent(objectname, field);
				webListComponents += getWebListComponent(objectname, field, true);
			});
			template = S(template)
						.replaceAll('{{{phone-body}}}', phoneListComponents)
						.replaceAll('{{{view-headers}}}', listHeaders)
						.replaceAll('{{{web-body}}}', webListComponents)
						.replaceAll('{{{object-name-lc}}}', objectname.toLowerCase())
						.replaceAll('{{{object-name}}}', objectname).s;
			break;
		case "view":
			template = templates.getViewTemplate();
			var viewComponents = "";
			_.each(fields, function(field) {
				viewComponents += getViewComponent(objectname, field);
			});
			template = S(template)
						.replaceAll('{{{body}}}', viewComponents)
						.replaceAll('{{{object-name-lc}}}', objectname.toLowerCase())
						.replaceAll('{{{object-name}}}', objectname)
						.s;
			break;
	}

	var filename = "ng" + objectname + S(template_type).capitalize().s + ".html";
	fs.writeFileSync(htmlPath + filename, template);
	console.log(filename + " was created");
};

var generateModel = function(objectName, fieldArray) {
	//var genericModel = S(readFile("cli_resource/" + "generic-model.js")).s;
	var genericModel = templates.getModelTemplate();
	var fields = "\n";
	_.each(fieldArray, function(field) {
		fields += "\t\t\t'" + field + "',\n";
	});
	fields = fields.substring(0, fields.length - 2) + "\n\t\t";
	//console.log("[\n" + fields + "\n]");
	genericModel = S(genericModel)
		.replaceAll("{{{object-name}}}", objectName)
		.replaceAll("{{{object-name-lc}}}", objectName.toLowerCase())
		.replaceAll("{{{fields-list}}}", fields)
		.replaceAll("{{{first-field}}}", fieldArray[0]).s;
	//console.log(genericModel);
	fs.writeFileSync(jsPath + objectName.toLowerCase() + ".js", genericModel);
	console.log(objectName + ".js created");

	// Tacking on the other generation parts
	makeTemplate(objectName, 'edit');
	makeTemplate(objectName, 'list');
	makeTemplate(objectName, 'view');

	// Edit the init.js file
	var init = S(readFile('js/init.js')).s;
	editInitFile(init, objectName);

	// Edit the app.js file
	var appJs = S(readFile("js/app.js")).s;
	getHomeControllerFunction(appJs, objectName);
};

/* Init file configuration  */
var moduleDefToReplace;

var getModuleList = function(init) {
	var modDefInsertionPointSearch = 'var app = angular.module(';
	var one = init.indexOf(modDefInsertionPointSearch);
	var moduleDef = init.substring(one, init.indexOf(';') + 1);

	moduleDefToReplace = moduleDef;

	var modDefLength = moduleDef.indexOf(')');
	var modDefArgs = moduleDef.substring(modDefInsertionPointSearch.length, modDefLength);

	modDefArgs = S(modDefArgs).replaceAll("'", "").s;

	var modList = modDefArgs.substring(modDefArgs.indexOf('[') + 1, modDefArgs.length - 1);
	var mList = modList.split("\n");
	var cleanMList = [];

	_.each(mList, function(m){
		m = S(m).collapseWhitespace().trim().replaceAll(",", "").replaceAll("\t", "").replaceAll("\n", "").s;
		if (m.length > 0) cleanMList.push(m);
	})
	return cleanMList;
};

var routeDefToReplace;

var getRouteList = function(init) {
	var routeListInsertionPointSearch = 'app.config(function ($routeProvider) {';
	var one = init.indexOf(routeListInsertionPointSearch);

	var routeDef = init.substring(one);
	var routeListInsertionPointEndSearch = "otherwise({redirectTo: '/'});";
	var two = routeDef.indexOf(routeListInsertionPointEndSearch);

	var routeDef2 = routeDef.substring(0, two + routeListInsertionPointEndSearch.length);
	var end = routeDef.indexOf("});", routeDef2.length + 1);
	routeDef = routeDef.substring(0, end + 4);
	routeDefToReplace = routeDef;

	routeDef2 = routeDef.split('$routeProvider.')[1];

	var routes = routeDef2.split('\n');

	var routeList = {};
	for (var i = 0;i<routes.length;i++) {
		var route = routes[i];
		route = S(route).collapseWhitespace().trim().replaceAll("\t", "").replaceAll("\n", "").s;
		var parts = route.split(',');
		for (var j=0;j<parts.length;j++) {
			var part = parts[j];
			routeList[S(part).trim().s] = S(part).trim().s;
		}
	}

	return routeList;
};

var getRoute = function(routeLine, findRoute) {
	var r = routeLine.split(',')[0];
	r = S(r).replaceAll('"', '').replaceAll("'", "").s.split("(")[1].trim();
	return r;
};

var routeExists = function(routeList, findRoute) {
	var result = false;
	for (var key in routeList) {
	   	var rte = routeList[key];
    	if (S(rte).startsWith('when')) {
    		if (getRoute(rte) == findRoute) {
    			result = true;
    		}
    	}
    };
    return result;
};

var addRoutes = function(init, routeList, objectName) {
	var listRoute = S('when("/{{{object-name-lc}}}s", {controller: "{{{object-name}}}ListCtrl", templateUrl: "partials/ng{{{object-name}}}List.html"}).')
				.replaceAll("{{{object-name-lc}}}", objectName.toLowerCase())
				.replaceAll("{{{object-name}}}", objectName).s;
    var editRoute = S('when("/edit{{{object-name-lc}}}/:{{{object-name-lc}}}Id", { controller: "{{{object-name}}}DetailCtrl", templateUrl: "partials/ng{{{object-name}}}Edit.html"}).')
				.replaceAll("{{{object-name-lc}}}", objectName.toLowerCase())
				.replaceAll("{{{object-name}}}", objectName).s;
    var createRoute = S('when("/new{{{object-name-lc}}}", { controller: "{{{object-name}}}CreateCtrl", templateUrl: "partials/ng{{{object-name}}}Edit.html" }).')
				.replaceAll("{{{object-name-lc}}}", objectName.toLowerCase())
				.replaceAll("{{{object-name}}}", objectName).s;
    var viewRoute = S('when("/view{{{object-name-lc}}}/:{{{object-name-lc}}}Id", {controller: "{{{object-name}}}ViewCtrl", templateUrl: "partials/ng{{{object-name}}}View.html"}).')
				.replaceAll("{{{object-name-lc}}}", objectName.toLowerCase())
				.replaceAll("{{{object-name}}}", objectName).s;

	var routeDefLines = routeDefToReplace.split("\n");
	//console.log(JSON.stringify(routeDefLines, null, 4));
	var insertionPoint;
	for (insertionPoint = 0; insertionPoint < routeDefLines.length;insertionPoint++) {
		if (S(routeDefLines[insertionPoint]).trim().startsWith('otherwise')) {
			break;
		}
	}

    if (routeExists(routeList, getRoute(listRoute)) === false) {
    	routeDefLines.splice(insertionPoint, 0, "\t\t" + listRoute);
    //	console.log(listRoute);
    }
    if (routeExists(routeList, getRoute(editRoute)) === false) {
    	routeDefLines.splice(insertionPoint, 0, "\t\t" + editRoute);
    //	console.log(editRoute);
    }
    if (routeExists(routeList, getRoute(createRoute)) === false) {
    	routeDefLines.splice(insertionPoint, 0, "\t\t" + createRoute);
    //	console.log(createRoute);
    }
    if (routeExists(routeList, viewRoute) === false) {
    	routeDefLines.splice(insertionPoint, 0, "\t\t" + viewRoute);
    //	console.log(viewRoute);
    }
    var newRouteDef = "";
    for (var i=0;i<routeDefLines.length;i++) {
    	newRouteDef += routeDefLines[i] + "\n";
    }

    return S(init).replaceAll(routeDefToReplace, newRouteDef).s;
};

var addModules = function(init, modList, objectName) {
	var add = true;
	console.log(JSON.stringify(modList, null, 4));
	for (var k=0;k<modList.length;k++) {
		//console.log(modList[k]);
		if (modList[k] === objectName + "Module") {
			add = false;
		}
	}
	if (add === true) {
		//console.log("Add is true");
		var modDefLines = moduleDefToReplace.split("\n");
		var insertionPoint;
		for (var i=0;i<modDefLines.length;i++) {
			//console.log(modDefLines[i]);
			if (S(modDefLines[i]).trim().s === ']);') {
				insertionPoint = i;
				break;
			}
		}
		//console.log("Length " + modDefLines.length + ", insertionPoint " + insertionPoint);
		modDefLines.splice(insertionPoint, 0, "\t\t'" + objectName + "Module'")
		modDefLines[insertionPoint - 1] = modDefLines[insertionPoint - 1] + ",";

		var newModDef = "";
    	for (var i=0;i<modDefLines.length;i++) {
    		newModDef += modDefLines[i] + "\n";
    	}
	    //console.log(newModDef);
    	return S(init).replaceAll(moduleDefToReplace, newModDef).s;
	} else {
		return init;
	}
};

var editInitFile = function(init, objectName) {
	init = addRoutes(init, getRouteList(init), objectName);
	init = addModules(init, getModuleList(init), objectName)
	console.log(init);
    fs.writeFileSync(jsPath + "init.js", init);
    console.log("init.js configured");
}

/* app.js file configuration */
var getHomeControllerFunction = function(appJs, objectName) {
	var recordingOn = false;
	var functionLines = [];
	var start = appJs.indexOf("function HomeCtrl");
	var end = appJs.indexOf("function LoginCtrl") - 2;
	var fToReplace = appJs.substring(start, end);
	
	_.each(appJs.split("\n"), function(line) {
		if (S(line).startsWith('function HomeCtrl')) {
			recordingOn = true;
		}
		if (S(line).startsWith('}')) {
			if (recordingOn === true) 
				functionLines.push(line);
			recordingOn = false;
		}
		if (recordingOn === true) {
			functionLines.push(line);
		}
	});

	for (var i=0;i<functionLines.length;i++) {
		if (functionLines[i].indexOf('$scope.view' + objectName + 's') > -1) {
			// No need to modify, already exists
			return;
		}
	}

	functionLines.splice(functionLines.length - 1, 0, "\n\t" + '$scope.view' + objectName + 's = function() {');
	functionLines.splice(functionLines.length - 1, 0, '\t\tconsole.log("HomeCtrl go to ' + objectName.toLowerCase() + 's...");');
	functionLines.splice(functionLines.length - 1, 0, "\t\t$location.path('/" + objectName.toLowerCase() + "s');");
	functionLines.splice(functionLines.length - 1, 0, '\t}');

	var newFunction = "";
	for (var i=0;i<functionLines.length;i++) {
		newFunction += functionLines[i] + "\n";
		//console.log(functionLines[i]);
	}

	appJs = S(appJs).replaceAll(fToReplace, newFunction).s;
	fs.writeFileSync(jsPath + "app.js", appJs);
	console.log("app.js configured");
}

//console.log(JSON.stringify(process.env, null, 4));

if (process.argv[2] === "make_model") {
	var objectname = S(process.argv[3]).capitalize().s;
	var fields = [];
	if (process.argv.length > 4) {
		for (var i=4;i<process.argv.length;i++) {
			fields.push(process.argv[i].replace(/,+$/, ""));
		}
	} else {
		fields = process.argv[4].split(',');
	}
	generateModel(objectname, fields);
} else if (process.argv[2] === "make_template") {
	var objectname = S(process.argv[3]).capitalize().s;
	if (typeof process.argv[4] === 'undefined') {
		makeTemplate(objectname, 'edit');
		makeTemplate(objectname, 'list');
		makeTemplate(objectname, 'view');
	} else {
		makeTemplate(objectname, process.argv[4]);
	}
};



