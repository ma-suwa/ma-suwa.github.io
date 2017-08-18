var myApp = angular.module("myApp", []);
myApp.controller("MyController",["$scope","$http",function($scope,$http){
  $http.get("assets/js/data.json").success(function(data){
    $scope.data = data;
  });
}]);
