/*
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

/**
 * External dependencies
 */
import { fireEvent, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import { setAppElement } from '@web-stories-wp/design-system';
import { StoryContext } from '@web-stories-wp/story-editor';

/**
 * Internal dependencies
 */
import MetaBoxesContext from '../../../metaBoxes/context';
import { renderWithTheme } from '../../../../testUtils';
import Buttons from '..';

function arrange({
  story: extraStoryProps,
  storyState: extraStoryStateProps,
  meta: extraMetaProps,
  metaBoxes: extraMetaBoxesProps,
} = {}) {
  const saveStory = jest.fn();
  const autoSave = jest.fn();
  const focusChecklistTab = jest.fn();

  const storyContextValue = {
    state: {
      capabilities: {
        publish: true,
      },
      meta: { isSaving: false, isFreshlyPublished: false, ...extraMetaProps },
      story: {
        status: 'draft',
        storyId: 123,
        date: null,
        editLink: 'http://localhost/wp-admin/post.php?post=123&action=edit',
        embedPostLink:
          'https://example.com/wp-admin/post-new.php?from-web-story=123',
        previewLink:
          'http://localhost?preview_id=1679&preview_nonce=b5ea827939&preview=true',
        ...extraStoryProps,
      },
      ...extraStoryStateProps,
    },
    actions: { saveStory, autoSave },
  };
  const metaBoxesValue = {
    state: {
      hasMetaBoxes: false,
      isSavingMetaBoxes: false,
      ...extraMetaBoxesProps,
    },
  };

  renderWithTheme(
    <MetaBoxesContext.Provider value={metaBoxesValue}>
      <StoryContext.Provider value={storyContextValue}>
        <Buttons />
      </StoryContext.Provider>
    </MetaBoxesContext.Provider>
  );
  return {
    autoSave,
    saveStory,
    focusChecklistTab,
  };
}

describe('Buttons', () => {
  const FUTURE_DATE = '2022-01-01T20:20:20Z';
  let modalWrapper;

  beforeAll(() => {
    modalWrapper = document.createElement('aside');
    document.documentElement.appendChild(modalWrapper);
    setAppElement(modalWrapper);
    MockDate.set('2020-07-15T12:00:00+00:00');
  });

  afterAll(() => {
    document.documentElement.removeChild(modalWrapper);
    MockDate.reset();
  });

  it('should always display history and preview buttons', () => {
    arrange();
    expect(
      screen.queryByRole('button', { name: 'Undo Changes' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Redo Changes' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).toBeInTheDocument();
  });

  it('should display Publish button for draft stories', () => {
    arrange();
    expect(
      screen.queryByRole('button', { name: 'Save draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).toBeInTheDocument();
  });

  it('should display Update button for published stories', () => {
    arrange({
      story: { status: 'publish' },
    });
    expect(
      screen.queryByRole('button', { name: 'Switch to Draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Update' })
    ).toBeInTheDocument();
  });

  it('should display Submit for Review button for draft stories if lacking capabilities', () => {
    arrange({
      storyState: { capabilities: { publish: false } },
    });
    expect(
      screen.queryByRole('button', { name: 'Save draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit for review' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).not.toBeInTheDocument();
  });

  it('should display three buttons for pending stories', () => {
    arrange({
      story: { status: 'pending' },
    });
    expect(
      screen.queryByRole('button', { name: 'Switch to Draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save as pending' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).toBeInTheDocument();
  });

  it('should display two buttons for pending stories if lacking capabilities', () => {
    arrange({
      story: { status: 'pending' },
      storyState: { capabilities: { publish: false } },
    });
    expect(
      screen.queryByRole('button', { name: 'Switch to Draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit for review' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).not.toBeInTheDocument();
  });

  it('should display Switch to draft button when published', () => {
    const { saveStory } = arrange({
      story: { status: 'publish' },
    });
    const draftButton = screen.getByRole('button', { name: 'Switch to Draft' });

    fireEvent.click(draftButton);
    expect(saveStory).toHaveBeenCalledTimes(1);
  });

  it('should display Schedule button when future date is set', () => {
    const { saveStory } = arrange({
      story: {
        title: 'Some title',
        status: 'draft',
        date: FUTURE_DATE,
      },
    });
    const scheduleButton = screen.getByRole('button', { name: 'Schedule' });

    fireEvent.click(scheduleButton);
    expect(saveStory).toHaveBeenCalledTimes(1);
  });

  it('should display Schedule button with future status', () => {
    arrange({
      story: {
        status: 'future',
        date: FUTURE_DATE,
      },
    });
    expect(
      screen.queryByRole('button', { name: 'Schedule' })
    ).toBeInTheDocument();
  });

  it('should display loading indicator while the story is updating', () => {
    arrange({ meta: { isSaving: true } });
    expect(screen.queryByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Preview' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Publish' })).toBeDisabled();
  });
});
