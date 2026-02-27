import { createHashRouter } from "react-router";
import FrontendLayout from './layout/FrontendLayout';
import NotFound from "./views/front/NotFound";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";

export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "product", element: <Products /> },
            { path: "product/:id", element: <SingleProduct /> },
            { path: "cart", element: <Cart /> }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])