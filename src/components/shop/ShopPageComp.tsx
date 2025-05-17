/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, LayoutGrid, List, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import Link from "next/link";
import { useGetAllProductsQuery } from "@/redux/features/product/ProductAPI";
import {
  useAddToWishlistMutation,
  useExistWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/features/wishlist/wistlistAPI";
import { toast } from "sonner";
import Loading from "../loading/Loading";
import { useSearchParams } from "next/navigation";

// type FilterCategory = "Category" | "Color" | "Price" | "Size" | "Material";
const filterSections = ["Categories", "Colors", "Sizes", "Materials"] as const;
type FilterCategory = (typeof filterSections)[number];

export default function ShopPageComponent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedFilters, setExpandedFilters] = useState<FilterCategory[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    materials: [] as string[],
  });
  const [isBuyable, setIsBuyable] = useState(false);
  const [isRentable, setIsRentable] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);

  const ImageURL = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [addToWishlist] = useAddToWishlistMutation();
  const [deleteToWishlist] = useRemoveFromWishlistMutation();

  const query = useSearchParams();
  const category = query.get("categories");

  // useEffect(() => {
  //   setSelectedFilters((prev) => ({
  //     ...prev,
  //     categories: category ? [category] : [],
  //   }));
  // }, [category]);

  useEffect(() => {
    if (category) {
      setSelectedFilters((prev) => ({
        ...prev,
        categories: [category],
      }));

      setExpandedFilters((prev) =>
        prev.includes("Categories" as FilterCategory)
          ? prev
          : [...prev, "Categories" as FilterCategory]
      );
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        categories: [],
      }));

      setExpandedFilters((prev) => prev.filter((f) => f !== "Categories"));
    }
  }, [category]);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetAllProductsQuery({
    isRentable,
    isBuyable,
    categories: selectedFilters.categories,
    colors: selectedFilters.colors.join(","),
    sizes: selectedFilters.sizes,
    materials: selectedFilters.materials,
    page: currentPage,
    limit: 10,
    sortBy,
  });

  if (isLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (isError) {
    return <div>Error</div>;
  }

  const toggleFavorite = async (productId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await deleteToWishlist({ productId }).unwrap();
      } else {
        await addToWishlist({ productId }).unwrap();
      }
    } catch {
      toast.error("Failed to update wishlist. Please try to login.");
    }
  };

  const toggleFilter = (filter: FilterCategory) => {
    setExpandedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const isFilterExpanded = (filter: FilterCategory) =>
    expandedFilters.includes(filter);

  const ProductCard = ({ product }: { product: any }) => {
    const { data, refetch } = useExistWishlistQuery({
      productId: product?._id,
    });

    return (
      <div
        key={product?._id}
        className={`group ${viewMode === "list" ? "flex gap-8" : ""}`}
      >
        <div
          className={`${
            viewMode === "list" ? "max-w-[450px]" : "min-w-[397px]"
          } h-[432px] flex items-center justify-center relative bg-gray-100 rounded-lg overflow-hidden mb-3`}
        >
          <button
            onClick={() => (
              toggleFavorite(product?._id, data?.data?.wishlist), refetch()
            )}
            className='absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors'
          >
            <Heart
              className={`w-6 h-6 ${
                data?.data?.wishlist
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-600"
              }`}
            />
          </button>

          <Link
            href={`/shop/${product?._id}`}
            className='relative h-full w-full flex items-center justify-center rounded-lg overflow-hidden'
          >
            <Image
              src={`${ImageURL}${product?.images[0]}`}
              alt={product.name}
              width={897}
              height={632}
              className='object-cover p-4'
            />
          </Link>
        </div>

        <div className='w-auto flex flex-col justify-center'>
          <Link href={`/shop/${product._id}`}>
            <h3 className='text-2xl text-[#000000] font-medium mb-3'>
              {product.name}
            </h3>

            <div className='flex items-center gap-6 mb-3'>
              {product?.isRentable && (
                <span className='font-medium'>${product.price}/mo</span>
              )}
              {product?.isBuyable && (
                <span className='text-gray-600'>${product.price} to Buy</span>
              )}
            </div>

            <div className='flex mb-3'>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < product.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>

            {viewMode === "list" && (
              <p className='text-[#545454] text-sm mb-6'>
                {product.description}
              </p>
            )}

            {viewMode === "list" && (
              <Button className='w-[126px] h-[43px] bg-primary text-base text-[#4A3300] cursor-pointer rounded-none'>
                See Details
              </Button>
            )}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-medium text-center mb-6'>Shop</h1>

      <div className='flex justify-between items-center mb-6'>
        <div className='flex space-x-2'>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size='icon'
            onClick={() => setViewMode("list")}
            className='h-9 w-9'
          >
            <LayoutGrid className='h-4 w-4' />
            <span className='sr-only'>List view</span>
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size='icon'
            onClick={() => setViewMode("grid")}
            className='h-9 w-9'
          >
            <List className='h-4 w-4' />
            <span className='sr-only'>Grid view</span>
          </Button>
        </div>

        <div className='w-48'>
          <Select
            defaultValue='latest'
            onValueChange={(value) => {
              const sortMapping: Record<string, string> = {
                latest: "createdAt",
                "-price": "-price",
                price: "price",
                rating: "-rating",
              };
              setSortBy(sortMapping[value]);
            }}
          >
            <SelectTrigger className='h-9 ml-auto'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='latest'>Sort by latest</SelectItem>
              <SelectItem value='-price'>Price: Low to High</SelectItem>
              <SelectItem value='price'>Price: High to Low</SelectItem>
              <SelectItem value='-rating'>Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-6'>
        {/* Filters sidebar */}
        <div className='w-full md:w-64 space-y-2'>
          {["Categories", "Colors", "Sizes", "Materials"].map((filter) => {
            const options =
              products?.meta?.filters?.[
                filter.toLowerCase() as keyof typeof products.meta.filters
              ] || [];

            return (
              <Collapsible
                key={filter}
                open={isFilterExpanded(filter as FilterCategory)}
                onOpenChange={() => toggleFilter(filter as FilterCategory)}
                className='bg-[#F5F5F5] rounded-md'
              >
                <CollapsibleTrigger className='flex justify-between items-center w-full px-4 py-3 hover:bg-gray-50'>
                  <span className='font-medium'>{filter}</span>
                  {isFilterExpanded(filter as FilterCategory) ? (
                    <Minus className='h-4 w-4' />
                  ) : (
                    <Plus className='h-4 w-4' />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className='px-4 pb-3'>
                  <div className='space-y-2'>
                    {Array.isArray(options) &&
                      options.map((option: string, index: number) => {
                        const filterKey =
                          filter.toLowerCase() as keyof typeof selectedFilters;
                        const currentValues = selectedFilters[filterKey] || [];

                        return (
                          <div key={index} className='flex items-center'>
                            <input
                              type='checkbox'
                              id={`${filter}-${option}`}
                              className='mr-2'
                              checked={currentValues.includes(option)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...currentValues, option]
                                  : currentValues.filter(
                                      (val) => val !== option
                                    );

                                setSelectedFilters((prev) => ({
                                  ...prev,
                                  [filterKey]: updated,
                                }));
                              }}
                            />
                            <label
                              htmlFor={`${filter}-${option}`}
                              className='capitalize'
                            >
                              {option}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Product grid */}
        <div className='flex-1'>
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6`}
          >
            {products?.data.length === 0 && (
              <div className='col-span-full text-center text-gray-500'>
                No products found.
              </div>
            )}

            {products?.data.map((product) => (
              <ProductCard product={product} key={product?._id} />
            ))}
          </div>

          {products?.data && products.data.length > 0 && (
            <Pagination className='mt-8'>
              <PaginationContent>
                {Array.from({
                  length: Math.ceil(
                    products.meta.pagination.total /
                      products.meta.pagination.limit
                  ),
                }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      className={`${
                        currentPage === i + 1
                          ? "bg-yellow-500 text-black hover:bg-yellow-600"
                          : ""
                      }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage <
                  Math.ceil(
                    products.meta.pagination.total /
                      products.meta.pagination.limit
                  ) && (
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => prev + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
