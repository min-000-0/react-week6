import { useState, useEffect } from "react";
import axios from "axios";
import { currency } from "../../utils/filter";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart () {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const getCart = async () => {
            try {
                const url = `${API_BASE}/api/${API_PATH}/cart`;
                const response = await axios.get(url);
                setCart(response.data.data);
            } catch (error) {
                console.log(error.response.data);
            }
        };
        getCart()
    }, []);

    const updateCart = async (cartId, productId, qty = 1) => {
        try {
            const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;
            const data = {
                product_id: productId,
                qty,
            };
            await axios.put(url, { data });
        } catch (error) {
            console.log(error.response.data);
        }

        try {
            const url = `${API_BASE}/api/${API_PATH}/cart`;
            const response = await axios.get(url);
            setCart(response.data.data);
        } catch (error) {
            console.log(error.response.data);
        }
    };

    const deleteCart = async (cartId) => {
        try {
            const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;
            await axios.delete(url);
        } catch (error) {
            console.log(error.response.data);
        }

        try {
            const url = `${API_BASE}/api/${API_PATH}/cart`;
            const response = await axios.get(url);
            setCart(response.data.data);
        } catch (error) {
            console.log(error.response.data);
        }
    };

    const deleteCartAll = async () => {
        try {
            const url = `${API_BASE}/api/${API_PATH}/carts`;
            await axios.delete(url);
        } catch (error) {
            console.log(error.response.data);
        }
        try {
            const url = `${API_BASE}/api/${API_PATH}/cart`;
            const response = await axios.get(url);
            setCart(response.data.data);
        } catch (error) {
            console.log(error.response.data);
        }
    };

    return (
        <div className="container">
            <h2>購物車列表</h2>
        <div className="text-end mt-4">
            <button type="button" className="btn btn-outline-danger"
                onClick={() => deleteCartAll()}
            >
                清空購物車
            </button>
        </div>
        <table className="table">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">品名</th>
                    <th scope="col">數量/單位</th>
                    <th scope="col">小計</th>
                </tr>
            </thead>
            <tbody>
                { cart?.carts?.map((cartItem) => (
                        <tr key={cartItem.id}>
                            <td>
                                <button type="button" className="btn btn-outline-danger btn-sm"
                                    onClick={() => deleteCart(cartItem.id)}
                                >
                                    刪除
                                </button>
                            </td>
                            <th scope="row">{cartItem.product.title}</th>
                            <td>
                                <div className="input-group input-group-sm mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-sm"
                                        defaultValue={cartItem.qty}
                                        onChange={(e) =>
                                            updateCart(
                                                cartItem.id,
                                                cartItem.product_id,
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    <span className="input-group-text" id="inputGroup-sizing-sm">
                                        {cartItem.product.unit}
                                    </span>
                                </div>
                            </td>
                            <td className="text-end">
                                { currency(cartItem.final_total)}
                            </td>
                        </tr>
                    ))
                }
            </tbody>
            <tfoot>
                <tr>
                    <td className="text-end" colSpan="3">
                    總計
                    </td>
                    <td className="text-end">{currency(cart.final_total)}</td>
                </tr>
            </tfoot>
        </table>
        </div>
    )
}

export default Cart