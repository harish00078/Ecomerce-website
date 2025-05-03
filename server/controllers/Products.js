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
  },
  {
    title: "Floral Summer Dress",
    name: "Summer Dress",
    desc: "Beautiful floral print summer dress, perfect for beach days",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=892&q=80",
    price: { org: 49.99, mrp: 69.99, off: 30 },
    sizes: ["S", "M", "L"],
    category: ["Women"],
  },
  {
    title: "Sports Running Shoes",
    name: "Running Shoes",
    desc: "Breathable and lightweight running shoes for men",
    img: "https://images.unsplash.com/photo-1528701800484-928142bda45f?auto=format&fit=crop&w=800&q=80",
    price: { org: 69.99, mrp: 89.99, off: 22 },
    sizes: ["7", "8", "9", "10"],
    category: ["Footwear"],
  },
  {
    title: "Women's Sunglasses",
    name: "Stylish Shades",
    desc: "UV-protected stylish sunglasses for women",
    img: "https://images.unsplash.com/photo-1520975919532-8f46bfb2e5c4?auto=format&fit=crop&w=800&q=80",
    price: { org: 19.99, mrp: 29.99, off: 33 },
    sizes: ["One Size"],
    category: ["Accessories"],
  },
  {
    title: "Men's Wrist Watch",
    name: "Leather Watch",
    desc: "Elegant leather strap analog wrist watch for men",
    img: "https://images.unsplash.com/photo-1611572659799-f1ec0e3e9dcb?auto=format&fit=crop&w=800&q=80",
    price: { org: 149.99, mrp: 179.99, off: 17 },
    sizes: ["One Size"],
    category: ["Accessories"],
  },
  {
    title: "Yoga Pants",
    name: "Comfort Fit Leggings",
    desc: "Stretchable and breathable yoga pants for women",
    img: "https://images.unsplash.com/photo-1589987601133-3c3903b9fc88?auto=format&fit=crop&w=800&q=80",
    price: { org: 39.99, mrp: 59.99, off: 33 },
    sizes: ["S", "M", "L"],
    category: ["Women", "Sportswear"],
  },
  {
    title: "Boys Sports Tracksuit",
    name: "Kids Tracksuit",
    desc: "Comfortable tracksuit set for boys, perfect for sports",
    img: "https://images.unsplash.com/photo-1581613443722-503eac2f6b9b?auto=format&fit=crop&w=800&q=80",
    price: { org: 44.99, mrp: 59.99, off: 25 },
    sizes: ["S", "M", "L"],
    category: ["Kids", "Sportswear"],
  },
  {
    title: "Elegant Evening Gown",
    name: "Evening Dress",
    desc: "Luxurious full-length gown for formal occasions",
    img: "https://images.unsplash.com/photo-1593032457862-3445e5b3ff6c?auto=format&fit=crop&w=800&q=80",
    price: { org: 199.99, mrp: 249.99, off: 20 },
    sizes: ["M", "L", "XL"],
    category: ["Women"],
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
