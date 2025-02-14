<?php
/**
 * RestTestCase class.
 *
 * Basic test that designed to replace WP_Test_REST_TestCase.
 *
 * @package   Google\Web_Stories
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/google/web-stories-wp
 */

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories\Tests\Integration;

/**
 * Class RestTestCase
 *
 * @package Google\Web_Stories\Tests
 */
abstract class RestTestCase extends TestCase {
	use REST_Setup;

	public function set_up() {
		parent::set_up();

		$this->set_up_rest();
	}

	public function tear_down() {
		$this->tear_down_rest();

		parent::tear_down();
	}
}
