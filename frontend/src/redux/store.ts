import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  type PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import authSlice from "./slices/authSlice";
import restaurantSlice from "./slices/restaurantSlice";
import themeSlice from "./slices/themeSlice";

// Define RootState type based on combined reducer
const rootReducer = combineReducers({
  auth: authSlice,
  restaurant: restaurantSlice,
  theme: themeSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

// Define persist config type with generics
const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: ["auth", "theme"],
};

// Wrap root reducer with persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with proper middleware typing
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export store types
export type AppDispatch = typeof store.dispatch;
