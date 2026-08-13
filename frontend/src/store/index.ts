import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import menuReducer from './slices/menuSlice';
import menuBuilderReducer from './slices/menuBuilderSlice';
import settingsReducer from './slices/settingsSlice';
import pageReducer from './slices/pageSlice';
import blogReducer from './slices/blogSlice';
import mediaReducer from './slices/mediaSlice';
import acfReducer from './slices/acfSlice';
import userReducer from './slices/userSlice';
import seoReducer from './slices/seoSlice';
import editorReducer from './slices/editorSlice';
import formReducer from './slices/formSlice';
import careerReducer from './slices/careerSlice';
import ecommerceReducer from './slices/ecommerceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    menuBuilder: menuBuilderReducer,
    settings: settingsReducer,
    pages: pageReducer,
    blogs: blogReducer,
    media: mediaReducer,
    acf: acfReducer,
    users: userReducer,
    seo: seoReducer,
    editor: editorReducer,
    forms: formReducer,
    careers: careerReducer,
    ecommerce: ecommerceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for typed dispatch and selector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
