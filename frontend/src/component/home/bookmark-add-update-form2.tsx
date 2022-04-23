import React from 'react';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { CategoriesStateType, useCategoriesState } from './use-categories-state';
import { Category } from './category';
import { OperationContext } from 'urql';
import { Spinner } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { useAddUpdateForm } from '../../hook/use-add-update-form';

import {
  Bookmark,
  useBookmarkAddMutation,
  useBookmarkDeleteMutation,
  useBookmarkUpdateMutation,
} from '../../generated/graphql';
import { BoxOutlined } from '../box-outlined';

interface Props {
  bookmark?: Bookmark | null;
  categories: CategoriesStateType;
  setShowForm: (value: React.SetStateAction<boolean>) => void;
  userReexec: (opts?: Partial<OperationContext> | undefined) => void;
}

export const BookmarkAddUpdateForm2: React.FC<Props> = (p) => {
  /*
   * categories
   */
  const initialCategories = (): CategoriesStateType => {
    if (p.categories) {
      return p.categories?.map((e1) => {
        const hasBookmarkCategory = p.bookmark?.categories?.find((e2) => e2?.id === e1?.id);
        return {
          ...e1,
          selected: hasBookmarkCategory ? true : false,
        };
      });
    }
    return null;
  };

  const {
    // todo: use normal names
    categories: bookmarkCategories,
    toggleCategorySelected: toggleBookmarkCategorySelected,
  } = useCategoriesState(initialCategories());

  const BookmarkCategories = bookmarkCategories?.map((e) => (
    <Category
      //
      category={e}
      key={e?.id}
      size="xs"
      toggleCategorySelected={toggleBookmarkCategorySelected}
    />
  ));

  /*
   * fields
   */
  // todo: pass in bookmark
  const f = useAddUpdateForm({
    description: p.bookmark?.description || '',
    url: p.bookmark?.url || '',
  });

  const [_, bookmarkAddMutation] = useBookmarkAddMutation();
  const [__, bookmarkUpdateMutation] = useBookmarkUpdateMutation();
  const [___, deleteMutation] = useBookmarkDeleteMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const categoryIds = bookmarkCategories?.filter((e) => e?.selected).map((e) => e?.id) as number[];

    let res;
    if (p.bookmark?.id) {
      res = await bookmarkUpdateMutation({
        categoryIds,
        description: f.description,
        id: p.bookmark.id,
        url: f.url,
      });
    } else {
      res = await bookmarkAddMutation({
        categoryIds,
        description: f.description,
        url: f.url,
      });
    }

    if (res?.error) {
      console.log(res.error);
      return;
    }

    p.userReexec();
    p.setShowForm(false);
  };

  const handleDelete: React.MouseEventHandler = async (e) => {
    const res = await deleteMutation({ id: p.bookmark?.id! });
    if (res.error) return;
    p.userReexec();
  };

  return (
    <form onSubmit={handleSubmit}>
      {BookmarkCategories && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {BookmarkCategories}
        </div>
      )}
      <Box className="element">
        <Input
          //
          name="url"
          onChange={f.handleUrl}
          placeholder="url"
          value={f.url}
        />
      </Box>

      {/* todo: spinner inside description box */}
      {f.pageTitleRes.fetching && <Spinner />}
      {f.pageTitleRes.error && (
        <BoxOutlined bg="yellow" className="block">
          <Box
            className="element"
            style={{
              display: 'flex',
            }}
          >
            <Box
              style={{
                marginRight: '.5rem',
              }}
            >
              <WarningTwoIcon />
            </Box>
            <Text>Autofill description doesn't work for this page.</Text>
          </Box>
        </BoxOutlined>
      )}

      <Box className="element">
        <Input
          //
          name="description"
          onChange={f.handleDescription}
          placeholder="description"
          value={f.description}
        />
      </Box>

      <Box
        className="element"
        style={{
          display: 'flex',
        }}
      >
        <Button
          colorScheme="blue"
          isFullWidth
          style={{
            marginRight: '.5rem',
          }}
          type="submit"
        >
          Submit
        </Button>

        {p.bookmark && (
          <Button
            //
            colorScheme="red"
            isFullWidth
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </Box>
    </form>
  );
};
