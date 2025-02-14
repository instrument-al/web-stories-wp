/*
 * Copyright 2020 Google LLC
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

/**
 * External dependencies
 */
import { waitFor, within } from '@testing-library/react';

/**
 * Internal dependencies
 */

import { Fixture, LOCAL_MEDIA_PER_PAGE } from '../../../../../../karma/fixture';
import { ROOT_MARGIN } from '../mediaPane';

// Disable reason: test is flakey
// Fix in progress:   https://github.com/google/web-stories-wp/issues/9779
// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('MediaPane fetching', () => {
  let fixture;

  beforeEach(async () => {
    fixture = new Fixture();
    await fixture.render();
    await fixture.collapseHelpCenter();
  });

  afterEach(() => {
    fixture.restore();
  });

  it('should fetch 2nd page', async () => {
    const localPane = await waitFor(() =>
      fixture.querySelector('#library-pane-media')
    );
    const mediaGallery = await within(localPane).getByTestId(
      'media-gallery-container'
    );

    const initialElements =
      within(mediaGallery).queryAllByTestId(/^mediaElement-/);

    await waitFor(() => {
      // ensure fixture.screen has loaded before calling expect to prevent immediate failure
      if (initialElements.length !== LOCAL_MEDIA_PER_PAGE) {
        throw new Error('wait');
      }
      expect(initialElements.length).toBe(LOCAL_MEDIA_PER_PAGE);
    });

    await mediaGallery.scrollTo(
      0,
      mediaGallery.scrollHeight - mediaGallery.clientHeight - ROOT_MARGIN / 2
    );

    await waitFor(() => {
      // ensure fixture.screen has loaded before calling expect to prevent immediate failure
      if (
        fixture.screen.queryAllByTestId(/^mediaElement-/).length <
        LOCAL_MEDIA_PER_PAGE * 2
      ) {
        throw new Error('wait');
      }

      expect(
        fixture.screen.queryAllByTestId(/^mediaElement-/).length
      ).toBeGreaterThanOrEqual(LOCAL_MEDIA_PER_PAGE * 2);
    });
  });
});
