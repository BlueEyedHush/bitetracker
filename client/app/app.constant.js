(function(angular, undefined) {
  angular.module("foodDiaryApp.constants", [])

.constant("appConfig", {
	"userRoles": [
		"guest",
		"user",
		"admin"
	]
})

;
})(angular);