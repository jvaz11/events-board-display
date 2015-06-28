var app = angular.module('website', ['ngAnimate', 'ui.bootstrap', 'ngRoute', 'ngResource', 'firebase', 'toaster', 'ui.bootstrap']);

app.constant('FURL', 'https://eventsboard.firebaseio.com/');


app.controller('MainCtrl', function($scope, $timeout, QueueService, $route, $routeParams, $location, $firebase, $log) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    var INTERVAL = 10000;
    // slides = [{
    //     "id": "image00",
    //     "src": "./images/image00.jpg",
    //     "title": "Volleyball Tournament",
    //     "dateTime": "2015-01-06"
    // }, {
    //     "id": "image01",
    //     "src": "./images/image01.jpg",
    //     "title": "All Hands Meeting",
    //     "dateTime": "2015-01-05"
    // }, {
    //     "id": "image02",
    //     "src": "./images/image02.jpg",
    //     "title": "Board Game Night",
    //     "dateTime": "2015-01-03"
    // }, {
    //     "id": "image03",
    //     "src": "./images/image03.jpg",
    //     "title": "Ops Q&A",
    //     "dateTime": "2015-01-04"
    // }, {
    //     "id": "image04",
    //     "src": "./images/image04.jpg",
    //     "title": "Pizza Party",
    //     "dateTime": "2015-01-02"
    // }, {
    //     "id": "image05",
    //     "src": "./images/image04.jpg",
    //     "title": "Pizza Partyyyyyyyyyyyy",
    //     "dateTime": "2015-01-01"
    // }];
     // Hardcoding :boardid until routing is configured
    var boardid = $routeParams.boardid;

    // var boardid = "-JsrWmm21vh4grLC-wRP";

    var ref = new Firebase("https://eventsboard.firebaseio.com/boards/" + boardid + "/slides");

   

    var slides = $firebase(ref).$asArray();
    $scope.slides = slides;

    // var slides = $scope.events;


    function setCurrentSlideIndex(index) {
        $scope.currentIndex = index;
        // console.log("set current slide");
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentIndex === index;
    }

    function nextSlide() {
        $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
        $timeout(nextSlide, INTERVAL);
    }

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
        return $scope.currentAnimation === animation;
    }

    function loadSlides() {
        // QueueService.loadManifest(slides);
        $timeout(nextSlide, INTERVAL);
    }

    $scope.$on('queueProgress', function(event, queueProgress) {
        $scope.$apply(function() {
            $scope.progress = queueProgress.progress * 100;
        });
    });

    $scope.$on('queueComplete', function(event, slides) {
        $scope.$apply(function() {
            $scope.slides = slides;
            $scope.loaded = true;

            $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
    $scope.loaded = true;
    $scope.currentIndex = 0;
    $scope.currentAnimation = 'fade-in-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;

    loadSlides();
});

app.config(function($routeProvider) {
    $routeProvider
        .when('/display', {
            templateUrl: 'display.html',
            controller: 'MainCtrl'
        })
        .when('/display/:boardid', {
            templateUrl: 'display.html',
            controller: 'MainCtrl'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'EventController'
        })
        .when('/post', {
            templateUrl: 'views/post.html',
            controller: 'EventController'
        })
        .when('/edit/:taskId', {
            templateUrl: 'views/edit.html',
            controller: 'TaskController'
        })
        .otherwise({
        redirectTo: '/'
    });
})


app.factory('QueueService', function($rootScope) {
    var queue = new createjs.LoadQueue(true);

    function loadManifest(manifest) {
        queue.loadManifest(manifest);

        queue.on('progress', function(event) {
            $rootScope.$broadcast('queueProgress', event);
        });

        queue.on('complete', function() {
            $rootScope.$broadcast('queueComplete', manifest);
        });
    }

    return {
        loadManifest: loadManifest
    }
});

app.animation('.slide-animation', function($window) {
    return {
        enter: function(element, done) {
            var startPoint = $window.innerWidth * 0.05,
                tl = new TimelineLite();

            tl.fromTo(element.find('.bg'), 1, {
                    alpha: 0
                }, {
                    alpha: 1
                })
                .fromTo(element.find('.xlarge'), 1, {
                    left: startPoint,
                    alpha: 0
                }, {
                    left: 50,
                    alpha: 1                })
                .fromTo(element.find('.title'), 1, {
                    left: 50,
                    alpha: 0
                }, {
                    left: 50,
                    alpha: 1                })
                .fromTo(element.find('.dateTime'), 1, {
                    left: 50,
                    alpha: 0
                }, {
                    left: 50,
                    alpha: 1,
                    onComplete: done
                });

        },

        leave: function(element, done) {
            var tl = new TimelineLite();

            tl.to(element, 1, {
                alpha: 0,
                onComplete: done
            });
        }
    };
});



app.directive('bgImage', function($window) {
    return function(scope, element, attrs) {
        var resizeBG = function() {
            var bgwidth = element.width();
            var bgheight = element.height();

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;

            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: winwidth + 'px',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: winheight + 'px'
                });
            }
        };

        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

        element.bind('load', function() {
            resizeBG();
        });
    }
});
