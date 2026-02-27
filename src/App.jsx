import { useEffect, useState, useRef } from "react";
import * as bootstrap from "bootstrap";
import axios from "axios";

import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"

  // useRef 建立對 DOM 元素的參照
  const productModalRef = useRef(null);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const handleModelInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 圖片處理
  const handleImageChange = (index, value) => {
    setTemplateProduct((preData) => {
      const newImages = [...preData.imagesUrl];
      newImages[index] = value;

      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
        newImages.pop();
      }

      return { ...preData, imagesUrl: newImages };
    });
  };

  // 新增圖片
  const handleAddImage = () => {
    setTemplateProduct((preData) => ({
      ...preData,
      imagesUrl: [...preData.imagesUrl, ""],
    }));
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setTemplateProduct((preData) => {
      const newImages = [...preData.imagesUrl];
      newImages.pop();
      return { ...preData, imagesUrl: newImages };
    });
  };


  const getProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  // 新增/更新產品
  const updateProductData = async (id) => {
    // 決定 API 端點和方法
    let url;
    let method;

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    } else if (modalType === "create") {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = "post";
    }

    // 準備要送出的資料（注意格式！）
    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price), // 轉換為數字
        price: Number(templateProduct.price), // 轉換為數字
        is_enabled: templateProduct.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: templateProduct.imagesUrl.filter((url) => url !== ""), // 過濾空白
      },
    };

    try {
      let response;
      if (method === "put") {
        response = await axios.put(url, productData);
        console.log("產品更新成功：", response.data);
        alert("產品更新成功！");
      } else {
        response = await axios.post(url, productData);
        console.log("產品新增成功：", response.data);
        alert("產品新增成功！");
      }

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProduct();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error(`${modalType === "edit" ? "更新" : "新增"}失敗：`, errorMsg);
      alert(`${modalType === "edit" ? "更新" : "新增"}失敗：${errorMsg}`);
    }
  };

  // 刪除產品
  const deleteProductData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      console.log("產品刪除成功：", response.data);
      alert("產品刪除成功！");

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProduct();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("刪除失敗：", errorMsg);
      alert("刪除失敗：" + errorMsg);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      getProduct();
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };


  useEffect(() => {
    // 檢查登入狀態
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }

    productModalRef.current = new bootstrap.Modal("#productModal");


    const checkLogin = async (e) => {
      try {
        const res = await axios.post(`${API_BASE}/api/user/check`);
        console.log(res.data);
        setIsAuth(true)
        getProduct()
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    // 檢查管理員權限並載入資料
    checkLogin();
  }, []);

  // 使用 ref 控制 Modal
  const openModal = (product, type) => {
    setTemplateProduct((preData) => ({
      ...preData,
      ...product,
    }));

    setModalType(type);
    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };


  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal({}, "create")}>
              建立新的產品
            </button>
          </div>
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">分類</th>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">編輯</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.category}</td>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td className={`${product.is_enabled ? 'text-success' : ''}`}>
                    {product.is_enabled ? '啟用' : '未啟用'}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openModal(product, "edit")}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openModal(product, "delete")}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`"modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white"`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalType === 'delete' ? '刪除產品' :
                    modalType === 'edit' ? '編輯產品' : '新增產品'}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {
                modalType === 'delete' ? (
                  <p className="fs-4">
                    確定要刪除
                    <span className="text-danger">{templateProduct.title}</span>嗎？
                  </p>
                ) : (
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="mb-2">
                        <div className="mb-3">
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                            value={templateProduct.imageUrl}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                        </div>
                        {
                          templateProduct.imageUrl && (
                            <img className="img-fluid" src={templateProduct.imageUrl} alt="主圖" />
                          )
                        }
                      </div>
                      <div>
                        {
                          templateProduct.imagesUrl.map((url, index) => {
                            <div key={index}>
                              <label htmlFor="imageUrl" className="form-label">
                                輸入圖片網址
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={url}
                                onChange={(e) => handleImageChange(index, e.target.value)}
                              />
                              {
                                url && (
                                  <img
                                    className="img-fluid"
                                    src={url}
                                  />
                                )
                              }
                            </div>
                          })
                        }
                        <button className="btn btn-outline-primary btn-sm d-block w-100"
                          onClick={() => handleAddImage()}
                        >
                          新增圖片
                        </button>
                      </div>
                      <div>
                        <button className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={() => handleRemoveImage()}
                        >
                          刪除圖片
                        </button>
                      </div>
                    </div>
                    <div className="col-sm-8">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">標題</label>
                        <input
                          name="title"
                          id="title"
                          type="text"
                          className="form-control"
                          placeholder="請輸入標題"
                          value={templateProduct.title}
                          onChange={(e) => { handleModelInputChange(e) }}
                        />
                      </div>

                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label htmlFor="category" className="form-label">分類</label>
                          <input
                            name="category"
                            id="category"
                            type="text"
                            className="form-control"
                            placeholder="請輸入分類"
                            value={templateProduct.category}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                        </div>
                        <div className="mb-3 col-md-6">
                          <label htmlFor="unit" className="form-label">單位</label>
                          <input
                            name="unit"
                            id="unit"
                            type="text"
                            className="form-control"
                            placeholder="請輸入單位"
                            value={templateProduct.unit}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label htmlFor="origin_price" className="form-label">原價</label>
                          <input
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="請輸入原價"
                            value={templateProduct.origin_price}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                        </div>
                        <div className="mb-3 col-md-6">
                          <label htmlFor="price" className="form-label">售價</label>
                          <input
                            name="price"
                            id="price"
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="請輸入售價"
                            value={templateProduct.price}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                        </div>
                      </div>
                      <hr />

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">產品描述</label>
                        <textarea
                          name="description"
                          id="description"
                          className="form-control"
                          placeholder="請輸入產品描述"
                          value={templateProduct.description}
                          onChange={(e) => { handleModelInputChange(e) }}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">說明內容</label>
                        <textarea
                          name="content"
                          id="content"
                          className="form-control"
                          placeholder="請輸入說明內容"
                          value={templateProduct.content}
                          onChange={(e) => { handleModelInputChange(e) }}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            name="is_enabled"
                            id="is_enabled"
                            className="form-check-input"
                            type="checkbox"
                            checked={templateProduct.is_enabled}
                            onChange={(e) => { handleModelInputChange(e) }}
                          />
                          <label className="form-check-label" htmlFor="is_enabled">
                            是否啟用
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="modal-footer">
              {
                modalType === 'delete' ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteProductData(templateProduct.id)}
                  >
                    刪除
                  </button>
                ) : (
                  <div>
                    <button type="button" className="btn btn-primary"
                      onClick={() => updateProductData(templateProduct.id)}
                    >
                      確認
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      data-bs-dismiss="modal"
                      onClick={() => closeModal()}
                    >
                      取消
                    </button>

                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
