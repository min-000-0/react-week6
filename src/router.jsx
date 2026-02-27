import { createHashRouter } from "react-router";
import FrontendLayout from './layout/FrontendLayout';
import NotFound from "./views/front/NotFound";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import CheckOut from "./views/front/CheckOut";
import Login from "./views/Login"

export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "product", element: <Products /> },
            { path: "product/:id", element: <SingleProduct /> },
            { path: "cart", element: <Cart /> },
            { path: "checkout", element: <CheckOut /> },
            { path: "login", element: <Login /> },
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])