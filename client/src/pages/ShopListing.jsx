import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "../components/cards/ProductCard";
import styled from "styled-components";
import { filter } from "../utils/data";
import { CircularProgress, Slider } from "@mui/material";
import { getAllProducts } from "../api";

// Styled Components
const Container = styled.div`
  padding: 20px 30px;
  height: 100vh;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  gap: 30px;
  @media (max-width: 768px) {
    padding: 20px 12px;
    flex-direction: column;
    overflow-y: scroll;
  }
  background: ${({ theme }) => theme.bg};
`;

const Filters = styled.div`
  width: 100%;
  height: fit-content;
  overflow-y: hidden;
  padding: 20px 16px;
  @media (min-width: 768px) {
    height: 100%;
    width: 230px;
    overflow-y: scroll;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Products = styled.div`
  padding: 12px;
  overflow: hidden;
  height: fit-content;
  @media (min-width: 768px) {
    width: 100%;
    overflow-y: scroll;
    height: 100%;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  @media (max-width: 750px) {
    gap: 14px;
  }
`;

const Item = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SelectableItem = styled.div`
  cursor: pointer;
  display: flex;
  border: 1px solid ${({ theme }) => theme.text_secondary + 50};
  color: ${({ theme }) => theme.text_secondary + 90};
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 16px;
  width: fit-content;
  ${({ selected, theme }) =>
    selected &&
    `
    border: 1px solid ${theme.text_primary};
    color: ${theme.text_primary};
    background: ${theme.text_primary + 30};
    font-weight: 500;
  `}
`;

const ShopListing = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Dynamically extract from `filter`
  const allSizes = filter.find(f => f.value === "size")?.items || [];
  const allCategories = filter.find(f => f.value === "category")?.items || [];

  const [selectedSizes, setSelectedSizes] = useState(allSizes);
  const [selectedCategories, setSelectedCategories] = useState(allCategories);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.append("minPrice", priceRange[0]);
    params.append("maxPrice", priceRange[1]);

    if (selectedSizes.length > 0) {
      params.append("sizes", selectedSizes.join(","));
    }

    if (selectedCategories.length > 0) {
      params.append("categories", selectedCategories.join(","));
    }

    return params.toString();
  }, [priceRange, selectedSizes, selectedCategories]);

  const getFilteredProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      console.log("Fetching products with query:", queryString);
      const response = await getAllProducts(queryString);
      console.log("Received products:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getFilteredProductsData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [getFilteredProductsData]);

  const handlePriceChange = useCallback((newRange) => {
    setPriceRange(newRange);
  }, []);

  const handleSizeChange = useCallback((size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Filters>
            <Menu>
              {filter.map((filters) => (
                <FilterSection key={filters.name}>
                  <Title>{filters.name}</Title>
                  {filters.value === "price" ? (
                    <Slider
                      getAriaLabel={() => "Price range"}
                      defaultValue={priceRange}
                      min={0}
                      max={1000}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0, label: "$0" },
                        { value: 1000, label: "$1000" },
                      ]}
                      onChange={(e, newValue) => handlePriceChange(newValue)}
                    />
                  ) : filters.value === "size" ? (
                    <Item>
                      {filters.items.map((item) => (
                        <SelectableItem
                          key={item}
                          selected={selectedSizes.includes(item)}
                          onClick={() => handleSizeChange(item)}
                        >
                          {item}
                        </SelectableItem>
                      ))}
                    </Item>
                  ) : filters.value === "category" ? (
                    <Item>
                      {filters.items.map((item) => (
                        <SelectableItem
                          key={item}
                          selected={selectedCategories.includes(item)}
                          onClick={() => handleCategoryChange(item)}
                        >
                          {item}
                        </SelectableItem>
                      ))}
                    </Item>
                  ) : null}
                </FilterSection>
              ))}
            </Menu>
          </Filters>
          <Products>
            <CardWrapper>
              {products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </CardWrapper>
          </Products>
        </>
      )}
    </Container>
  );
};

export default ShopListing;
