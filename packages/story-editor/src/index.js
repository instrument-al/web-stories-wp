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
 * Internal dependencies
 */
import { default as StoryEditor } from './editorApp';
import PostLock from './components/postLock';
import StatusCheck from './components/statusCheck';

export * from './components/transform';
export * from './app/config';
export * from './app/api';
export * from './components/previewPage';

export { default as base64Encode } from './utils/base64Encode';
export { default as getStoryPropsToSave } from './app/story/utils/getStoryPropsToSave';
export { default as FontContext } from './app/font/context';
export { default as useLoadFontFiles } from './app/font/actions/useLoadFontFiles';
export { getResourceFromMediaPicker } from './app/media/utils';
export { default as StoryPropTypes } from './types';
export { GlobalStyle } from './theme';
export { default as theme } from './theme'; // @todo To be refactored.
export { GlobalStyle as CropMoveableGlobalStyle } from './components/moveable/cropStyle';
export { ConfigProvider as EditorConfigProvider } from './app/config';

export { PostLock, StatusCheck };
export default StoryEditor;
