var templateSource = new Object();

templateSource.getEditTemplate = function() {
	var t = '<form class="well" name="myForm">\n' +
    		'<div class="control-group" ng-class="{error: myForm.Name.$invalid}">\n' +
    		'\n' +	
			'    	{{{body}}}\n' +
			'\n' +
			'   </div>\n' +
			'\n' +
			'\n' +
			'    <p style="text-align: center;padding-bottom: 30px;padding-top: 40px;">\n' +
			'        <button ng-click="save()" ng-disabled="isClean() || myForm.$invalid"\n' +
			'                class="btn btn-primary">Save\n' +
			'        </button>\n' +
			'        <button ng-click="destroy()"\n' +
			'                ng-show="{{{object-type}}}.Id"\n' +
			'                class="btn btn-danger">Delete\n' +
			'        </button>\n' +
			'        <button ng-click="doCancel()" class="btn">Cancel</button>\n' +
			'    </p>\n' +
			'\n' +	
			'</form>\n';
	return t;
}

// template variables:
// {{{object-name}}} - proper case object name
// {{{view-headers}}} - proper case field name
// {{{web-body}}} - set of tds that hold field names for web size 
// {{{phone-body}}} - set of tds that hold field names for device size
// {{{object-name-lc}}} - lower case object name

templateSource.getListTemplate = function() {
	var t = '<div ng-show="isWorking()">\n' + 
			'    <p>Working</p>\n' + 
			'</div>\n' + 
			'<script>\n' + 
			'    $("#header").html("{{{object-name}}} Demo");\n' + 
			'</script>\n' + 
			'\n' + 
			'<div ng-show="!isWorking()">\n' + 
			'    <!-- This div is only displayed in desktops (see below for mobile phones)-->\n' + 
			'    <div class="hidden-phone">\n' + 
			'        <div style="float: left">\n' + 
			'            <div style="margin-bottom: 10px;">\n' + 
			'                <input type="text" ng-model="searchTerm" class="search-query" placeholder="Search" />\n' + 
			'\n' + 
			'                <p class="btn btn-primary" ng-click="doSearch(searchString)">Go</p>\n' + 
			'            </div>\n' + 
			'        </div>\n' + 
			'\n' + 
			'        <div style="float: right">\n' + 
			'            <a href="#/new" class="btn btn-primary">New</a>\n' + 
			'        </div>\n' + 
			'\n' + 
			'\n' + 
			'        <table width="80%" class="table">\n' + 
			'            <thead>\n' + 
			'            <tr>\n' + 
			'                {{{view-headers}}}\n' + 
			'            </tr>\n' + 
			'            </thead>\n' + 
			'            <tbody>\n' + 
			'\n' + 
			'            <tr ng-repeat="{{{object-name-lc}}} in {{{object-name-lc}}}s">\n' + 
			'                {{{web-body}}}\n' + 
			'            </tr>\n' + 
			'            </tbody>\n' + 
			'        </table>\n' + 
			'    </div>\n' + 
			'\n' + 
			'    <!-- This div is only displayed in mobile phones (see above for desktops) -->\n' + 
			'    <div class="visible-phone">\n' + 
			'        <form class="form-inline">\n' + 
			'            <input type="text" ng-model="searchTerm" class="input-medium search-query" placeholder="Search" />\n' + 
			'            <button ng-click="doSearch(searchString)" class="btn btn-primary">Go</button>\n' + 
			'            <button ng-click="doCreate()" class="btn btn-default">&nbsp;+&nbsp;</button>\n' + 
			'        </form>\n' + 
			'\n' + 
			'        <table class="table">\n' + 
			'            <tr ng-click="doView({{{object-name-lc}}}.Id)" ng-repeat="{{{object-name-lc}}} in {{{object-name-lc}}}s">\n' + 
			'                {{{phone-body}}}\n' + 
			'            </tr>\n' + 
			'        </table>\n' + 
			'    </div>\n' + 
			'\n' + 
			'</div>\n';
	return t;
}

