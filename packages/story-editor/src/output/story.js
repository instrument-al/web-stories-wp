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
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import StoryPropTypes, { BackgroundAudioPropType } from '../types';
import getUsedAmpExtensions from './utils/getUsedAmpExtensions';
import Boilerplate from './utils/ampBoilerplate';
import CustomCSS from './utils/styles';
import getFontDeclarations from './utils/getFontDeclarations';
import OutputPage from './page';
import getPreloadResources from './utils/getPreloadResources';

function OutputStory({
  story: {
    featuredMedia,
    link,
    title,
    autoAdvance,
    defaultPageDuration,
    backgroundAudio,
    publisherLogo,
  },
  pages,
  metadata: { publisher },
  args = {},
}) {
  const ampExtensions = getUsedAmpExtensions(pages, args);
  const fontDeclarations = getFontDeclarations(pages);
  const preloadResources = getPreloadResources(pages);

  const featuredMediaUrl = featuredMedia?.url || '';
  const publisherLogoUrl = publisherLogo?.url || '';

  return (
    <html amp="" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1"
        />
        {ampExtensions.map(({ name, src }) => (
          <script key={src} async="async" src={src} custom-element={name} />
        ))}
        {fontDeclarations.map((url) => (
          <link key={url} href={url} rel="stylesheet" />
        ))}
        {preloadResources.map(({ url, type }) => (
          <link key={url} href={url} rel="preload" as={type} />
        ))}
        <Boilerplate />
        <CustomCSS />
        {/* Everything between these markers can be replaced server-side. */}
        <meta name="web-stories-replace-head-start" />
        <title>{title}</title>
        {link && <link rel="canonical" href={link} />}
        <meta name="web-stories-replace-head-end" />
      </head>
      <body>
        <amp-story
          standalone=""
          publisher={publisher}
          publisher-logo-src={publisherLogoUrl}
          title={title}
          poster-portrait-src={featuredMediaUrl}
          background-audio={backgroundAudio?.src ?? undefined}
        >
          {pages.map((page) => (
            <OutputPage
              key={page.id}
              page={page}
              autoAdvance={autoAdvance}
              defaultPageDuration={defaultPageDuration}
              args={args}
            />
          ))}
        </amp-story>
      </body>
    </html>
  );
}

OutputStory.propTypes = {
  story: PropTypes.shape({
    link: PropTypes.string,
    title: PropTypes.string.isRequired,
    autoAdvance: PropTypes.bool,
    defaultPageDuration: PropTypes.number,
    backgroundAudio: BackgroundAudioPropType,
    publisherLogo: PropTypes.shape({
      url: PropTypes.string.isRequired,
    }),
    featuredMedia: PropTypes.shape({
      url: PropTypes.string.isRequired,
    }),
  }).isRequired,
  pages: PropTypes.arrayOf(StoryPropTypes.page).isRequired,
  metadata: PropTypes.shape({
    publisher: PropTypes.string.isRequired,
  }).isRequired,
  args: PropTypes.shape({
    enableBetterCaptions: PropTypes.bool,
  }),
};

export default OutputStory;
