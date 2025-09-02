import axios from "axios";
import {
  SkillAddFail,
  SkillremoveFail,
  btnLoadingStart,
  forgotFail,
  forgotSuccess,
  getUserFail,
  getUserProfileFail,
  getUserProfileSucces,
  getUserSucces,
  loadingStart,
  loginFail,
  loginSuccess,
  photoUpdateFail,
  photoUpdateSuccess,
  registerFail,
  registerSuccess,
  resetFail,
  resetSuccess,
  resumeUpdateFail,
  resumeUpdateSuccess,
  skillAddSuccess,
  skillremoveSuccess,
  updateFail,
  updateSuccess,
} from "../reducer/userReducer";
import Cookies from "js-cookie";
import { getAllCompany } from "./company";

export const registerUser = (formdata) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const { data } = await axios.post("/api/user/register", formdata);

    Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" });

    dispatch(registerSuccess(data));
    dispatch(getAllCompany());
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Registration failed";
    dispatch(registerFail(message));
  }
};

export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const { data } = await axios.post("/api/user/login", { email, password });

    Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" });

    dispatch(loginSuccess(data));
    dispatch(getAllCompany());
  } catch (error) {
    dispatch(loginFail(error.response.data.message));
  }
};

export const getUser = () => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(getUserFail('Please login first.'));
      return;
    }
    const { data } = await axios.get(
      "/api/user/myprofile?token=" + token
    );

    dispatch(getUserSucces(data));
  } catch (error) {
    dispatch(getUserFail(error.response.data.message));
  }
};

export const forgotPassword = (email, setEmail) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const { data } = await axios.post("/api/user/forgot", { email });

    dispatch(forgotSuccess(data));
    setEmail("");
  } catch (error) {
    dispatch(forgotFail(error.response.data.message));
  }
};

export const resetPassword =
  (password, token, setPassword) => async (dispatch) => {
    try {
      dispatch(btnLoadingStart());

      const { data } = await axios.post("/api/user/reset?token=" + token, {
        password,
      });

      dispatch(resetSuccess(data));
      setPassword("");
    } catch (error) {
      dispatch(resetFail(error.response.data.message));
    }
  };

export const updatePhoto = (formdata) => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(photoUpdateFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/user/update/profilepic?token=" + token,
      formdata
    );

    dispatch(photoUpdateSuccess(data));
    dispatch(getUser());
  } catch (error) {
    dispatch(photoUpdateFail(error.response.data.message));
  }
};

export const updateProfile = (name, phoneNumber, bio) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(updateFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/user/update/info?token=" + token,
      { name, phoneNumber, bio }
    );

    dispatch(updateSuccess(data));
    dispatch(getUser());
  } catch (error) {
    dispatch(updateFail(error.response.data.message));
  }
};

export const updateResume = (formdata) => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(resumeUpdateFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/user/update/resume?token=" + token,
      formdata
    );

    dispatch(resumeUpdateSuccess(data));
    dispatch(getUser());
  } catch (error) {
    dispatch(resumeUpdateFail(error.response.data.message));
  }
};

export const AddSkill = (skill) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(SkillAddFail('Please login first.'));
      return;
    }
    const { data } = await axios.post(
      "/api/user/skill/add?token=" + token,
      { skill }
    );

    dispatch(skillAddSuccess(data));
    dispatch(getUser());
  } catch (error) {
    dispatch(SkillAddFail(error.response.data.message));
  }
};

export const removeSkill = (skill) => async (dispatch) => {
  try {
    dispatch(btnLoadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(SkillremoveFail('Please login first.'));
      return;
    }
    const { data } = await axios.delete(
      "/api/user/skill/remove?token=" + token + "&skill=" + skill
    );

    dispatch(skillremoveSuccess(data));
    dispatch(getUser());
  } catch (error) {
    dispatch(SkillremoveFail(error.response.data.message));
  }
};

export const getUserProfile = (id) => async (dispatch) => {
  try {
    dispatch(loadingStart());

    const token = Cookies.get("token");
    if (!token) {
      dispatch(getUserProfileFail('Please login first.'));
      return;
    }
    const { data } = await axios.get(
      "/api/user/profile?token=" + token + "&id=" + id
    );

    dispatch(getUserProfileSucces(data));
  } catch (error) {
    dispatch(getUserProfileFail(error.response.data.message));
  }
};