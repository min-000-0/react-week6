
import { Outlet, Link } from "react-router";

const FrontendLayout = () => {
  return (
    <div>
      <header>
        <ul className="nav">
            <li className="nav-item">
                <Link className="nav-link" to="/">
                    首頁
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="/product">
                    產品頁面
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="/cart">
                    購物車
                </Link>
            </li>
        </ul>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2025 我的網站</p>
      </footer>
    </div>
  );
};

export default FrontendLayout;