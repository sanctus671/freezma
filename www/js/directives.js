angular.module('app.directives', [])

.directive('recursiveMenu', function($compile) {
	return {
		restrict: 'EACM',
		priority: 100000,
		compile: function(tElement, tAttr) {
			var compiledContents, contents;
			contents = tElement.contents().remove();
			compiledContents = null;
			return function(scope, iElement, iAttr) {
				if (!compiledContents) {
					compiledContents = $compile(contents);
				}
				compiledContents(scope, function(clone, scope) {
					return iElement.append(clone);
				});
			};
		}
	};
})

.directive('pushMenu', function(){
	return {
		scope: {
			menu: '=',
			level: '='
		},
		controller: function($scope, $element, $attrs) {
			this.getMenu = function(){
				return $scope.menu;
			};
		},
		templateUrl: 'templates/partials/main-menu.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('menuLevel', function(_){
	return {
		scope: {
			menu: '=',
			level: '='
		},
		link: function(scope, element, attr, menuCtrl) {
			scope.original_menu = menuCtrl.getMenu();
			scope.childrenLevel = scope.level + 1;

			scope.openSubMenu = function(item_menu, parent_menu, $event) {
				// console.log("open sub menu from child directive");
				// Check if it has sub levels
				if(!_.isUndefined(item_menu) && !_.isUndefined(item_menu.items) && item_menu.items.length > 0)
				{
					// console.log("has sub menus, OPENING!");
					$event.preventDefault();

					// Open sub menu
					var sub_level = document.querySelector('.mp-level.level-id-'+item_menu.id);
					this.$parent._openMenu(sub_level);
				}
			};

			scope.backToPreviousMenu = function(menu, $event){
				$event.preventDefault();
				$event.stopPropagation();

				// Close current menu
				var current_level = document.querySelector('.mp-level.level-id-'+menu.id);
				this.$parent._closeMenu(current_level);
			};

			scope._setTransform = function(val, el){
				el.style.WebkitTransform = val;
				el.style.MozTransform = val;
				el.style.transform = val;
			};

			scope._openMenu = function(level){
				// console.log("opening menu!");
				this._setTransform('translate3d(0,0,0)', level);
			};

			scope._closeMenu = function(level){
				// console.log("closing menu!");
				this._setTransform('translate3d(100%,0,0)', level);
			};
		},
		templateUrl: 'templates/partials/menu-level.html',
		require: '^pushMenu',
		restrict: 'EA',
		replace: true,
		transclude: true
	};
})

.directive('wpSearch', function(_, SearchService, $q){
	return {
		scope: {
			// menu: '=',
			// shown: '='
		},
		controller: function($scope) {
			var utils = this;

			$scope.close_shown = false;

			this.showClose = function(){
				// Think i have to use apply because this function is not called from this controller ($scope)
				$scope.$apply(function () {
					$scope.close_shown = true;
				});
			};

			this.hideClose = function(){
				// This method is called from hideResultsPanel that is called from $scope.closeSearch,
				// which is triggered from within the directive so it doesn't need $scope.apply
				$scope.close_shown = false;
			};

			this.showResultsPanel = function(query){
				utils.showClose();
				// console.log("broadcast show-results-panel");
				var search_results_promise = null;
				if(!_.isUndefined(query))
				{
					// Then perform search, and returns a promise
					search_results_promise = SearchService.search(query);
				}
				$scope.$broadcast("show-results-panel", search_results_promise);
			};

			this.cleanResultsPanel = function(){
				// console.log("broadcast clean-results-panel");
				$scope.$broadcast("clean-results-panel");
			};

			this.hideResultsPanel = function(){
				// console.log("broadcast hide-results-panel");
				utils.hideClose();
				$scope.$broadcast("hide-results-panel", 1);
			};

			$scope.closeSearch = function($event) {
				$event.stopPropagation();
				$event.preventDefault();
				// console.log("close search, should hide panel");
				// console.log($event);
				utils.hideResultsPanel();
			};

			// $scope.closeSearch = function() {
			// 	utils.hideResultsPanel();
			// };
		},
		templateUrl: 'templates/partials/wp-search.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('searchInput', function($timeout, SearchService, $ionicLoading){
	return {
		require: '^wpSearch',
		link: function(scope, element, attr, wpSearchCtrl) {
			var timeout = null;

			scope.$on("hide-results-panel", function(event, value){
				// console.log("Broadcast received, value: ", value);
				$timeout.cancel(timeout);
				// console.log("CANCEL because of hide panel");
				element[0].value = "";
			});

			element.on('focus', function(event) {
				// event.preventDefault();
				// event.stopPropagation();
				// console.log("FOCUS on (current target): ", event.currentTarget);
				// console.log("FOCUS on (target): ", event.target);
				// maybe emit event here so the serch results directive can update itself
				wpSearchCtrl.showResultsPanel();
			});

			element.on('keyup', function(event) {
				event.preventDefault();
				event.stopPropagation();
				// console.log("KEYUP!");

				var target = this;

				if(timeout !== null)
				{
					// console.log("canceling search");
					$timeout.cancel(timeout);
				}

				var query = target.value;

				timeout = $timeout(function(){

					if(query.trim().length>0)
					{

						$ionicLoading.show({
							template: 'Searching...'
						});

						// Perform search
						wpSearchCtrl.showResultsPanel(query);
						// console.log("searching for query: ", query);
					}
					else
					{
						// Clean previous search results
						wpSearchCtrl.cleanResultsPanel();
					}
				}, 800);
			});

		},
		restrict: 'A'
	};
})

.directive('searchResults', function(_, $ionicLoading){
	return {
		require: '^wpSearch',
		link: function(scope, element, attr, wpSearchCtrl) {
			var _setTransform = function(val, el){
						el.style.WebkitTransform = val;
						el.style.MozTransform = val;
						el.style.transform = val;
					};

			scope.$on("show-results-panel", function(event, search_results_promise){
				// console.log("Broadcast received, value: ", search_results_promise);

				_setTransform('translate3d(0,0,0)', element[0]);

				// search_results_promise is null when we the search query was empty
				if(search_results_promise)
				{
					// Then show search results in tabs
					search_results_promise.then(function(results){
						// console.log("promise DONE, search OK: ", results);

						$ionicLoading.hide();

						scope.loadSearchResults(results);
					}, function(error){
						// console.log("search ERROR: ", error);
					});
				}
			});

			scope.$on("clean-results-panel", function(event, value){
				// Clean previous search results
				scope.cleanSearchResults();
			});

			scope.$on("hide-results-panel", function(event, value){
				// console.log("Broadcast received, value: ", value);
				_setTransform('translate3d(0,100%,0)', element[0]);
			});
		},
		controller: function($scope) {
			var tabs = $scope.tabs = [];
			$scope.query = "";

			$scope.select = function(tab) {
				angular.forEach(tabs, function(tab) {
					tab.selected = false;
				});
				tab.selected = true;
			};

			$scope.loadSearchResults = function(results){
				_.each(tabs, function(tab){
					var tab_search = _.findWhere(results, {_id : tab.tabid});
					tab.results = tab_search.results;
				});
			};

			$scope.cleanSearchResults = function(){
				_.each(tabs, function(tab){
					tab.results = [];
				});
			};

			this.addTab = function(tab) {
				if (tabs.length === 0) {
					$scope.select(tab);
				}
				tabs.push(tab);
			};
		},
		templateUrl: 'templates/partials/search-results.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('myTab', function($state, $ionicHistory) {
	return {
		require: '^searchResults',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@',
			tabid: '@',
			query: '@query',
		},
		link: function(scope, element, attrs, tabsCtrl) {
			// This helped me understand scope inheritance between directives in angular: https://github.com/angular/angular.js/wiki/Understanding-Scopes
			scope.results = [];
			tabsCtrl.addTab(scope);

			scope.goToPost = function(post){
				$ionicHistory.nextViewOptions({
					disableAnimate: true
				});
                                if (post.type === "product"){
                                    $state.go('app.product', {productId: post.id});                                   
                                }
                                else{
                                    $state.go('app.post', {postId: post.id});
                                }
			};
		},
		templateUrl: 'templates/partials/my-tab.html'
	};
})


.directive('postCard', function() {
	return {
		templateUrl: 'templates/partials/post-card.html'
	};
})

.directive('productCard', function() {
	return {
		templateUrl: 'templates/partials/product-card.html'
	};
})

.directive('shredCard', function() {
	return {
		templateUrl: 'templates/partials/shred-card.html'
	};
})

.directive('ebookCard', function() {
	return {
		templateUrl: 'templates/partials/ebook-card.html'
	};
})

.directive('freeEbookCard', function() {
	return {
		templateUrl: 'templates/partials/free-ebook-card.html'
	};
})

.directive('planCard', function() {
	return {
		templateUrl: 'templates/partials/plan-card.html'
	};
})

.directive('customPlanCard', function() {
	return {
		templateUrl: 'templates/partials/custom-plan-card.html'
	};
})

.directive('videoCard', function() {
	return {
		templateUrl: 'templates/partials/video-card.html'
	};
})

.directive('freeVideoCard', function() {
	return {
		templateUrl: 'templates/partials/free-video-card.html'
	};
})




.directive('showHideContainer', function(){
	return {
		scope: {

		},
		controller: function($scope, $element, $attrs) {
			$scope.show = false;

			$scope.toggleType = function($event){
				$event.stopPropagation();
				$event.preventDefault();

				$scope.show = !$scope.show;

				// Emit event
				$scope.$broadcast("toggle-type", $scope.show);
			};
		},
		templateUrl: 'templates/partials/show-hide-password.html',
		restrict: 'A',
		replace: false,
		transclude: true
	};
})


.directive('showHideInput', function(){
	return {
		scope: {

		},
		link: function(scope, element, attrs) {
			// listen to event
			scope.$on("toggle-type", function(event, show){
				var password_input = element[0],
						input_type = password_input.getAttribute('type');

				if(!show)
				{
					password_input.setAttribute('type', 'password');
				}

				if(show)
				{
					password_input.setAttribute('type', 'text');
				}
			});
		},
		require: '^showHideContainer',
		restrict: 'A',
		replace: false,
		transclude: false
	};
})

.directive('countrySelect', ['$parse', function ($parse) {
    var countries = [
      "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
      "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
      "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
      "Botswana", "Bouvet Island", "Brazil",
      "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
      "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
      "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
      "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
      "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
      "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
      "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
      "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
      "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
      "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
      "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
      "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
      "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
      "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
      "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
      "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
      "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
      "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
      "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
      "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
      "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
      "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
      "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
      "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
      "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
      "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
      "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
      "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
      "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
      "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
      "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
      "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
      "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
      "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
    ];

    return {
      restrict: 'E',
      template: '<select><option>' + countries.join('</option><option>') + '</option></select>',
      replace: true,
      link: function (scope, elem, attrs) {
        if (!!attrs.ngModel) {
          var assignCountry = $parse(attrs.ngModel).assign;

          elem.bind('change', function (e) {
            assignCountry(elem.val());
          });

          scope.$watch(attrs.ngModel, function (country) {
            elem.val(country);
          });
        }
      }
    };
  }])
  





