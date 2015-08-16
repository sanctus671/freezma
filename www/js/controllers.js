angular.module('app.controllers', [])

// APP - RIGHT MENU
.controller('AppCtrl', function($scope, AuthService) {

  $scope.$on('$ionicView.enter', function(){
    // Refresh user data & avatar
    $scope.user = AuthService.getUser();
    AuthService.getUserGravatar($scope.user.data.id).then(function(data){
        $scope.user.avatar = data.avatar;
    });

    
  });
})

// CATEGORIES MENU
.controller('PushMenuCtrl', function($scope, CategoryService) {

  var getItems = function(parents, categories){

    if(parents.length > 0){

      _.each(parents, function(parent){
        parent.name = parent.title;
        parent.link = parent.slug;

        var items = _.filter(categories, function(category){ return category.parent===parent.id; });

        if(items.length > 0){
          parent.menu = {
            title: parent.title,
            id: parent.id,
            items:items
          };
          getItems(parent.menu.items, categories);
        }
      });
    }
    return parents;
  };

  CategoryService.getCategories()
  .then(function(data){


    var sorted_categories = _.sortBy(data.categories, function(category){ return category.title; });
    var parents = _.filter(sorted_categories, function(category){ return category.parent===0; });
    var result = getItems(parents, sorted_categories);

    $scope.menu = {
      title: 'All Categories',
      id: '0',
      items: result
    };
  });
})



// SETTINGS
.controller('SettingCtrl', function($scope, $ionicActionSheet, $ionicModal, $state, AuthService) {
  $scope.notifications = false;
  $scope.sendLocation = false;

  $ionicModal.fromTemplateUrl('templates/partials/faqs.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.faqs_modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/partials/credits.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.credits_modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/partials/edit-profile.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.profile_modal = modal;
  });    
    
  $ionicModal.fromTemplateUrl('templates/partials/edit-avatar.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.avatar_modal = modal;
  });  

  $scope.showFAQS = function() {
    $scope.faqs_modal.show();
  };

  $scope.showCredits = function() {
    $scope.credits_modal.show();
  };
  
  $scope.showAvatar = function() {
    $scope.avatar_modal.show();
  };
  
  $scope.showProfile = function() {
    $scope.profile_modal.show();
  };  

  // Triggered on a the logOut button click
  $scope.showLogOutMenu = function() {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      //Here you can add some more buttons
      // buttons: [
      // { text: '<b>Share</b> This' },
      // { text: 'Move' }
      // ],
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout?',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        //Called when one of the non-destructive buttons is clicked,
        //with the index of the button that was clicked and the button object.
        //Return true to close the action sheet, or false to keep it opened.
        return true;
      },
      destructiveButtonClicked: function(){
        //Called when the destructive button is clicked.
        //Return true to close the action sheet, or false to keep it opened.
        AuthService.logOut();
        $state.go('login');
      }
    });
  };
})

//EMAIL SENDER
.controller('EmailSenderCtrl', function($scope) {
  $scope.sendContactMail = function(){
    cordova.plugins.email.isAvailable(
      function (isAvailable) {
        // alert('Service is not available') unless isAvailable;
        cordova.plugins.email.open({
          to:      'john@doe.com',
          cc:      'jane@doe.com',
          subject: 'Contact',
          body:    'Contact from ionWordpress app'
        });
      }
    );
  };
})


// WALKTHROUGH
.controller('WalkthroughCtrl', function($scope, $state, $ionicSlideBoxDelegate) {

  $scope.$on('$ionicView.enter', function(){
    //this is to fix ng-repeat slider width:0px;
    $ionicSlideBoxDelegate.$getByHandle('walkthrough-slider').update();
  });
})

