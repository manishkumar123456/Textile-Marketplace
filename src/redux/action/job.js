import axios from "axios";
import {
  addJobFail,
  addJobSuccess,
  applyFail,
  applySuccess,
  btnLoadingStart,
  deleteFail,
  deleteSuccess,
  getAllJObsFail,
  getAllJObsSuccess,
  getApplicationsFail,
  getApplicationsSuccess,
  getJobofComapnyFail,
  getJobofComapnySuccess,
  getSingleJobFail,
  getSingleJobSuccess,
  loadingStart,
  saveJobFail,
  saveJobSuccess,
  updateAppFail,
  updateAppSuccess,
  updateFail,
  updateSuccess,
} from "../reducer/jobReducer";
import Cookies from "js-cookie";
import { getUser } from "./user";

export const getAllJobs = (title, location, experience) => async (dispatch) => {
  if (title === undefined) title = "";
  if (location === undefined) location = "";
  if (experience === undefined) experience = 15;
  try {
    dispatch(loadingStart());

    const { data } = await axios.get(
      "/api/job/all?title=" +
        title +
        "&location=" +
        location +
        "&experience=" +
        experience
    );

    dispatch(getAllJObsSuccess(data));
  } catch (error) {
    dispatch(getAllJObsFail(error.response.data.message));
  }
};

export const AddJob =
  (
    company,
    title,
    description,
    role,
    salary,
    experience,
    location,
    openings,
    clearInput
  ) =>
  async (dispatch) => {
    try {
      dispatch(btnLoadingStart());

      const token = Cookies.get("token");
      if (!token) {
        dispatch(addJobFail('Please login first.'));
        return;
      }
      const { data } = await axios.post(
        "/api/job/new?token=" + token + "&company=" + company,
        { title, description, role, salary, experience, location, openings }
      );

      dispatch(addJobSuccess(data));
      dispatch(getAllJobs());
      clearInput();
    } catch (error) {
      dispatch(addJobFail(error.response.data.message));
    }
  };

export const getsingleJobs = (id) => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(getSingleJobFail('Please login first.'));
      return;
    }
    const { data } = await axios.get(
      "/api/job/single?token=" + token + "&id=" + id
    );

    dispatch(getSingleJobSuccess(data));
  } catch (error) {
    dispatch(getSingleJobFail(error.response.data.message));
  }
};
export const saveJob = (id) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(saveJobFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/job/save?token=" + token + "&id=" + id
    );

    dispatch(saveJobSuccess(data));
    dispatch(getsingleJobs(id));
    dispatch(getUser());
  } catch (error) {
    dispatch(saveJobFail(error.response.data.message));
  }
};

export const getAllApplications = () => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(getApplicationsFail('Please login first.'));
      return;
    }
    const { data } = await axios.get(
      "/api/job/application/all?token=" + token
    );

    dispatch(getApplicationsSuccess(data));
  } catch (error) {
    dispatch(getApplicationsFail(error.response.data.message));
  }
};

export const ApplyForJob = (id) => async (dispatch) => {
  if (!id || isNaN(Number(id))) {
    dispatch(applyFail("Job ID must be a valid integer."));
    return;
  }
  try {
    dispatch(btnLoadingStart());
    const token = Cookies.get("token");
    if (!token) {
      dispatch(applyFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/job/application/new?token=" + token + "&id=" + Number(id)
    );
    dispatch(applySuccess(data));
    dispatch(getAllApplications());
  } catch (error) {
    dispatch(applyFail(error.response?.data?.message || "Error applying for job."));
  }
};

export const updateJob =
  (
    id,
    title,
    description,
    role,
    salary,
    experience,
    location,
    openings,
    status,
    clickUpdate
  ) =>
  async (dispatch) => {
    try {
      dispatch(btnLoadingStart());

      const token = Cookies.get("token");
      if (!token) {
        dispatch(updateFail('Please login first.'));
        return;
      }
      const { data } = await axios.post(
        "/api/job/update?token=" + token + "&id=" + id,
        {
          title,
          description,
          role,
          salary,
          experience,
          location,
          openings,
          status,
        }
      );

      dispatch(updateSuccess(data));
      dispatch(getsingleJobs(id));
      clickUpdate();
    } catch (error) {
      dispatch(updateFail(error.response.data.message));
    }
  };

export const applicationofjob = (id) => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(getJobofComapnyFail('Please login first.'));
      return;
    }
    let response;
    try {
      response = await axios.get(
        "/api/job/application/company?token=" + token + "&jobId=" + id
      );
    } catch (err) {
      dispatch(getJobofComapnyFail('API request failed: ' + (err?.message || 'Unknown error')));
      return;
    }
    const data = response?.data;
    if (!data || (Array.isArray(data.applications) && data.applications.length === 0)) {
      dispatch(getJobofComapnyFail('No applications found.'));
      return;
    }
    dispatch(getJobofComapnySuccess(data));
  } catch (error) {
    dispatch(getJobofComapnyFail(error?.response?.data?.message || error?.message || 'Unknown error'));
  }
};

export const updateStatus =
  (id, jobId, value, setvalue) => async (dispatch) => {
    try {
      dispatch(btnLoadingStart());

      const token = Cookies.get("token");
      if (!token) {
        dispatch(updateAppFail('Please login first.'));
        return;
      }
      const { data } = await axios.put(
        "/api/job/application/update?token=" + token + "&id=" + id,
        { value }
      );

      dispatch(updateAppSuccess(data));
      dispatch(applicationofjob(jobId));
      // Force refresh of all job lists and company info
      dispatch(getAllJobs());
      dispatch(require("@/redux/action/company").getAllCompany());
      setvalue("");
    } catch (error) {
      dispatch(updateAppFail(error.response.data.message));
    }
  };

export const deleteJob = (id) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(deleteFail('Please login first.'));
      return;
    }
    const { data } = await axios.delete(
      "/api/job/delete?token=" + token + "&id=" + id
    );

    dispatch(deleteSuccess(data));
    dispatch(getAllJobs());
  } catch (error) {
    dispatch(deleteFail(error.response.data.message));
  }
};