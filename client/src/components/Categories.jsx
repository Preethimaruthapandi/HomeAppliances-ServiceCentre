import React from "react";
import { categories } from "../data";
import "../styles/Categories.scss";
import { Link } from "react-router-dom";

const Categories = () => {
  return (
    <div className="categories">
      <h1>Find Your Expert Care</h1>
      <p>
        Explore our list of appliance categories serviced by skilled professionals. Whether it's fixing your trusted cookware, restoring your gas stove, or tuning up your kitchen essentials, <span style={{ color: "red" }}>connect with specialists who ensure your appliances run like new.</span> Select a category and discover experts tailored to your needs today!
      </p>

      <div className="categories_list">
        {categories?.slice(1, 9).map((category, index) => (
          <Link to={`/experts/category/${category.label}`} key={index}>
            <div className="category">
              <img src={category.img} alt={category.label} />
              <div className="overlay"></div>
              <div className="category_text">
                <div className="category_text_icon">{category.icon}</div>
                <p>{category.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
