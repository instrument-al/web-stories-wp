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
import { useCallback, useMemo, useRef, useState } from '@web-stories-wp/react';
import { curatedFontNames } from '@web-stories-wp/fonts';

/**
 * Internal dependencies
 */
import loadStylesheet from '../../utils/loadStylesheet';
import { FONT_WEIGHT_NAMES } from '../../constants';
import Context from './context';
import useLoadFonts from './effects/useLoadFonts';
import useLoadFontFiles from './actions/useLoadFontFiles';

export const GOOGLE_MENU_FONT_URL = 'https://fonts.googleapis.com/css';

function FontProvider({ children }) {
  const [fonts, setFonts] = useState([]);
  const [recentFonts, setRecentFonts] = useState([]);

  useLoadFonts({ fonts, setFonts });

  const getFontBy = useCallback(
    (key, value) => {
      const foundFont = fonts.find((thisFont) => thisFont[key] === value);
      if (!foundFont) {
        return {};
      }
      return foundFont;
    },
    [fonts]
  );

  const getFontByName = useCallback(
    (name) => {
      return getFontBy('family', name);
    },
    [getFontBy]
  );

  const getFontWeight = useCallback(
    (name) => {
      const defaultFontWeights = [{ name: FONT_WEIGHT_NAMES[400], value: 400 }];

      const currentFont = getFontByName(name);
      let fontWeights = defaultFontWeights;
      if (currentFont) {
        const { weights } = currentFont;
        if (weights) {
          fontWeights = weights.map((weight) => ({
            name: FONT_WEIGHT_NAMES[weight],
            value: weight,
          }));
        }
      }
      return fontWeights;
    },
    [getFontByName]
  );

  const getFontFallback = useCallback(
    (name) => {
      const currentFont = getFontByName(name);
      return currentFont?.fallbacks ? currentFont.fallbacks : [];
    },
    [getFontByName]
  );

  const addRecentFont = useCallback(
    (recentFont) => {
      const newRecentFonts = [recentFont];
      recentFonts.forEach((font) => {
        if (recentFont.family === font.family) {
          return;
        }
        newRecentFonts.push(font);
      });
      setRecentFonts(newRecentFonts.slice(0, 5));
    },
    [recentFonts]
  );

  const menuFonts = useRef([]);
  const ensureMenuFontsLoaded = useCallback((menuFontsRequested) => {
    const newMenuFonts = menuFontsRequested.filter(
      (fontName) => !menuFonts.current.includes(fontName)
    );
    if (!newMenuFonts?.length) {
      return;
    }
    menuFonts.current = menuFonts.current.concat(newMenuFonts);

    // Create new <link> in head with ref to new font families
    const families = encodeURIComponent(newMenuFonts.join('|'));
    const url = `${GOOGLE_MENU_FONT_URL}?family=${families}&subset=menu&display=swap`;
    loadStylesheet(url).catch(() => {
      // If they failed to load, remove from array again!
      menuFonts.current = menuFonts.current.filter(
        (font) => !newMenuFonts.includes(font)
      );
    });
  }, []);

  const maybeEnqueueFontStyle = useLoadFontFiles();

  const curatedFonts = useMemo(
    () => fonts.filter((font) => curatedFontNames.includes(font.name)),
    [fonts]
  );

  const state = {
    state: {
      fonts,
      curatedFonts,
      recentFonts,
    },
    actions: {
      getFontByName,
      maybeEnqueueFontStyle,
      getFontWeight,
      getFontFallback,
      ensureMenuFontsLoaded,
      addRecentFont,
    },
  };

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

FontProvider.propTypes = {
  children: PropTypes.node,
};

export default FontProvider;
