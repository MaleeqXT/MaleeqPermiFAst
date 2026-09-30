  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import http from '../../helpers/http';

  const preloadProfileImage = (user) => {
    if (typeof window === "undefined" || !user) return;

    const raw = typeof user.media === "string" ? user.media
      : user.media?.path || user.media?.url || user.profile_photo_url || user.avatar || null;
    if (!raw) return;

    const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
    const value = String(raw).trim();
    const storagePosition = value.indexOf("/storage/");
    const source = storagePosition >= 0 ? `${baseUrl}${value.slice(storagePosition)}`
      : /^https?:\/\//i.test(value) ? value
        : `${baseUrl}/storage/${value.replace(/^\/?storage\//, "")}`;

    const image = new Image();
    image.src = source;
  };


  export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password, remember = false }, { rejectWithValue }) => {
      try {
        const response = await http.post('/auth/login', { email, password, remember });
        if (response.data?.token) {
          window.localStorage.setItem('ppf_auth_token', response.data.token);
        }
        preloadProfileImage(response.data.user);
        return response.data.user;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Impossible de joindre le serveur.' });
      }
    }
  );

  // Logout Thunk
  export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
      try {
        await http.post('/auth/logout');
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Impossible de fermer la session.' });
      } finally {
        window.localStorage.removeItem('ppf_auth_token');
      }
    }
  );

  export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get('/auth/me'); // cookie automatically sent if configured
      preloadProfileImage(response.data.user);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Unauthorized' });
    }
  }
);



  const authReducer = createSlice({
    name: 'auth',
    initialState: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
    reducers: {
      clearError: (state) => {
        state.error = null;
      }
    },
    extraReducers: (builder) => {
      builder
        // Login
        .addCase(loginUser.pending, (state) => {
          state.loading = true;
          state.error   = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.loading         = false;
          state.user            = action.payload;
          state.isAuthenticated = true;
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.loading = false;
          state.error   = action.payload;
        })
        // Logout
        .addCase(logoutUser.fulfilled, (state) => {
          state.user            = null;
          state.isAuthenticated = false;
        })
        .addCase(logoutUser.rejected, (state) => {
          // The client must still leave the protected area if the server
          // session has already expired or cannot be reached.
          state.user            = null;
          state.isAuthenticated = false;
        })

        //auth me
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.user            = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(fetchCurrentUser.rejected, (state) => {
            state.user            = null;
            state.isAuthenticated = false;
        });

    }
  });

  export const { clearError } = authReducer.actions;
  export default authReducer.reducer;
