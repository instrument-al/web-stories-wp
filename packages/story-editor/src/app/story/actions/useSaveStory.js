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
import { __ } from '@web-stories-wp/i18n';
import { useCallback, useState } from '@web-stories-wp/react';
import { getTimeTracker } from '@web-stories-wp/tracking';
import { useSnackbar } from '@web-stories-wp/design-system';
import { useFeature } from 'flagged';

/**
 * Internal dependencies
 */
import { useAPI } from '../../api';
import { useConfig } from '../../config';
import useRefreshPostEditURL from '../../../utils/useRefreshPostEditURL';
import getStoryPropsToSave from '../utils/getStoryPropsToSave';
import { useHistory } from '../../history';

/**
 * Custom hook to save story.
 *
 * @param {Object} properties Properties to update.
 * @param {number} properties.storyId Story post id.
 * @param {Array} properties.pages Array of all pages.
 * @param {Object} properties.story Story-global properties.
 * @param {Function} properties.updateStory Function to update a story.
 * @return {Function} Function that can be called to save a story.
 */
function useSaveStory({ storyId, pages, story, updateStory }) {
  const {
    actions: { saveStoryById },
  } = useAPI();
  const {
    actions: { resetNewChanges },
  } = useHistory();
  const { metadata } = useConfig();
  const { showSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);
  const [isFreshlyPublished, setIsFreshlyPublished] = useState(false);

  const { editLink } = story;
  const refreshPostEditURL = useRefreshPostEditURL(storyId, editLink);

  const enableBetterCaptions = useFeature('enableBetterCaptions');

  const saveStory = useCallback(
    (props) => {
      setIsSaving(true);

      const isStoryAlreadyPublished = ['publish', 'future', 'private'].includes(
        story.status
      );

      const trackTiming = getTimeTracker('load_save_story');

      return saveStoryById({
        storyId,
        ...getStoryPropsToSave({
          story,
          pages,
          metadata,
          args: { enableBetterCaptions },
        }),
        ...props,
      })
        .then((data) => {
          const {
            status,
            slug,
            link,
            preview_link: previewLink,
            edit_link: newEditLink,
            embed_post_link: embedPostLink,
            featured_media: featuredMedia,
          } = data;

          const properties = {
            status,
            slug,
            link,
            previewLink,
            editLink: newEditLink,
            embedPostLink,
            featuredMedia,
          };
          updateStory({ properties });

          refreshPostEditURL();

          const isStoryPublished = ['publish', 'future', 'private'].includes(
            data.status
          );
          setIsFreshlyPublished(!isStoryAlreadyPublished && isStoryPublished);
        })
        .catch(() => {
          showSnackbar({
            message: __('Failed to save the story', 'web-stories'),
            dismissible: true,
          });
        })
        .finally(() => {
          setIsSaving(false);
          resetNewChanges();
          trackTiming();
        });
    },
    [
      story,
      pages,
      metadata,
      saveStoryById,
      storyId,
      updateStory,
      refreshPostEditURL,
      showSnackbar,
      resetNewChanges,
      enableBetterCaptions,
    ]
  );

  return { saveStory, isSaving, isFreshlyPublished };
}

export default useSaveStory;
