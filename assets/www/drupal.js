/*
 * Drupal GeoPicture. A simple Drupal picture uploader for Android.
 * Copyright (C) 2011 Pierre Buyle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
Drupal = (function($){  
  var POST = function(path, data, onSuccess, onError) {
    $.ajax({
      type: "POST",
      url: Drupal.base_url + path,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      success: onSuccess,
      error: onError,
    });
  };
  
  var chain = function() {
    var functions = Array.prototype.slice.call(arguments);
    return function(){
      for (i=0;(i<functions.length);i++) {
        functions[i].apply(this, arguments);
      }
    }
  };
  
  var action = function(path, params, onSuccess, onError) {
    return function() {
      var data = {};
      for (i=0;(i<params.length);i++) {
        var p = params[i];
        data[p] = arguments[i];
      }
      if(typeof onSuccess !== 'function') {
        
      }
      $.ajax({
        type: "POST",
        url: Drupal.base_url + path,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: chain(onSuccess || $.noop, arguments[i] || $.noop),
        error: chain(onError || $.noop, arguments[i+1] || $.noop),
      });
    }
  }
  
  return {
    base_url: '',
    initialize: function(baseUrl, onSuccess, onError) {
      Drupal.base_url = baseUrl || Drupal.base_url;
      Drupal.system.connect(chain(function(){
        if(Drupal.user.is_logged_in()) {
          $(document).trigger('DrupalLogin', Drupal.user.current);
        }
      }, onSuccess || $.noop), onError || $.noop);      
    },
    user: {
      current: {uid:0},
      is_logged_in: function() {
        return parseInt(Drupal.user.current.uid) != 0;
      },
      login: action('api/user/login', ['name', 'pass'], function(data) {
        Drupal.user.current = data.user;
        Drupal.session = {id: data.sessid, name: data.session_name};
        $(document).trigger('DrupalLogin', Drupal.user.current);
      }, function(xhr, textStatus, error) {
        alert(textStatus);
      }),
      logout: action('api/user/logout', [], function(data) {
        delete Drupal.user.current;
        Drupal.system.connect(function(){
          $(document).trigger('DrupalLogout');
        }, function(){
          $(document).trigger('DrupalLogout');
        });        
      }),
    },
    system: {
      connect: action('api/system/connect', [], function(data){
        Drupal.user.current = data.user;
        Drupal.session = {id: data.sessid};
      }),
    },
    file: {
      create: function(file, callback) {
        POST('api/file', {file: file}, callback);
      }
    },
    node: {
      create: function(node, callback) {
        POST('api/node', {node: node}, callback);
      }
    }
  };
})(jQuery);