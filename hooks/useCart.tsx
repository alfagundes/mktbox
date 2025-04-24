import React, { createContext, useContext, useState } from 'react';

type Product = { id: string; nome: string; preco: number; descricao?: string; quantidade: number; imageUrl: string };
type CartItem = Product & { quantidadeCarrinho: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantidadeCarrinho: item.quantidadeCarrinho + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantidadeCarrinho: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(item => item.id !== id));
  }

  function increaseQuantity(id: string) {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantidadeCarrinho: item.quantidadeCarrinho + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantidadeCarrinho: item.quantidadeCarrinho - 1 }
            : item
        )
        .filter(item => item.quantidadeCarrinho > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}