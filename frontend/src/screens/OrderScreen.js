import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deliverOrder, detailsOrder, payOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { ORDER_DELIVER_RESET, ORDER_PAY_RESET } from '../constants/orderConstants';

export default function OrderScreen(props) {

    const orderId = props.match.params.id;
    const [sdkReady, setSdkReady] = useState(false);
    const orderDetails = useSelector((state) => state.orderDetails);
    const { order, loading, error } = orderDetails;
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin;
    const orderDeliver = useSelector((state) => state.orderDeliver);
    const {
        loading: loadingDeliver,
        error: errorDeliver,
        success: successDeliver,
    } = orderDeliver;
    const dispatch = useDispatch();

    useEffect(() => {
        if (!order  || successDeliver || (order && order._id !== orderId)) {
            dispatch({ type: ORDER_PAY_RESET });
            dispatch({ type: ORDER_DELIVER_RESET });
            dispatch(detailsOrder(orderId));
        } else {
            if (!order.isPaid) {
                setSdkReady(true);
            }
        }
    }, [dispatch, order, orderId, sdkReady, successDeliver]);

    const paymentHandler = (e) => {
        e.preventDefault();
        const data = {
            purpose: "Goods Payment",
            amount: order.totalPrice,
            buyer_name: userInfo.name,
            email_address: userInfo.email,
            phone: order.shippingAddress.phone,
            order_id: order._id,
            redirect_url: `http://localhost:4100/callback?order_id=${order._id}`,
            webhook_url: '/webhook/',
        };
        Axios.post(`/api/orders/${order._id}/pay`, data, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
        })
            .then(res => {
                console.log('resp', res.data.url)
                window.location.href = String(res.data.url);
            })
            .catch((error) => { console.warn(error); })
    };
    const deliverHandler = () => {
        dispatch(deliverOrder(order._id));
    }
    
    return loading ? (
        <LoadingBox></LoadingBox>
    ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
    ) : (
                <div>
                    <h1>Order {order._id}</h1>
                    <div className="row top">
                        <div className="col-2">
                            <ul>
                                <li>
                                    <div className="card card-body">
                                        <h2>Shipping</h2>
                                        <p>
                                            <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                                            <strong>Address: </strong> {order.shippingAddress.address},
                  {order.shippingAddress.city},{' '}
                                            {order.shippingAddress.postalCode},
                  {order.shippingAddress.country}
                                        </p>
                                        {order.isDelivered ? (
                                            <MessageBox variant="success">
                                                Delivered at {order.deliveredAt}
                                            </MessageBox>
                                        ) : (
                                                <MessageBox variant="danger">Not Delivered</MessageBox>
                                            )}
                                    </div>
                                </li>
                                <li>
                                    <div className="card card-body">
                                        <h2>Payment</h2>
                                        <p>
                                            <strong>Method:</strong> {order.paymentMethod}
                                        </p>
                                        {order.isPaid ? (
                                            <MessageBox variant="success">
                                                Paid at {order.paidAt}
                                            </MessageBox>
                                        ) : (
                                                <MessageBox variant="danger">Not Paid</MessageBox>
                                            )}
                                    </div>
                                </li>
                                <li>
                                    <div className="card card-body">
                                        <h2>Order Items</h2>
                                        <ul>
                                            {order.orderItems.map((item) => (
                                                <li key={item.product}>
                                                    <div className="row">
                                                        <div>
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="small"
                                                            ></img>
                                                        </div>
                                                        <div className="min-30">
                                                            <Link to={`/product/{item.product}`}>
                                                                {item.name}
                                                            </Link>
                                                        </div>

                                                        <div>
                                                            {item.qty} x Rs{" "}{item.price} = Rs{" "}{item.qty * item.price}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="col-1">
                            <div className="card card-body">
                                <ul>
                                    <li>
                                        <h2>Order Summary</h2>
                                    </li>
                                    <li>
                                        <div className="row">
                                            <div>Items</div>
                                            <div>Rs{" "}{order.itemsPrice.toFixed(2)}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="row">
                                            <div>Shipping</div>
                                            <div>Rs{" "}{order.shippingPrice.toFixed(2)}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="row">
                                            <div>Tax</div>
                                            <div>Rs{" "}{order.taxPrice.toFixed(2)}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="row">
                                            <div>
                                                <strong> Order Total</strong>
                                            </div>
                                            <div>
                                                <strong>Rs{" "}{order.totalPrice.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </li>
                                    {!order.isPaid && (
                                        <li>
                                            {!sdkReady ? (
                                                <LoadingBox></LoadingBox>
                                            ) : (
                                                    <>
                                                                       
                                                        <button type="button" className="primary block"
                                                            onClick={(e => { paymentHandler(e) })} >Pay{" "}{order.totalPrice}</button>
                                                    </>
                                                )}
                                        </li>
                                    )}
                                    {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                        <li>
                                            <button type="button" className="primary" onClick={deliverHandler}>Deliver Order</button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
}
