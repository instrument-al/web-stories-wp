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
import { useCallback } from '@web-stories-wp/react';
import styled, { css } from 'styled-components';
import { __ } from '@web-stories-wp/i18n';
import { LockToggle, NumericInput, Icons } from '@web-stories-wp/design-system';

/**
 * Internal dependencies
 */
import Tooltip from '../../../tooltip';
import {
  focusStyle,
  inputContainerStyleOverride,
  useCommonObjectValue,
} from '../../shared';
import { MULTIPLE_DISPLAY_VALUE, MULTIPLE_VALUE } from '../../../../constants';
import { DEFAULT_BORDER } from './shared';

const BorderInputsGrid = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const BorderInputsWrapper = styled.div`
  margin-left: 1px;
  ${({ locked }) => (locked ? 'width: calc(50% - 32px);' : '')}
`;

const BorderWidthNumericInput = styled(NumericInput)`
  border-radius: 0px;
  margin-left: -1px;

  ${({ locked, border }) =>
    !locked &&
    `
    width: 25%;
    svg {
      width: 10px;
      height: 10px;
      margin-right: -14px;
      ${border === 'right' ? 'transform: scaleX(-1);' : ''}
      ${border === 'bottom' ? 'transform: scaleY(-1);' : ''}
    }
  `}
`;

const styleOverrideTopLeft = css`
  ${inputContainerStyleOverride}
  border-radius: 4px 0 0 4px;
`;

const styleOverrideTopRight = css`
  ${inputContainerStyleOverride}
  border-radius: 0;
`;

const styleOverrideBottomLeft = css`
  ${inputContainerStyleOverride}
  border-radius: 0;
`;

const styleOverrideBottomRight = css`
  ${inputContainerStyleOverride}
  border-radius: 0 4px 4px 0;
`;

const StyledLockToggle = styled(LockToggle)`
  ${focusStyle};
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

function WidthControls({ selectedElements, pushUpdateForObject }) {
  const border = useCommonObjectValue(
    selectedElements,
    'border',
    DEFAULT_BORDER
  );

  // Only if true for all selected elements.
  const lockBorder = border.lockedWidth === true;

  const handleChange = useCallback(
    (name) => (evt, value) => {
      const newBorder = !lockBorder
        ? {
            [name]: value,
          }
        : {
            left: value,
            top: value,
            right: value,
            bottom: value,
          };
      pushUpdateForObject('border', newBorder, DEFAULT_BORDER, true);
    },
    [pushUpdateForObject, lockBorder]
  );

  const handleLockChange = useCallback(
    (newBorder) => {
      pushUpdateForObject('border', newBorder, DEFAULT_BORDER, true);
    },
    [pushUpdateForObject]
  );

  const firstInputLabel = lockBorder
    ? __('Border', 'web-stories')
    : __('Left border', 'web-stories');

  const getMixedValueProps = useCallback((value) => {
    return {
      isIndeterminate: MULTIPLE_VALUE === value,
      placeholder: MULTIPLE_VALUE === value ? MULTIPLE_DISPLAY_VALUE : null,
    };
  }, []);
  return (
    <BorderInputsGrid locked={lockBorder}>
      <BorderInputsWrapper locked={lockBorder}>
        <BorderWidthNumericInput
          locked={lockBorder}
          suffix={!lockBorder && <Icons.BorderLeft />}
          value={border.left}
          aria-label={firstInputLabel}
          onChange={handleChange('left')}
          containerStyleOverride={
            lockBorder ? inputContainerStyleOverride : styleOverrideTopLeft
          }
          {...getMixedValueProps(border.left)}
        />
        {!lockBorder && (
          <>
            <BorderWidthNumericInput
              suffix={<Icons.BorderTop />}
              value={border.top}
              onChange={handleChange('top')}
              aria-label={__('Top border', 'web-stories')}
              labelText={__('Top', 'web-stories')}
              containerStyleOverride={styleOverrideTopRight}
              {...getMixedValueProps(border.top)}
            />
            <BorderWidthNumericInput
              border="right"
              suffix={<Icons.BorderLeft />}
              value={border.right}
              onChange={handleChange('right')}
              aria-label={__('Right border', 'web-stories')}
              labelText={__('Right', 'web-stories')}
              containerStyleOverride={styleOverrideBottomLeft}
              {...getMixedValueProps(border.right)}
            />
            <BorderWidthNumericInput
              border="bottom"
              suffix={<Icons.BorderTop />}
              value={border.bottom}
              onChange={handleChange('bottom')}
              aria-label={__('Bottom border', 'web-stories')}
              labelText={__('Bottom', 'web-stories')}
              containerStyleOverride={styleOverrideBottomRight}
              {...getMixedValueProps(border.bottom)}
            />
          </>
        )}
      </BorderInputsWrapper>
      <ToggleWrapper>
        <Tooltip title={__('Toggle consistent border', 'web-stories')}>
          <StyledLockToggle
            isLocked={lockBorder}
            onClick={() => {
              let args = {
                lockedWidth: !lockBorder,
              };
              // If the border width wasn't locked before (and is now), unify all the values.
              if (!lockBorder) {
                args = {
                  ...args,
                  top: border.left,
                  right: border.left,
                  bottom: border.left,
                };
              }
              handleLockChange(args);
            }}
            aria-label={__('Toggle consistent border', 'web-stories')}
          />
        </Tooltip>
      </ToggleWrapper>
    </BorderInputsGrid>
  );
}

WidthControls.propTypes = {
  selectedElements: PropTypes.array.isRequired,
  pushUpdateForObject: PropTypes.func.isRequired,
};

export default WidthControls;
