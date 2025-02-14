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
import getMediaSizePositionProps from './getMediaSizePositionProps';
import preloadVideo from './preloadVideo';
import seekVideo from './seekVideo';

/**
 * Returns an image data URL with a video strip of the frames of the video.
 *
 * @param {Object} element Canvas element with information about size, scale, and focal point.
 * @param {Object} resource Resource object with url and video length.
 * @param {number} stripWidth Target strip width.
 * @param {number} stripHeight Video src URL.
 * @return {Promise<string>} The video strip as a data URL.
 */
async function generateVideoStrip(element, resource, stripWidth, stripHeight) {
  const {
    width: frameWidth,
    height: frameHeight,
    scale,
    focalX,
    focalY,
  } = element;

  const { src, length } = resource;

  // Calculate the scaled frame width in the strip
  const stripFrameHeight = stripHeight;
  const stripFrameWidth = (stripFrameHeight / frameHeight) * frameWidth;

  // Calculate how many frames we can fit in the strip (rounded up)
  const frameCount = Math.ceil(stripWidth / stripFrameWidth);

  // Calculate what the actual width of each frame will have to be to squeeze the images in
  const actualStripFrameWidth = stripWidth / frameCount;

  // Scale the original frame width down by the same amount so we don't squish the frames
  const actualFrameWidth =
    (actualStripFrameWidth / stripFrameWidth) * frameWidth;

  // get video size based on scale and focal
  const {
    width: videoWidth,
    height: videoHeight,
    offsetX,
    offsetY,
  } = getMediaSizePositionProps(
    resource,
    actualFrameWidth,
    frameHeight,
    scale,
    focalX,
    focalY
  );

  // Calculate the offset between each frame to be grabbed
  const frameDistance = length / (frameCount - 1);

  // Preload video and adjust size
  const video = await preloadVideo(src);
  video.width = videoWidth;
  video.height = videoHeight;

  // Create the target canvas
  const canvas = document.createElement('canvas');
  canvas.width = stripWidth;
  canvas.height = stripHeight;
  const ctx = canvas.getContext('2d');

  // Create a function to grab the current frame and either schedule next or abort
  let timeOffset = 0;
  let frame = 0;
  const grabFrame = async () => {
    // Seek to the next offset
    await seekVideo(video, timeOffset);

    // Now copy the correct part of the video to the correct part of the context
    ctx.drawImage(
      video,
      // Source position
      offsetX,
      offsetY,
      // Source dimension
      actualFrameWidth,
      frameHeight,
      // Destination position
      frame * actualStripFrameWidth,
      0,
      // Destination dimension
      actualStripFrameWidth,
      stripFrameHeight
    );

    // If there are no more frames, return resolved promise
    frame += 1;
    if (frame === frameCount) {
      return Promise.resolve();
    }

    // Else, advance time and grab next frame
    timeOffset += frameDistance;
    return grabFrame();
  };

  return grabFrame().then(() => canvas.toDataURL());
}

export default generateVideoStrip;
