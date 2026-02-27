import ProductModal from "../components/ProductModal";
import Pagination from "../components/Pagination";
import { useForm } from "react-hook-form";

import { useEffect, useState, useRef } from "react";
import * as bootstrap from "bootstrap";
import axios from "axios";

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

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onChange',
  });

  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"
  const [pagination, setPagination] = useState({})

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


  const getProduct = async ( page = 1 ) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination)
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

  const onSubmit = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
    //   getProduct();
    //   setIsAuth(true);
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


    const checkLogin = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
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
          <form className="form-floating" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                {...register("username", {
                required: "請輸入 Email",
                pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email 格式不正確",
                },
                })}
              />
              <label htmlFor="username">Email address</label>
              {
                errors.username && (
                    <p className="text-danger">{errors.username.message}</p>
                )
              }
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                {...register("password", {
                    required: "請輸入密碼",
                    minLength: {
                        value: 6,
                        message: "密碼長度至少需 6 碼",
                    },
                })}
              />
              <label htmlFor="password">Password</label>
              {
                errors.password && (
                    <p className="text-danger">{errors.password.message}</p>
                )
              }
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
          <Pagination pagination={pagination} onChangePage={getProduct}/>
        </div>
      )}

      <ProductModal
        modalType={modalType} templateProduct={templateProduct} handleModelInputChange={handleModelInputChange} handleAddImage={handleAddImage} handleRemoveImage={handleRemoveImage} updateProductData={updateProductData} deleteProductData={deleteProductData} closeModal={closeModal}
      />
    </>
  );
}

export default Login;
