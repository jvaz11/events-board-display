'use strict';

app.controller('EventController', function($scope, $firebase, FURL, $location, $routeParams, toaster) {

	var ref = new Firebase(FURL);
	var fbEvents = $firebase(ref.child('events')).$asArray();
	var eventId = $routeParams.eventId;

	$scope.events = fbEvents;
	
	if(eventId) {
		$scope.selectedEvent = getEvent(eventId);
	}

	function getEvent(eventId) {
		return $firebase(ref.child('events').child(eventId)).$asObject();
	};

	$scope.postEvent = function(event) {
		$scope.events.$add(event);
		toaster.pop('success', 'Event created successfully.');
		$location.path('/');
	};	

	$scope.updateEvent = function(event) {
		$scope.selectedEvent.$save(event);
		toaster.pop('success', "Event is updated.");
		$location.path('/');
	};

});