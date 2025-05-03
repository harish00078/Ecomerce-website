import mongoose from "mongoose";
import Products from "../models/Products.js";
import { createError } from "../error.js";

export const addProducts = async (req, res, next) => {
  try {
    const productsData = req.body;

    if (!Array.isArray(productsData)) {
      return next(
        createError(400, "Invalid request. Expected an array of products")
      );
    }

    const createdproducts = [];

    for (const productInfo of productsData) {
      const { title, name, desc, img, price, sizes, category } = productInfo;

      const product = new Products({
        title,
        name,
        desc,
        img,
        price,
        sizes,
        category,
      });
      const createdproduct = await product.save();

      createdproducts.push(createdproduct);
    }

    return res
      .status(201)
      .json({ message: "Products added successfully", createdproducts });
  } catch (err) {
    next(err);
  }
};

export const getproducts = async (req, res, next) => {
  try {
    let { categories, minPrice, maxPrice, sizes, search } = req.query;
    console.log("Query parameters:", {
      categories,
      minPrice,
      maxPrice,
      sizes,
      search,
    });

    sizes = sizes?.split(",");
    categories = categories?.split(",");

    const filter = {};

    if (categories && Array.isArray(categories)) {
      filter.category = { $in: categories };
    }

    if (minPrice || maxPrice) {
      filter["price.org"] = {};
      if (minPrice) {
        filter["price.org"]["$gte"] = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter["price.org"]["$lte"] = parseFloat(maxPrice);
      }
    }

    if (sizes && Array.isArray(sizes)) {
      filter.sizes = { $in: sizes };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { desc: { $regex: new RegExp(search, "i") } },
      ];
    }

    console.log("MongoDB filter:", filter);
    const products = await Products.find(filter);
    console.log("Found products:", products.length);

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error in getproducts:", err);
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, "Invalid product ID"));
    }
    const product = await Products.findById(id);
    if (!product) {
      return next(createError(404, "Product not found"));
    }
    return res.status(200).json(product);
  } catch (err) {
    return next(error);
  }
};

const sampleProducts = [
  {
    title: "Classic White T-Shirt",
    name: "White T-Shirt",
    desc: "Premium cotton white t-shirt, perfect for everyday wear",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    price: {
      org: 29.99,
      mrp: 39.99,
      off: 25,
    },
    sizes: ["S", "M", "L", "XL"],
    category: ["Men"],
  },
  {
    title: "Floral Summer Dress",
    name: "Summer Dress",
    desc: "Beautiful floral print summer dress, perfect for beach days",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=892&q=80",
    price: {
      org: 49.99,
      mrp: 69.99,
      off: 30,
    },
    sizes: ["S", "M", "L"],
    category: ["Women"],
  },
  {
    title: "Kids Denim Jacket",
    name: "Denim Jacket",
    desc: "Stylish denim jacket for kids, perfect for cool weather",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80",
    price: {
      org: 39.99,
      mrp: 49.99,
      off: 20,
    },
    sizes: ["S", "M", "L"],
    category: ["Kids"],
  },
  {
    title: "Leather Backpack",
    name: "Backpack",
    desc: "Premium leather backpack with multiple compartments",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    price: {
      org: 79.99,
      mrp: 99.99,
      off: 20,
    },
    sizes: ["One Size"],
    category: ["Bags"],
  },
  {
    title: "Slim Fit Jeans",
    name: "Blue Jeans",
    desc: "Classic slim fit blue jeans for men, comfortable and stylish",
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    price: {
      org: 59.99,
      mrp: 79.99,
      off: 25,
    },
    sizes: ["30", "32", "34", "36"],
    category: ["Men"],
  },
  {
    title: "Casual Blazer",
    name: "Black Blazer",
    desc: "Elegant black blazer for women, perfect for office wear",
    img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    price: {
      org: 89.99,
      mrp: 119.99,
      off: 25,
    },
    sizes: ["S", "M", "L", "XL"],
    category: ["Women"],
  },
  {
    title: "Kids Sneakers",
    name: "Colorful Sneakers",
    desc: "Comfortable and colorful sneakers for kids",
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1112&q=80",
    price: {
      org: 34.99,
      mrp: 44.99,
      off: 22,
    },
    sizes: ["3", "4", "5", "6"],
    category: ["Kids"],
  },
  {
    title: "Designer Handbag",
    name: "Leather Handbag",
    desc: "Luxurious leather handbag with gold accents",
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80",
    price: {
      org: 129.99,
      mrp: 159.99,
      off: 19,
    },
    sizes: ["One Size"],
    category: ["Bags"],
  },
  {
    title: "Formal Shirt",
    name: "White Formal Shirt",
    desc: "Crisp white formal shirt for men, perfect for business meetings",
    img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    price: {
      org: 45.99,
      mrp: 59.99,
      off: 23,
    },
    sizes: ["S", "M", "L", "XL"],
    category: ["Men"],
  },
  {
    title: "Summer Hat",
    name: "Straw Hat",
    desc: "Stylish straw hat for women, perfect for beach days",
    img: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    price: {
      org: 29.99,
      mrp: 39.99,
      off: 25,
    },
    sizes: ["One Size"],
    category: ["Women"],
  },
  {
    title: "Kids Winter Coat",
    name: "Puffer Jacket",
    desc: "Warm and cozy puffer jacket for kids",
    img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    price: {
      org: 49.99,
      mrp: 69.99,
      off: 29,
    },
    sizes: ["S", "M", "L"],
    category: ["Kids"],
  },
  {
    title: "Travel Duffel Bag",
    name: "Duffel Bag",
    desc: "Spacious duffel bag for travel and sports",
    img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    price: {
      org: 69.99,
      mrp: 89.99,
      off: 22,
    },
    sizes: ["One Size"],
    category: ["Bags"],
  },
];

export const initializeSampleProducts = async () => {
  try {
    const count = await Products.countDocuments();
    if (count === 0) {
      await Products.insertMany(sampleProducts);
      console.log("Sample products initialized successfully");
    }
  } catch (err) {
    console.error("Error initializing sample products:", err);
  }
};