templateSource.getViewTemplate = function() {
	var t = '\n' + 
			'<div class="span4 well">\n' + 
			'{{{body}}}\n' + 
			'    <div class="row">\n' + 
			'        <div class="span1">\n' + 
			'            <a class="btn" style="margin-top: 10px;" href="#/edit{{{object-name-lc}}}/{{{{{object-name-lc}}}.Id}}">Edit</a>\n' + 
			'        </div>\n' + 
			'        <div class="span3">\n' + 
			'            <a class="btn btn-primary" style="margin-top: 10px;" href="#/{{{object-name-lc}}}s">Back to {{{object-name}}}s</a>\n' + 
			'        </div>\n' + 
			'    </div>\n' + 
			'</div>\n';
	return t;
}

templateSource.getModelTemplate = function() {
	var t = '/**\n' + 
			' * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and\n' + 
			' * create an "{{{object-name}}}" object. And then set its type, fields, where-clause etc.\n' + 
			' *\n' + 
			' *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.\n' + 
			' */\n' + 
			'var {{{object-name}}}Module = angular.module("{{{object-name}}}Module", []).factory("{{{object-name}}}", function (AngularForceObjectFactory) {\n' + 
			'   //Describe the {{{object-name}}} object\n' + 
			'    var objDesc = {\n' + 
			'        type: "{{{object-name}}}",\n' + 
			'        fields: [{{{fields-list}}}],\n' + 
			'        where: "",\n' + 
			'        orderBy: "{{{first-field}}}",\n' + 
			'        limit: 20\n' + 
			'    };\n' + 
			'    var {{{object-name}}} = AngularForceObjectFactory(objDesc);\n' + 
			'\n' + 
			'    return {{{object-name}}};\n' + 
			'});\n' + 
			'\n' + 
			'{{{object-name}}}Module.controller("{{{object-name}}}ListCtrl", function($scope, AngularForce, $location, {{{object-name}}}) {\n' + 
			'    $scope.authenticated = AngularForce.authenticated();\n' + 
			'    if (!$scope.authenticated) {\n' + 
			'        return $location.path("/login");\n' + 
			'    }\n' + 
			'\n' + 
			'    $scope.searchTerm = "";\n' + 
			'    $scope.working = false;\n' + 
			'\n' + 
			'    {{{object-name}}}.query(function (data) {\n' + 
			'        $scope.{{{object-name-lc}}}s = data.records;\n' + 
			'        $scope.$apply();//Required coz sfdc uses jquery.ajax\n' + 
			'    }, function (data) {\n' + 
			'        alert("Query Error");\n' + 
			'    });\n' + 
			'\n' + 
			'    $scope.isWorking = function () {\n' + 
			'        return $scope.working;\n' + 
			'    };\n' + 
			'\n' + 
			'    $scope.doSearch = function () {\n' + 
			'        {{{object-name}}}.search($scope.searchTerm, function (data) {\n' + 
			'            $scope.{{{object-name-lc}}}s = data;\n' + 
			'            $scope.$apply();//Required coz sfdc uses jquery.ajax\n' + 
			'        }, function (data) {\n' + 
			'        });\n' + 
			'    };\n' + 
			'\n' + 
			'    $scope.doView = function ({{{object-name-lc}}}Id) {\n' + 
			'        console.log("doView");\n' + 
			'        $location.path("/view{{{object-name-lc}}}/" + {{{object-name-lc}}}Id);\n' + 
			'    };\n' + 
			'\n' + 
			'    $scope.doCreate = function () {\n' + 
			'        $location.path("/new{{{object-name-lc}}}");\n' + 
			'    }\n' + 
			'});\n' + 
			'\n' + 
			'{{{object-name}}}Module.controller("{{{object-name}}}CreateCtrl", function($scope, $location, {{{object-name}}}) {\n' + 
			'    $scope.save = function () {\n' + 
			'        {{{object-name}}}.save($scope.{{{object-name-lc}}}, function ({{{object-name-lc}}}) {\n' + 
			'            var c = {{{object-name-lc}}};\n' + 
			'            $scope.$apply(function () {\n' + 
			'                $location.path("/view{{{object-name-lc}}}/" + c.Id);\n' + 
			'            });\n' + 
			'        });\n' + 
			'    }\n' + 
			'});\n' + 
			'\n' + 
			'{{{object-name}}}Module.controller("{{{object-name}}}ViewCtrl", function($scope, AngularForce, $location, $routeParams, {{{object-name}}}) {\n' + 
			'\n' + 
			'    AngularForce.login(function () {\n' + 
			'        {{{object-name}}}.get({id: $routeParams.{{{object-name-lc}}}Id}, function ({{{object-name-lc}}}) {\n' + 
			'            self.original = {{{object-name-lc}}};\n' + 
			'            $scope.{{{object-name-lc}}} = new {{{object-name}}}(self.original);\n' + 
			'            $scope.$apply();//Required coz sfdc uses jquery.ajax\n' + 
			'        });\n' + 
			'    });\n' + 
			'});\n' + 
			'\n' + 
			'{{{object-name}}}Module.controller("{{{object-name}}}DetailCtrl", function($scope, AngularForce, $location, $routeParams, {{{object-name}}}) {\n' + 
			'    var self = this;\n' + 
			'    console.log("{{{object-name}}} Detail Controller");\n' + 
			'    if ($routeParams.{{{object-name-lc}}}Id) {\n' + 
			'        AngularForce.login(function () {\n' + 
			'            {{{object-name}}}.get({id: $routeParams.{{{object-name-lc}}}Id}, function ({{{object-name-lc}}}) {\n' + 
			'                self.original = {{{object-name-lc}}};\n' + 
			'                $scope.{{{object-name-lc}}} = new {{{object-name}}}(self.original);\n' + 
			'                $scope.$apply();//Required coz sfdc uses jquery.ajax\n' + 
			'            });\n' + 
			'        });\n' + 
			'    } else {\n' + 
			'        $scope.{{{object-name-lc}}} = new {{{object-name}}}();\n' + 
			'        //$scope.$apply();\n' + 
			'    }\n' + 
			'\n' + 
			'    $scope.isClean = function () {\n' + 
			'        return angular.equals(self.original, $scope.{{{object-name-lc}}});\n' + 
			'    }\n' + 
			'\n' + 
			'    $scope.destroy = function () {\n' + 
			'        self.original.destroy(\n' + 
			'           function () {\n' + 
			'               $scope.$apply(function () {\n' + 
			'                   $location.path("/{{{object-name-lc}}}s");\n' + 
			'               });\n' + 
			'            },\n' + 
			'            function(errors) {\n' + 
			'                alert("Could not delete {{{object-name}}}!" + JSON.parse(errors.responseText)[0].message);\n' + 
			'            }\n' + 
			'       );\n' + 
			'    };\n' + 
			'\n' + 
			'    $scope.save = function () {\n' + 
			'        if ($scope.{{{object-name-lc}}}.Id) {\n' + 
			'            $scope.{{{object-name-lc}}}.update(function () {\n' + 
			'                $scope.$apply(function () {\n' + 
			'                    $location.path("/view{{{object-name-lc}}}/" + $scope.{{{object-name-lc}}}.Id);\n' + 
			'                });\n' + 
			'\n' + 
			'            });\n' + 
			'        } else {\n' + 
			'            {{{object-name}}}.save($scope.{{{object-name-lc}}}, function ({{{object-name-lc}}}) {\n' + 
			'               var p = {{{object-name-lc}}};\n' + 
			'               $scope.$apply(function () {\n' + 
			'                    $location.path("/view{{{object-name-lc}}}/" + p.id);\n' + 
			'                });\n' + 
			'            });\n' + 
			'        }\n' + 
			'    };\n' + 
			'\n' + 
			'    $scope.doCancel = function () {\n' + 
			'        if ($scope.{{{object-name-lc}}}.Id) {\n' + 
			'            $location.path("/view{{{object-name-lc}}}/" + $scope.{{{object-name-lc}}}.Id);\n' + 
			'        } else {\n' + 
			'            $location.path("/{{{object-name-lc}}}s");\n' + 
			'        }\n' + 
			'    }\n' + 
			'});\n' + 
			';\n'
	return t;
}

exports.templateSource = templateSource;
