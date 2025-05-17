"use client";
import React from "react";
import { useGetProductCategoriesQuery } from "@/redux/features/product/ProductAPI";
import Link from "next/link";
import Image from "next/image";

const AllCategories = () => {
  const { data: categories } = useGetProductCategoriesQuery({});

  const ImageURL = process.env.NEXT_PUBLIC_IMAGE_URL;

  // console.log(categories);

  return (
    <div className='min-h-screen bg-[#FDF7EE] py-12'>
      <h2 className='text-3xl md:text-4xl font-bold mb-5 text-center'>
        All Categories
      </h2>
      <div className='container mx-auto py-12 px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {categories?.data?.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categories=${category.name}`}
              className='bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <Image
                src={`${ImageURL}${category?.image}`}
                alt={category.name}
                width={897}
                height={532}
                className='object-cover p-4'
              />
              <h2 className='text-xl font-semibold mb-2'>{category.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategories;
