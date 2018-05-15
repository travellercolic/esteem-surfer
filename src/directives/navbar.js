import {postUrlParser} from '../helpers/post-url-parser';

export default ($rootScope, $location, $uibModal, userService, activeUsername) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedSection: '=',
      selectedTag: '=',
      searchStr: '=?'
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, $rootScope, $location, $filter, constants, steemService, activeUsername) => {

      // Hide FEED filter if not user logged in
      if (activeUsername()) {
        $scope.filters = constants.filters;
      } else {
        $scope.filters = constants.filters.filter(x => x.name !== 'feed');
      }

      // Find selected filter
      $scope.selectedFilterName = $scope.filters.find(i => i.name === $rootScope.selectedFilter).key;

      $scope.filterClicked = (c) => {
        if (c === 'feed') {
          $location.path(`/feed/${activeUsername()}`);
          return;
        }

        let u = `/posts/${c}`;
        if ($scope.selectedTag) {
          u += `/${$scope.selectedTag}`;
        }
        $location.path(u);
      };

      $scope.filterDblClicked = () => {
        if (!($scope.selectedSection === 'filters' || $scope.selectedSection === 'feed')) {
          $scope.filterClicked($rootScope.selectedFilter);
        }
      };

      $scope.tokenExchangeClicked = () => {
        $location.path('/token-exchange');
      };

      $scope.discoverClicked = () => {
        $location.path('/discover');
      };

      $scope.marketPlaceClicked = () => {
        $location.path('/market-place');
      };

      $scope.feedClicked = () => {
        $location.path(`/feed/${activeUsername()}`);
      };

      $scope.editorClicked = () => {
        $location.path(`/editor`);
      };

      $scope.activitiesClicked = () => {
        $location.path(`/account/${activeUsername()}/activities`);
      };

      $scope.openSettings = () => {
        $uibModal.open({
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl',
          windowClass: 'settings-modal',
          backdrop: 'static',
          keyboard: false
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.openLogin = () => {
        $uibModal.open({
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl',
          windowClass: 'login-modal',
          resolve: {
            loginMessage: () => {
              return null;
            },
            afterLogin: () => {
              return (username) => {
                if ($location.path().indexOf('/feed/') === -1) {
                  $location.path(`/feed/${username}`);
                }
              }
            },
            onOpen: function () {
              return () => {

              }
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.logout = () => {
        userService.setActive(null);
        $rootScope.$broadcast('userLoggedOut');
      };

      $scope.profileClicked = () => {
        $location.path(`/account/${activeUsername()}`);
      };

      $scope.walletClicked = () => {
        $location.path(`/account/${activeUsername()}/wallet`);
      };

      $scope.bookmarksClicked = () => {
        $uibModal.open({
          templateUrl: 'templates/bookmarks.html',
          controller: 'bookmarksCtrl',
          windowClass: 'bookmarks-modal'
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.favoritesClicked = () => {
        $uibModal.open({
          templateUrl: 'templates/favorites.html',
          controller: 'favoritesCtrl',
          windowClass: 'favorites-modal'
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.draftsClicked = () => {
        $location.path(`/drafts`);
      };

      $scope.schedulesClicked = () => {
        $location.path(`/schedules`);
      };

      $scope.galleryClicked = () => {
        $location.path(`/gallery`);
      };

      $scope.searchButtonClicked = async () => {

        let resp = null;
        let isContent = false;
        let isAccount = false;

        const parsed = postUrlParser($scope.searchStr);
        if (parsed) {

          $scope.fetchingSearch = true;
          $scope.$applyAsync();
          resp = await steemService.getContent(parsed.author, parsed.permlink);
          $scope.fetchingSearch = false;
          $scope.$applyAsync();

          if (resp && resp.id !== 0) {
            isContent = true;
          }

        } else if ($scope.searchStr.startsWith('@') && $scope.searchStr.indexOf(' ') === -1) {

          const account = $scope.searchStr.replace('@', '');

          $scope.fetchingSearch = true;
          $scope.$applyAsync();
          resp = await steemService.getAccounts([account]);
          $scope.fetchingSearch = false;
          $scope.$applyAsync();

          if (resp.length > 0 && resp[0].name === account) {
            isAccount = true;
          }
        }

        if (isContent) {
          $rootScope.selectedPost = resp;
          const u = `/post/${resp.category}/${resp.author}/${resp.permlink}`;
          $location.path(u);
        } else if (isAccount) {
          const u = `/account/${$scope.searchStr.replace('@', '')}`;
          $location.path(u);
        } else {
          const obj = {"str": $scope.searchStr};
          const u = `/search/${encodeURIComponent(JSON.stringify(obj))}`;
          $location.path(u);
        }

        $scope.$applyAsync();
      };

      $scope.username = activeUsername();
      $rootScope.$on('userLoggedIn', () => {
        $scope.username = activeUsername();
      });

      $rootScope.$on('userLoggedOut', () => {
        $scope.username = null;
      });
    }
  };
};
