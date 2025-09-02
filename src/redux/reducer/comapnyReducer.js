import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: null,
  message: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearMessage(state) {
      state.message = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
    loadingStart(state) {
      state.loading = true;
    },
    btnLoadingStart(state) {
      state.btnLoading = true;
    },
    getAllCompanySuccess(state, action) {
      state.companies = action.payload;
      state.loading = false;
    },
    getAllCompanyFail(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    addCompanySuccess(state, action) {
      state.message = action.payload;
      state.btnLoading = false;
    },
    addCompanyFail(state, action) {
      state.error = action.payload;
      state.btnLoading = false;
    },
    getSingleCompanySuccess(state, action) {
  state.company = action.payload.company;
      state.loading = false;
    },
    getSingleCompanyFail(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    deleteCompanySuccess(state, action) {
      state.message = action.payload;
      state.loading = false;
    },
    deleteCompanyFail(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  clearError,
  clearMessage,
  setError,
  setMessage,
  loadingStart,
  btnLoadingStart,
  getAllCompanySuccess,
  getAllCompanyFail,
  addCompanySuccess,
  addCompanyFail,
  getSingleCompanySuccess,
  getSingleCompanyFail,
  deleteCompanySuccess,
  deleteCompanyFail
} = companySlice.actions;
export default companySlice.reducer;
