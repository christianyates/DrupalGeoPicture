<?php
/**
 * @file
 * drupal_geopicture_service.services.inc
 */

/**
 * Implementation of hook_default_services_endpoint().
 */
function drupal_geopicture_service_default_services_endpoint() {
  $export = array();

  $endpoint = new stdClass;
  $endpoint->disabled = FALSE; /* Edit this to true to make a default endpoint disabled initially */
  $endpoint->api_version = 3;
  $endpoint->name = 'ios_api';
  $endpoint->title = 'Drupal Geo Picture';
  $endpoint->server = 'rest_server';
  $endpoint->path = 'drupalgeopicture';
  $endpoint->authentication = array();
  $endpoint->resources = array(
    'file' => array(
      'alias' => '',
      'operations' => array(
        'create' => array(
          'enabled' => '1',
        ),
        'retrieve' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'system' => array(
      'alias' => '',
      'actions' => array(
        'connect' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'user' => array(
      'alias' => '',
      'actions' => array(
        'login' => array(
          'enabled' => '1',
        ),
        'logout' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'node' => array(
      'alias' => '',
      'operations' => array(
        'create' => array(
          'enabled' => '1',
        ),
      ),
      'relationships' => array(
        'files' => array(
          'enabled' => '1',
        ),
      ),
    ),
  );
  $endpoint->debug = 0;
  $export['ios_api'] = $endpoint;

  return $export;
}