//LOGIN
.controller('LoginCtrl', function($scope, $state, $ionicLoading, AuthService, PushNotificationsService) {
  $scope.user = {};

  $scope.doLogin = function(){

    $ionicLoading.show({
      template: 'Logging in...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password
    };

    AuthService.doLogin(user)
    .then(function(user){
      //success
      $state.go('app.home');

      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})


// FORGOT PASSWORD
.controller('ForgotPasswordCtrl', function($scope, $state, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.recoverPassword = function(){

    $ionicLoading.show({
      template: 'Recovering password...'
    });

    AuthService.forgotPassword($scope.user.userName)
    .then(function(data){
      if(data.status == "error"){
        $scope.error = data.error;
      }else{
        $scope.message ="Link for password reset has been emailed to you. Please check your email.";
      }
      $ionicLoading.hide();
    });
  };
})


// REGISTER
.controller('RegisterCtrl', function($scope, $state, $ionicLoading, AuthService, PushNotificationsService) {
  $scope.user = {};

  $scope.doRegister = function(){

    $ionicLoading.show({
      template: 'Registering user...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password,
      email: $scope.user.email,
      displayName: $scope.user.displayName
    };

    AuthService.doRegister(user)
    .then(function(user){
      //success
      $state.go('app.home');
      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})

// HOME - GET RECENT POSTS
.controller('HomeCtrl', function($scope, $rootScope, $state, $ionicLoading, PostService) {
  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading posts...'
    });

    //Always bring me the latest posts => page=1
    PostService.getRecentPosts(1)
    .then(function(data){

      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getRecentPosts($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.sharePost = function(link){
    PostService.sharePost(link);
  };



  $scope.doRefresh();

})


// POST
.controller('PostCtrl', function($scope, $state, $ionicLoading, PostService, $stateParams, AuthService, $ionicScrollDelegate) {
  $ionicLoading.show({
    template: 'Loading post...'
  });

  var postId = $stateParams.postId;
  PostService.getPost(postId)
  .then(function(data){
    $scope.post = data.post;
    console.log(data);
    $scope.comments = _.map(data.post.comments, function(comment){
      if(comment.author){
        PostService.getUserGravatar(comment.author.id)
        .then(function(data){
          comment.user_gravatar = data.avatar;
        });
        return comment;
      }else{
        return comment;
      }
    });
    $ionicLoading.hide();
  });

  $scope.sharePost = function(link){
    window.plugins.socialsharing.share('Check this post here: ', null, null, link);
  };

  $scope.addComment = function(){

    $ionicLoading.show({
      template: 'Submiting comment...'
    });

    PostService.submitComment($scope.post.id, $scope.new_comment)
    .then(function(data){
      if(data.status=="ok"){
        var user = AuthService.getUser();
        var comment = {
          author: {name: user.data.username},
          content:$scope.new_comment,
          date: Date.now(),
          user_gravatar : user.data.avatar,
          id: data.comment_id
        };
        $scope.comments.push(comment);
        $scope.new_comment = "";
        $scope.new_comment_id = data.comment_id;
        $ionicLoading.hide();
        // Scroll to new post
        $ionicScrollDelegate.scrollBottom(true);
      }
    });
  };
})


// CATEGORY
.controller('PostCategoryCtrl', function($scope, $rootScope, $state, $ionicLoading, $stateParams, PostService) {

  $scope.category = {};
  $scope.category.id = $stateParams.categoryId;
  $scope.category.title = $stateParams.categoryTitle;

  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading posts...'
    });

    PostService.getPostsFromCategory($scope.category.id, 1)
    .then(function(data){
      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getRecentPosts($scope.category.id, $scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.sharePost = function(link){
    PostService.sharePost(link);
  };



  $scope.doRefresh();
})

.controller('ShredsCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading 8 week shred...'
    });
    
    $scope.shreds = [];
    
    ShopService.getDownloads()
    .then(function(data){   
        $scope.shreds = data.filter(function(shred){
            return shred.product.categories.indexOf('8weekshred') > -1;
        });

        $ionicLoading.hide();
    });  
    
    $scope.doRefresh = function() {
        $ionicLoading.show({
          template: 'Loading 8 week shred...'
        });

        ShopService.getDownloads()
        .then(function(data){   
            $scope.shreds = data.filter(function(shred){
                return shred.product.categories.indexOf('8weekshred') > -1;
            });
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
        

    };     
    
})

.controller('ShredCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
   $ionicLoading.show({
      template: 'Loading video...'
    });
    
    $scope.shred = [];
    var shredId = $stateParams.shredId;
    ShopService.getDownloads()
    .then(function(data){   
        $scope.shred = data.filter(function(shred){
            return shred.product_id == shredId;
        })[0];
        $ionicLoading.hide();
    });     
       
})


.controller('EbooksCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading ebooks...'
    });
    
    $scope.ebooks = [];
    
    ShopService.getDownloads()
    .then(function(data){   
        $scope.ebooks = data.filter(function(ebook){
            return ebook.product.categories.indexOf('ebooks') > -1;
        });

        $ionicLoading.hide();
    });  
    
    $scope.doRefresh = function() {
        $ionicLoading.show({
          template: 'Loading ebooks...'
        });

        ShopService.getDownloads()
        .then(function(data){   
            $scope.ebooks = data.filter(function(ebook){
                return ebook.product.categories.indexOf('ebooks') > -1;
            });
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
        

    };     
    
})

.controller('EbookCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
   $ionicLoading.show({
      template: 'Loading ebook...'
    });
    
    $scope.ebook = [];
    var ebookId = $stateParams.ebookId;
    ShopService.getDownloads()
    .then(function(data){   
        $scope.ebook = data.filter(function(ebook){
            return ebook.product_id == ebookId;
        })[0];
        $ionicLoading.hide();
    });     
       
})

.controller('VideosCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading videos...'
    });
    
    $scope.videos = [];
    
    ShopService.getDownloads()
    .then(function(data){   
        $scope.videos = data.filter(function(video){
            return video.product.categories.indexOf('videos') > -1;
        });

        $ionicLoading.hide();
    });  
    
    $scope.doRefresh = function() {
        $ionicLoading.show({
          template: 'Loading videos...'
        });

        ShopService.getDownloads()
        .then(function(data){   
            $scope.videos = data.filter(function(video){
                return video.product.categories.indexOf('videos') > -1;
            });
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
        

    };     
    
    
})

.controller('VideoCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
   $ionicLoading.show({
      template: 'Loading video...'
    });
    
    $scope.video = [];
    var videoId = $stateParams.videoId;
    ShopService.getDownloads()
    .then(function(data){   
        $scope.video = data.filter(function(video){
            return video.product_id == videoId;
        })[0];
        console.log($scope.video);
        $ionicLoading.hide();
    });     
    
    
})

.controller('PlansCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading plans...'
    });
    
    $scope.plans = [];
    
    ShopService.getDownloads()
    .then(function(data){   
        $scope.plans = data.filter(function(plan){
            return plan.product.categories.indexOf('plans') > -1;
        });

        $ionicLoading.hide();
    });  
    
    $scope.doRefresh = function() {
        $ionicLoading.show({
          template: 'Loading plans...'
        });

        ShopService.getDownloads()
        .then(function(data){   
            $scope.plans = data.filter(function(plan){
                return plan.product.categories.indexOf('plans') > -1;
            });
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
        

    };         
    
    
})

.controller('PlanCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
   $ionicLoading.show({
      template: 'Loading plan...'
    });
    
    $scope.plan = [];
    var planId = $stateParams.planId;
    ShopService.getDownloads()
    .then(function(data){   
        $scope.plan = data.filter(function(plan){
            return plan.product_id == planId;
        })[0];
        $ionicLoading.hide();
    });     
   
})

.controller('ProductsCtrl', function($scope, $state, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading store...'
    });
    
    $scope.products = [];
    
    ShopService.getProducts()
    .then(function(data){
        $scope.products = data;
console.log(data);
        $ionicLoading.hide();
    });      
    
  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading store...'
    });
    
    ShopService.getProducts()
    .then(function(data){
        $scope.products = data;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
    });  
  };    
})

