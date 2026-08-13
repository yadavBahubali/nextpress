import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersService } from '@/services/users.service';
import { authorsService } from '@/services/authors.service';

interface UsersState {
  users: any[];
  authors: any[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  authors: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

// Users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getAll();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      const response = await usersService.create(data);
      dispatch(fetchUsers());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: number; data: any }, { dispatch, rejectWithValue }) => {
    try {
      const response = await usersService.update(id, data);
      dispatch(fetchUsers());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await usersService.delete(id);
      dispatch(fetchUsers());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Authors
export const fetchAuthors = createAsyncThunk(
  'users/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authorsService.getAll();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch authors');
    }
  }
);

export const createAuthor = createAsyncThunk(
  'authors/create',
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      const response = await authorsService.create(data);
      dispatch(fetchAuthors());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create author');
    }
  }
);

export const updateAuthor = createAsyncThunk(
  'authors/update',
  async ({ id, data }: { id: number; data: any }, { dispatch, rejectWithValue }) => {
    try {
      const response = await authorsService.update(id, data);
      dispatch(fetchAuthors());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update author');
    }
  }
);

export const deleteAuthor = createAsyncThunk(
  'authors/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await authorsService.delete(id);
      dispatch(fetchAuthors());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete author');
    }
  }
);


const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Authors
      .addCase(fetchAuthors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authors = action.payload;
        state.error = null;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Saving State (Generic for Create/Update/Delete)
      .addMatcher(
        (action) => action.type.endsWith('/pending') && (action.type.includes('create') || action.type.includes('update') || action.type.includes('delete')),
        (state) => { state.isSaving = true; }
      )
      .addMatcher(
        (action) => (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && (action.type.includes('create') || action.type.includes('update') || action.type.includes('delete')),
        (state) => { state.isSaving = false; }
      );
  },
});

export default userSlice.reducer;
