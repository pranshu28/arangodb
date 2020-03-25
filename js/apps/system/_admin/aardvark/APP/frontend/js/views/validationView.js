/* jshint browser: true */
/* jshint unused: false */
/* global frontendConfig, arangoHelper, Joi, Backbone, window, $ */

(function () {
  'use strict';

  window.ValidationView = Backbone.View.extend({
    el: '#content',
    readOnly: false,

    initialize: function (options) {
      this.collectionName = options.collectionName;
      this.model = this.collection;

      // OBI: happens just once
    },

    events: {
    },

    render: function () {
      // get poperties here?
      this.breadcrumb();
      arangoHelper.buildCollectionSubNav(this.collectionName, 'Validation');

      // OBI: happens every refresh
      this.renderValidation();
    },

    breadcrumb: function () {
      // OBI: do not touch
      $('#subNavigationBar .breadcrumb').html(
        'Collection: ' + (this.collectionName.length > 64 ? this.collectionName.substr(0, 64) + "..." : this.collectionName)
      );
    },

    loadProperties: function () {
      if (!this.readOnly) {
        var loadCollectionCallback = function (error) {
          if (error) {
            arangoHelper.arangoError('Collection error', this.model.get('name') + ' could not be loaded.');
          } else if (error === undefined) {
            this.model.set('status', 'loading');
            this.render();
          } else {
            if (window.location.hash === '#collections') {
              this.model.set('status', 'loaded');
              this.render();
            } else {
              arangoHelper.arangoNotification('Collection ' + this.model.get('name') + ' loaded.');
            }
          }
        }.bind(this);

        this.model.loadCollection(loadCollectionCallback);
        window.modalView.hide();
      }
    },

    saveModifiedProperties: function () {
      var saveCallback = function (error, isCoordinator) {
        if (error) {
          arangoHelper.arangoError('Error', 'Could not get coordinator info');
        } else {
          var newname;
          if (isCoordinator) {
            newname = this.model.get('name');
          } else {
            newname = $('#change-property-validation').val();
          }
          var status = this.model.get('status');

          if (status === 'loaded') {
            var validation;
            if (frontendConfig.engine == 'rocksdb') {
              try {
                validation = JSON.parse($('#change-property-validation').val());
              } catch (e) {
                arangoHelper.arangoError('Please enter a valid validaiton object.');
                return 0;
              }
            }

            if (frontendConfig.engine !== 'rocksdb') {
            }

            var self = this;

            //var callbackChange = function (error, data) {
            //  if (error) {
            //    self.render();
            //    arangoHelper.arangoError('Collection error: ' + data.responseJSON.errorMessage);
            //  } else {
            //    arangoHelper.arangoNotification('Collection: ' + 'Successfully changed.');
            //    window.App.navigate('#cValidation/' + newname, {trigger: true});
            //  }
            //};

            //var callbackRename = function (error) {
            //  var abort = false;
            //  if (error) {
            //    arangoHelper.arangoError('Collection error: ' + error.responseText);
            //  } else {
            //    var wfs = $('#change-collection-sync').val();
            //    var replicationFactor;
            //    var writeConcern;

            //    if (frontendConfig.isCluster) {
            //      replicationFactor = $('#change-replication-factor').val();
            //      writeConcern = $('#change-write-concern').val();
            //      try {
            //        if (Number.parseInt(writeConcern) > Number.parseInt(replicationFactor)) {
            //          // validation here, as our Joi integration misses some core features
            //          arangoHelper.arangoError("Change Collection", "Write concern is not allowed to be greater than replication factor");
            //          abort = true;
            //        }
            //      } catch (ignore) {
            //      }
            //    }
            //    if (!abort) {
            //      this.model.changeCollection(wfs, journalSize, indexBuckets, replicationFactor, writeConcern, callbackChange);
            //    }
            //  }
            //}.bind(this);

            //if (frontendConfig.isCluster === false) {
            //  this.model.renameCollection(newname, callbackRename);
            //} else {
            //  callbackRename();
            //}
          } else if (status === 'unloaded') {
            if (this.model.get('name') !== newname) {
              var callbackRename2 = function (error, data) {
                if (error) {
                  arangoHelper.arangoError('Collection' + data.responseText);
                } else {
                  arangoHelper.arangoNotification('Collection' + 'Successfully changed.');
                  window.App.navigate('#cValidation/' + newname, {trigger: true});
                }
              };

              if (frontendConfig.isCluster === false) {
                this.model.renameCollection(newname, callbackRename2);
              } else {
                callbackRename2();
              }
            } else {
              window.modalView.hide();
            }
          }
        }
      }.bind(this);

      window.isCoordinator(saveCallback);
    },

    changeViewToReadOnly: function () {
      window.App.validationView.readOnly = true;
      $('.breadcrumb').html($('.breadcrumb').html() + ' (read-only)');
      // this method disables all write-based functions
      $('.modal-body input').prop('disabled', 'true');
      $('.modal-body select').prop('disabled', 'true');
      $('.modal-footer button').addClass('disabled');
      $('.modal-footer button').unbind('click');
    },

    renderValidation: function () {

      // use react here?

      var self = this;

      var validationCallback = function (error, isCoordinator) {
        if (error) {
          arangoHelper.arangoError('Error', 'Could not get coordinator info');
        } else {
          var collectionIsLoaded = false;

          if (this.model.get('status') === 'loaded') {
            collectionIsLoaded = true;
          }

          var buttons = [];
          var tableContent = [];

          var properties = undefined;

          var propCB = (error, data) => {
            if(error) {
              properties = data;
              properties = { "wurst" : "wasser" };
            } else {
              properties = { "wurst" : "wasser" };
            }
          };

          this.model.getProperties(propCB);

          tableContent.push(
           // createBlobStub(this.tables.BLOB, label, value, info, placeholder, mandatory, regex)
            window.modalView.createBlobEntry(
              'change-property-validation',
              'Validation',
              JSON.stringify(properties),
              false,
              '{}',
              false,
              [ ]
            )
          );

          var after = function () {
            buttons.push(
              window.modalView.createSuccessButton(
                'Save',
                this.saveModifiedProperties.bind(this)
              )
            );

            var tabBar = ['General'];
            var templates = ['modalTable.ejs'];

            window.modalView.show(
              templates,
              'Modify Collection',
              buttons,
              tableContent, null, null,
              this.events, null,
              tabBar, 'content'
            );
            //$($('#infoTab').children()[1]).remove();
          }.bind(this);

          if (collectionIsLoaded) {
            var callback2 = function (error, data) {
              if (error) {
                arangoHelper.arangoError('Collection', 'Could not fetch properties');
              } else {
                var wfs = data.waitForSync;
                if (data.journalSize) {
                  var journalSize = data.journalSize / (1024 * 1024);
                  var indexBuckets = data.indexBuckets;

                  tableContent.push(
                    window.modalView.createTextEntry(
                      'change-collection-size',
                      'Journal size',
                      journalSize,
                      'The maximal size of a journal or datafile (in MB). Must be at least 1.',
                      '',
                      true,
                      [
                        {
                          rule: Joi.string().allow('').optional().regex(/^[0-9]*$/),
                          msg: 'Must be a number.'
                        }
                      ]
                    )
                  );
                }
              }
              after();

              // check permissions and adjust views
              arangoHelper.checkCollectionPermissions(self.collectionName, self.changeViewToReadOnly.bind(this));
            };

            this.model.getProperties(callback2);
          } else {
            after();
            // check permissions and adjust views
            arangoHelper.checkCollectionPermissions(self.collectionName, self.changeViewToReadOnly.bind(this));
          }
        }
      }.bind(this);
      window.isCoordinator(validationCallback);
    }

  });
}());
