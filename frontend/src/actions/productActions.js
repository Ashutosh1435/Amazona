import {
    PRODUCT_CREATE_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
    PRODUCT_REVIEW_SAVE_REQUEST,
    PRODUCT_REVIEW_SAVE_SUCCESS,
    PRODUCT_REVIEW_SAVE_FAIL
} from "../constants/productConstants"
import Axios from "axios";

export const listProducts = (category = "", searchKeyword = "", sortOrder = "") => async (dispatch) => {
    dispatch({
        type: PRODUCT_LIST_REQUEST
    });
    try {
        const { data } = await Axios.get('/api/products?category=' + category
            + "&searchKeyword=" + searchKeyword + '&sortOrder=' + sortOrder);
        dispatch({ type: PRODUCT_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: PRODUCT_LIST_FAIL, payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
        });
    }
}

export const detailsProduct = (productId) => async (dispatch) => {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    try {
        const { data } = await Axios.get(`/api/products/${productId}`);
        dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL, payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message
        });
    }
}

export const createProduct = () => async (dispatch, getState) => {
    dispatch({ type: PRODUCT_CREATE_REQUEST, });
    const { userSignin: { userInfo } } = getState();
    try {
        //  2nd & 3rd parameters are optional. request-payload and header values.
        const { data } = await Axios.post('/api/products', {}, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        dispatch({ type: PRODUCT_CREATE_SUCCESS, payload: data.product });
    } catch (error) {
        dispatch({
            type: PRODUCT_CREATE_FAIL, payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
        })
    }
}

export const updateProduct = (product) => async (dispatch, getState) => {
    dispatch({ type: PRODUCT_UPDATE_REQUEST, payload: product });
    const { userSignin: { userInfo } } = getState();
    try {
        const { data } = await Axios.put(`/api/products/${product._id}`, product, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        dispatch({ type: PRODUCT_UPDATE_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: PRODUCT_UPDATE_FAIL, payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
        })
    }
}
export const deleteProduct = (id) => async (dispatch, getState) => {
    dispatch({ type: PRODUCT_DELETE_REQUEST, payload: id });
    const { userSignin: { userInfo } } = getState();
    try {
        const { data } = await Axios.delete(`/api/products/${id}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: PRODUCT_DELETE_SUCCESS });
    } catch (error) {
        dispatch({
            type: PRODUCT_DELETE_FAIL, payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
        })
    }
}

export const saveProductReview = (productId, review) => async (dispatch, getState) => {
    try {
        const { userSignin: { userInfo: { token } } } = getState();
        dispatch({ type: PRODUCT_REVIEW_SAVE_REQUEST, payload: review })
        const { data } = await Axios.post(`/api/products/${productId}/reviews`, review, {
            headers: { Authorization: `Bearer ${token}`, }
        })
        dispatch({ type: PRODUCT_REVIEW_SAVE_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: PRODUCT_REVIEW_SAVE_FAIL, payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
        })
    }
}
