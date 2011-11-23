/*
 * Drupal GeoPicture. A simple Drupal picture uploader for iOS.
 * Copyright (C) 2011 Pierre Buyle, Christian Yates
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

$.extend($.mobile, {defaultTransition: 'none'});

$(document).ready(function() {
		
  //--- Start of PG only code
  $(document).bind("deviceready", function() {
	
		// Determine if user has saved a baseurl
		if ($('#base_url').val()) {
			Drupal.initialize($('#base_url').val());
		}
		else {
			// Base url is not yet saved.
			$.mobile.changePage('#options', undefined, undefined, true);
		}	
    
    //Since we have a device, use it to get the picture
    $('#get-picture').unbind('click.nodevice').bind('click.device', function(){
      $.mobile.changePage([$.mobile.activePage, $('#get-picture-from-device')], 'none', false);
    });
    $('#get-picture-from-device a[data-picture-source]').removeClass('ui-disabled').click(function(){
      navigator.camera.getPicture(function(imageUri) {
        $('#picture').attr('src', imageUri);
      }, $.noop, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType[$(this).data('picture-source')]
      });
    });
  }, true);
  //--- End of PG only code
  
  //Automatically store and retrieve input value from localStorage
  $('input[data-storage-key], select[data-storage-key]').each( function(){
    var $this = $(this);
    var key = $this.data('storage-key');
    $this.val(localStorage.getItem(key)).change(function(){
      localStorage.setItem(key, $this.val());
    });
  });
 
 //Default picture getter using a file input and FileRead
 $('#get-picture').bind('click.nodevice', function(){
   $.mobile.changePage([$.mobile.activePage, $('#get-picture-from-file')], 'none', false);
 });
 $('#get-picture-from-file').live('pagehide', function() {
    var files = $('#picture-file').attr('files');
    if(files.length > 0) {
      var file = files[0];
      if(!file.type.match(/image.(gif|jpeg|png)/)) {
        alert('This file is not an image.');
        $('#picture').attr('src', 'images/entry_no_icon.png');
      }
      else {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          if(!e.target.error) {
            $('#picture').attr('src', e.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  })
 $('#location-summary').focus(function(){
   $.mobile.changePage('#location', undefined, undefined, true);
 })
 //@todo When refreshing geolocation, use geolocation.watchPosition for some time
 //before using the latest position. This to ensure the GPS of the device has
 //been activated long enough for it to catch a precise location.
 var lastPosition = false
 var geocodePosition = function(position) {
   lastPosition = position;
 };
 window.gmapInit = function() {
   geocodePosition = function(position) {
     var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
     geocoder = new google.maps.Geocoder();
     geocoder.geocode({'latLng': latlng}, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
         var address = {};
         for (i=0;i<results[0].address_components.length;i++){
           for (j=0;j<results[0].address_components[i].types.length;j++){
             address[results[0].address_components[i].types[j]] = results[0].address_components[i].long_name
           }
         }
         $('#street').val(address.route + ' ' + address.street_number);
         $('#city').val(address.locality);
         $('#province').val(address.administrative_area_level_1);
         $('#postal_code').val(address.postal_code);
         $('#location-summary').val($('#street').val() + ', ' + $('#postal_code').val() + ' ' + $('#city').val());
       } else {
         //alert("Geocoder failed due to: " + status);
       }
     });
   }
   if(typeof lastPosition == 'object') {
     geocodePosition(lastPosition);
   }
 }
 var locationRefresh = function() {
   var geolocationOptions = {enableHighAccuracy: true};
   navigator.geolocation.getCurrentPosition(function(position){
     $('#latitude').val(position.coords.latitude);
     $('#longitude').val(position.coords.longitude);
     geocodePosition(position);
   }, $.noop, geolocationOptions);
 }
 $('#location-refresh').click(function(e){
   e.stopImmediatePropagation();
   locationRefresh();
 });
 locationRefresh();
 $('#location').bind('pagehide', function(){
   $('#location-summary').val($('#street').val() + ', ' + $('#postal_code').val() + ' ' + $('#city').val());
 });
 
 var getPictureDataUrl = function(img, callback) {
   var $img = $(img);
   if(!$img.attr('src') || $img.attr('src') ===  'images/entry_no_icon.png') {
     callback('data:,');
   }
   if($img.attr('src').slice(0, 5) === 'data:') {
     //The img source is a Data URL
     callback($img.attr('src'));
   } else if(typeof FileReader === 'function') {
     //Use the FileReader API to read the img src as a Data URL
     var reader = new FileReader();
     reader.onloadend = function(e) {
       if(!e.target.error) {
         callback(e.target.result);
       }
       else {
   		 
   	   }
     };

	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

	 function gotFS(fileSystem) {
	  	// fileSystem.root contains a DirectoryEntry object
		var url = $img.attr('src');
		
		url = fileSystem.root.fullPath + "/tmp/" + url.substring(url.lastIndexOf('/') + 1);
		
		fileSystem.root.getFile( url, {"create":true, "exclusive":false}, function(fileEntry) {
			reader.readAsDataURL(fileEntry);
		}, function(e){  });
	
	 }
	function fail(fileSystem) {
		
	}
	
	
   } else {
     //Use the Canvas API to get the Data URL
     //This doesn't seems to work on Android 2.2
     //See http://code.google.com/p/android/issues/detail?id=7901
     var canvas = document.getElementById("picture-canvas");
     var context = canvas.getContext("2d");
     var width = parseInt($img.attr('width'), 10);
     var height = parseInt($img.attr('height'), 10);
     var ratio = 1;
     if(width > 2048) {
       ratio = 2048 / width;
     } else if(height > 2048) {
       ration = 2048 / height;
     }
     canvas.height= Math.floor(height * ratio);
     canvas.width= Math.floor(width * ratio);
     context.drawImage(img, 0, 0, canvas.width, canvas.height);
     callback(canvas.toDataURL('image/jpeg'));
   }
 }    

 //Drupal stuffs
 $('#login').click(function() {
	 Drupal.initialize($('#base_url').val());
   Drupal.user.login($('#name').val(), $('#password').val());
 });
 $('#logout').click(function() {
   Drupal.user.logout();
 });
 $(document).bind('DrupalLogin', function(e, user){
   // navigator.notification.alert('Logged in as ' + user.name, $.noop, 'Drupal');
	 $("#options-button .ui-btn-text").text(user.name);
   $('#login').hide();
   $('#logout').show();
	 $.mobile.changePage("#home", undefined, undefined, true);
 });
 $(document).bind('DrupalLogout', function(e, user){
   // navigator.notification.alert('Logged out', $.noop, 'Drupal');
   $("#options-button .ui-btn-text").text("Log In");
   $('#login').show();
   $('#logout').hide();
 });
 $('#post').click(function() {
   if(!Drupal.user.is_logged_in()) {
     navigator.notification.vibrate(500);
     navigator.notification.alert('You need to login before posting picture.', function(){
       $.mobile.changePage('#options', undefined, undefined, true);
     }, 'Drupal');
     return
   }
   $.mobile.pageLoading();
   getPictureDataUrl('#picture', function(dataUrl){
     if((typeof dataUrl !== 'string') || (dataUrl === 'data:,')) {
       $.mobile.pageLoading(true);
       navigator.notification.vibrate(250);
       navigator.notification.alert('You cannot post without a picture.', $.noop, 'Missing Picture');
       return
     }
     if($('#title').val() === '') {
       $.mobile.pageLoading(true);
       navigator.notification.vibrate(250);
       navigator.notification.alert('You cannot post without a title.', $.noop, 'Missing Title');
       return
     }
     //@todo: check for mime type in dataUrl to use the correct extension
	 	 
     Drupal.file.create({
       filename: $("#picture").attr('src').substring($("#picture").attr('src').lastIndexOf('/') + 1),
       file: dataUrl.slice(dataUrl.indexOf(';base64,') + ';base64,'.length),
			 uid: Drupal.user.current.uid
     }, function(data){
       Drupal.node.create({
	       uid: Drupal.user.current.uid,
	       name: Drupal.user.current.name,
         title: $('#title').val(),
         body: { und: [{
						value: $('#body').val()
				 }]},
         type: 'blog',
         language: 'und',
         field_images: {
						und:	[{
							fid: data.fid
			   		}]
		     },
          locations: [{
            street: $('#street').val(),
            city: $('#city').val(),
            postal_code: $('#postal_code').val(),
            latitude: $('#latitude').val(),
            longitude: $('#longitude').val(),
            province: $('#province').val(),
          }]
       }, function(data){         
         $('#title, #body').val('');
         $('#picture').attr('src', 'images/entry_no_icon.png');
         $.mobile.pageLoading(true);
         navigator.notification.vibrate(250);
         navigator.notification.alert('New post created with nid ' + data.nid, $.noop, 'Drupal');
       });
     }, function() {
       $.mobile.pageLoading(true);
     });
   })
 });
 //Async. load GMaps API
 var script = document.createElement("script");
 script.type = "text/javascript";
 script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=gmapInit&region=US";
 document.body.appendChild(script);
});
