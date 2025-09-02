import axios from "axios";
import {
  getAllCompanyFail,
  getAllCompanySuccess,
  loadingStart,
  btnLoadingStart,
  addCompanySuccess,
  addCompanyFail,
  getSingleCompanySuccess,
  getSingleCompanyFail,
  deleteCompanySuccess,
  deleteCompanyFail,
} from "../reducer/comapnyReducer";
import Cookies from "js-cookie";

export const getAllCompany = () => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch({ type: 'COMPANY_FAIL', payload: 'Please login first.' });
      return;
    }
    const { data } = await axios.get(
      "/api/company/all?token=" + token
    );

    dispatch(getAllCompanySuccess(data));
  } catch (error) {
    dispatch(getAllCompanyFail(error.response.data.message));
  }
};

export const addCompany = (formdata, clearData) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const { data } = await axios.post(
      "/api/company/new?token=" + Cookies.get("token"),
      formdata
    );

    dispatch(addCompanySuccess(data));
    dispatch(getAllCompany());
    clearData();
  } catch (error) {
    dispatch(addCompanyFail(error.response.data.message));
  }
};

export const getSingleCompany = (id) => async (dispatch) => {
  if (!id || isNaN(Number(id))) {
    dispatch(getSingleCompanyFail("Invalid company ID."));
    return;
  }
  try {
    dispatch(loadingStart());
    const { data } = await axios.get(
      "/api/company/single?token=" + Cookies.get("token") + "&id=" + Number(id)
    );
    dispatch(getSingleCompanySuccess(data));
  } catch (error) {
    dispatch(getSingleCompanyFail(error.response?.data?.message || "Error fetching company."));
  }
};
export const deleteCompany = (id) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const { data } = await axios.delete(
      "/api/company/delete?token=" + Cookies.get("token") + "&id=" + id
    );

    dispatch(deleteCompanySuccess(data));
    dispatch(getAllCompany());
  } catch (error) {
    dispatch(deleteCompanyFail(error.response.data.message));
  }
};