import { useState, useEffect, useRef } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useForm } from "react-hook-form";
import axios from "axios";
import { currency } from "../../utils/filter";
import SingleProductModal from "../../components/SingleProductModal";
import * as bootstrap from "bootstrap"

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function CheckOut () {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState();
    const [loadingCartId, setLoadingCartId] = useState(null);
    const [loadingProductId, setLoadingProductId] = useState(null);
    const productModalRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors}
    } = useForm({
        mode: 'onChange'
    })

    useEffect(() => {
        productModalRef.current = new bootstrap.Modal("#productModal");
  
        // Modal 關閉時移除焦點
        document
            .querySelector("#productModal")
            .addEventListener("hide.bs.modal", () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            });
        const getCart = async () => {
            try {
                const url = `${API_BASE}/api/${API_PATH}/cart`;
                const response = await axios.get(url);
                setCart(response.data.data);
            } catch (error) {
                console.log(error.response.data);
            }
        };
        const getProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
                console.log(res.data.products);
                setProducts(res.data.products);
            } catch (error) {
                console.error("取得產品資料失敗", error);
            }
        };
        getProducts()
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

    const onSubmit = async (fromData) => {
        try {
            const url = `${API_BASE}/api/${API_PATH}/order`;
            await axios.post(url, { 
                data: { user: fromData, message: fromData.message } 
            });
            reset();
            try {
                const url = `${API_BASE}/api/${API_PATH}/cart`;
                const response = await axios.get(url);
                setCart(response.data.data);
            } catch (error) {
                console.log(error.response.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addCart = async (id, num =1) => {
        setLoadingCartId(id)
        const data = {
            product_id: id,
            qty: num,
        };
        try {
            const url = `${API_BASE}/api/${API_PATH}/cart`;
            await axios.post(url, { data });
        } catch (error) {
            console.log(error.response.data);
        }
        try {
            const url = `${API_BASE}/api/${API_PATH}/cart`;
            const response = await axios.get(url);
            setCart(response.data.data);
        } catch (error) {
            console.log(error.response.data);
        } finally {
            setLoadingCartId(null)
        }
    };

    const getProduct = async (id) => {
        setLoadingProductId(id)
        try {
            const res = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
            console.log(res.data.product);
            setProduct(res.data.product);
        } catch (error) {
            console.error("取得產品資料失敗", error);
        } finally {
            setLoadingProductId(null)
        }

        productModalRef.current.show();
    };

    const closeModal = () => {
        productModalRef.current.hide();
    }

    return (
        <div className="container">
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">圖片</th>
                        <th scope="col">品名</th>
                        <th scope="col">價格</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                    <td style={{ width: "200px" }}>
                        <div
                        style={{
                            height: "100px",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "4px",
                            backgroundImage: `url(${product.imageUrl})`,
                        }}
                        ></div>
                    </td>
                    <td>{product.title}</td>
                    <td>
                        <del className="h6">原價：{product.origin_price}</del>
                        <div className="h5">特價：{product.price}</div>
                    </td>
                    <td>
                        <div className="btn-group btn-group-sm">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => getProduct(product.id)}
                            disabled={loadingProductId === product.id}
                        >
                            {loadingProductId === product.id ? (
                            <RotatingLines
                                visible={true}
                                height="16"
                                width={80}
                                strokeColor="grey"
                                strokeWidth="5"
                            />
                            ) : (
                            "查看更多"
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => addCart(product.id)}
                            disabled={loadingCartId === product.id}
                        >
                            {loadingCartId === product.id ? (
                            <RotatingLines
                                visible={true}
                                height="16"
                                width={80}
                                strokeColor="grey"
                                strokeWidth="5"
                            />
                            ) : (
                            "加到購物車"
                            )}
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
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
            {/* 結帳頁面 */}
            <div className="my-5 row justify-content-center">
                <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="請輸入 Email"
                            defaultValue="test@gamil.com"
                            {...register("email", {
                                    required: "請輸入 Email",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Email 格式不正確",
                                    },
                                })
                            }
                        />
                        { errors.email && (
                                <p className="text-danger">{errors.email.message}</p>
                            )
                        }
                    </div>

                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            收件人姓名
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="form-control"
                            placeholder="請輸入姓名"
                            defaultValue="小明"
                            { ...register("name", {
                                required: "請輸入收件人姓名",
                                minLength: { value: 2, message: "姓名至少 2 個字" },
                                })
                            }
                        />
                        { errors.name&& (
                                <p className="text-danger">{errors.name.message}</p>
                            )
                        }
                    </div>

                    <div className="mb-3">
                        <label htmlFor="tel" className="form-label">
                            收件人電話
                        </label>
                        <input
                            id="tel"
                            name="tel"
                            type="tel"
                            className="form-control"
                            placeholder="請輸入電話"
                            defaultValue="0912345678"
                            {...register("tel", {
                                required: "請輸入收件人電話",
                                minLength: { value: 8, message: "電話至少 8 碼" },
                                pattern: {
                                    value: /^\d+$/,
                                    message: "電話僅能輸入數字",
                                },
                            })}
                        />
                        { errors.tel && (
                                <p className="text-danger">{errors.tel.message}</p>
                            )
                        }
                    </div>

                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">
                            收件人地址
                        </label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            className="form-control"
                            placeholder="請輸入地址"
                            defaultValue="臺北市信義區信義路5段7號"
                            {...register("address", {
                                required: "請輸入收件人地址",
                            })}
                        />
                        { errors.address && (
                                <p className="text-danger">{errors.address.message}</p>
                            )
                        }
                    </div>

                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">
                            留言
                        </label>
                        <textarea
                            id="message"
                            className="form-control"
                            cols="30"
                            rows="10"
                            {...register("message")}
                        ></textarea>
                    </div>
                    <div className="text-end">
                        <button type="submit" className="btn btn-danger">
                            送出訂單
                        </button>
                    </div>
                </form>
            </div>

            <SingleProductModal 
            product={product}
            addCart={addCart}
            closeModal={closeModal}
            />
        </div>
    )
}

export default CheckOut