.controller('ProductCtrl', function($scope, $state, $ionicPopup, $ionicLoading, ShopService, $stateParams, AuthService, $ionicScrollDelegate) {
    $ionicLoading.show({
      template: 'Loading item...'
    });
    
    $scope.product = [];
    var productId = $stateParams.productId;
    ShopService.getProduct(productId)
    .then(function(data){
        console.log(data);
        $scope.product = data.product;
        
        $ionicLoading.hide();
    });      
    
  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading item...'
    });
    
    ShopService.getProduct(productId)
    .then(function(data){
        $scope.product = data;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
    });  
  };  
  
  $scope.createOrder = function(){
    $ionicLoading.show({
      template: 'Purchasing...'
    });
    
    ShopService.createOrder(productId)
    .then(function(data){
        $scope.product = data;
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: 'Purchase successful',
            template: 'Thank you for your purchase! Head over to My eBooks, My videos or My plans to see your purchased items.'
        });
    });       
  };
})

.controller('MessagesCtrl', function($scope, $state, $ionicLoading, PostService, MessageService, $stateParams, AuthService, $ionicScrollDelegate) {
  $ionicLoading.show({
    template: 'Loading messages...'
  });
  var user = AuthService.getUser();
  $scope.messages = [];
  MessageService.getMessages()
  .then(function(data){
    $scope.messages = data;
    $scope.messages = _.map(data, function(message){
      if(message.sender){
        PostService.getUserGravatar(message.sender)
        .then(function(data){
          message.user_gravatar = data.avatar;
        });
        return message;
      }else{
        return message;
      }
    });
    $ionicLoading.hide();
  });
  
    $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading messages...'
    });
  MessageService.getMessages()
  .then(function(data){
    $scope.messages = data;
    console.log(data);
    $scope.messages = _.map(data, function(message){
      if(message.sender){
        PostService.getUserGravatar(message.sender)
        .then(function(data){
          message.user_gravatar = data.avatar;
        });
        return message;
      }else{
        return message;
      }
    });
    $ionicLoading.hide();
    $scope.$broadcast('scroll.refreshComplete');
  });    

  }; 



  $scope.createMessage = function(){

    $ionicLoading.show({
      template: 'Sending message...'
    });

    MessageService.createMessage($scope.new_message)
    .then(function(data){
      if(data){
        var user = AuthService.getUser();
        var message = {
          date: Date.now(),
          message: $scope.new_message,
          receiver: "1",
          sender: user.data.user_id,
          user_gravatar : user.data.avatar,
          id: data.message_id
        };
        $scope.messages.push(message);
        $scope.new_message = "";
        $scope.new_message_id = data.message_id;
        $ionicLoading.hide();
        // Scroll to new post
        $ionicScrollDelegate.scrollBottom(true);
      }
    });
  };    
    
    
})

.controller('MessageCtrl', function($scope, $state, $ionicLoading, PostService, $stateParams, AuthService, $ionicScrollDelegate) {
    
})


;
