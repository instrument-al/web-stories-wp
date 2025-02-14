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
import { trackError } from '@web-stories-wp/tracking';
import { getHexFromSolidArray } from '@web-stories-wp/patterns';

const STYLES = {
  boxSizing: 'border-box',
  visibility: 'hidden',
  position: 'fixed',
  contain: 'layout paint',
  top: '-9999px',
  left: '-9999px',
  zIndex: -1,
};

const BASE_COLOR_NODE = '__WEB_STORIES_BASE_COLOR__';
const IMG_NODE = '__WEB_STORIES_IMG_NODE';

export function getImgNodeId(elementId) {
  if (elementId === undefined) {
    return '__web-stories-base-color';
  }
  return `__web-stories-bg-${elementId}`;
}

function getImgNodeKey(elementId) {
  if (elementId === undefined) {
    return BASE_COLOR_NODE;
  }
  return `${IMG_NODE}_${elementId}`;
}

export async function getMediaBaseColor(src) {
  if (!src) {
    return Promise.reject(new Error('No source to image'));
  }
  let color;
  try {
    color = await setOrCreateImage({
      src,
      width: 10,
      height: 'auto',
    });
  } catch (error) {
    // Known error of color thief with white only images.
    if (error?.name !== 'TypeError') {
      throw error;
    }
    color = '#ffffff';
  }
  return color;
}

function getDefaultOnloadCallback(nodeKey, resolve, reject) {
  return () => {
    import(
      /* webpackPrefetch: true, webpackChunkName: "chunk-colorthief" */ 'colorthief'
    )
      .then(({ default: ColorThief }) => {
        const node = document.body[nodeKey];
        const thief = new ColorThief();
        const rgb = thief.getColor(node.firstElementChild);
        resolve(getHexFromSolidArray(rgb));
      })
      .catch((err) => {
        trackError('image_base_color', err.message);
        reject(err);
      });
  };
}

export function setOrCreateImage(
  imageData,
  getOnloadCallback = getDefaultOnloadCallback
) {
  const { src, id, height, width } = imageData;
  return new Promise((resolve, reject) => {
    const NODE_KEY = getImgNodeKey(id);
    let imgNode = document.body[NODE_KEY];
    if (!imgNode) {
      imgNode = document.createElement('div');
      imgNode.id = getImgNodeId(id);
      Object.assign(imgNode.style, STYLES);
      document.body.appendChild(imgNode);
      document.body[NODE_KEY] = imgNode;
    }
    imgNode.innerHTML = '';

    const img = new Image();
    // Necessary to avoid tainting canvas with CORS image data.
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.addEventListener('load', getOnloadCallback(NODE_KEY, resolve, reject));
    img.addEventListener('error', (e) => {
      reject(new Error('Set image error: ' + e.message));
    });
    img.width = width;
    img.height = height;
    img.src = src;
    imgNode.appendChild(img);
  });
}
