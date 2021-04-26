import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { IProduct, IProductInCart } from "../types";

interface ICartContextData {
  cart: IProductInCart[];
  productAmount: (product: IProduct | IProductInCart) => number;
  addProduct: (product: IProduct | IProductInCart) => void;
  decrementProduct: (product: IProduct | IProductInCart) => void;
  deleteProduct: (product: IProduct | IProductInCart) => void;
}

interface ICartDataContextProps {
  children: ReactNode;
}

export const CartContext = createContext<ICartContextData>(
  {} as ICartContextData
);

export const CartDataContext = ({
  children,
}: ICartDataContextProps): JSX.Element => {
  const [cart, setCart] = useState<IProductInCart[]>(() => {
    const cartStorage = localStorage.getItem("MarketApp:cart");

    if (cartStorage) return JSON.parse(cartStorage);

    return [];
  });

  const [updatedCart, setUpdatedCart] = useState<IProductInCart[]>([]);

  useEffect(() => {
    if (updatedCart.length > 0) {
      setCart(updatedCart);
    }
  }, [updatedCart]);

  function productAmount(product: IProduct | IProductInCart) {
    const productInCart = cart.find((prod) => prod.id === product.id);

    return productInCart ? Number(productInCart.amount) : 0;
  }

  function addProduct(product: IProduct | IProductInCart) {
    const productInCart = cart.find((prod) => prod.id === product.id);

    if (!productInCart) {
      if (product.stock > 0) {
        setUpdatedCart([...cart, { ...product, amount: 1 }]);

        localStorage.setItem(
          "MarketApp:cart",
          JSON.stringify([...cart, { ...product, amount: 1 }])
        );

        toast.success("Adicionado ao Carrinho");
        return;
      }
    }

    if (productInCart && product.stock > productInCart.amount) {
      const updatedCart = cart.map((p) =>
        p.id === product.id ? { ...p, amount: Number(p.amount) + 1 } : p
      );

      setUpdatedCart([...updatedCart]);

      localStorage.setItem("MarketApp:cart", JSON.stringify(updatedCart));

      toast.success("Adicionado mais uma unidade");
      return;
    } else {
      toast.warning("Produto sem Estoque");
    }
    return;
  }

  function decrementProduct(product: IProduct | IProductInCart) {
    const productInCart = cart.find((prod) => prod.id === product.id);

    if (productInCart) {
      if (productInCart.amount > 1) {
        const updatedCart = cart.map((p) =>
          p.id === product.id ? { ...p, amount: Number(p.amount) - 1 } : p
        );

        setUpdatedCart([...updatedCart]);

        localStorage.setItem("MarketApp:cart", JSON.stringify(updatedCart));

        toast.info("Removido uma unidade");
        return;
      } else {
        deleteProduct(product);
        toast.warn("Produto removido do carrinho");
      }
    }
  }

  function deleteProduct(product: IProduct | IProductInCart) {
    const productInCart = cart.find((prod) => prod.id === product.id);

    if (productInCart) {
      const updatedCart = cart.filter((p) => p.id !== productInCart.id);

      setUpdatedCart([...updatedCart]);

      localStorage.setItem("MarketApp:cart", JSON.stringify(updatedCart));

      toast.warn("Produto removido do carrinho");
      return;
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        productAmount,
        addProduct,
        decrementProduct,
        deleteProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
