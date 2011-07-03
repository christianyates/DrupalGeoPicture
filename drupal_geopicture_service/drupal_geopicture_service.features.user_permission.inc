<?php
/**
 * @file
 * drupal_geopicture_service.features.user_permission.inc
 */

/**
 * Implementation of hook_user_default_permissions().
 */
function drupal_geopicture_service_user_default_permissions() {
  $permissions = array();

  // Exported permission: save file information
  $permissions['save file information'] = array(
    'name' => 'save file information',
    'roles' => array(
      0 => 'administrator',
      1 => 'editor',
      2 => 'publisher',
    ),
    'module' => 'services',
  );

  return $permissions;
}
