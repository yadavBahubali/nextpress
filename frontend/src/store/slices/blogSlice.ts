import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogsService } from '@/services/blogs.service';

interface BlogsState {
  posts: any[];
  categories: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  posts: [],
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'blog/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await blogsService.getAll();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'blog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await blogsService.getAllCategories();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'blog/createCategory',
  async (data: { name: string; slug: string; description?: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await blogsService.createCategory(data);
      dispatch(fetchCategories());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'blog/updateCategory',
  async ({ id, data }: { id: number | string, data: { name: string; slug: string; description?: string } }, { dispatch, rejectWithValue }) => {
    try {
      const response = await blogsService.updateCategory(id, data);
      dispatch(fetchCategories());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'blog/deleteCategory',
  async (id: number | string, { dispatch, rejectWithValue }) => {
    try {
      await blogsService.deleteCategory(id);
      dispatch(fetchCategories());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const deletePost = createAsyncThunk(
  'blog/deletePost',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await blogsService.delete(id);
      dispatch(fetchPosts());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);


const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default blogSlice.reducer;
