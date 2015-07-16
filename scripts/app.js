var app = angular.module('website', ['ngAnimate', 'ui.bootstrap', 'ngRoute', 'ngResource', 'firebase', 'toaster', 'ui.bootstrap']);


app.controller('MainCtrl', function($scope, $timeout, QueueService, $route, $routeParams, $location, $firebase, $log) {
    $scope.$route = $route;
    $scope.$location = $location;
    // $scope.$routeParams = $routeParams;
    var INTERVAL = 10000;
    // var boardid = $routeParams.boardid;
    // var ref = new Firebase("https://eventsboard.firebaseio.com/profiles/simplelogin%3A34/slides");
    // var slides = $firebase(ref).$asArray();
    // $scope.slides = slides;

    // var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    // var FURL = 'https://eventsboard.firebaseio.com';
    // var ref = new Firebase(FURL);

    $scope.$on('$routeChangeSuccess', function(ev, current, prev) {
        var paramId = $routeParams.boardid;
        console.log("paramId is " + paramId);
        var idd = atob(paramId);

        // idd = encodeURI(idd);


        var ref = new Firebase("https://eventsboard.firebaseio.com");
        var slides = $firebase(ref.child('profiles').child(idd).child('slides')).$asArray();
        $scope.slides = slides;


    });



    // get slides if slides array isn't null
    // $scope.getSlides = function(){
    //     if (slides !== null) {
    //         $scope.slides = slides;
    //     }
    // };

    // $scope.getSlides();









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
                    alpha: 1
                })
                .fromTo(element.find('.title'), 1, {
                    left: 50,
                    alpha: 0
                }, {
                    left: 50,
                    alpha: 1
                })
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
