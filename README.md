About this App
==============

This application is based on [Phonegap](http://phonegap.com), a HTML and javascript based toolkit for developing native smartphone applications.

It provides one simple service - posting of images as attachments to Blog nodes for Drupal 7.x. You should be able to use this as an example for using other methods, or other information architecture.

It is a fork of work by Pierre Buyle, who created the application for Android. I've cleaned it up a bit from both the [Drupal](http://drupal.org) side and the Phonegap side, but there's a lot more work to be done before it's production ready.

Installing and using
====================

I've not yet tried this on a real live iOS device, only on the simulator, but so far it works. I've created a [Feature](http://drupal.org/project/features) module that the iOS application interacts with. Just move the *drupal_geopicture_service* folder to your Drupal sites/all/modules directory, and enable the module. This should enable Blogs, Services and the appropriate modifications to each, namely adding a [Services 3.x](http://drupal.org/project/services) compatible REST web service that the app talks to, and adding the appropriate image field to the Blog content type.

You can modify the application source code and the Drupal feature to your hearts content to customize.

The app also supports the [Location](http://drupal.org/project/location) module.