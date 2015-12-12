// Ionic Starter App

angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.directives', 'app.controllers', 'app.services', 'app.config', 'app.filters', 'angularMoment', 'underscore', 'ngCordova'])

.run(function($ionicPlatform, AuthService, $rootScope, $state) {

  $ionicPlatform.on("deviceready", function(){

    AuthService.userIsLoggedIn().then(function(response)
    {
      if(response === true)
      {
        //update user avatar and go on
        //AuthService.updateUserAvatar();

        $state.go('app.home');
      }
      else
      {
        $state.go('walkthrough');
      }
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true)
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }





  });

  $ionicPlatform.on("resume", function(){
    AuthService.userIsLoggedIn().then(function(response)
    {
      if(response === false)
      {
        $state.go('walkthrough');
      }else{
        //update user avatar and go on
        AuthService.updateUserAvatar();
      }
    });


  });

  // UI Router Authentication Check
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.data.authenticate)
    {
      AuthService.userIsLoggedIn().then(function(response)
      {
        if(response === false)
        {
          event.preventDefault();
          $state.go('walkthrough');
        }
      });
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);
  $stateProvider

  .state('walkthrough', {
    url: "/",
    templateUrl: "templates/walkthrough.html",
    controller: 'WalkthroughCtrl',
    data: {
      authenticate: false
    }
  })

  .state('register', {
    url: "/register",
    templateUrl: "templates/register.html",
    controller: 'RegisterCtrl',
    data: {
      authenticate: false
    }
  })

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl',
    data: {
      authenticate: false
    }
  })

  .state('forgot_password', {
    url: "/forgot_password",
    templateUrl: "templates/forgot-password.html",
    controller: 'ForgotPasswordCtrl',
    data: {
      authenticate: false
    }
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/side-menu.html",
    controller: 'AppCtrl'
  })

  .state('app.home', {
                cache: false,
    url: "/home",
    views: {
      'menuContent': {

        templateUrl: "templates/home.html",
        controller: 'HomeCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.post', {
    url: "/post/:postId",
    views: {
      'menuContent': {
        templateUrl: "templates/post.html",
        controller: 'PostCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.shreds', {
    url: "/shreds",
    views: {
      'menuContent': {
        templateUrl: "templates/shreds.html",
        controller: 'ShredsCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.shred', {
    url: "/shreds/:shredId",
    views: {
      'menuContent': {
        templateUrl: "templates/shred.html",
        controller: 'ShredCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })



  .state('app.ebooks', {
    url: "/ebooks",
    views: {
      'menuContent': {
        templateUrl: "templates/ebooks.html",
        controller: 'EbooksCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.ebook', {
    url: "/ebooks/:ebookId",
    views: {
      'menuContent': {
        templateUrl: "templates/ebook.html",
        controller: 'EbookCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })
  
  .state('app.freeebook', {
    url: "/freeebooks/:ebookId",
    views: {
      'menuContent': {
        templateUrl: "templates/free-ebook.html",
        controller: 'FreeEbookCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })  
  
  .state('app.videos', {
    url: "/videos",
    views: {
      'menuContent': {
        templateUrl: "templates/videos.html",
        controller: 'VideosCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.video', {
    url: "/videos/:videoId",
    views: {
      'menuContent': {
        templateUrl: "templates/video.html",
        controller: 'VideoCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })
  
  .state('app.freevideo', {
    url: "/freevideos/:videoId",
    views: {
      'menuContent': {
        templateUrl: "templates/free-video.html",
        controller: 'FreeVideoCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })  
  
  .state('app.plans', {
    url: "/plans",
    views: {
      'menuContent': {
        templateUrl: "templates/plans.html",
        controller: 'PlansCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.plan', {
    url: "/plans/:planId",
    views: {
      'menuContent': {
        templateUrl: "templates/plan.html",
        controller: 'PlanCtrl'
      }
    },
    
    data: {
      authenticate: true
    }
  })
  
  .state('app.customplan', {
    url: "/customplans/:customPlanId",
    views: {
      'menuContent': {
        templateUrl: "templates/custom-plan.html",
        controller: 'CustomPlanCtrl'
      }
    },
    
    data: {
      authenticate: true
    }
  })  
  
  .state('app.products', {
    url: "/products",
    views: {
      'menuContent': {
        templateUrl: "templates/products.html",
        controller: 'ProductsCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.product', {
    url: "/products/:productId",
    views: {
      'menuContent': {
        templateUrl: "templates/product.html",
        controller: 'ProductCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })
  
  .state('app.messages', {
      cache: false,
    url: "/messages",
    views: {
      'menuContent': {
        templateUrl: "templates/messages.html",
        controller: 'MessagesCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.message', {
    url: "/messages/:messageId",
    views: {
      'menuContent': {
        templateUrl: "templates/message.html",
        controller: 'MessageCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })  
  
  
  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

  .state('app.category', {
    url: "/category/:categoryTitle/:categoryId",
    views: {
      'menuContent': {
        templateUrl: "templates/category.html",
        controller: 'PostCategoryCtrl'
      }
    },
    data: {
      authenticate: true
    }
  })

;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})

;
