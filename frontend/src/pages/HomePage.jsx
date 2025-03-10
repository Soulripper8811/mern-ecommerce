import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProduct";
import { useUserStore } from "../stores/useUserStore";
import { Navigate } from "react-router-dom";

const categories = [
  { href: "/carpet-wooden", name: "Carpet", imageUrl: "/carpet.png" },
  { href: "/PVC-carpet-marble", name: "Wallpaper", imageUrl: "/wallpaper.png" },
  { href: "/carpet-vinyl-tiles", name: "Blinds", imageUrl: "/blinds.png" },
  { href: "/flower-wallpaper", name: "Sofa", imageUrl: "/sofa.png" },
  { href: "/geometric-wallpaper", name: "Curtains", imageUrl: "/curtains.png" },
  { href: "/bricks-wallpaper", name: "Artifitial Grass", imageUrl: "/artificialGrass.png" },
  { href: "/3d-wallpaper", name: "Doormate", imageUrl: "/doormate.png" },
];

const HomePage = () => {
  const {user}=useUserStore()
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();
  

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);
  useEffect(()=>{
    if(user && user.role==="admin"){
      <Navigate to={"/secret-dashboard"}/>
    }
  },[user])
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest trends in eco-friendly fashion
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>
    </div>
  );
};
export default HomePage;
