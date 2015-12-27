angular.module('app.controllers', [])

// APP - RIGHT MENU
.controller('AppCtrl', function($scope, AuthService) {

  $scope.$on('$ionicView.enter', function(){
    // Refresh user data & avatar
    $scope.user = AuthService.getUser();
    if (!$scope.user.avatar){
        AuthService.updateUserAvatar().then(function(data){
            $scope.user.avatar = data;
        });
    }

    
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
    var parents = _.filter(sorted_categories, function(category){ return category.parent===0 && category.title.indexOf("8 Week Shred") < 0 && category.title !== "Custom Plans"; });
    var result = getItems(parents, sorted_categories);

    $scope.menu = {
      title: 'All Categories',
      id: '0',
      items: result
    };
  });
})



// SETTINGS
.controller('SettingCtrl', function($scope, $ionicActionSheet, $ionicModal, $ionicPopup, $ionicLoading, $state, AuthService, WORDPRESS_API4_URL) {
  $scope.notifications = false;
  $scope.sendLocation = false;
  $scope.user = AuthService.getUser();
  $scope.profile = {
        firstName : null,
        lastName : null,
        age : null,
        country : null,
        biography : null,
        gymGoals : null,
        lifeGoals : null         
  };
  AuthService.getUserProfile().then(function(data){
    $scope.profile = {
        firstName : data["wpcf-first-name"],
        lastName : data["wpcf-last-name"],
        age : parseInt(data["wpcf-age"]),
        country : data["wpcf-country"],
        biography : data["wpcf-biography"],
        gymGoals : data["wpcf-gym-goals"],
        lifeGoals : data["wpcf-life-goals"]    
    };
    

  });  
  $scope.updateProfile = function(){
    $ionicLoading.show({
        template: 'Updating profile...'
    });      
    AuthService.editUserProfile($scope.profile).then(function(data){
        $ionicLoading.hide();
    });
  };
  
  $scope.useGetFile = function(){
        navigator.camera.getPicture(
                $scope.onPhotoSuccess,
                function(message){/*alert('Failed: ' + message);*/},
                {
                        quality: 25,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        encodingType: Camera.EncodingType.JPEG,
                        correctOrientation: true


                }


        )      
  };
  

  
  $scope.useGetPicture = function(){
        navigator.camera.getPicture(
                $scope.onPhotoSuccess,
                function(message){/*alert('Failed: ' + message);*/},
                {
                        quality: 25,
                        sourceType: Camera.PictureSourceType.Camera,
                        encodingType: Camera.EncodingType.JPEG,
                        correctOrientation: true,
                        cameraDirection: Camera.Direction.FRONT


                }


        )      
  };  
  
  $scope.onPhotoSuccess = function(imageURI){
        $ionicLoading.show({
            template: 'Updating avatar...'
        }); 

        var options = new FileUploadOptions();
        options.fileKey="fileToUpload";
        options.fileName=$scope.user.data.username;
        options.mimeType="image/jpeg";
        options.params = {userid:$scope.user.data.id};
        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI(WORDPRESS_API4_URL), function(response){
            $ionicLoading.hide();
            var data = JSON.parse(response.response);
            if (data.result === 'success'){
                var imageMenu = document.getElementById('menu-avatar');
                var imageAvatar = document.getElementById('image-avatar');
                imageMenu.src = imageURI;
                imageAvatar.src = imageURI;                
                //AuthService.editUserAvatar(data.url);
            }
            else{
                
                $ionicPopup.alert({
                title: 'Error',
                template: data.msg
                });                
            }
        },  
        function(data){           
            $ionicLoading.hide();        
            $ionicPopup.alert({
            title: 'Error',
            template: 'Sorry, there was an error uploading your file.'
            });}, options);		
		
	     
  };  

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
.controller('WalkthroughCtrl', function($scope, $ionicSlideBoxDelegate) {

  $scope.$on('$ionicView.enter', function(){
    //this is to fix ng-repeat slider width:0px;
    $ionicSlideBoxDelegate.$getByHandle('walkthrough-slider').update();
  });
})

//LOGIN
.controller('LoginCtrl', function($scope, $state, $ionicLoading, AuthService) {
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
.controller('ForgotPasswordCtrl', function($scope, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.recoverPassword = function(){

    $ionicLoading.show({
      template: 'Recovering password...'
    });

    AuthService.doForgotPassword($scope.user.userName)
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
.controller('RegisterCtrl', function($scope, $state, $ionicLoading, AuthService) {
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
.controller('HomeCtrl', function($scope, $ionicLoading, PostService) {
  //angular.element(".bar.app-top-bar").css({"background-image":"url(../img/HeaderGold.PNG)"});  
    
    
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
      data.posts = data.posts.filter(function(post){
                if (post.categories[0]){
                    return post.categories[0].title.indexOf('8 Week Shred') < 0 && post.categories[0].title.indexOf('Custom Plans') < 0;
                }
                else{return false;}
            });        
      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;
/*
    PostService.getRecentPosts($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);
      */

      $scope.$broadcast('scroll.infiniteScrollComplete');
    /*});*/
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
.controller('PostCtrl', function($scope, $ionicLoading, PostService, $stateParams, AuthService, $ionicScrollDelegate) {
  $ionicLoading.show({
    template: 'Loading post...'
  });

  var postId = $stateParams.postId;
  PostService.getPost(postId)
  .then(function(data){
    $scope.post = data.post;
    $scope.comments = _.map(data.post.comments, function(comment){
      if(comment.author){
        PostService.getUserGravatar(comment.author.id)
        .then(function(data){
          comment.user_gravatar = data;
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
.controller('PostCategoryCtrl', function($scope, $ionicLoading, $stateParams, PostService) {

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

.controller('ShredsCtrl', function($scope, $ionicLoading, ShopService, PostService) {
    $ionicLoading.show({
      template: 'Loading 8 week shred...'
    });
    
    $scope.shreds = {};

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };
    
    $scope.getSize = function(object){
        return _.size(object);
    }
    
    
            
    ShopService.getDownloads()
    .then(function(data){ 
        var shredMember = false;
        shredMember = data.filter(function(shredCheck){
            return shredCheck.product.categories.indexOf('8weekshred') > -1;
        });
        if (shredMember.length > 0){
            PostService.getPostsFromCategory(19, 1)
            .then(function(data){
                for (var index in data.posts){
                    var post = data.posts[index], category;
                    if (post.categories.length > 1){category = post.categories[1].title;}
                    else{category = "8 Week Shred Posts";}
                    if ($scope.shreds[category]){$scope.shreds[category].push(post);}
                    else{$scope.shreds[category] = [post];}
                }
            });  
        }
        $ionicLoading.hide();
    });  
    
    $scope.doRefresh = function() {
        $ionicLoading.show({
          template: 'Loading 8 week shred...'
        });
        
        ShopService.getDownloads()
        .then(function(data){ 
            var shredMember = false;
            shredMember = data.filter(function(shredCheck){
                return shredCheck.product.categories.indexOf('8weekshred') > -1;
            });
            if (shredMember.length > 0){
                PostService.getPostsFromCategory(19, 1)
                .then(function(data){
                    $scope.shreds = {};
                    for (var index in data.posts){
                        var post = data.posts[index], category;
                        if (post.categories.length > 1){category = post.categories[1].title;}
                        else{category = "8 Week Shred Posts";}
                        if ($scope.shreds[category]){$scope.shreds[category].push(post);}
                        else{$scope.shreds[category] = [post];}
                    }
                });  
            }
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        }); 

    };     
    
})

.controller('ShredCtrl', function($scope, $ionicLoading, PostService, $stateParams, AuthService, $ionicScrollDelegate) {
   $ionicLoading.show({
      template: 'Loading video...'
    });
    
    $scope.shred = [];
    var shredId = $stateParams.shredId;
    PostService.getPost(shredId)
    .then(function(data){
      $scope.shred = data.post;
      $scope.comments = _.map(data.post.comments, function(comment){
        if(comment.author){
          PostService.getUserGravatar(comment.author.id)
          .then(function(data){
            comment.user_gravatar = data;
          });
          return comment;
        }else{
          return comment;
        }
      });
      $ionicLoading.hide();
    });    
    
  $scope.addComment = function(){

    $ionicLoading.show({
      template: 'Submiting comment...'
    });

    PostService.submitComment($scope.shred.id, $scope.new_comment)
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
  
  
  
    $scope.openFile = function(url){
        window.open(url, "_system");
    }   
    
       
})


.controller('EbooksCtrl', function($scope,$ionicLoading, ShopService) {
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
    
    ShopService.getAllProducts()
    .then(function(data){   //quietly load all the free products otherwise page will take too long to load
        $scope.freeEbooks = data.filter(function(ebook){
            return ebook.categories.indexOf('ebooks') > -1 && parseInt(ebook.price) <= 0;
        });
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

        ShopService.getAllProducts()
        .then(function(data){   //quietly load all the free products
    
            $scope.freeEbooks = data.filter(function(ebook){
                return ebook.categories.indexOf('ebooks') > -1 && ebook.price <= 0;
            });
        });         
        

    };     
    
})

.controller('EbookCtrl', function($scope, $ionicLoading, ShopService, $stateParams) {
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
    
    $scope.openFile = function(url){
        window.open(url, "_system");
    }     
       
})

.controller('FreeEbookCtrl', function($scope, $ionicLoading, ShopService, $stateParams) {
   $ionicLoading.show({
      template: 'Loading ebook...'
    });
    
    $scope.ebook = [];
    var ebookId = $stateParams.ebookId;
    ShopService.getProduct(ebookId)
    .then(function(data){
        if (data.product.price <= 0){
            $scope.ebook = data.product;
            if ($scope.ebook.downloads.length > 0){
                $scope.ebook.file = $scope.ebook.downloads[0];
            }
        }
        $ionicLoading.hide();
    });    
    
    $scope.openFile = function(url){
        window.open(url, "_system");
    }
    
    
})

.controller('VideosCtrl', function($scope, $ionicLoading, ShopService) {
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
    
    ShopService.getAllProducts()
    .then(function(data){   //quietly load all the free products otherwise page will take too long to load
        $scope.freeVideos = data.filter(function(video){
            return video.categories.indexOf('videos') > -1 && video.price <= 0;
        });
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

        ShopService.getAllProducts()
        .then(function(data){   //quietly load all the free products otherwise page will take too long to load
            $scope.freeVideos = data.filter(function(video){
                return video.categories.indexOf('videos') > -1 && video.price <= 0;
            });
        });         
        

    };     
    
    
})

.controller('VideoCtrl', function($scope,$ionicLoading, ShopService, $stateParams) {
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
        $ionicLoading.hide();
    });    
    
    $scope.openFile = function(url){
        window.open(url, "_system");
    }    
    
    
})

.controller('FreeVideoCtrl', function($scope, $ionicLoading, ShopService, $stateParams) {
   $ionicLoading.show({
      template: 'Loading video...'
    });
    
    $scope.video = [];
    var videoId = $stateParams.videoId;
    ShopService.getProduct(videoId)
    .then(function(data){
        if (data.product.price <= 0){
            $scope.video = data.product;
            if ($scope.video.downloads.length > 0){
                $scope.video.file = $scope.video.downloads[0];
            }    
    
        }
        $ionicLoading.hide();
    });   
    
    $scope.openFile = function(url){
        window.open(url, "_system");
    }    
    
    
})

.controller('PlansCtrl', function($scope, $ionicLoading, ShopService, PostService, AuthService) {
    $ionicLoading.show({
      template: 'Loading plans...'
    });
    
    $scope.plans = [];
    $scope.customPlans = [];
    var user = AuthService.getUser();
    
    ShopService.getDownloads()
    .then(function(data){   
        $scope.plans = data.filter(function(plan){
            return plan.product.categories.indexOf('plans') > -1;
        });

        $ionicLoading.hide();
    });  
    

    PostService.getPostsFromCategory(20, 1)
        .then(function(data){
            $scope.customPlans = data.posts.filter(function(plan){
                for(var tagIndex in plan.tags){
                    var tag = plan.tags[tagIndex];
                    if (parseInt(tag.title) === user.data.id){
                        return true;
                    }
                }
                return false;
                });
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

.controller('PlanCtrl', function($scope, $ionicLoading, ShopService, $stateParams) {
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
    
    $scope.openFile = function(url){
        window.open(url, "_system");
    }    
   
})

.controller('CustomPlanCtrl', function($scope, $timeout, $ionicLoading,PostService, $stateParams) {
   $ionicLoading.show({
      template: 'Loading plan...'
    });
    
    $scope.customPlan = [];
    var planId = $stateParams.customPlanId;
    PostService.getPost(planId)
    .then(function(data){
      $scope.customPlan = data.post;
      $ionicLoading.hide();
      $timeout(function(){
          angular.element("a.custom-plan-upload").click(function(e){
              e.preventDefault();
              if (angular.element(e.target).attr("href")){
                window.open(angular.element(e.target).attr("href"), "_system");
              }
              
          });
      },100);
    });
   
})

.controller('ProductsCtrl', function($scope, $ionicPopup, $cordovaInAppBrowser, $ionicModal, $ionicLoading, ShopService, $rootScope, AuthService) {
    $ionicLoading.show({
      template: 'Loading store...'
    });
    
    $scope.products = [];
    $scope.product = {};
    
    $scope.planDetails = {
        name:null,
        gender:"Male",
        email:null,
        age:null,
        height:null,
        weight:null,
        country:"Australia",
        allergies:null,
        injuries:null,
        bodytype:"Meso",
        activity:1,
        ocupation:null,
        results:null,
        mealtype:null,
        plan:null
    }    
    
    ShopService.getProducts()
    .then(function(data){
        $scope.products = data;
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
  
  $ionicModal.fromTemplateUrl('templates/partials/plan-details.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.plan_modal = modal;
  });    
  
  $scope.showPlanModal = function() {
    
    $scope.plan_modal.show();
    
    
  };   
  
  $scope.savePlanDetails = function(){
      $scope.planDetails.plan = $scope.product.title;
      ShopService.savePlanDetails($scope.planDetails);

  }
  
  $scope.buyProduct = function(product){
      $scope.product = product;
      if ($scope.product.categories.indexOf('plans') > -1 || $scope.product.categories.indexOf('8weekshred') > -1){
          
            //prefill some stuff if possible
            var user = AuthService.getUser();
            if (user.data.email){
                $scope.planDetails.email = user.data.email;
            }
            AuthService.getUserProfile().then(function(data){
              var profile = {
                  firstName : data["wpcf-first-name"],
                  lastName : data["wpcf-last-name"],
                  age : parseInt(data["wpcf-age"]),
                  country : data["wpcf-country"]  
              };
                if (profile.firstName && profile.lastName){
                    $scope.planDetails.name = profile.firstName + " " + profile.lastName;
                }
                if (profile.country){
                    $scope.planDetails.country = profile.country;
                }   
                if (profile.age){
                    $scope.planDetails.age = profile.age;
                }                 


            });           

            $scope.showPlanModal();
      }
      else{
          $scope.createOrder();
      }
  }  
  
  
  $scope.createOrder = function(){
    
    
    $scope.purchaseComplete = false;
    var ref = window.open( $scope.generatePaypalUrl($scope.product.id, $scope.product.title,$scope.product.price, $scope.product.categories), "_blank", "EnableViewPortScale=yes,location=no,toolbar=yes");

    ref.addEventListener('loadstop', function(event) {        
        if (event.url.match("http://www.freezmafitness.com/fail.php")) {
            ref.close();
        }
        else if (event.url.match("http://www.freezmafitness.com/success.php")  && !$scope.purchaseComplete){
            ref.close();
            $scope.purchaseComplete = true;
            $rootScope.$broadcast('productPurchased',{productId:$scope.product.id}); //send event for ProductsCtrl
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Purchase successful',
                template: 'Thank you for your purchase! Head over to the appropriate page in the side menu to see your purchased items.'
            });            
        }
    });
    
    
    /*
    //window.open($scope.product.permalink, "_blank", "location=no"); //for ios when mobile SDK was broken
    
    //mobile SDK (can't use because doesn't allow credit cards for australian account)
    PaypalService.initPaymentUI().then(function () {
        PaypalService.makePayment($scope.product.price, $scope.product.title).then(function(){      
            $ionicLoading.show({
              template: 'Purchasing...'
            });
            
    
            ShopService.createOrder($scope.product.id)
            .then(function(data){
                $rootScope.$broadcast('productPurchased',{productId:$scope.product.id}); //send event for ProductsCtrl
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Purchase successful',
                    template: 'Thank you for your purchase! Head over to the appropriate page in the side menu to see your purchased items.'
                });
            });   
        });
    });
    */
    
  };  
  
  $scope.generatePaypalUrl = function(productId, productName, price, categories){
      productName = encodeURI(productName);
      price = encodeURI(price);
      var user = AuthService.getUser();
      var custom = user.data.email + "," + productId + "," + user.data.id;
      if (categories.indexOf('plans') > -1 || categories.indexOf('8weekshred') > -1){custom = custom + ",plan";}
      return "https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&cbt=Complete%20purchase%20and%20reutrn%20to%20app&rm=2&business=freezma@freezmafitness.com&item_name=" + productName + "&amount=" + price + "&custom=" + custom + "&currency_code=AUD&return=http%3A%2F%2Fwww.freezmafitness.com%2Fsuccess.php&cancel_return=http%3A%2F%2Fwww.freezmafitness.com%2Ffail.php&notify_url=http%3A%2F%2Fwww.freezmafitness.com%2Fclasses%2Fmy_ipn.php";
  }  
  
  
  $rootScope.$on('productPurchased',function(event,data){ //detecting when a product has been purchased in the ProductCtrl

      for (var index in $scope.products){
          if ($scope.products[index].id === data.productId){
              $scope.products.splice(index, 1);
              return;
          }
      }
  })
  
})

.controller('ProductCtrl', function($scope, $state, $ionicPopup, $ionicModal, $ionicLoading, ShopService, $rootScope, $stateParams, AuthService) {
    $ionicLoading.show({
      template: 'Loading item...'
    });
    
    $scope.product = [];
    
    $scope.planDetails = {
        name:null,
        gender:"Male",
        email:null,
        age:null,
        height:null,
        weight:null,
        country:"Australia",
        allergies:null,
        injuries:null,
        bodytype:"Meso",
        activity:1,
        ocupation:null,
        results:null,
        mealtype:null,
        plan:null
    }
    
    var productId = $stateParams.productId;
    ShopService.getProduct(productId)
    .then(function(data){
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
  
  $ionicModal.fromTemplateUrl('templates/partials/plan-details.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.plan_modal = modal;
  });    
  
  $scope.showPlanModal = function() {
    
    $scope.plan_modal.show();
    
    
  };   
  
  $scope.savePlanDetails = function(){
      $scope.planDetails.plan = $scope.product.title;
      ShopService.savePlanDetails($scope.planDetails);

  }
  
  $scope.buyProduct = function(){
      if ($scope.product.categories.indexOf('plans') > -1 || $scope.product.categories.indexOf('8weekshred') > -1){
          
            //prefill some stuff if possible
            var user = AuthService.getUser();
            if (user.data.email){
                $scope.planDetails.email = user.data.email;
            }
            AuthService.getUserProfile().then(function(data){
              var profile = {
                  firstName : data["wpcf-first-name"],
                  lastName : data["wpcf-last-name"],
                  age : parseInt(data["wpcf-age"]),
                  country : data["wpcf-country"]  
              };
                if (profile.firstName && profile.lastName){
                    $scope.planDetails.name = profile.firstName + " " + profile.lastName;
                }
                if (profile.country){
                    $scope.planDetails.country = profile.country;
                }   
                if (profile.age){
                    $scope.planDetails.age = profile.age;
                }                 


            });           

            $scope.showPlanModal();
      }
      else{
          $scope.createOrder();
      }
  }
  
  
  $scope.createOrder = function(){
    $scope.purchaseComplete = false;
    var ref = window.open( $scope.generatePaypalUrl($scope.product.id, $scope.product.title,$scope.product.price, $scope.product.categories), "_blank", "EnableViewPortScale=yes,location=no,toolbar=yes");

    ref.addEventListener('loadstop', function(event) {        
        if (event.url.match("http://www.freezmafitness.com/fail.php")) {
            ref.close();
        }
        else if (event.url.match("http://www.freezmafitness.com/success.php")  && !$scope.purchaseComplete){
            ref.close();
            $scope.purchaseComplete = true;
            $rootScope.$broadcast('productPurchased',{productId:$scope.product.id}); //send event for ProductsCtrl
            $ionicLoading.hide();
            $state.go('app.products');            
            $ionicPopup.alert({
                title: 'Purchase successful',
                template: 'Thank you for your purchase! Head over to the appropriate page in the side menu to see your purchased items.'
            });        
        }
    });

    /*
    //window.open($scope.product.permalink, "_blank", "location=no"); //for ios when mobile SDK was broken
    //mobile SDK (can't use because doesn't allow credit cards for australian account)
    PaypalService.initPaymentUI().then(function () {
        PaypalService.makePayment($scope.product.price, $scope.product.title).then(function(){
            $ionicLoading.show({
              template: 'Purchasing...'
            });


            ShopService.createOrder($scope.product.id)
            .then(function(data){
                $rootScope.$broadcast('productPurchased',{productId:$scope.product.id}); //send event for ProductsCtrl
                $scope.product = data;
                $ionicLoading.hide();
                $state.go('app.products');
                $ionicPopup.alert({
                    title: 'Purchase successful',
                    template: 'Thank you for your purchase! Head over to the appropriate page in the side menu to see your purchased items.'
                });
            });  
    });
    
    });
    */
    
  };
  
  $scope.generatePaypalUrl = function(productId, productName, price, categories){
      productName = encodeURI(productName);
      price = encodeURI(price);
      var user = AuthService.getUser();
      var custom = user.data.email + "," + productId + "," + user.data.id;
      if (categories.indexOf('plans') > -1 || categories.indexOf('8weekshred') > -1){custom = custom + ",plan";}
      return "https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&cbt=Complete%20purchase%20and%20reutrn%20to%20app&rm=2&business=freezma@freezmafitness.com&item_name=" + productName + "&amount=" + price + "&custom=" + custom + "&currency_code=AUD&return=http%3A%2F%2Fwww.freezmafitness.com%2Fsuccess.php&cancel_return=http%3A%2F%2Fwww.freezmafitness.com%2Ffail.php&notify_url=http%3A%2F%2Fwww.freezmafitness.com%2Fclasses%2Fmy_ipn.php";
  }
  
})

.controller('MessagesCtrl', function($scope, $ionicLoading, PostService, MessageService, ShopService, AuthService, $ionicScrollDelegate) {
    var user = AuthService.getUser();
    $scope.messages = [];
    $scope.new_message = "";
    $scope.new_message_id = 0;
    $scope.freezma_avatar = "";
    $scope.avatar = ""
    var avatar = "";
    //check if user has purchased messaging
    $scope.sendEnabled = false;
     
  
    
  
  
    $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading messages...'
    });
    avatar = "";
    ShopService.getDownloads().then(function(data){ 
        var messageProduct = data.filter(function(msg){
            return (msg.product.categories.indexOf('messaging') > -1  || msg.product.categories.indexOf('plans') > -1 || msg.product.categories.indexOf('8weekshred') > -1);
        });
        if (messageProduct.length > 0){
            $scope.sendEnabled = true;
        }
        else{
            $scope.sendEnabled = false;
        }
           
        MessageService.getMessages()
        .then(function(data){
          $scope.messages = _.sortBy(data, function(message){ return new Date(message.date + "T" + message.time + "Z"); });

          $scope.messages = _.map($scope.messages, function(message){
            if(message.sender){
                if (parseInt(message.sender) === parseInt(user.data.id)){
                    message.user_gravatar = user.avatar;

                }
                else if ($scope.freezma_avatar.length < 1){
                    PostService.getUserGravatar(message.sender)
                    .then(function(data){
                      $scope.freezma_avatar = data;
                      message.user_gravatar = data;

                    });                    

                }
                else{
                    message.user_gravatar = $scope.freezma_avatar;
                }
              return message;
            }else{
              return message;
            }
          });

          $ionicLoading.hide();
          
          $scope.$broadcast('scroll.refreshComplete');
          $ionicScrollDelegate.scrollBottom(true);

          });     
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

        $scope.new_message_id = 1;
        if ($scope.messages.length > 1){
            $scope.new_message_id = $scope.messages[$scope.messages.length -1].auto + 1;
        }
        var message = {
          date: Date.now(),
          message: $scope.new_message,
          receiver: "3",
          sender: user.data.id,
          user_gravatar : user.data.avatar,
          auto: $scope.new_message_id
        };

        $scope.messages.push(message);
        $scope.new_message = "";

        $ionicLoading.hide();
        // Scroll to new post
        $ionicScrollDelegate.scrollBottom(true);
      }
    });
  };    
  
  $scope.doRefresh();
    
    
})



;
