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
import { useState, useCallback, useEffect } from '@web-stories-wp/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TranslateWithMarkup, __ } from '@web-stories-wp/i18n';
import {
  Text,
  THEME_CONSTANTS,
  DropDown,
  AdvancedDropDown,
  noop,
} from '@web-stories-wp/design-system';

/**
 * Internal dependencies
 */
import useApi from '../../api/useApi';
import { StandardViewContentGutter, ViewStyleBar } from '../../../components';
import { DROPDOWN_TYPES, VIEW_STYLE } from '../../../constants';

const DisplayFormatContainer = styled.div`
  height: 76px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -10px;
`;

const StorySortDropdownContainer = styled.div`
  margin: auto 8px;
  align-self: flex-end;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledDropDown = styled(DropDown)`
  width: 210px;
`;

const BodyViewOptionsHeader = styled.div``;
const StyledAdvancedDropDown = styled(AdvancedDropDown.DropDown)`
  width: 150px;
`;

export default function BodyViewOptions({
  currentSort,
  handleLayoutSelect,
  handleSortChange,
  isLoading,
  resultsLabel,
  layoutStyle,
  pageSortOptions = [],
  showGridToggle,
  showSortDropdown,
  sortDropdownAriaLabel,
  showAuthorDropdown = false,
  authorFilterId = null,
  handleToggleAuthorId = noop,
}) {
  const getAuthors = useApi((v) => v.actions.usersApi.getAuthors);
  const [queriedUsers, setQueriedUsers] = useState([]);

  const getAuthorsBySearch = useCallback(
    (search) => {
      return getAuthors(search).then((data) => {
        const userData = data.map(({ id, name }) => ({
          id,
          name,
        }));
        setQueriedUsers((exisitingUsers) => {
          const newUsers = userData.filter(
            (newUser) => !exisitingUsers.includes(newUser)
          );
          return [...exisitingUsers, ...newUsers];
        });
      });
    },
    [getAuthors]
  );

  useEffect(() => {
    getAuthorsBySearch();
  }, [getAuthorsBySearch]);

  const dropDownParams = {
    hasSearch: true,
    onChange: handleToggleAuthorId,
    getOptionsByQuery: getAuthorsBySearch,
    selectedId: authorFilterId,
    placeholder: __('Author', 'web-stories'),
    primaryOptions: queriedUsers,
  };

  return (
    <StandardViewContentGutter>
      <BodyViewOptionsHeader id="body-view-options-header" />
      {!isLoading && (
        <DisplayFormatContainer>
          <Text as="span" size={THEME_CONSTANTS.TYPOGRAPHY.PRESET_SIZES.SMALL}>
            <TranslateWithMarkup>{resultsLabel}</TranslateWithMarkup>
          </Text>
          <ControlsContainer>
            {layoutStyle === VIEW_STYLE.GRID && showAuthorDropdown && (
              <StorySortDropdownContainer>
                <StyledAdvancedDropDown
                  hasDropDownBorder
                  options={queriedUsers}
                  searchResultsLabel={__('Search results', 'web-stories')}
                  aria-label={__('Author', 'web-stories')}
                  {...dropDownParams}
                />
              </StorySortDropdownContainer>
            )}
            {layoutStyle === VIEW_STYLE.GRID && showSortDropdown && (
              <StorySortDropdownContainer>
                <StyledDropDown
                  ariaLabel={sortDropdownAriaLabel}
                  options={pageSortOptions}
                  type={DROPDOWN_TYPES.MENU}
                  selectedValue={currentSort}
                  onMenuItemClick={(_, newSort) => handleSortChange(newSort)}
                />
              </StorySortDropdownContainer>
            )}
            {showGridToggle && (
              <ControlsContainer>
                <ViewStyleBar
                  layoutStyle={layoutStyle}
                  onPress={handleLayoutSelect}
                />
              </ControlsContainer>
            )}
          </ControlsContainer>
        </DisplayFormatContainer>
      )}
    </StandardViewContentGutter>
  );
}

BodyViewOptions.propTypes = {
  currentSort: PropTypes.string.isRequired,
  handleLayoutSelect: PropTypes.func,
  handleSortChange: PropTypes.func,
  isLoading: PropTypes.bool,
  layoutStyle: PropTypes.string.isRequired,
  resultsLabel: PropTypes.string.isRequired,
  pageSortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  showGridToggle: PropTypes.bool,
  showSortDropdown: PropTypes.bool,
  sortDropdownAriaLabel: PropTypes.string.isRequired,
  showAuthorDropdown: PropTypes.bool,
  authorFilterId: PropTypes.number,
  handleToggleAuthorId: PropTypes.func,
};
