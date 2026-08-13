import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ecommerceService, { Product, Category, Order, Customer } from '@/services/ecommerce.service';

interface EcommerceState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EcommerceState = {
  products: [],
  categories: [],
  orders: [],
  customers: [],
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('ecommerce/fetchProducts', async (filters: any, { rejectWithValue }) => {
  try {
    return await ecommerceService.getAllProducts(filters);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchCategories = createAsyncThunk('ecommerce/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return await ecommerceService.getAllCategories();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchOrders = createAsyncThunk('ecommerce/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await ecommerceService.getAllOrders();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchCustomers = createAsyncThunk('ecommerce/fetchCustomers', async (_, { rejectWithValue }) => {
  try {
    return await ecommerceService.getAllCustomers();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
  }
});

export const deleteProduct = createAsyncThunk('ecommerce/deleteProduct', async (id: number, { rejectWithValue }) => {
  try {
    await ecommerceService.deleteProduct(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
  }
});

const ecommerceSlice = createSlice({
  name: 'ecommerce',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Orders
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      // Customers
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      // Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      });
  },
});

export default ecommerceSlice.reducer;
