import mongoose from "mongoose";
import Products from "../models/Products.js";
import { createError } from "../error.js";

// Add multiple products
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

// Fetch products with filtering
export const getproducts = async (req, res, next) => {
  try {
    let { categories, minPrice, maxPrice, sizes, search } = req.query;
    sizes = sizes?.split(",");
    categories = categories?.split(",");

    const filter = {};

    if (categories?.length) {
      filter.category = { $in: categories };
    }

    if (minPrice || maxPrice) {
      filter["price.org"] = {};
      if (minPrice) filter["price.org"]["$gte"] = parseFloat(minPrice);
      if (maxPrice) filter["price.org"]["$lte"] = parseFloat(maxPrice);
    }

    if (sizes?.length) {
      filter.sizes = { $in: sizes };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { desc: { $regex: new RegExp(search, "i") } },
      ];
    }

    const products = await Products.find(filter);
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error in getproducts:", err);
    next(err);
  }
};

// Fetch single product by ID
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
    return next(err);
  }
};

// Sample products to insert
const sampleProducts = [
  {
    title: "Classic White T-Shirt",
    name: "White T-Shirt",
    desc: "Premium cotton white t-shirt, perfect for everyday wear",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=880&q=80",
    price: { org: 29.99, mrp: 39.99, off: 25 },
    sizes: ["S", "M", "L", "XL"],
    category: ["Men"],
    link: "https://unsplash.com/photos/3TLl_97HNJo"
  },
  {
    title: "Floral Summer Dress",
    name: "Summer Dress",
    desc: "Beautiful floral print summer dress, perfect for beach days",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=892&q=80",
    price: { org: 49.99, mrp: 69.99, off: 30 },
    sizes: ["S", "M", "L"],
    category: ["Women"],
    link: "https://unsplash.com/photos/nGrfKmtwv24"
  },
  {
    title: "Casual Jeans",
    name: "Denim Jeans",
    desc: "Classic denim jeans, perfect for everyday wear",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=880&q=80",
    price: { org: 59.99, mrp: 79.99, off: 30 },
    sizes: ["One Size"],
    link: "https://unsplash.com/photos/3TLl_97HNJo"
  },
  
];


// Initialize sample products if DB is empty
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
